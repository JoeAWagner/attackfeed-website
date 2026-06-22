"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Theme = "system" | "light" | "dark";

const FONT_MIN = 90;
const FONT_MAX = 140;
const FONT_STEP = 5;

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
}

function applyFont(pct: number) {
  document.documentElement.style.setProperty("--font-scale", `${pct}%`);
}

export default function Settings() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [font, setFont] = useState(100);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Hydrate from storage (the inline head script already applied them pre-paint)
  useEffect(() => {
    setMounted(true);
    const t = (localStorage.getItem("af-theme") as Theme) || "dark";
    const f = parseInt(localStorage.getItem("af-font") || "100", 10);
    setTheme(t);
    setFont(Number.isFinite(f) ? f : 100);
  }, []);

  // Re-apply on OS theme change while in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      // popover lives in a portal, so check it separately from the trigger
      if (ref.current?.contains(t) || popoverRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function chooseTheme(t: Theme) {
    setTheme(t);
    localStorage.setItem("af-theme", t);
    applyTheme(t);
  }

  function changeFont(pct: number) {
    const clamped = Math.min(FONT_MAX, Math.max(FONT_MIN, pct));
    setFont(clamped);
    localStorage.setItem("af-font", String(clamped));
    applyFont(clamped);
  }

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: "system",
      label: "System",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      ),
    },
    {
      value: "light",
      label: "Light",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      ),
    },
    {
      value: "dark",
      label: "Dark",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      ),
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Display settings"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center justify-center p-2 rounded-lg border border-hairline/[0.08] bg-hairline/[0.03] text-text-secondary hover:border-hairline/[0.14] hover:text-text-primary transition-all"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.855.107 1.205l.527.737c.32.448.27 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.855-.142-1.204.108l-.738.527c-.448.32-1.06.27-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.148c.424-.071.765-.384.93-.781.165-.398.143-.855-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && mounted && createPortal(
        // Rendered in a portal on <body> so the header's backdrop-filter
        // can't capture the fixed positioning. Pinned to the viewport and
        // counter-scaled from the top-right corner so it stays put and at a
        // constant size while the slider changes the page font.
        <div ref={popoverRef} className="fixed top-[56px] right-[12px] z-50">
        <div
          role="dialog"
          aria-label="Display settings"
          className="w-64 rounded-xl border border-border bg-bg-card shadow-xl p-4 space-y-4"
          style={{ transform: `scale(${100 / font})`, transformOrigin: "top right" }}
        >
          {/* Theme */}
          <div>
            <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-text-muted mb-2">
              Theme
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => chooseTheme(t.value)}
                  aria-pressed={theme === t.value}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[11px] transition-colors ${
                    theme === t.value
                      ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
                      : "border-border text-text-secondary hover:text-text-primary hover:border-border-bright"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    {t.icon}
                  </svg>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-text-muted">
                Text size
              </p>
              <span className="text-[11px] font-mono text-text-secondary tabular-nums">{font}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeFont(font - FONT_STEP)}
                aria-label="Decrease text size"
                disabled={font <= FONT_MIN}
                className="text-xs text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed px-1"
              >
                A
              </button>
              <input
                type="range"
                min={FONT_MIN}
                max={FONT_MAX}
                step={FONT_STEP}
                value={font}
                onChange={(e) => changeFont(parseInt(e.target.value, 10))}
                aria-label="Text size"
                className="flex-1 accent-accent-cyan"
              />
              <button
                onClick={() => changeFont(font + FONT_STEP)}
                aria-label="Increase text size"
                disabled={font >= FONT_MAX}
                className="text-base font-semibold text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed px-1"
              >
                A
              </button>
            </div>
            {font !== 100 && (
              <button
                onClick={() => changeFont(100)}
                className="mt-2 text-[11px] text-text-muted hover:text-accent-cyan transition-colors"
              >
                Reset to 100%
              </button>
            )}
          </div>
        </div>
        </div>,
        document.body
      )}
    </div>
  );
}
