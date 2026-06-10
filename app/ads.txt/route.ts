// AdSense requires /ads.txt at the domain root listing the publisher id.
// Served dynamically so the id lives in an env var instead of a committed file.
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // e.g. ca-pub-1234567890123456
  if (!client) {
    return new Response("", { status: 404 });
  }
  const pubId = client.replace(/^ca-/, ""); // ads.txt wants pub-..., not ca-pub-...
  return new Response(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain" },
  });
}
