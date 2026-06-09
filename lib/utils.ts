import { formatDistanceToNow, format } from "date-fns";

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "…";
}

// Domains that never include images in their RSS — use their og:image via a proxy approach
const SOURCE_OG_IMAGES: Record<string, string> = {
  "Bleeping Computer":      "https://www.bleepingcomputer.com/images/bc-logo2-white-small.png",
  "SecurityWeek":           "https://www.securityweek.com/wp-content/uploads/2022/11/SecurityWeek-Logo-White.png",
  "CyberScoop":             "https://cyberscoop.com/wp-content/uploads/sites/3/2023/01/CyberScoop-white.png",
  "Hackread":               "https://hackread.com/wp-content/uploads/2022/05/hackread-logo.png",
  "Infosecurity Magazine":  "https://www.infosecurity-magazine.com/images/infosecurity_logo_white.png",
  "Dark Reading":           "https://www.darkreading.com/img/dark-reading-logo-white.png",
  "Security Magazine":      "https://www.securitymagazine.com/ext/resources/Logos/SM_Logo_White.png",
};

export function extractImageFromRss(
  item: Record<string, unknown>,
  sourceName?: string
): string | null {
  // media:content
  const mediaContent = item["media:content"] as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  // media:thumbnail
  const mediaThumbnail = item["media:thumbnail"] as { $?: { url?: string } } | undefined;
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;

  // enclosure (with or without type — some feeds omit type)
  const enclosure = item["enclosure"] as { url?: string; type?: string } | undefined;
  if (enclosure?.url) {
    // Accept if type starts with image/ OR type is missing (assume image)
    if (!enclosure.type || enclosure.type.startsWith("image/")) return enclosure.url;
  }

  // img tag in content:encoded or content HTML
  const content =
    (item["content:encoded"] as string | undefined) ??
    (item["content"] as string | undefined) ?? "";
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];

  // Fall back to source logo for known image-less feeds
  if (sourceName && SOURCE_OG_IMAGES[sourceName]) {
    return SOURCE_OG_IMAGES[sourceName];
  }

  return null;
}

export function detectSeverity(title: string): "critical" | "high" | null {
  const t = title.toLowerCase();
  if (/critical|zero.?day|0.?day|actively exploit|emergency|ransomware attack|data breach/.test(t))
    return "critical";
  if (/vulnerabilit|cve-\d|exploit|patch tuesday|malware|hack|backdoor|phish/.test(t))
    return "high";
  return null;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
