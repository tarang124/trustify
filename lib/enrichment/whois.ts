import type { WhoisResult } from "@/lib/enrichment-types"
import { whoisDomain, firstResult } from "whoiser"

/**
 * Performs a WHOIS lookup for the given domain and returns
 * structured registration data (registrar, dates, nameservers).
 */
export async function lookupWhois(domain: string): Promise<WhoisResult> {
  const raw = await whoisDomain(domain, { follow: 1 })

  // firstResult extracts the data from the first responding WHOIS server
  const data = firstResult(raw) as Record<string, unknown>

  if (!data || Object.keys(data).length === 0) {
    throw new Error(`No WHOIS data found for ${domain}`)
  }

  const createdDate = parseDate(
    data["Created Date"] ?? data["Creation Date"]
  )
  const expiresDate = parseDate(
    data["Expiry Date"] ??
      data["Registry Expiry Date"] ??
      data["Registrar Registration Expiration Date"]
  )

  let domainAgeDays: number | null = null
  if (createdDate) {
    domainAgeDays = Math.floor(
      (Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  return {
    domain,
    registrar: extractField(data, ["Registrar", "Registrar Name"]),
    createdDate,
    expiresDate,
    domainAgeDays,
    registrantOrg: extractField(data, [
      "Registrant Organization",
      "Registrant",
    ]),
    nameServers: extractArray(data, ["Name Server", "Name Servers"]),
    status: extractArray(data, ["Domain Status", "Status"]),
  }
}

// ─── helpers ──────────────────────────────────────────────────

function extractField(
  data: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const val = data[key]
    if (val) return Array.isArray(val) ? val[0] : String(val)
  }
  return null
}

function extractArray(
  data: Record<string, unknown>,
  keys: string[]
): string[] {
  for (const key of keys) {
    const val = data[key]
    if (val) return Array.isArray(val) ? val.map(String) : [String(val)]
  }
  return []
}

function parseDate(value: unknown): string | null {
  if (!value) return null
  const str = Array.isArray(value) ? value[0] : String(value)
  const date = new Date(str)
  return isNaN(date.getTime()) ? null : date.toISOString()
}
