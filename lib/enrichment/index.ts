import { prisma } from "@/lib/prisma"
import type {
  EnrichmentResponse,
  EnrichmentStatus,
} from "@/lib/enrichment-types"
import { lookupWhois } from "./whois"
import { lookupGeoIp } from "./geoip"
import { checkSsl } from "./ssl"
import { checkVirusTotal } from "./virustotal"

// ─── Cache TTLs (hours) ───────────────────────────────────────
// WHOIS / GeoIP: domain info and IP location rarely change
// SSL: certificates can be reissued, check daily
// VirusTotal: reputation can change, 24-48 h window
const CACHE_TTL: Record<string, number> = {
  whois: 7 * 24,
  geoip: 7 * 24,
  ssl: 24,
  virustotal: 36,
}

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

function isStale(checkedAt: Date | null, ttlHours: number): boolean {
  if (!checkedAt) return true
  return Date.now() - checkedAt.getTime() > ttlHours * 3_600_000
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Main entry-point: normalise the target, check the DB cache,
 * run any stale / missing modules concurrently, persist results,
 * and return the full enrichment response.
 */
export async function runEnrichment(
  targetInput: string,
  reportId?: string
): Promise<EnrichmentResponse> {
  const { normalized, type, originalUrl } = normalizeTarget(targetInput)

  // ── 1. Look up the cache ──────────────────────────────────
  let record = await prisma.enrichmentResult.findUnique({
    where: { normalizedTarget: normalized },
  })

  // ── 2. Determine which modules need running ───────────────
  const needsWhois =
    !record ||
    record.whoisStatus === "pending" ||
    record.whoisStatus === "failed" ||
    isStale(record.whoisCheckedAt, CACHE_TTL.whois)

  const needsGeoip =
    !record ||
    record.geoipStatus === "pending" ||
    record.geoipStatus === "failed" ||
    isStale(record.geoipCheckedAt, CACHE_TTL.geoip)

  const needsSsl =
    type === "url" &&
    (!record ||
      record.sslStatus === "pending" ||
      record.sslStatus === "failed" ||
      isStale(record.sslCheckedAt, CACHE_TTL.ssl))

  const needsVt =
    !record ||
    record.vtStatus === "pending" ||
    (record.vtStatus === "failed" &&
      record.vtError !==
        "VIRUSTOTAL_API_KEY environment variable is not set") ||
    isStale(record.vtCheckedAt, CACHE_TTL.virustotal)

  const anythingNeeded = needsWhois || needsGeoip || needsSsl || needsVt

  // ── 3. Create or mark running ─────────────────────────────
  if (!record) {
    record = await prisma.enrichmentResult.create({
      data: {
        normalizedTarget: normalized,
        targetType: type,
        overallStatus: "running",
      },
    })
  } else if (anythingNeeded) {
    record = await prisma.enrichmentResult.update({
      where: { id: record.id },
      data: { overallStatus: "running", lastCheckedAt: new Date() },
    })
  }

  // ── 4. Link to report ─────────────────────────────────────
  if (reportId) {
    await prisma.report
      .update({
        where: { id: reportId },
        data: { enrichmentId: record.id },
      })
      .catch(() => {
        /* report may not exist yet — ignore */
      })
  }

  // ── 5. Run modules concurrently ───────────────────────────
  const tasks: Promise<void>[] = []

  if (needsWhois) {
    tasks.push(runModule("whois", record.id, () => lookupWhois(normalized)))
  }
  if (needsGeoip) {
    tasks.push(runModule("geoip", record.id, () => lookupGeoIp(normalized)))
  }
  if (needsSsl) {
    tasks.push(runModule("ssl", record.id, () => checkSsl(normalized)))
  }
  if (needsVt) {
    tasks.push(
      runModule("virustotal", record.id, () => checkVirusTotal(originalUrl))
    )
  }

  await Promise.allSettled(tasks)

  // ── 6. Reload and compute overall status ──────────────────
  const finalRecord = await prisma.enrichmentResult.findUniqueOrThrow({
    where: { id: record.id },
  })

  const statuses = [
    finalRecord.whoisStatus,
    finalRecord.geoipStatus,
    finalRecord.sslStatus,
    finalRecord.vtStatus,
  ]

  let overallStatus: string = "completed"
  if (statuses.some((s) => s === "running")) {
    overallStatus = "running"
  } else if (statuses.every((s) => s === "failed" || s === "rate_limited")) {
    overallStatus = "failed"
  } else if (
    statuses.some(
      (s) => s === "failed" || s === "rate_limited" || s === "pending"
    )
  ) {
    overallStatus = "partial"
  }

  await prisma.enrichmentResult.update({
    where: { id: finalRecord.id },
    data: { overallStatus },
  })

  return formatResponse(finalRecord, overallStatus, !anythingNeeded)
}

// ─── Internal helpers ─────────────────────────────────────────

type ModuleName = "whois" | "geoip" | "ssl" | "virustotal"

const DB_COLUMN_MAP: Record<
  ModuleName,
  { status: string; data: string; error: string; checked: string }
> = {
  whois: {
    status: "whoisStatus",
    data: "whoisData",
    error: "whoisError",
    checked: "whoisCheckedAt",
  },
  geoip: {
    status: "geoipStatus",
    data: "geoipData",
    error: "geoipError",
    checked: "geoipCheckedAt",
  },
  ssl: {
    status: "sslStatus",
    data: "sslData",
    error: "sslError",
    checked: "sslCheckedAt",
  },
  virustotal: {
    status: "vtStatus",
    data: "vtData",
    error: "vtError",
    checked: "vtCheckedAt",
  },
}

async function runModule(
  name: ModuleName,
  recordId: string,
  fn: () => Promise<unknown>
): Promise<void> {
  const cols = DB_COLUMN_MAP[name]
  try {
    const result = await fn()
    await prisma.enrichmentResult.update({
      where: { id: recordId },
      data: {
        [cols.status]: "completed",
        [cols.data]: JSON.stringify(result),
        [cols.error]: null,
        [cols.checked]: new Date(),
      },
    })
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error"
    await prisma.enrichmentResult.update({
      where: { id: recordId },
      data: {
        [cols.status]: message === "RATE_LIMITED" ? "rate_limited" : "failed",
        [cols.error]: message,
        [cols.checked]: new Date(),
      },
    })
  }
}

function formatResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: any,
  overallStatus: string,
  cached: boolean
): EnrichmentResponse {
  const parseJson = (raw: string | null) =>
    raw ? JSON.parse(raw) : null

  return {
    id: record.id,
    normalizedTarget: record.normalizedTarget,
    targetType: record.targetType as "url" | "ip",
    overallStatus: overallStatus as EnrichmentStatus | "partial",
    lastCheckedAt: record.lastCheckedAt.toISOString(),
    cached,
    whois: {
      status: record.whoisStatus as EnrichmentStatus,
      data: parseJson(record.whoisData),
      error: record.whoisError,
      checkedAt: record.whoisCheckedAt?.toISOString() ?? null,
    },
    geoip: {
      status: record.geoipStatus as EnrichmentStatus,
      data: parseJson(record.geoipData),
      error: record.geoipError,
      checkedAt: record.geoipCheckedAt?.toISOString() ?? null,
    },
    ssl: {
      status: record.sslStatus as EnrichmentStatus,
      data: parseJson(record.sslData),
      error: record.sslError,
      checkedAt: record.sslCheckedAt?.toISOString() ?? null,
    },
    virustotal: {
      status: record.vtStatus as EnrichmentStatus,
      data: parseJson(record.vtData),
      error: record.vtError,
      checkedAt: record.vtCheckedAt?.toISOString() ?? null,
    },
    screenshot: {
      status: (record.screenshotStatus as EnrichmentStatus) || "pending",
      data: parseJson(record.screenshotData),
      error: record.screenshotError,
      checkedAt: record.screenshotCheckedAt?.toISOString() ?? null,
    },
  }
}
