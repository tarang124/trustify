import { NextRequest, NextResponse } from "next/server"
import { runEnrichment } from "@/lib/enrichment"

/**
 * POST /api/enrich
 *
 * Body: { url?: string, ip?: string, reportId?: string }
 *
 * Triggers the OSINT enrichment pipeline for the given URL or IP.
 * Creates a Report record if reportId is not supplied.
 * Returns the full EnrichmentResponse.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, ip, reportId } = body as {
      url?: string
      ip?: string
      reportId?: string
    }

    const target = url || ip

    if (!target || typeof target !== "string") {
      return NextResponse.json(
        { error: "Missing required field: url or ip" },
        { status: 400 }
      )
    }

    // Only link to a report if reportId is provided (from the report flow)
    // Standalone tool pages don't create report records
    const result = await runEnrichment(target, reportId || undefined)


    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error("[Enrichment API Error]", err)
    const message =
      err instanceof Error ? err.message : "Enrichment failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * GET /api/enrich
 *
 * Without a persistent database, cached lookups are not available.
 * Use POST to run a fresh enrichment.
 */
export async function GET() {
  return NextResponse.json(
    { error: "Use POST /api/enrich with { url: '...' } to run enrichment" },
    { status: 405 }
  )
}

