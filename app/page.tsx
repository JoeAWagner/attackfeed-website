import { Suspense } from "react";
import { getLatestArticles, getRecentArticlesByCategory } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import ArticleCard from "@/components/ArticleCard";
import CategoryNav from "@/components/CategoryNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function HeroSection() {
  const articles = await getLatestArticles(3);

  if (articles.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg-card p-12 text-center">
        <div className="text-4xl mb-4">📡</div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">No articles yet</h2>
        <p className="text-sm text-text-secondary">The feed fetch cron job hasn&apos;t run yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} featured />
      ))}
    </div>
  );
}

async function LatestFeed() {
  const articles = await getLatestArticles(30);

  if (articles.length === 0) return null;

  return (
    <div className="space-y-2">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

async function CategorySections() {
  const byCategory = await getRecentArticlesByCategory(5);

  return (
    <div className="space-y-12">
      {CATEGORIES.map((cat) => {
        const articles = byCategory[cat.slug] ?? [];
        if (articles.length === 0) return null;

        return (
          <section key={cat.slug}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-1 w-8 rounded-full ${cat.tailwindBg.replace("/10", "")}`}
                  style={{ backgroundColor: cat.accentColor }} />
                <h2 className={`font-mono font-semibold text-sm uppercase tracking-wider ${cat.tailwindText}`}>
                  {cat.name}
                </h2>
              </div>
              <Link
                href={`/category/${cat.slug}`}
                className="text-xs text-text-secondary hover:text-accent-cyan transition-colors"
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
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-10">
      {/* Page header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Live Feed</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">
          Cybersecurity Intelligence Feed
        </h1>
        <CategoryNav />
      </div>

      {/* Featured / hero articles */}
      <section>
        <h2 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider mb-4">
          Latest Stories
        </h2>
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection />
        </Suspense>
      </section>

      {/* Two-column layout: feed + category sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">
            Recent Articles
          </h2>
          <Suspense fallback={<FeedSkeleton />}>
            <LatestFeed />
          </Suspense>
          <div className="pt-2">
            <Link
              href="/category/news"
              className="text-sm text-accent-cyan hover:underline"
            >
              View all news →
            </Link>
          </div>
        </div>

        {/* Category sections sidebar */}
        <div className="lg:col-span-1">
          <Suspense fallback={<SidebarSkeleton />}>
            <CategorySections />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-64 rounded-lg bg-bg-card border border-border animate-pulse" />
      ))}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-20 rounded-lg bg-bg-card border border-border animate-pulse" />
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 rounded bg-bg-card animate-pulse" />
          {[...Array(4)].map((_, j) => (
            <div key={j} className="h-16 rounded-lg bg-bg-card border border-border animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}
