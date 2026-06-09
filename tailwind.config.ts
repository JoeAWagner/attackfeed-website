import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#080c12",
          secondary: "#0d1117",
          card: "#131920",
          hover: "#1a2233",
        },
        accent: {
          cyan: "#00d4ff",
          "cyan-dim": "#0077a8",
          red: "#f85149",
          yellow: "#e3b341",
          orange: "#ffa657",
          purple: "#bc8cff",
          green: "#3fb950",
        },
        border: {
          DEFAULT: "#21262d",
          bright: "#30363d",
        },
        text: {
          primary: "#e6edf3",
          secondary: "#8b949e",
          muted: "#484f58",
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
