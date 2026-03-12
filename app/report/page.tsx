import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ReportForm } from "@/components/report/report-form"
import { Shield, ArrowLeft } from "lucide-react"

export default function ReportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-20">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-3.5" />
              Back to Home
            </Link>

            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                <Shield className="size-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Report a Cyber Incident
              </h1>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
              Answer a few guided questions to help us identify the threat,
              generate your action plan, and connect you with the right
              authorities.
            </p>
          </div>

          {/* Multi-step form */}
          <ReportForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
