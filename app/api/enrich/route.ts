import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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

    // Create a report record to link enrichment to
    let effectiveReportId = reportId
    if (!effectiveReportId) {
      const report = await prisma.report.create({
        data: { suspiciousUrl: target },
      })
      effectiveReportId = report.id
    }

    const result = await runEnrichment(target, effectiveReportId)

    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error("[Enrichment API Error]", err)
    const message =
      err instanceof Error ? err.message : "Enrichment failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * GET /api/enrich?id=<enrichmentId>&target=<normalizedTarget>
 *
 * Fetch a cached enrichment result by ID or normalised target.
 * Useful for polling status or retrieving cached data.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const id = searchParams.get("id")
  const target = searchParams.get("target")

  try {
    let record
    if (id) {
      record = await prisma.enrichmentResult.findUnique({ where: { id } })
    } else if (target) {
      record = await prisma.enrichmentResult.findUnique({
        where: { normalizedTarget: target.trim().toLowerCase() },
      })
    }

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const parseJson = (raw: string | null) =>
      raw ? JSON.parse(raw) : null

    return NextResponse.json({
      id: record.id,
      normalizedTarget: record.normalizedTarget,
      targetType: record.targetType,
      overallStatus: record.overallStatus,
      lastCheckedAt: record.lastCheckedAt.toISOString(),
      cached: true,
      whois: {
        status: record.whoisStatus,
        data: parseJson(record.whoisData),
        error: record.whoisError,
        checkedAt: record.whoisCheckedAt?.toISOString() ?? null,
      },
      geoip: {
        status: record.geoipStatus,
        data: parseJson(record.geoipData),
        error: record.geoipError,
        checkedAt: record.geoipCheckedAt?.toISOString() ?? null,
      },
      ssl: {
        status: record.sslStatus,
        data: parseJson(record.sslData),
        error: record.sslError,
        checkedAt: record.sslCheckedAt?.toISOString() ?? null,
      },
      virustotal: {
        status: record.vtStatus,
        data: parseJson(record.vtData),
        error: record.vtError,
        checkedAt: record.vtCheckedAt?.toISOString() ?? null,
      },
      screenshot: {
        status: record.screenshotStatus,
        data: parseJson(record.screenshotData),
        error: record.screenshotError,
        checkedAt: record.screenshotCheckedAt?.toISOString() ?? null,
      },
    })
  } catch (err: unknown) {
    console.error("[Enrichment GET Error]", err)
    const message =
      err instanceof Error ? err.message : "Failed to fetch"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
