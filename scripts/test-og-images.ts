import { neon } from "@neondatabase/serverless";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 200_000);
    const og =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ??
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    return og?.[1] ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`
    SELECT DISTINCT ON (source) source, url FROM articles
    WHERE image_url IS NULL
    ORDER BY source, published_at DESC
  `) as { source: string; url: string }[];

  for (const r of rows) {
    const img = await fetchOgImage(r.url);
    console.log(`${img ? "✓" : "✗"} ${r.source.padEnd(25)} ${img?.slice(0, 80) ?? "(none)"}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
