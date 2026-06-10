"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import Logo from "./Logo";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        router.push("/search");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-bg-primary/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <Logo size={28} className="group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.5)] transition-all" />
            <span className="font-mono font-bold text-base text-text-primary group-hover:text-white transition-colors tracking-tight">
              Attack<span className="text-accent-cyan">Feed</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-accent-green font-mono border border-accent-green/20 bg-accent-green/10 rounded px-1.5 py-0.5">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent-green inline-block" />
              LIVE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === "/"
                  ? "text-white bg-white/[0.08] font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
              }`}
            >
              All Feeds
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  pathname === `/category/${cat.slug}`
                    ? "font-medium bg-white/[0.08]"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
                }`}
                style={pathname === `/category/${cat.slug}` ? { color: cat.accentColor } : {}}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/search"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-text-secondary text-sm hover:border-white/[0.14] hover:text-text-primary transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline text-xs">Search</span>
              <kbd className="hidden sm:inline text-[10px] bg-white/[0.06] border border-white/[0.1] rounded px-1 py-px font-mono">⌘K</kbd>
            </Link>

            <button
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="h-4.5 w-4.5 h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/[0.06] py-3 space-y-0.5">
            <Link href="/" onClick={() => setMobileOpen(false)}
              className={`flex px-3 py-2 rounded-lg text-sm transition-colors ${pathname === "/" ? "text-white bg-white/[0.08] font-medium" : "text-text-secondary hover:text-text-primary"}`}>
              All Feeds
            </Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)}
                className={`flex px-3 py-2 rounded-lg text-sm transition-colors ${pathname === `/category/${cat.slug}` ? "font-medium bg-white/[0.08]" : "text-text-secondary hover:text-text-primary"}`}
                style={pathname === `/category/${cat.slug}` ? { color: cat.accentColor } : {}}>
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
