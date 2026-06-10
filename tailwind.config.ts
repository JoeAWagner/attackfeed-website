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
          primary: "#0B0E13",
          secondary: "#0E1219",
          card: "#12171F",
          hover: "#1A2230",
        },
        accent: {
          cyan: "#38BDF8",
          "cyan-dim": "#0C7ABF",
          red: "#FF3B47",
          yellow: "#FBBF24",
          orange: "#FB923C",
          purple: "#8B5CF6",
          green: "#34D399",
        },
        border: {
          DEFAULT: "#2A3340",
          bright: "#3A4754",
        },
        text: {
          primary: "#E8EDF2",
          secondary: "#7A8694",
          muted: "#4A5568",
        },
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
