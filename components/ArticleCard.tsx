import Image from "next/image";
import Link from "next/link";
import { Article } from "@/lib/db";
import { getCategoryBySlug } from "@/lib/categories";
import { timeAgo, stripHtml, truncate } from "@/lib/utils";

interface Props {
  article: Article;
  featured?: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  "The Hacker News": "text-accent-cyan",
  "Krebs on Security": "text-accent-red",
  "Bleeping Computer": "text-accent-yellow",
  "CISA Alerts": "text-accent-yellow",
  "CISA Current Activity": "text-accent-yellow",
  "Zero Day Initiative": "text-accent-red",
  "Exploit-DB": "text-accent-red",
  "EFF Deeplinks": "text-accent-purple",
  "Google Project Zero": "text-accent-green",
};

function getSourceColor(source: string): string {
  return SOURCE_COLORS[source] ?? "text-text-secondary";
}

export default function ArticleCard({ article, featured = false }: Props) {
  const category = getCategoryBySlug(article.category);
  const description = article.description ? truncate(stripHtml(article.description), featured ? 200 : 120) : null;
  const ago = timeAgo(article.published_at);

  if (featured) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col rounded-lg border border-border bg-bg-card hover:border-accent-cyan/40 hover:bg-bg-hover transition-all duration-200 overflow-hidden"
      >
        {article.image_url && (
          <div className="relative h-48 w-full overflow-hidden bg-bg-primary">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />
          </div>
        )}
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${category.tailwindBg} ${category.tailwindText} ${category.tailwindBorder}`}>
                {category.name}
              </span>
            )}
            <span className={`text-xs font-medium ${getSourceColor(article.source)}`}>
              {article.source}
            </span>
          </div>
          <h2 className="font-semibold text-text-primary group-hover:text-accent-cyan transition-colors leading-snug">
            {article.title}
          </h2>
          {description && (
            <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
          )}
          <div className="flex items-center gap-2 mt-auto pt-2">
            <svg className="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-text-muted">{ago}</span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 p-3 rounded-lg border border-border bg-bg-card hover:border-accent-cyan/30 hover:bg-bg-hover transition-all duration-150"
    >
      {article.image_url && (
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-bg-primary">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {category && (
            <span className={`text-xs font-mono px-1.5 py-px rounded border ${category.tailwindBg} ${category.tailwindText} ${category.tailwindBorder}`}>
              {category.name}
            </span>
          )}
          <span className={`text-xs ${getSourceColor(article.source)}`}>{article.source}</span>
          <span className="text-xs text-text-muted">{ago}</span>
        </div>
        <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        {description && (
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{description}</p>
        )}
      </div>
    </a>
  );
}
