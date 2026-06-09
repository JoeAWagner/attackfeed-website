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

export function extractImageFromRss(item: Record<string, unknown>): string | null {
  // media:content
  const mediaContent = item["media:content"] as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  // media:thumbnail
  const mediaThumbnail = item["media:thumbnail"] as { $?: { url?: string } } | undefined;
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;

  // enclosure
  const enclosure = item["enclosure"] as { url?: string; type?: string } | undefined;
  if (enclosure?.url && enclosure.type?.startsWith("image/")) return enclosure.url;

  // image in content
  const content = (item["content:encoded"] as string | undefined) ?? (item["content"] as string | undefined) ?? "";
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];

  return null;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
