import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import Parser from "rss-parser";
import { upsertArticles, pruneOldArticles, setupDatabase, getExistingGuids } from "@/lib/db";
import { FEEDS } from "@/lib/feeds";
import { extractImageFromRss, stripHtml, truncate, safeHttpUrl } from "@/lib/utils";
import { fetchOgImages } from "@/lib/og";

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
    // Cap article-page fetches per run so the function stays well under maxDuration
    let ogBudgetLeft = 60;
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

          return {
            guid: guid.slice(0, 500),
            title: title.slice(0, 500),
            url,
            source: feed.source,
            category: feed.category,
            published_at: publishedAt,
            description,
            image_url: imageUrl,
          };
        }).filter((a) => a.url && a.title !== "(untitled)");

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

    // Prune articles older than 6 months
    const pruned = await pruneOldArticles();

    return NextResponse.json({
      ok: true,
      feedsProcessed,
      feedErrors,
      totalInserted,
      ogImagesFound,
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
