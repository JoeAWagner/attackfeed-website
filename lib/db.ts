import { neon } from "@neondatabase/serverless";

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
}

export async function upsertArticles(
  articles: Omit<Article, "id" | "created_at">[]
): Promise<number> {
  if (articles.length === 0) return 0;
  const sql = getSql();
  let inserted = 0;
  for (const article of articles) {
    const result = await sql`
      INSERT INTO articles (guid, title, url, source, category, published_at, description, image_url)
      VALUES (
        ${article.guid},
        ${article.title},
        ${article.url},
        ${article.source},
        ${article.category},
        ${article.published_at},
        ${article.description},
        ${article.image_url}
      )
      ON CONFLICT (guid) DO UPDATE
        SET image_url = EXCLUDED.image_url
        WHERE articles.image_url IS NULL AND EXCLUDED.image_url IS NOT NULL
      RETURNING id
    `;
    if (result.length > 0) inserted++;
  }
  return inserted;
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
      WHERE category = ${category}
      ORDER BY published_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `) as unknown as Article[];
    countResult = (await sql`
      SELECT COUNT(*)::text as count FROM articles
      WHERE category = ${category}
    `) as unknown as { count: string }[];
  } else {
    articles = (await sql`
      SELECT * FROM articles
      ORDER BY published_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `) as unknown as Article[];
    countResult = (await sql`
      SELECT COUNT(*)::text as count FROM articles
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
  const tsQuery = query.trim().split(/\s+/).join(" & ");

  let articles: Article[];
  let countResult: { count: string }[];

  if (category) {
    articles = (await sql`
      SELECT *, ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), to_tsquery('english', ${tsQuery})) AS rank
      FROM articles
      WHERE category = ${category}
        AND to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ to_tsquery('english', ${tsQuery})
      ORDER BY rank DESC, published_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `) as unknown as Article[];
    countResult = (await sql`
      SELECT COUNT(*)::text as count FROM articles
      WHERE category = ${category}
        AND to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ to_tsquery('english', ${tsQuery})
    `) as unknown as { count: string }[];
  } else {
    articles = (await sql`
      SELECT *, ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), to_tsquery('english', ${tsQuery})) AS rank
      FROM articles
      WHERE to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ to_tsquery('english', ${tsQuery})
      ORDER BY rank DESC, published_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `) as unknown as Article[];
    countResult = (await sql`
      SELECT COUNT(*)::text as count FROM articles
      WHERE to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ to_tsquery('english', ${tsQuery})
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
  const categories = ["news", "gov-alerts", "vulnerabilities", "privacy", "fraud"];
  const result: Record<string, Article[]> = {};

  for (const cat of categories) {
    const rows = (await sql`
      SELECT * FROM articles
      WHERE category = ${cat}
      ORDER BY published_at DESC
      LIMIT ${limit}
    `) as unknown as Article[];
    result[cat] = rows;
  }

  return result;
}

export async function getArticleCounts(): Promise<{ total: number; byCategory: Record<string, number>; lastUpdated: string | null }> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT category, COUNT(*)::int as count
    FROM articles
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
    ORDER BY published_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as Article[];
}
