import type { MetadataRoute } from "next";
import { ALL_CATEGORY_SLUGS } from "@/lib/categories";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.attackfeed.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...ALL_CATEGORY_SLUGS.map((slug) => ({
      url: `${BASE}/category/${slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    {
      url: `${BASE}/search`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
