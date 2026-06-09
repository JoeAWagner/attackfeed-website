"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-secondary/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded bg-accent-cyan/10 border border-accent-cyan/30">
              <svg className="h-4 w-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-mono font-bold text-lg text-text-primary group-hover:text-accent-cyan transition-colors">
              AttackFeed
            </span>
            <span className="hidden sm:block text-xs text-text-muted font-mono border border-border rounded px-1.5 py-0.5">
              v2
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-accent-cyan/10 text-accent-cyan"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              All Feeds
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname === `/category/${cat.slug}`
                    ? "bg-accent-cyan/10 text-accent-cyan"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Search + mobile toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-bg-primary text-text-secondary text-sm hover:border-accent-cyan/50 hover:text-text-primary transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline text-xs bg-bg-hover border border-border rounded px-1">⌘K</kbd>
            </Link>

            <button
              className="md:hidden p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                pathname === "/" ? "bg-accent-cyan/10 text-accent-cyan" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              All Feeds
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                  pathname === `/category/${cat.slug}`
                    ? "bg-accent-cyan/10 text-accent-cyan"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
