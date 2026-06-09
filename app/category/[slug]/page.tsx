import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticles } from "@/lib/db";
import { getCategoryBySlug, ALL_CATEGORY_SLUGS } from "@/lib/categories";
import ArticleCard from "@/components/ArticleCard";
import CategoryNav from "@/components/CategoryNav";
import Pagination from "@/components/Pagination";

export const revalidate = 3600;

export async function generateStaticParams() {
  return ALL_CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
  };
}

const PER_PAGE = 30;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const category = getCategoryBySlug(slug);

  if (!category) notFound();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { articles, total, totalPages } = await getArticles({
    category: slug,
    page,
    perPage: PER_PAGE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: category.accentColor }}
          />
          <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${category.tailwindText}`}>
            {category.name}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">{category.name}</h1>
        <p className="text-sm text-text-secondary">{category.description}</p>
        <div className="flex items-center gap-4">
          <CategoryNav activeSlug={slug} />
          <span className="text-xs text-text-muted font-mono">{total.toLocaleString()} articles</span>
        </div>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-card p-12 text-center">
          <p className="text-text-secondary">No articles found. The feed may not have run yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/category/${slug}`}
          />
        </>
      )}
    </div>
  );
}
