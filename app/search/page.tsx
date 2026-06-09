import { Metadata } from "next";
import { searchArticles, getArticles } from "@/lib/db";
import ArticleCard from "@/components/ArticleCard";
import CategoryNav from "@/components/CategoryNav";
import Pagination from "@/components/Pagination";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the AttackFeed cybersecurity article archive",
};

const PER_PAGE = 30;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q, category, page: pageParam } = await searchParams;
  const query = (q ?? "").trim();
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  let result = null;
  if (query.length >= 2) {
    try {
      result = await searchArticles({ query, category, page, perPage: PER_PAGE });
    } catch {
      result = { articles: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  const basePath = `/search?q=${encodeURIComponent(query)}${category ? `&category=${category}` : ""}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Search Archive</h1>
        <p className="text-sm text-text-secondary">
          Search 6 months of cybersecurity articles across all feeds
        </p>
      </div>

      {/* Search form */}
      <form method="GET" action="/search" className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search for CVEs, threats, vendors…"
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 transition-colors text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-medium hover:bg-accent-cyan/20 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted font-mono">Filter:</span>
          <CategoryNav activeSlug={category} />
          {category && (
            <a
              href={`/search?q=${encodeURIComponent(query)}`}
              className="text-xs text-text-secondary hover:text-accent-cyan transition-colors"
            >
              Clear filter ✕
            </a>
          )}
        </div>
      </form>

      {/* Results */}
      {query.length < 2 ? (
        <div className="rounded-lg border border-border bg-bg-card p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-text-secondary text-sm">Enter at least 2 characters to search</p>
        </div>
      ) : result === null || result.articles.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-card p-12 text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">No results</h2>
          <p className="text-sm text-text-secondary">
            No articles found for &ldquo;<span className="text-text-primary">{query}</span>&rdquo;
            {category ? ` in ${category}` : ""}.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              <span className="text-text-primary font-medium">{result.total.toLocaleString()}</span> results for &ldquo;
              <span className="text-accent-cyan">{query}</span>&rdquo;
            </span>
          </div>
          <div className="space-y-2">
            {result.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={result.totalPages} basePath={basePath} />
        </>
      )}
    </div>
  );
}
