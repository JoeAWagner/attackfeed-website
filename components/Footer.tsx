import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Logo size={26} />
              <span className="font-mono font-bold text-text-primary">
                Attack<span className="text-accent-cyan">Feed</span>
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              A curated cybersecurity news aggregator. Stay ahead of threats with real-time feeds from top security sources.
            </p>
            <a
              href="https://wagnercybersecurity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-cyan transition-colors"
            >
              <span className="h-1 w-1 rounded-full bg-accent-cyan inline-block" />
              Provided by Wagner Cybersecurity LLC
            </a>
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
            © {new Date().getFullYear()} AttackFeed · A{" "}
            <a
              href="https://wagnercybersecurity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent-cyan transition-colors"
            >
              Wagner Cybersecurity LLC
            </a>{" "}
            service. All articles link to their original sources.
          </p>
          <Link href="/search" className="text-xs text-text-secondary hover:text-accent-cyan transition-colors">
            Search the archive →
          </Link>
        </div>
      </div>
    </footer>
  );
}
