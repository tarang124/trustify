# Trustify — Technical Documentation

## Overview

Trustify is an AI-powered cyber attack reporting platform designed for Indian citizens. It combines a guided incident triage flow with automated OSINT (Open Source Intelligence) enrichment to help users understand and respond to cyber threats.

---

## Architecture

### Client-Side (Privacy-First)

The core report flow runs entirely in the browser:

1. **Report Form** (`/report`) — Multi-step questionnaire collecting incident details
2. **Attack Detection** (`lib/detect-attacks.ts`) — Rule-based pattern matching identifies attack types from user responses
3. **Results Page** (`/results`) — Displays detected threats, severity assessment, personalized action plan, and downloadable incident report

Personal data (incident descriptions, financial details) never leaves the browser. It's stored temporarily in `sessionStorage` and cleared when the session ends.

### Server-Side (OSINT Enrichment)

When a user reports a suspicious URL or IP address, the enrichment pipeline runs server-side via a Next.js API route:

```
POST /api/enrich  →  Orchestrator  →  [WHOIS, GeoIP, SSL, VirusTotal]  →  SQLite Cache  →  Response
```

This architecture keeps API keys secure and enables Node.js native modules (`tls` for SSL inspection, `dns` for resolution).

---

## OSINT Enrichment Pipeline

### Module Details

#### WHOIS (`lib/enrichment/whois.ts`)
- **Library:** `whoiser` (npm)
- **Data returned:** Domain registrar, creation date, expiry date, domain age (days), registrant organization, nameservers, domain status codes
- **No API key required**
- **Cache TTL:** 7 days (domain registration data rarely changes)

#### GeoIP (`lib/enrichment/geoip.ts`)
- **API:** ip-api.com (free tier, 45 req/min)
- **Data returned:** IP address, country, region, city, lat/lon coordinates, ISP, organization, ASN, proxy flag, hosting flag
- **No API key required**
- **Cache TTL:** 7 days

#### SSL Certificate (`lib/enrichment/ssl.ts`)
- **Method:** Node.js native `tls.connect()` with `rejectUnauthorized: false`
- **Data returned:** Certificate issuer, subject, validity period, days until expiry, self-signed check, TLS protocol version, serial number, Subject Alternative Names (SANs)
- **No API key required**
- **Cache TTL:** 24 hours (certificates can be reissued)

#### VirusTotal (`lib/enrichment/virustotal.ts`)
- **API:** VirusTotal v3
- **Data returned:** Detection ratio (malicious/suspicious/harmless/undetected counts), total engines scanned, threat names, engine categories, permalink to full report
- **API key required:** Free tier at [virustotal.com](https://www.virustotal.com/gui/my-apikey) (4 req/min, 500 req/day)
- **Cache TTL:** 36 hours
- **Rate limit handling:** Throws `RATE_LIMITED` error on HTTP 429, which the orchestrator catches and marks as `rate_limited` status

### Orchestrator (`lib/enrichment/index.ts`)

The orchestrator manages the entire enrichment lifecycle:

1. **Normalize** the target (extract hostname from URL, lowercase)
2. **Cache check** — query SQLite for existing results by `normalizedTarget`
3. **Staleness check** — compare each module's `checkedAt` timestamp against its TTL
4. **Concurrent execution** — run only stale/missing modules via `Promise.allSettled()`
5. **Persist results** — update the database row with new data, status, and timestamps
6. **Compute overall status** — `completed` | `partial` | `failed` | `running`

Each module failure is isolated — one failing module doesn't block others.

### Extension Points

The database schema, TypeScript interfaces, and API response all include a `screenshot` module (status `"pending"` by default). To add screenshots later:

1. Create `lib/enrichment/screenshot.ts`
2. Add a cache TTL entry in `lib/enrichment/index.ts`
3. Add a "Screenshot" tab to `components/results/threat-intel-panel.tsx`

---

## Database Schema

SQLite database via Prisma ORM, used **only** for caching enrichment results (no personal data is stored).

### Models

**Report**
| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| suspiciousUrl | String? | The URL/IP submitted for enrichment |
| enrichmentId | String? | FK to EnrichmentResult |
| createdAt | DateTime | Report creation timestamp |

**EnrichmentResult**
| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| normalizedTarget | String (unique) | Cache key (hostname or IP) |
| targetType | String | `"url"` or `"ip"` |
| overallStatus | String | `pending` / `running` / `completed` / `partial` / `failed` |
| lastCheckedAt | DateTime | Last time any module was checked |
| {module}Status | String | Per-module status |
| {module}Data | String? | JSON-serialized module result |
| {module}Error | String? | Error message if failed |
| {module}CheckedAt | DateTime? | Per-module timestamp for TTL |

Modules: `whois`, `geoip`, `ssl`, `vt` (VirusTotal), `screenshot`

---

## API Reference

### POST `/api/enrich`

Triggers the enrichment pipeline for a URL or IP.

**Request:**
```json
{
  "url": "https://suspicious-site.com",
  "reportId": "optional-report-id"
}
```

**Response:**
```json
{
  "id": "cuid",
  "normalizedTarget": "suspicious-site.com",
  "targetType": "url",
  "overallStatus": "completed",
  "cached": false,
  "lastCheckedAt": "2026-07-26T06:01:12Z",
  "whois": { "status": "completed", "data": { ... }, "error": null, "checkedAt": "..." },
  "geoip": { "status": "completed", "data": { ... }, "error": null, "checkedAt": "..." },
  "ssl": { "status": "completed", "data": { ... }, "error": null, "checkedAt": "..." },
  "virustotal": { "status": "completed", "data": { ... }, "error": null, "checkedAt": "..." },
  "screenshot": { "status": "pending", "data": null, "error": null, "checkedAt": null }
}
```

### GET `/api/enrich?target=<hostname>`

Fetch cached enrichment results without triggering a new scan.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite connection string. Default: `file:prisma/dev.db` |
| `VIRUSTOTAL_API_KEY` | Optional | VirusTotal v3 API key for URL reputation checks |

---

## Setup

```bash
git clone https://github.com/tarangpatel-redteam/trustify.git
cd trustify
npm install
cp .env.example .env
# Add your VIRUSTOTAL_API_KEY to .env (optional)
npx prisma db push
npm run dev
```

---

## Author

**Tarang Patel**
[LinkedIn](https://www.linkedin.com/in/tarangpatel-red-team/) · [GitHub](https://github.com/tarangpatel-redteam)
