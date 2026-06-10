"use client";

import { useEffect, useRef } from "react";

interface Props {
  slot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Responsive AdSense display unit. Renders nothing unless
 * NEXT_PUBLIC_ADSENSE_CLIENT is configured.
 */
export default function AdUnit({ slot, className = "" }: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not loaded (blocked or script still loading) — fine
    }
  }, [client]);

  if (!client || !slot) return null;

  return (
    <div className={`rounded-xl border border-white/[0.07] bg-bg-card overflow-hidden ${className}`}>
      <div className="px-4 py-1.5 border-b border-white/[0.05]">
        <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
          Sponsored
        </span>
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
