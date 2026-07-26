// ─── Module status ────────────────────────────────────────────
export type EnrichmentStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "rate_limited"

/**
 * Supported enrichment module types.
 * Add new entries here when extending the pipeline (e.g. "screenshot").
 */
export type EnrichmentModuleType =
  | "whois"
  | "geoip"
  | "ssl"
  | "virustotal"
  | "screenshot" // reserved — not yet implemented

// ─── Per-module result shapes ─────────────────────────────────

export interface WhoisResult {
  domain: string
  registrar: string | null
  createdDate: string | null // ISO-8601
  expiresDate: string | null
  domainAgeDays: number | null
  registrantOrg: string | null
  nameServers: string[]
  status: string[]
}

export interface GeoIpResult {
  ip: string
  country: string | null
  countryCode: string | null
  region: string | null
  city: string | null
  lat: number | null
  lon: number | null
  isp: string | null
  org: string | null
  asn: string | null
  isProxy: boolean
  isHosting: boolean
}

export interface SslResult {
  issuer: string | null
  subject: string | null
  validFrom: string | null // ISO-8601
  validTo: string | null
  daysUntilExpiry: number | null
  isSelfSigned: boolean
  isExpired: boolean
  protocol: string | null
  serialNumber: string | null
  subjectAltNames: string[]
}

export interface VirusTotalResult {
  malicious: number
  suspicious: number
  harmless: number
  undetected: number
  totalEngines: number
  permalink: string | null
  scanDate: string | null
  categories: Record<string, string> // engine → category
  threatNames: string[]
}

/** Extension point: screenshot data shape for future implementation. */
export interface ScreenshotResult {
  imageBase64: string | null
  capturedAt: string | null
  pageTitle: string | null
  finalUrl: string | null // after redirects
}

// ─── Wrapper for a single module's outcome ────────────────────

export interface ModuleResult<T> {
  status: EnrichmentStatus
  data: T | null
  error: string | null
  checkedAt: string | null
}

// ─── Full enrichment response returned by the API ─────────────

export interface EnrichmentResponse {
  id: string
  normalizedTarget: string
  targetType: "url" | "ip"
  overallStatus: EnrichmentStatus | "partial"
  lastCheckedAt: string
  cached: boolean

  whois: ModuleResult<WhoisResult>
  geoip: ModuleResult<GeoIpResult>
  ssl: ModuleResult<SslResult>
  virustotal: ModuleResult<VirusTotalResult>
  screenshot: ModuleResult<ScreenshotResult>
}
