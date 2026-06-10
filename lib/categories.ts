export interface Category {
  slug: string;
  name: string;
  description: string;
  accentColor: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "news",
    name: "Attack & News",
    description: "Latest cybersecurity news, threat reports, and attack campaigns",
    accentColor: "#38BDF8",
    tailwindBg: "bg-accent-cyan/10",
    tailwindText: "text-accent-cyan",
    tailwindBorder: "border-accent-cyan/30",
  },
  {
    slug: "gov-alerts",
    name: "Gov Alerts / ISAC",
    description: "CISA advisories, government alerts, and ISAC threat intelligence",
    accentColor: "#FBBF24",
    tailwindBg: "bg-accent-yellow/10",
    tailwindText: "text-accent-yellow",
    tailwindBorder: "border-accent-yellow/30",
  },
  {
    slug: "vulnerabilities",
    name: "Vulnerability Alerts",
    description: "CVEs, zero-days, exploits, and security advisories",
    accentColor: "#FF3B47",
    tailwindBg: "bg-accent-red/10",
    tailwindText: "text-accent-red",
    tailwindBorder: "border-accent-red/30",
  },
  {
    slug: "privacy",
    name: "Privacy & Governance",
    description: "Privacy legislation, compliance news, and data protection",
    accentColor: "#8B5CF6",
    tailwindBg: "bg-accent-purple/10",
    tailwindText: "text-accent-purple",
    tailwindBorder: "border-accent-purple/30",
  },
  {
    slug: "fraud",
    name: "Fraud & Scams",
    description: "Fraud alerts, phishing campaigns, and consumer scam warnings",
    accentColor: "#FB923C",
    tailwindBg: "bg-accent-orange/10",
    tailwindText: "text-accent-orange",
    tailwindBorder: "border-accent-orange/30",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export const ALL_CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);
