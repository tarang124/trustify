import type { VirusTotalResult } from "@/lib/enrichment-types"

const VT_API_BASE = "https://www.virustotal.com/api/v3"

/**
 * Checks a URL's reputation via the VirusTotal v3 API.
 *
 * Flow:
 *   1. Try to GET the existing report by URL-id (base64url of the URL).
 *   2. If not found, POST the URL for a new scan and poll for results.
 *   3. Parse detection stats, threat names, and categories.
 *
 * Throws "RATE_LIMITED" on 429 responses so the orchestrator can
 * mark the module status accordingly.
 *
 * Requires env var: VIRUSTOTAL_API_KEY
 * Free tier: 4 requests/minute, 500 requests/day.
 */
export async function checkVirusTotal(url: string): Promise<VirusTotalResult> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY

  if (!apiKey) {
    throw new Error("VIRUSTOTAL_API_KEY environment variable is not set")
  }

  const urlId = Buffer.from(url).toString("base64url")
  let analysisData: Record<string, unknown> | null = null

  // ── Step 1: try to get an existing report ────────────────────
  try {
    const res = await fetch(`${VT_API_BASE}/urls/${urlId}`, {
      headers: { "x-apikey": apiKey },
    })

    if (res.status === 429) throw new Error("RATE_LIMITED")

    if (res.ok) {
      const json = await res.json()
      analysisData = json.data?.attributes ?? null
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "RATE_LIMITED") throw err
    // URL not in VT yet — we'll submit it below
  }

  // ── Step 2: submit for scanning if no report exists ──────────
  if (!analysisData) {
    const submitRes = await fetch(`${VT_API_BASE}/urls`, {
      method: "POST",
      headers: {
        "x-apikey": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `url=${encodeURIComponent(url)}`,
    })

    if (submitRes.status === 429) throw new Error("RATE_LIMITED")

    if (!submitRes.ok) {
      throw new Error(
        `VirusTotal submission failed: HTTP ${submitRes.status}`
      )
    }

    const submitJson = await submitRes.json()
    const analysisId = submitJson.data?.id as string | undefined

    if (!analysisId) {
      throw new Error("No analysis ID returned from VirusTotal")
    }

    // Poll for results (up to 3 attempts, 5 s apart)
    for (let attempt = 0; attempt < 3; attempt++) {
      await sleep(5_000)

      const pollRes = await fetch(
        `${VT_API_BASE}/analyses/${analysisId}`,
        { headers: { "x-apikey": apiKey } }
      )

      if (pollRes.status === 429) throw new Error("RATE_LIMITED")

      if (pollRes.ok) {
        const pollJson = await pollRes.json()
        if (pollJson.data?.attributes?.status === "completed") {
          analysisData = pollJson.data.attributes
          break
        }
      }
    }

    // Fallback: fetch URL report directly (might have been indexed by now)
    if (!analysisData) {
      const fallback = await fetch(`${VT_API_BASE}/urls/${urlId}`, {
        headers: { "x-apikey": apiKey },
      })
      if (fallback.ok) {
        const fbJson = await fallback.json()
        analysisData = fbJson.data?.attributes ?? null
      }
    }
  }

  if (!analysisData) {
    throw new Error("Could not retrieve VirusTotal analysis results")
  }

  // ── Step 3: parse results ────────────────────────────────────
  const stats = (analysisData.last_analysis_stats ?? {}) as Record<
    string,
    number
  >
  const results = (analysisData.last_analysis_results ?? {}) as Record<
    string,
    { category?: string; result?: string }
  >

  const threatNames: string[] = []
  for (const r of Object.values(results)) {
    if (
      (r.category === "malicious" || r.category === "suspicious") &&
      r.result &&
      !threatNames.includes(r.result)
    ) {
      threatNames.push(r.result)
    }
  }

  return {
    malicious: stats.malicious ?? 0,
    suspicious: stats.suspicious ?? 0,
    harmless: stats.harmless ?? 0,
    undetected: stats.undetected ?? 0,
    totalEngines:
      (stats.malicious ?? 0) +
      (stats.suspicious ?? 0) +
      (stats.harmless ?? 0) +
      (stats.undetected ?? 0),
    permalink: `https://www.virustotal.com/gui/url/${urlId}`,
    scanDate: analysisData.last_analysis_date
      ? new Date(
          (analysisData.last_analysis_date as number) * 1000
        ).toISOString()
      : null,
    categories: (analysisData.categories ?? {}) as Record<string, string>,
    threatNames,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
