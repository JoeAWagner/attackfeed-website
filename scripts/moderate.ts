// Find and hide/unhide articles on the live site.
//
// Usage (run from the repo root):
//   npx tsx --env-file=.env scripts/moderate.ts "search words or URL"   # find articles
//   npx tsx --env-file=.env scripts/moderate.ts --hide 12345            # hide by id
//   npx tsx --env-file=.env scripts/moderate.ts --unhide 12345          # restore by id
//   npx tsx --env-file=.env scripts/moderate.ts --hidden                # list hidden articles
//
// Hiding keeps the row in the database so the hourly cron can't
// re-import it; it just never renders. Changes show on the site
// immediately (pages are server-rendered per request).
import { neon } from "@neondatabase/serverless";

interface Row {
  id: number;
  title: string;
  source: string;
  url: string;
  published_at: string;
  hidden: boolean;
}

function print(rows: Row[]) {
  if (rows.length === 0) {
    console.log("No matches.");
    return;
  }
  for (const r of rows) {
    const flag = r.hidden ? " [HIDDEN]" : "";
    console.log(`#${r.id}${flag}  ${r.source} — ${new Date(r.published_at).toISOString().slice(0, 10)}`);
    console.log(`    ${r.title}`);
    console.log(`    ${r.url}`);
  }
  console.log(`\n${rows.length} match(es). Hide one with: npx tsx --env-file=.env scripts/moderate.ts --hide <id>`);
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const [arg, value] = process.argv.slice(2);

  if (!arg) {
    console.log("Usage: moderate.ts <search-or-url> | --hide <id> | --unhide <id> | --hidden");
    process.exit(1);
  }

  if (arg === "--hide" || arg === "--unhide") {
    const id = parseInt(value, 10);
    if (!Number.isFinite(id)) throw new Error(`Invalid id: ${value}`);
    const hidden = arg === "--hide";
    const rows = (await sql`
      UPDATE articles SET hidden = ${hidden} WHERE id = ${id}
      RETURNING id, title, source, url, published_at, hidden
    `) as Row[];
    if (rows.length === 0) {
      console.log(`No article with id ${id}.`);
    } else {
      console.log(`${hidden ? "Hidden" : "Restored"}: #${rows[0].id} — ${rows[0].title}`);
    }
    return;
  }

  if (arg === "--hidden") {
    const rows = (await sql`
      SELECT id, title, source, url, published_at, hidden FROM articles
      WHERE hidden ORDER BY published_at DESC LIMIT 100
    `) as Row[];
    print(rows);
    return;
  }

  // Search: exact URL match if it looks like one, otherwise title search
  const term = process.argv.slice(2).join(" ");
  const rows = (term.startsWith("http")
    ? await sql`
        SELECT id, title, source, url, published_at, hidden FROM articles
        WHERE url = ${term} LIMIT 20
      `
    : await sql`
        SELECT id, title, source, url, published_at, hidden FROM articles
        WHERE title ILIKE ${"%" + term + "%"}
        ORDER BY published_at DESC LIMIT 20
      `) as Row[];
  print(rows);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
