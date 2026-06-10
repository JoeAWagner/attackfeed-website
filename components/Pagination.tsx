import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const pages = getPagesArray(currentPage, totalPages);

  // basePath may already carry query params (e.g. /search?q=foo)
  const sep = basePath.includes("?") ? "&" : "?";

  function href(page: number) {
    return page === 1 ? basePath : `${basePath}${sep}page=${page}`;
  }

  return (
    <nav className="flex items-center justify-center gap-1 py-8" aria-label="Pagination">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={href(currentPage - 1)}
          className="px-3 py-1.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-border-bright text-sm transition-colors"
        >
          ← Prev
        </Link>
      ) : (
        <span className="px-3 py-1.5 rounded border border-border text-text-muted text-sm cursor-not-allowed">
          ← Prev
        </span>
      )}

      {/* Pages */}
      {pages.map((page, i) =>
        page === null ? (
          <span key={`ellipsis-${i}`} className="px-2 text-text-muted text-sm">…</span>
        ) : (
          <Link
            key={page}
            href={href(page)}
            className={`px-3 py-1.5 rounded border text-sm transition-colors ${
              page === currentPage
                ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
                : "border-border text-text-secondary hover:text-text-primary hover:border-border-bright"
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={href(currentPage + 1)}
          className="px-3 py-1.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-border-bright text-sm transition-colors"
        >
          Next →
        </Link>
      ) : (
        <span className="px-3 py-1.5 rounded border border-border text-text-muted text-sm cursor-not-allowed">
          Next →
        </span>
      )}
    </nav>
  );
}

function getPagesArray(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | null)[] = [];
  pages.push(1);
  if (current > 3) pages.push(null);
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push(null);
  pages.push(total);
  return pages;
}
