import { neon } from "@neondatabase/serverless";
import { ALL_CATEGORY_SLUGS } from "./categories";

export interface Article {
  id: number;
  guid: string;
  title: string;
  url: string;
  source: string;
  category: string;
  published_at: string;
  description: string | null;
  image_url: string | null;
  hidden: boolean;
  cve_id: string | null;
  cve_score: number | null;
  cve_severity: string | null;
  created_at: string;
}

export interface PaginatedResult {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  return neon(url);
}

let dbReady = false;

async function ensureDb() {
  if (dbReady) return;
  await setupDatabase();
  dbReady = true;
}

export async function setupDatabase(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS articles (
      id BIGSERIAL PRIMARY KEY,
      guid TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      source TEXT NOT NULL,
      category TEXT NOT NULL,
      published_at TIMESTAMPTZ NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_articles_category
    ON articles(category)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_articles_published_at
    ON articles(published_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_articles_source
    ON articles(source)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_articles_fts
    ON articles USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')))
  `;
  // Soft-hide flag: hidden articles stay in the table (so the cron's
  // ON CONFLICT(guid) blocks re-import) but never render
  await sql`
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE
  `;
  // CVE tagging: the CVE id mentioned in an article + its CVSS score/severity
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS cve_id TEXT`;
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS cve_score REAL`;
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS cve_severity TEXT`;
  // Per-CVE score cache so each CVE is fetched from NVD at most once.
  // score/severity are nullable: a row with null score records that we
  // looked and NVD had no score yet (re-checked after the TTL).
  await sql`
    CREATE TABLE IF NOT EXISTS cve_scores (
      cve_id TEXT PRIMARY KEY,
      score REAL,
      severity TEXT,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export interface CveScoreRow {
  cve_id: string;
  score: number | null;
  severity: string | null;
}

/** Cached CVE scores for the given ids. Skips rows whose null score is
 * stale (older than 7 days) so the caller re-fetches those from NVD. */
export async function getCachedCveScores(cveIds: string[]): Promise<Map<string, CveScoreRow>> {
  if (cveIds.length === 0) return new Map();
  const sql = getSql();
  const rows = (await sql`
    SELECT cve_id, score, severity FROM cve_scores
    WHERE cve_id = ANY(${cveIds})
      AND (score IS NOT NULL OR fetched_at > NOW() - INTERVAL '7 days')
  `) as unknown as CveScoreRow[];
  return new Map(rows.map((r) => [r.cve_id, r]));
}

export async function cacheCveScore(
  cveId: string,
  score: number | null,
  severity: string | null
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO cve_scores (cve_id, score, severity, fetched_at)
    VALUES (${cveId}, ${score}, ${severity}, NOW())
    ON CONFLICT (cve_id) DO UPDATE
      SET score = EXCLUDED.score, severity = EXCLUDED.severity, fetched_at = NOW()
  `;
}

/** Backfill articles whose CVE score arrived in the cache after import. */
export async function reconcileCveScores(): Promise<number> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE articles a
    SET cve_score = c.score, cve_severity = c.severity
    FROM cve_scores c
    WHERE a.cve_id = c.cve_id
      AND c.score IS NOT NULL
      AND a.cve_score IS DISTINCT FROM c.score
    RETURNING a.id
  `) as unknown as { id: number }[];
  return rows.length;
}

export async function upsertArticles(
  articles: Omit<Article, "id" | "created_at" | "hidden">[]
): Promise<number> {
  // Dedupe within the batch by guid (a multi-row INSERT ... ON CONFLICT
  // errors if the same guid appears twice) and by url (the same article
  // can show up in two feeds with different guids — e.g. a publisher's
  // main feed and a category feed).
  const seenGuids = new Set<string>();
  const seenUrls = new Set<string>();
  const batch = articles.filter((a) => {
    if (seenGuids.has(a.guid) || seenUrls.has(a.url)) return false;
    seenGuids.add(a.guid);
    seenUrls.add(a.url);
    return true;
  });
  if (batch.length === 0) return 0;

  const sql = getSql();

  // Drop articles that would create a duplicate of an existing row under a
  // different guid: a *new* guid whose url is already in the table. Known
  // guids are kept so ON CONFLICT(guid) can still backfill a missing image.
  const existingGuids = await getExistingGuids(batch.map((a) => a.guid));
  const existingUrls = await getExistingUrls(batch.map((a) => a.url));
  const unique = batch.filter(
    (a) => existingGuids.has(a.guid) || !existingUrls.has(a.url)
  );
  if (unique.length === 0) return 0;
  const result = (await sql`
    INSERT INTO articles (guid, title, url, source, category, published_at, description, image_url, cve_id, cve_score, cve_severity)
    SELECT * FROM unnest(
      ${unique.map((a) => a.guid)}::text[],
      ${unique.map((a) => a.title)}::text[],
      ${unique.map((a) => a.url)}::text[],
      ${unique.map((a) => a.source)}::text[],
      ${unique.map((a) => a.category)}::text[],
      ${unique.map((a) => a.published_at)}::timestamptz[],
      ${unique.map((a) => a.description)}::text[],
      ${unique.map((a) => a.image_url)}::text[],
      ${unique.map((a) => a.cve_id)}::text[],
      ${unique.map((a) => a.cve_score)}::real[],
      ${unique.map((a) => a.cve_severity)}::text[]
    )
    ON CONFLICT (guid) DO UPDATE
      SET image_url = EXCLUDED.image_url
      WHERE articles.image_url IS NULL AND EXCLUDED.image_url IS NOT NULL
    RETURNING (xmax = 0) AS inserted
  `) as unknown as { inserted: boolean }[];

  return result.filter((r) => r.inserted).length;
}

export async function getExistingGuids(guids: string[]): Promise<Set<string>> {
  if (guids.length === 0) return new Set();
  const sql = getSql();
  const rows = (await sql`
    SELECT guid FROM articles WHERE guid = ANY(${guids})
  `) as unknown as { guid: string }[];
  return new Set(rows.map((r) => r.guid));
}

export async function getExistingUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) return new Set();
  const sql = getSql();
  const rows = (await sql`
    SELECT url FROM articles WHERE url = ANY(${urls})
  `) as unknown as { url: string }[];
  return new Set(rows.map((r) => r.url));
}

export async function pruneOldArticles(): Promise<number> {
  const sql = getSql();
  const result = await sql`
    DELETE FROM articles
    WHERE published_at < NOW() - INTERVAL '6 months'
    RETURNING id
  `;
  return result.length;
}

export async function getArticles({
  category,
  page = 1,
  perPage = 30,
}: {
  category?: string;
  page?: number;
  perPage?: number;
}): Promise<PaginatedResult> {
  await ensureDb();
  const sql = getSql();
  const offset = (page - 1) * perPage;

  let articles: Article[];
  let countResult: { count: string }[];

  if (category) {
    articles = (await sql`
      SELECT * FROM articles
      WHERE category = ${category} AND NOT hidden
      ORDER BY published_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `) as unknown as Article[];
    countResult = (await sql`
      SELECT COUNT(*)::text as count FROM articles
      WHERE category = ${category} AND NOT hidden
    `) as unknown as { count: string }[];
  } else {
    articles = (await sql`
      SELECT * FROM articles
      WHERE NOT hidden
      ORDER BY published_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `) as unknown as Article[];
    countResult = (await sql`
      SELECT COUNT(*)::text as count FROM articles
      WHERE NOT hidden
    `) as unknown as { count: string }[];
  }

  const total = parseInt(countResult[0].count, 10);
  return {
    articles,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function searchArticles({
  query,
  category,
  page = 1,
  perPage = 30,
}: {
  query: string;
  category?: string;
  page?: number;
  perPage?: number;
}): Promise<PaginatedResult> {
  await ensureDb();
  const sql = getSql();
  const offset = (page - 1) * perPage;
  

  let articles: Article[];
  let countResult: { count: string }[];

  if (category) {
    articles = (await sql`
      SELECT *, ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), websearch_to_tsquery('english', ${query})) AS rank
      FROM articles
      WHERE category = ${category}
        AND to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ websearch_to_tsquery('english', ${query})
        AND NOT hidden
      ORDER BY rank DESC, published_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `) as unknown as Article[];
    countResult = (await sql`
      SELECT COUNT(*)::text as count FROM articles
      WHERE category = ${category}
        AND to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ websearch_to_tsquery('english', ${query})
        AND NOT hidden
    `) as unknown as { count: string }[];
  } else {
    articles = (await sql`
      SELECT *, ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), websearch_to_tsquery('english', ${query})) AS rank
      FROM articles
      WHERE to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ websearch_to_tsquery('english', ${query})
        AND NOT hidden
      ORDER BY rank DESC, published_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `) as unknown as Article[];
    countResult = (await sql`
      SELECT COUNT(*)::text as count FROM articles
      WHERE to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ websearch_to_tsquery('english', ${query})
        AND NOT hidden
    `) as unknown as { count: string }[];
  }

  const total = parseInt(countResult[0]?.count ?? "0", 10);
  return {
    articles,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getRecentArticlesByCategory(
  limit = 6
): Promise<Record<string, Article[]>> {
  await ensureDb();
  const sql = getSql();

  const perCategory = await Promise.all(
    ALL_CATEGORY_SLUGS.map(
      (cat) =>
        sql`
          SELECT * FROM articles
          WHERE category = ${cat} AND NOT hidden
          ORDER BY published_at DESC
          LIMIT ${limit}
        ` as unknown as Promise<Article[]>
    )
  );

  const result: Record<string, Article[]> = {};
  ALL_CATEGORY_SLUGS.forEach((cat, i) => {
    result[cat] = perCategory[i];
  });
  return result;
}

export async function getArticleCounts(): Promise<{ total: number; byCategory: Record<string, number>; lastUpdated: string | null }> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT category, COUNT(*)::int as count
    FROM articles
    WHERE NOT hidden
    GROUP BY category
  `) as unknown as { category: string; count: number }[];

  const latest = (await sql`
    SELECT MAX(created_at)::text as last_updated FROM articles
  `) as unknown as { last_updated: string | null }[];

  const byCategory: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    byCategory[row.category] = row.count;
    total += row.count;
  }
  return { total, byCategory, lastUpdated: latest[0]?.last_updated ?? null };
}

export async function getLatestArticles(limit = 20): Promise<Article[]> {
  await ensureDb();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM articles
    WHERE NOT hidden
    ORDER BY published_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as Article[];
}
