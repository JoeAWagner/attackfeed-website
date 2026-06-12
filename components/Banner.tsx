/* eslint-disable @next/next/no-img-element */

export default function Banner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08]">
      {/* Layered backdrop: gradient + grid + scanlines */}
      <div className="absolute inset-0 gradient-cyber-cyan" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 scanlines" />
      {/* Soft glow behind the icon, tinted to the brand gradient */}
      <div
        className="absolute -left-12 top-1/2 -translate-y-1/2 h-52 w-52 rounded-full opacity-25 blur-3xl"
        style={{ background: "linear-gradient(135deg, #FF3B47, #8B5CF6, #38BDF8)" }}
      />

      <div className="relative flex items-center gap-4 sm:gap-5 px-5 py-3 sm:px-7 sm:py-4">
        {/* Terminal icon with blinking cursor */}
        <img
          src="/brand/attackfeed-icon-color-animated.svg"
          alt="AttackFeed"
          className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 drop-shadow-[0_0_14px_rgba(139,92,246,0.35)]"
        />

        <div className="min-w-0">
          {/* >attack_Feed wordmark */}
          <img
            src="/brand/attackfeed-wordmark.svg"
            alt="attack_Feed"
            className="h-6 sm:h-8 w-auto"
          />
          <p className="mt-1.5 text-xs sm:text-sm text-text-secondary truncate">
            Cybersecurity news from across the internet
          </p>
        </div>

        <a
          href="https://wagnercybersecurity.com"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto hidden md:flex flex-col items-end gap-0.5 group shrink-0"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted group-hover:text-text-secondary transition-colors">
            Provided by
          </span>
          <span className="text-xs font-medium text-text-secondary group-hover:text-accent-cyan transition-colors">
            Wagner Cybersecurity LLC
          </span>
          <span className="text-[10px] text-text-muted">
            20+ years in cybersecurity
          </span>
        </a>
      </div>
    </div>
  );
}
