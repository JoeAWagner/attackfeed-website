// One-off: NULL out image_url rows that point to the broken logo fallback
// URLs introduced (and since removed) in commit 75cae7c.
import { neon } from "@neondatabase/serverless";

const BROKEN_URLS = [
  "https://www.bleepingcomputer.com/images/bc-logo2-white-small.png",
  "https://www.securityweek.com/wp-content/uploads/2022/11/SecurityWeek-Logo-White.png",
  "https://cyberscoop.com/wp-content/uploads/sites/3/2023/01/CyberScoop-white.png",
  "https://hackread.com/wp-content/uploads/2022/05/hackread-logo.png",
  "https://www.infosecurity-magazine.com/images/infosecurity_logo_white.png",
  "https://www.darkreading.com/img/dark-reading-logo-white.png",
  "https://www.securitymagazine.com/ext/resources/Logos/SM_Logo_White.png",
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = neon(url);

  const result = await sql`
    UPDATE articles
    SET image_url = NULL
    WHERE image_url = ANY(${BROKEN_URLS})
    RETURNING id
  `;
  console.log(`Cleared broken image_url on ${result.length} articles.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
