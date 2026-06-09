import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-accent-cyan/10 border border-accent-cyan/30">
                <svg className="h-3.5 w-3.5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-mono font-bold text-text-primary">AttackFeed</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              A curated cybersecurity news aggregator. Stay ahead of threats with real-time feeds from top security sources.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider mb-3">
              Feed Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-text-secondary hover:text-accent-cyan transition-colors">
                  All Feeds
                </Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-text-secondary hover:text-accent-cyan transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.cisa.gov" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-accent-cyan transition-colors">
                  CISA
                </a>
              </li>
              <li>
                <a href="https://nvd.nist.gov" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-accent-cyan transition-colors">
                  NVD / CVE Database
                </a>
              </li>
              <li>
                <a href="https://www.exploit-db.com" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-accent-cyan transition-colors">
                  Exploit-DB
                </a>
              </li>
              <li>
                <a href="https://attack.mitre.org" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-accent-cyan transition-colors">
                  MITRE ATT&CK
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider mb-3">
              About
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              AttackFeed aggregates RSS feeds from leading cybersecurity publishers, government agencies, and research labs. Updated hourly.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse-slow inline-block" />
              Updated hourly
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} AttackFeed. All articles link to their original sources.
          </p>
          <Link href="/search" className="text-xs text-text-secondary hover:text-accent-cyan transition-colors">
            Search the archive →
          </Link>
        </div>
      </div>
    </footer>
  );
}
