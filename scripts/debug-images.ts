import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: false }],
      ["media:thumbnail", "media:thumbnail", { keepArray: false }],
      ["content:encoded", "content:encoded"],
    ],
  },
  timeout: 10000,
  headers: { "User-Agent": "AttackFeed/2.0 (+https://www.attackfeed.com)" },
});

// Exact same function as lib/utils.ts — copy it here to test directly
function extractImageFromRss(item: Record<string, unknown>): string | null {
  const mediaContent = item["media:content"] as { $?: { url?: string }; url?: string } | undefined;
  if (mediaContent?.$?.url) return `enclosure→media:content.$: ${mediaContent.$.url}`;
  if (typeof mediaContent === "string" && mediaContent) return `media:content string: ${mediaContent}`;

  const mediaThumbnail = item["media:thumbnail"] as { $?: { url?: string } } | undefined;
  if (mediaThumbnail?.$?.url) return `media:thumbnail.$: ${mediaThumbnail.$.url}`;

  const enclosure = item["enclosure"] as { url?: string; type?: string } | undefined;
  if (enclosure?.url && enclosure.type?.startsWith("image/")) return `enclosure: ${enclosure.url}`;
  // Also try enclosure without type check
  if (enclosure?.url) return `enclosure (no type check): ${enclosure.url}`;

  const content =
    (item["content:encoded"] as string | undefined) ??
    (item["content"] as string | undefined) ?? "";
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return `html img tag: ${imgMatch[1]}`;

  return null;
}

const TEST_FEEDS = [
  "https://feeds.feedburner.com/TheHackersNews",
  "https://www.bleepingcomputer.com/feed/",
  "https://krebsonsecurity.com/feed/",
  "https://feeds.feedburner.com/securityweek",
  "https://www.theregister.com/security/headlines.atom",
  "https://www.wired.com/feed/category/security/latest/rss",
  "https://hackread.com/feed/",
  "https://www.infosecurity-magazine.com/rss/news/",
  "https://cyberscoop.com/feed/",
];

async function main() {
  let totalWithImages = 0;
  let totalItems = 0;

  for (const url of TEST_FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      let feedImages = 0;
      console.log(`\n${"─".repeat(60)}`);
      console.log(`${feed.title ?? url}`);

      for (const item of feed.items.slice(0, 5)) {
        totalItems++;
        const img = extractImageFromRss(item as unknown as Record<string, unknown>);
        if (img) {
          feedImages++;
          totalWithImages++;
          console.log(`  ✓ ${item.title?.slice(0, 50)}`);
          console.log(`      via: ${img.slice(0, 120)}`);
        } else {
          console.log(`  ✗ ${item.title?.slice(0, 50)} — no image`);
          // Show what fields exist
          const keys = Object.keys(item).filter(k =>
            /media|image|enclosure|thumbnail/i.test(k)
          );
          if (keys.length) console.log(`      has: ${keys.join(", ")}`);
        }
      }
      console.log(`  → ${feedImages}/5 items have images`);
    } catch (e) {
      console.log(`  ERROR on ${url}: ${e}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`TOTAL: ${totalWithImages}/${totalItems} items have extractable images`);
}

main();
