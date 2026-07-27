"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { ReportFormData } from "@/lib/report-types"
import { detectAttacks } from "@/lib/detect-attacks"
import { SeveritySummary } from "@/components/results/severity-summary"
import { EmergencyBanner } from "@/components/results/emergency-banner"
import { ThreatCard } from "@/components/results/threat-card"
import { ActionPlan } from "@/components/results/action-plan"
import { IncidentReport } from "@/components/results/incident-report"
import { Button } from "@/components/ui/button"
import {
  Shield,
  ArrowLeft,
  Scan,
  FileDown,
  ExternalLink,
  RotateCcw,
  BookOpen,
} from "lucide-react"

export default function ResultsPage() {
  const router = useRouter()
  const [data, setData] = useState<ReportFormData | null>(null)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("trustify-report")
    if (stored) {
      setData(JSON.parse(stored))
    } else {
      router.push("/report")
    }
  }, [router])

  const attacks = useMemo(() => (data ? detectAttacks(data) : []), [data])

  // Loading state
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Scan className="size-8 animate-pulse text-primary" />
            <span className="text-sm font-medium">Analyzing your report...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Downloadable report overlay
  if (showReport) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
            <button
              onClick={() => setShowReport(false)}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-3.5" />
              Back to Results
            </button>
            <IncidentReport data={data} attacks={attacks} />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-20">
          {/* Back link */}
          <Link
            href="/report"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            Back to Report
          </Link>

          <div className="flex flex-col gap-6">
            {/* 1. Severity Summary Banner */}
            <SeveritySummary attacks={attacks} />

            {/* 2. Emergency Banner (only for critical/financial) */}
            <EmergencyBanner attacks={attacks} />

            {/* 3. Threat Cards */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Scan className="size-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Detected Threats
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {attacks.map((attack, i) => (
                  <ThreatCard key={attack.name} attack={attack} index={i} />
                ))}
              </div>
            </section>

            {/* 4. Action Plan Checklist */}
            <ActionPlan data={data} attacks={attacks} />

            {/* 5. Official Resources Quick Links */}
            <section className="rounded-xl border border-border/60 bg-card/80 p-5 md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Official Resources
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    name: "National Cyber Crime Portal",
                    url: "https://cybercrime.gov.in/",
                    desc: "File an official complaint online",
                  },
                  {
                    name: "CERT-In",
                    url: "https://www.cert-in.org.in/",
                    desc: "Indian Computer Emergency Response Team",
                  },
                  {
                    name: "RBI Sachet",
                    url: "https://sachet.rbi.org.in/",
                    desc: "Report financial fraud and scams",
                  },
                  {
                    name: "Cyber Crime Helpline",
                    url: "tel:1930",
                    desc: "Call 1930 for immediate assistance",
                  },
                ].map((resource) => (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3.5 transition-colors hover:border-primary/40 hover:bg-secondary/80"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20">
                      <ExternalLink className="size-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {resource.name}
                      </span>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {resource.desc}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* 6. Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowReport(true)}
              >
                <FileDown className="size-3.5" />
                View Incident Report
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/report">
                  <RotateCcw className="size-3.5" />
                  Start New Report
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/resources">
                  <Shield className="size-3.5" />
                  All Resources
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
