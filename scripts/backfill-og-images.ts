// Backfill og:image for existing articles whose RSS feed had no image.
// Run locally: npx tsx --env-file=.env scripts/backfill-og-images.ts
import { neon } from "@neondatabase/serverless";
import { fetchOgImage } from "../lib/og";

const CONCURRENCY = 8;
const LIMIT = 1000;

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`
    SELECT id, url, source FROM articles
    WHERE image_url IS NULL
    ORDER BY published_at DESC
    LIMIT ${LIMIT}
  `) as { id: number; url: string; source: string }[];

  console.log(`Backfilling og:image for ${rows.length} articles...`);
  let found = 0;
  let done = 0;
  const queue = [...rows];

  async function worker() {
    while (queue.length > 0) {
      const row = queue.shift();
      if (!row) return;
      const img = await fetchOgImage(row.url);
      done++;
      if (img) {
        await sql`UPDATE articles SET image_url = ${img} WHERE id = ${row.id}`;
        found++;
      }
      if (done % 100 === 0) console.log(`  ${done}/${rows.length} processed, ${found} images found`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`Done: ${found}/${rows.length} articles updated with og:image.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
