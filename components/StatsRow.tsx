import { CATEGORIES } from "@/lib/categories";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

interface Props {
  total: number;
  byCategory: Record<string, number>;
  lastUpdated: string | null;
}

export default function StatsRow({ total, byCategory, lastUpdated }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3 px-4 rounded-xl border border-white/[0.06] bg-bg-card/60">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="live-dot h-2 w-2 rounded-full bg-accent-green inline-block" />
        <span className="text-xs font-mono font-semibold text-accent-green tracking-wider">LIVE</span>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-white/10 hidden sm:block" />

      {/* Total count */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold text-text-primary tabular-nums">{total.toLocaleString()}</span>
        <span className="text-xs text-text-muted">articles</span>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <span className="text-xs text-text-muted font-mono">
            updated {timeAgo(lastUpdated)}
          </span>
        </>
      )}

      {/* Per-category counts */}
      <div className="flex flex-wrap items-center gap-2 ml-auto">
        {CATEGORIES.map((cat) => {
          const count = byCategory[cat.slug] ?? 0;
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors hover:bg-white/[0.06]"
            >
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.accentColor }}
              />
              <span className="text-text-secondary">{cat.name.split(" ")[0]}</span>
              <span className="font-semibold tabular-nums" style={{ color: cat.accentColor }}>
                {count.toLocaleString()}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
