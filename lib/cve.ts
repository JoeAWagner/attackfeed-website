// CVE extraction + CVSS lookup via the NVD API.
// NVD rate limits: 5 requests / 30s without a key, 50 / 30s with one.
// We cache every score in the DB (lib/db cve_scores) so each CVE is
// fetched at most once, and budget lookups per cron run.

export interface CvssResult {
  score: number | null;
  severity: string | null; // LOW | MEDIUM | HIGH | CRITICAL
}

const CVE_RE = /CVE-\d{4}-\d{4,7}/i;

/** First CVE id mentioned in the text, normalized to upper-case, or null. */
export function extractCve(text: string): string | null {
  const m = text.match(CVE_RE);
  return m ? m[0].toUpperCase() : null;
}

/** Map a CVSS base score to a severity label (CVSS v3 bands). */
export function severityFromScore(score: number): string {
  if (score >= 9.0) return "CRITICAL";
  if (score >= 7.0) return "HIGH";
  if (score >= 4.0) return "MEDIUM";
  if (score > 0.0) return "LOW";
  return "NONE";
}

/**
 * Look up a CVE's CVSS base score from NVD. Returns { score: null } when the
 * CVE exists but has no score yet (NVD analysis lag) or isn't found, so the
 * caller can still cache the attempt.
 */
export async function fetchCvss(cveId: string, timeoutMs = 8000): Promise<CvssResult> {
  const apiKey = process.env.NVD_API_KEY;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cveId)}`,
      {
        headers: apiKey ? { apiKey } : {},
        signal: controller.signal,
      }
    );
    if (!res.ok) return { score: null, severity: null };
    const data = await res.json();
    const metrics = data?.vulnerabilities?.[0]?.cve?.metrics;
    if (!metrics) return { score: null, severity: null };

    // Prefer CVSS v3.1, then v3.0, then v2
    const v3 = metrics.cvssMetricV31?.[0] ?? metrics.cvssMetricV30?.[0];
    if (v3?.cvssData) {
      const score = v3.cvssData.baseScore as number;
      const severity = (v3.cvssData.baseSeverity as string) ?? severityFromScore(score);
      return { score, severity: severity.toUpperCase() };
    }
    const v2 = metrics.cvssMetricV2?.[0];
    if (v2?.cvssData) {
      const score = v2.cvssData.baseScore as number;
      return { score, severity: severityFromScore(score) };
    }
    return { score: null, severity: null };
  } catch {
    return { score: null, severity: null };
  } finally {
    clearTimeout(timer);
  }
}

export const NVD_HAS_KEY = !!process.env.NVD_API_KEY;
