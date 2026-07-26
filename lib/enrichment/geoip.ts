import type { GeoIpResult } from "@/lib/enrichment-types"

/**
 * Returns geolocation, ISP, ASN, and proxy/hosting flags via the
 * free ip-api.com endpoint.
 *
 * ip-api.com accepts both raw IPs and domain names — it resolves
 * domains server-side, so we don't need a local DNS lookup.
 *
 * Rate limit: 45 req/min — generous enough for our use-case.
 * No API key required.
 */
export async function lookupGeoIp(target: string): Promise<GeoIpResult> {
  const fields =
    "status,message,query,country,countryCode,regionName,city,lat,lon,isp,org,as,proxy,hosting"
  const response = await fetch(
    `http://ip-api.com/json/${encodeURIComponent(target)}?fields=${fields}`
  )

  if (!response.ok) {
    throw new Error(`GeoIP lookup failed: HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.status === "fail") {
    throw new Error(`GeoIP lookup failed: ${data.message}`)
  }

  return {
    ip: data.query || target,
    country: data.country || null,
    countryCode: data.countryCode || null,
    region: data.regionName || null,
    city: data.city || null,
    lat: data.lat ?? null,
    lon: data.lon ?? null,
    isp: data.isp || null,
    org: data.org || null,
    asn: data.as || null,
    isProxy: data.proxy ?? false,
    isHosting: data.hosting ?? false,
  }
}

function isIpAddress(str: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(str) || str.includes(":")
}
