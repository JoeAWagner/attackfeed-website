import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT source, COUNT(*)::int AS total, COUNT(image_url)::int AS with_img
    FROM articles GROUP BY source ORDER BY total DESC LIMIT 20
  `;
  for (const r of rows) {
    console.log(`${String(r.with_img).padStart(4)}/${String(r.total).padEnd(4)} ${r.source}`);
  }
  const logos = await sql`
    SELECT COUNT(*)::int AS n FROM articles
    WHERE image_url ILIKE '%logo%'
  `;
  console.log("logo-ish urls:", logos[0].n);
}

main().catch((e) => { console.error(e); process.exit(1); });
