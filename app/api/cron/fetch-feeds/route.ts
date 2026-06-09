import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { upsertArticles, pruneOldArticles, setupDatabase } from "@/lib/db";
import { FEEDS } from "@/lib/feeds";
import { extractImageFromRss, stripHtml, truncate } from "@/lib/utils";

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

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await setupDatabase();

    let totalInserted = 0;
    let feedsProcessed = 0;
    let feedErrors = 0;
    const errors: string[] = [];

    for (const feed of FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const articles = (parsed.items as unknown as RssItem[]).map((item) => {
          const guid = item.guid ?? item.link ?? `${feed.source}-${item.title}`;
          const title = item.title?.trim() ?? "(untitled)";
          const url = item.link ?? "";
          const publishedAt = item.isoDate ?? item.pubDate ?? new Date().toISOString();
          const rawDescription = item.contentSnippet ?? item.content ?? item["content:encoded"] ?? "";
          const description = truncate(stripHtml(rawDescription), 500) || null;
          const imageUrl = extractImageFromRss(item as Record<string, unknown>);

          return {
            guid: guid.slice(0, 500),
            title: title.slice(0, 500),
            url: url.slice(0, 1000),
            source: feed.source,
            category: feed.category,
            published_at: publishedAt,
            description,
            image_url: imageUrl,
          };
        }).filter((a) => a.url && a.title !== "(untitled)");

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
