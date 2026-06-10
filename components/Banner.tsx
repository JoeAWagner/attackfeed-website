import Logo from "./Logo";

export default function Banner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08]">
      {/* Layered backdrop: gradient + grid + scanlines */}
      <div className="absolute inset-0 gradient-cyber-cyan" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 scanlines" />
      {/* Soft glow behind the logo */}
      <div
        className="absolute -left-10 top-1/2 -translate-y-1/2 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{ background: "#00d4ff" }}
      />

      <div className="relative flex items-center gap-4 px-5 py-4 sm:px-7 sm:py-5">
        <Logo size={52} className="shrink-0 drop-shadow-[0_0_12px_rgba(0,212,255,0.35)]" />

        <div className="min-w-0">
          <h1 className="font-mono font-bold text-xl sm:text-2xl tracking-tight text-text-primary leading-none">
            ATTACK<span className="text-accent-cyan">FEED</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-text-secondary truncate">
            Real-time cybersecurity intelligence, aggregated from 25+ trusted sources
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
        </a>
      </div>
    </div>
  );
}
