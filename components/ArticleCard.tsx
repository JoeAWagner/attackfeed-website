import Image from "next/image";
import { Article } from "@/lib/db";
import { getCategoryBySlug, Category } from "@/lib/categories";
import { timeAgo, stripHtml, truncate, detectSeverity, safeHttpUrl } from "@/lib/utils";

interface Props {
  article: Article;
  featured?: boolean;
}

const GRADIENT_MAP: Record<string, string> = {
  news: "gradient-cyber-cyan",
  "gov-alerts": "gradient-cyber-yellow",
  vulnerabilities: "gradient-cyber-red",
  privacy: "gradient-cyber-purple",
  fraud: "gradient-cyber-orange",
};

const CARD_BORDER_MAP: Record<string, string> = {
  news: "card-border-cyan",
  "gov-alerts": "card-border-yellow",
  vulnerabilities: "card-border-red",
  privacy: "card-border-purple",
  fraud: "card-border-orange",
};

const GLOW_MAP: Record<string, string> = {
  news: "hover:glow-cyan",
  "gov-alerts": "hover:glow-yellow",
  vulnerabilities: "hover:glow-red",
  privacy: "",
  fraud: "",
};

const CATEGORY_ABBR: Record<string, string> = {
  news: "NEWS",
  "gov-alerts": "GOV",
  vulnerabilities: "VULN",
  privacy: "PRIV",
  fraud: "FRAUD",
};

const SEVERITY_STYLES = {
  critical: "bg-accent-red/15 text-accent-red border border-accent-red/30 animate-pulse-slow",
  high: "bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30",
};

function sourceInitials(source: string): string {
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function MonogramTile({ source, color }: { source: string; color?: string }) {
  return (
    <div
      className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${color ?? "#4A5568"}20, ${color ?? "#4A5568"}08)`,
        border: `1px solid ${color ?? "#4A5568"}25`,
      }}
    >
      <span className="font-mono font-bold text-sm select-none" style={{ color: color ?? "#8b949e", opacity: 0.85 }}>
        {sourceInitials(source)}
      </span>
    </div>
  );
}

// CVSS severity -> color, matching the brand palette
const CVE_SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#FF3B47",
  HIGH: "#FB923C",
  MEDIUM: "#FBBF24",
  LOW: "#38BDF8",
};

function CveBadge({ article }: { article: Article }) {
  if (!article.cve_id) return null;
  const color = article.cve_severity
    ? CVE_SEVERITY_COLOR[article.cve_severity] ?? "#7A8694"
    : "#7A8694";
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border"
      style={{ color, borderColor: `${color}40`, backgroundColor: `${color}14` }}
      title={
        article.cve_score != null
          ? `${article.cve_id} — CVSS ${article.cve_score} ${article.cve_severity}`
          : article.cve_id
      }
    >
      <span className="tracking-wider">{article.cve_id}</span>
      {article.cve_score != null && (
        <span className="opacity-90">
          {article.cve_score.toFixed(1)} {article.cve_severity}
        </span>
      )}
    </span>
  );
}

function SeverityBadge({ title }: { title: string }) {
  const sev = detectSeverity(title);
  if (!sev) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${SEVERITY_STYLES[sev]}`}>
      {sev === "critical" && <span className="h-1.5 w-1.5 rounded-full bg-accent-red inline-block live-dot" />}
      {sev}
    </span>
  );
}

export default function ArticleCard({ article, featured = false }: Props) {
  const category = getCategoryBySlug(article.category);
  const ago = timeAgo(article.published_at);
  const cardBorder = CARD_BORDER_MAP[article.category] ?? "border border-border";
  const glow = GLOW_MAP[article.category] ?? "";

  if (featured) {
    return <FeaturedCard article={article} category={category} ago={ago} />;
  }

  const description = article.description
    ? truncate(stripHtml(article.description), 130)
    : null;
  // Defense in depth: rows predating ingest validation could hold odd schemes
  const href = safeHttpUrl(article.url) ?? "#";
  const imageUrl = safeHttpUrl(article.image_url);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex gap-3 p-3.5 rounded-xl transition-all duration-200 ${cardBorder} ${glow}`}
    >
      {/* Category accent bar */}
      <div
        className="w-0.5 shrink-0 rounded-full self-stretch"
        style={{ backgroundColor: category?.accentColor ?? "#4A5568" }}
      />

      {/* Thumbnail — real image or source monogram tile */}
      {imageUrl ? (
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-bg-primary">
          <Image src={imageUrl} alt="" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" unoptimized />
        </div>
      ) : (
        <MonogramTile source={article.source} color={category?.accentColor} />
      )}

      {/* Content */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[10px] font-mono font-semibold uppercase tracking-widest px-1.5 py-px rounded"
            style={{ color: category?.accentColor, backgroundColor: `${category?.accentColor}18` }}
          >
            {CATEGORY_ABBR[article.category] ?? article.category}
          </span>
          <SeverityBadge title={article.title} />
          <CveBadge article={article} />
          <span className="text-xs font-medium text-text-secondary">{article.source}</span>
          <span className="text-text-muted text-[11px] ml-auto shrink-0">{ago}</span>
        </div>

        <h3 className="text-sm font-semibold text-text-primary group-hover:text-white transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>

        {description && (
          <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-1 hidden sm:block">
            {description}
          </p>
        )}
      </div>
    </a>
  );
}

function FeaturedCard({
  article,
  category,
  ago,
}: {
  article: Article;
  category: Category | undefined;
  ago: string;
}) {
  const gradient = GRADIENT_MAP[article.category] ?? "gradient-cyber-cyan";
  const description = article.description
    ? truncate(stripHtml(article.description), 220)
    : null;
  const href = safeHttpUrl(article.url) ?? "#";
  const imageUrl = safeHttpUrl(article.image_url);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl overflow-hidden border border-white/[0.07] bg-bg-card hover:border-white/[0.14] transition-all duration-200"
      style={{ boxShadow: `0 0 0 1px transparent, inset 0 0 40px rgba(0,0,0,0.2)` }}
    >
      {/* Header area — works without image */}
      <div className={`relative overflow-hidden ${imageUrl ? "" : "min-h-[120px]"}`}>
        {imageUrl ? (
          <div className="relative h-44 w-full overflow-hidden">
            <Image src={imageUrl} alt="" fill className="object-cover opacity-60 group-hover:opacity-75 transition-opacity" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/60 to-transparent" />
          </div>
        ) : (
          <div className={`relative scanlines ${gradient} px-5 pt-5 pb-3`}>
            {/* Decorative grid lines */}
            <div className="absolute inset-0 grid-bg opacity-40" />
            {/* Large background letter */}
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[80px] font-mono font-bold opacity-[0.06] select-none leading-none"
              style={{ color: category?.accentColor }}
            >
              {CATEGORY_ABBR[article.category] ?? "//"}
            </div>
            <div className="relative flex items-center gap-2">
              <span className="live-dot h-2 w-2 rounded-full inline-block" style={{ backgroundColor: category?.accentColor }} />
              <span className="text-[10px] font-mono uppercase tracking-widest font-semibold" style={{ color: category?.accentColor }}>
                {category?.name ?? article.category} · Live
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-mono font-semibold uppercase tracking-widest px-2 py-0.5 rounded border"
            style={{ color: category?.accentColor, borderColor: `${category?.accentColor}40`, backgroundColor: `${category?.accentColor}12` }}
          >
            {category?.name ?? article.category}
          </span>
          <SeverityBadge title={article.title} />
          <CveBadge article={article} />
          <span className="text-xs font-medium text-text-secondary">{article.source}</span>
        </div>

        <h2 className="font-bold text-text-primary group-hover:text-white transition-colors leading-snug text-base">
          {article.title}
        </h2>

        {description && (
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.05]">
          <span className="text-[11px] text-text-muted font-mono">{ago}</span>
          <span className="text-xs text-text-secondary group-hover:text-white transition-colors flex items-center gap-1">
            Read more
            <svg className="h-3 w-3 -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}
