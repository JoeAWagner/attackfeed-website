// Backfill cve_id + CVSS score/severity for existing articles.
//   npx tsx --env-file=.env scripts/backfill-cve.ts
// Set NVD_API_KEY in .env for 50 req/30s instead of 5 req/30s.
import { neon } from "@neondatabase/serverless";
import { extractCve, fetchCvss, NVD_HAS_KEY } from "../lib/cve";
import { setupDatabase, cacheCveScore, getCachedCveScores, reconcileCveScores } from "../lib/db";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await setupDatabase();
  const sql = neon(process.env.DATABASE_URL!);

  // 1. Tag cve_id from title+description (local, no network)
  const rows = (await sql`
    SELECT id, title, description, cve_id FROM articles
  `) as { id: number; title: string; description: string | null; cve_id: string | null }[];

  let tagged = 0;
  const distinct = new Set<string>();
  for (const r of rows) {
    const cve = extractCve(`${r.title} ${r.description ?? ""}`);
    if (cve) distinct.add(cve);
    if (cve !== r.cve_id) {
      await sql`UPDATE articles SET cve_id = ${cve} WHERE id = ${r.id}`;
      tagged++;
    }
  }
  console.log(`Tagged cve_id on ${tagged} articles. ${distinct.size} distinct CVEs.`);

  // 2. Resolve scores for distinct CVEs not already cached
  const ids = [...distinct];
  const cached = await getCachedCveScores(ids);
  const todo = ids.filter((c) => !cached.has(c));
  console.log(`${todo.length} CVEs need an NVD lookup (key: ${NVD_HAS_KEY ? "yes" : "no"}).`);

  const delay = NVD_HAS_KEY ? 700 : 6500;
  let done = 0;
  for (const cve of todo) {
    const { score, severity } = await fetchCvss(cve);
    await cacheCveScore(cve, score, severity);
    done++;
    if (done % 10 === 0) console.log(`  ${done}/${todo.length} resolved`);
    if (done < todo.length) await sleep(delay);
  }

  // 3. Copy cached scores onto the articles
  const updated = await reconcileCveScores();
  console.log(`Done. Backfilled scores onto ${updated} articles.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
