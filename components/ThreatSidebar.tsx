import Link from "next/link";
import { Article } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import { timeAgo, safeHttpUrl } from "@/lib/utils";
import AdUnit from "./AdUnit";

interface Props {
  byCategory: Record<string, Article[]>;
  counts: Record<string, number>;
}

const SIDEBAR_CATEGORIES = ["vulnerabilities", "gov-alerts", "fraud"];

export default function ThreatSidebar({ byCategory, counts }: Props) {
  return (
    <div className="space-y-5">
      {/* Threat meter */}
      <div className="rounded-xl border border-white/[0.07] bg-bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent-red inline-block" />
          <h3 className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-widest">
            Feed Activity
          </h3>
        </div>
        <div className="space-y-2.5">
          {CATEGORIES.map((cat) => {
            const count = counts[cat.slug] ?? 0;
            const max = Math.max(...CATEGORIES.map((c) => counts[c.slug] ?? 0), 1);
            const pct = Math.round((count / max) * 100);
            return (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="group block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-text-secondary group-hover:text-text-primary transition-colors font-medium">
                    {cat.name}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums" style={{ color: cat.accentColor }}>
                    {count.toLocaleString()}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: cat.accentColor, opacity: 0.7 }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sponsored slot — renders only when AdSense env vars are set */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? ""} />

      {/* Per-category latest */}
      {SIDEBAR_CATEGORIES.map((slug) => {
        const cat = CATEGORIES.find((c) => c.slug === slug);
        const articles = byCategory[slug] ?? [];
        if (!cat || articles.length === 0) return null;

        return (
          <div key={slug} className="rounded-xl border border-white/[0.07] bg-bg-card overflow-hidden">
            {/* Section header */}
            <div
              className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]"
              style={{ background: `linear-gradient(90deg, ${cat.accentColor}12, transparent)` }}
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cat.accentColor }} />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-widest" style={{ color: cat.accentColor }}>
                  {cat.name}
                </span>
              </div>
              <Link href={`/category/${slug}`} className="text-[10px] text-text-muted hover:text-text-secondary transition-colors font-mono">
                all →
              </Link>
            </div>

            {/* Article list */}
            <div className="divide-y divide-white/[0.04]">
              {articles.slice(0, 4).map((article) => (
                <a
                  key={article.id}
                  href={safeHttpUrl(article.url) ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1 px-4 py-2.5 hover:bg-white/[0.03] transition-colors"
                >
                  <p className="text-[12px] font-medium text-text-primary group-hover:text-white transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-mono">{timeAgo(article.published_at)}</span>
                    <span className="text-[10px] text-text-muted">·</span>
                    <span className="text-[10px] text-text-secondary truncate">{article.source}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
