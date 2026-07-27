import type {
  EnrichmentResponse,
  EnrichmentStatus,
} from "@/lib/enrichment-types"
import { lookupWhois } from "./whois"
import { lookupGeoIp } from "./geoip"
import { checkSsl } from "./ssl"
import { checkVirusTotal } from "./virustotal"

// ─── Normalisation ────────────────────────────────────────────

interface NormalizedTarget {
  normalized: string // hostname or IP
  type: "url" | "ip"
  originalUrl: string // used for VirusTotal
}

function normalizeTarget(input: string): NormalizedTarget {
  const trimmed = input.trim()

  // Bare IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(trimmed)) {
    return { normalized: trimmed, type: "ip", originalUrl: `http://${trimmed}` }
  }

  // URL or domain
  try {
    let urlStr = trimmed
    if (!/^https?:\/\//i.test(urlStr)) urlStr = `https://${urlStr}`
    const url = new URL(urlStr)
    return {
      normalized: url.hostname.toLowerCase(),
      type: "url",
      originalUrl: urlStr,
    }
  } catch {
    const cleaned = trimmed.replace(/\/+$/, "").toLowerCase()
    return { normalized: cleaned, type: "url", originalUrl: `https://${cleaned}` }
  }
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Main entry-point: normalise the target, run all modules concurrently,
 * and return the full enrichment response.
 *
 * This version runs without a database — no caching, direct execution.
 * Each call re-runs all modules fresh.
 */
export async function runEnrichment(
  targetInput: string,
  _reportId?: string
): Promise<EnrichmentResponse> {
  const { normalized, type, originalUrl } = normalizeTarget(targetInput)

  // ── Run all modules concurrently ──────────────────────────
  const [whoisResult, geoipResult, sslResult, vtResult] =
    await Promise.allSettled([
      lookupWhois(normalized),
      lookupGeoIp(normalized),
      type === "url" ? checkSsl(normalized) : Promise.resolve(null),
      checkVirusTotal(originalUrl),
    ])

  const now = new Date().toISOString()

  // ── Build module responses ────────────────────────────────
  function buildModule<T>(
    settled: PromiseSettledResult<T | null>,
    skipModule = false
  ): {
    status: EnrichmentStatus
    data: T | null
    error: string | null
    checkedAt: string | null
  } {
    if (skipModule) {
      return { status: "pending", data: null, error: null, checkedAt: null }
    }
    if (settled.status === "fulfilled") {
      if (settled.value === null) {
        return { status: "pending", data: null, error: null, checkedAt: null }
      }
      return {
        status: "completed",
        data: settled.value,
        error: null,
        checkedAt: now,
      }
    }
    const errMsg =
      settled.reason instanceof Error
        ? settled.reason.message
        : "Unknown error"
    return {
      status: errMsg === "RATE_LIMITED" ? "rate_limited" : "failed",
      data: null,
      error: errMsg,
      checkedAt: now,
    }
  }

  const whois = buildModule(whoisResult)
  const geoip = buildModule(geoipResult)
  const ssl = buildModule(sslResult, type !== "url")
  const virustotal = buildModule(vtResult)

  // ── Compute overall status ────────────────────────────────
  const statuses = [whois.status, geoip.status, ssl.status, virustotal.status]
  let overallStatus: EnrichmentStatus | "partial" = "completed"
  if (statuses.some((s) => s === "running")) {
    overallStatus = "running"
  } else if (
    statuses
      .filter((s) => s !== "pending")
      .every((s) => s === "failed" || s === "rate_limited")
  ) {
    overallStatus = "failed"
  } else if (
    statuses.some(
      (s) => s === "failed" || s === "rate_limited"
    )
  ) {
    overallStatus = "partial"
  }

  return {
    id: `enrich-${Date.now()}`,
    normalizedTarget: normalized,
    targetType: type,
    overallStatus,
    lastCheckedAt: now,
    cached: false,
    whois,
    geoip,
    ssl,
    virustotal,
    screenshot: {
      status: "pending",
      data: null,
      error: null,
      checkedAt: null,
    },
  }
}
