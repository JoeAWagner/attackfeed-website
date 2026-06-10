interface Props {
  size?: number;
  className?: string;
}

/**
 * AttackFeed mark: shield outline with a broadcasting feed beacon —
 * signal arcs radiating from a pulse dot, in the site's cyan gradient.
 */
export default function Logo({ size = 32, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="af-lg" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00d4ff" />
          <stop offset="1" stopColor="#006fa8" />
        </linearGradient>
        <linearGradient id="af-lg2" x1="20" y1="20" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7fe9ff" />
          <stop offset="1" stopColor="#00d4ff" />
        </linearGradient>
      </defs>

      {/* Shield */}
      <path
        d="M32 3.5 L57 13.5 V31 C57 45.8 46.6 56.9 32 61 C17.4 56.9 7 45.8 7 31 V13.5 Z"
        fill="#0c121b"
        stroke="url(#af-lg)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Feed beacon — pulse dot + radiating signal arcs */}
      <circle cx="23" cy="43" r="4" fill="url(#af-lg2)" />
      <path
        d="M23 31.5 A11.5 11.5 0 0 1 34.5 43"
        stroke="url(#af-lg2)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M23 22.5 A20.5 20.5 0 0 1 43.5 43"
        stroke="url(#af-lg2)"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}
