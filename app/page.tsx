import { Suspense } from "react";
import {
  getLatestArticles,
  getRecentArticlesByCategory,
  getArticleCounts,
} from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import ArticleCard from "@/components/ArticleCard";
import CategoryNav from "@/components/CategoryNav";
import StatsRow from "@/components/StatsRow";
import ThreatSidebar from "@/components/ThreatSidebar";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function DashboardContent() {
  const [latest, byCategory, counts] = await Promise.all([
    getLatestArticles(40),
    getRecentArticlesByCategory(5),
    getArticleCounts(),
  ]);

  const featuredArticles = latest.slice(0, 3);
  const feedArticles = latest.slice(3);

  if (latest.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4 opacity-30">📡</div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">Feed is initializing</h2>
        <p className="text-sm text-text-secondary max-w-sm">
          The hourly cron job hasn&apos;t run yet. Trigger it manually or wait up to an hour.
        </p>
        <code className="mt-4 text-xs font-mono text-text-muted bg-bg-card border border-border rounded-lg px-4 py-2 block max-w-full overflow-x-auto">
          GET /api/cron/fetch-feeds
        </code>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <StatsRow
        total={counts.total}
        byCategory={counts.byCategory}
        lastUpdated={counts.lastUpdated}
      />

      {/* Category filter pills */}
      <CategoryNav />

      {/* Featured 3-up grid */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent-cyan inline-block" />
          <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-text-muted">
            Latest
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} featured />
          ))}
        </div>
      </section>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed — 2 cols */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-text-muted">
              Recent Articles
            </h2>
            <Link href="/search" className="text-xs text-text-muted hover:text-accent-cyan transition-colors font-mono">
              Search archive →
            </Link>
          </div>
          <div className="space-y-2">
            {feedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Per-category sections below the main feed */}
          <div className="space-y-10 pt-6">
            {CATEGORIES.map((cat) => {
              const articles = byCategory[cat.slug] ?? [];
              if (articles.length === 0) return null;
              return (
                <section key={cat.slug}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-3 w-px rounded-full" style={{ backgroundColor: cat.accentColor }} />
                      <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest" style={{ color: cat.accentColor }}>
                        {cat.name}
                      </h2>
                    </div>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="text-[11px] text-text-muted hover:text-text-secondary transition-colors font-mono"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Sidebar — 1 col */}
        <div className="lg:col-span-1">
          <ThreatSidebar byCategory={byCategory} counts={counts.byCategory} />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 rounded-xl bg-bg-card border border-border" />
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => <div key={i} className="h-8 w-24 rounded-full bg-bg-card" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-52 rounded-xl bg-bg-card" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          {[...Array(10)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-bg-card" />)}
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-xl bg-bg-card" />
          <div className="h-48 rounded-xl bg-bg-card" />
        </div>
      </div>
    </div>
  );
}
