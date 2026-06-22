import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Palette from the AttackFeed brand kit: red #FF3B47 -> purple
      // #8B5CF6 -> blue #38BDF8 on near-black #0B0E13. Yellow/orange/green
      // (category + status colors) use the matching Tailwind-400 family.
      colors: {
        bg: {
          primary: "rgb(var(--bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--bg-secondary) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
          hover: "rgb(var(--bg-hover) / <alpha-value>)",
        },
        accent: {
          cyan: "rgb(var(--accent-cyan) / <alpha-value>)",
          red: "rgb(var(--accent-red) / <alpha-value>)",
          yellow: "rgb(var(--accent-yellow) / <alpha-value>)",
          orange: "rgb(var(--accent-orange) / <alpha-value>)",
          purple: "rgb(var(--accent-purple) / <alpha-value>)",
          green: "rgb(var(--accent-green) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          bright: "rgb(var(--border-bright) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        hairline: "rgb(var(--hairline) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
