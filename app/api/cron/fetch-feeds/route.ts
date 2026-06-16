import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import Parser from "rss-parser";
import {
  upsertArticles,
  pruneOldArticles,
  setupDatabase,
  getExistingGuids,
  getCachedCveScores,
  cacheCveScore,
  reconcileCveScores,
} from "@/lib/db";
import { FEEDS } from "@/lib/feeds";
import { extractImageFromRss, stripHtml, truncate, safeHttpUrl } from "@/lib/utils";
import { fetchOgImages } from "@/lib/og";
import { extractCve, fetchCvss, NVD_HAS_KEY } from "@/lib/cve";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Feed parsing + og:image fetches need more than the default timeout
export const maxDuration = 120;

type RssItem = {
  guid?: string;
  link?: string;
  title?: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  content?: string;
  "content:encoded"?: string;
  [key: string]: unknown;
};

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: false }],
      ["media:thumbnail", "media:thumbnail", { keepArray: false }],
      ["content:encoded", "content:encoded"],
    ],
  },
  timeout: 10000,
  headers: {
    "User-Agent": "AttackFeed/2.0 RSS Aggregator (+https://www.attackfeed.com)",
  },
});

function authorized(authHeader: string | null, secret: string | undefined): boolean {
  if (!secret || !authHeader) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const provided = Buffer.from(authHeader);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export async function GET(req: NextRequest) {
  // Verify cron secret — fail closed if it isn't configured
  if (!authorized(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await setupDatabase();

    let totalInserted = 0;
    let feedsProcessed = 0;
    let feedErrors = 0;
    let ogImagesFound = 0;
    let cvesTagged = 0;
    // Cap external fetches per run so the function stays well under maxDuration
    let ogBudgetLeft = 60;
    // NVD allows 5 req/30s without a key, 50/30s with one
    let cveBudgetLeft = NVD_HAS_KEY ? 40 : 6;
    const cveDelayMs = NVD_HAS_KEY ? 700 : 6500;
    const errors: string[] = [];

    for (const feed of FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const articles = (parsed.items as unknown as RssItem[]).map((item) => {
          const guid = item.guid ?? item.link ?? `${feed.source}-${item.title}`;
          const title = item.title?.trim() ?? "(untitled)";
          // Feed content is external input: only http(s) URLs survive
          const url = safeHttpUrl(item.link) ?? "";
          const publishedAt = item.isoDate ?? item.pubDate ?? new Date().toISOString();
          const rawDescription = item.contentSnippet ?? item.content ?? item["content:encoded"] ?? "";
          const description = truncate(stripHtml(rawDescription), 500) || null;
          const imageUrl = safeHttpUrl(extractImageFromRss(item as Record<string, unknown>));
          const cveId = extractCve(`${title} ${description ?? ""}`);

          return {
            guid: guid.slice(0, 500),
            title: title.slice(0, 500),
            url,
            source: feed.source,
            category: feed.category,
            published_at: publishedAt,
            description,
            image_url: imageUrl,
            cve_id: cveId,
            cve_score: null as number | null,
            cve_severity: null as string | null,
          };
        }).filter((a) => a.url && a.title !== "(untitled)");

        // Resolve CVSS scores for any CVEs mentioned. Cache-first; live NVD
        // lookups are budgeted and rate-limited across the whole run.
        const cveIds = [...new Set(articles.map((a) => a.cve_id).filter((c): c is string => !!c))];
        if (cveIds.length > 0) {
          const resolved = await getCachedCveScores(cveIds);
          for (const cveId of cveIds) {
            if (resolved.has(cveId) || cveBudgetLeft <= 0) continue;
            cveBudgetLeft--;
            const { score, severity } = await fetchCvss(cveId);
            await cacheCveScore(cveId, score, severity);
            resolved.set(cveId, { cve_id: cveId, score, severity });
            if (cveBudgetLeft > 0) await sleep(cveDelayMs);
          }
          for (const a of articles) {
            const hit = a.cve_id ? resolved.get(a.cve_id) : undefined;
            if (hit?.score != null) {
              a.cve_score = hit.score;
              a.cve_severity = hit.severity;
              cvesTagged++;
            }
          }
        }

        // For new articles whose RSS had no image, try the article page's og:image.
        // Only new guids — otherwise we'd re-fetch the same pages every hour.
        if (ogBudgetLeft > 0) {
          const candidates = articles.filter((a) => !a.image_url);
          if (candidates.length > 0) {
            const existing = await getExistingGuids(candidates.map((a) => a.guid));
            const newWithoutImage = candidates.filter((a) => !existing.has(a.guid));
            if (newWithoutImage.length > 0) {
              const ogImages = await fetchOgImages(
                newWithoutImage.map((a) => a.url),
                { budget: ogBudgetLeft }
              );
              ogBudgetLeft -= Math.min(newWithoutImage.length, ogBudgetLeft);
              for (const a of newWithoutImage) {
                const img = ogImages.get(a.url);
                if (img) {
                  a.image_url = img;
                  ogImagesFound++;
                }
              }
            }
          }
        }

        const inserted = await upsertArticles(articles);
        totalInserted += inserted;
        feedsProcessed++;
      } catch (err) {
        feedErrors++;
        errors.push(`${feed.source}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Backfill scores for already-stored articles whose CVE was scored later
    const cveBackfilled = await reconcileCveScores();

    // Prune articles older than 6 months
    const pruned = await pruneOldArticles();

    return NextResponse.json({
      ok: true,
      feedsProcessed,
      feedErrors,
      totalInserted,
      ogImagesFound,
      cvesTagged,
      cveBackfilled,
      pruned,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Cron fetch-feeds error:", err);
    return NextResponse.json(
      { error: "Internal server error", message: String(err) },
      { status: 500 }
    );
  }
}
