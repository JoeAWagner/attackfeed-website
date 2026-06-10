const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function fetchOgImage(url: string, timeoutMs = 5000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    // og:image lives in <head>; cap how much we scan
    const html = (await res.text()).slice(0, 200_000);
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ??
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    const img = match?.[1]?.trim() ?? null;
    if (!img || !/^https?:\/\//i.test(img)) return null;
    return img.slice(0, 1000);
  } catch {
    return null;
  }
}

/** Fetch og:images for many URLs with bounded concurrency. Returns url -> image. */
export async function fetchOgImages(
  urls: string[],
  { concurrency = 6, budget = 50 }: { concurrency?: number; budget?: number } = {}
): Promise<Map<string, string>> {
  const queue = urls.slice(0, budget);
  const results = new Map<string, string>();

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) return;
      const img = await fetchOgImage(url);
      if (img) results.set(url, img);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));
  return results;
}
