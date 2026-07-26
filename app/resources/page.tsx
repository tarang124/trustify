import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  ArrowLeft,
  ExternalLink,
  Phone,
  Globe,
  Building2,
  Shield,
  Landmark,
  Scale,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const resources = [
  {
    icon: Globe,
    title: "National Cyber Crime Reporting Portal",
    description:
      "The official Government of India portal for reporting all types of cyber crimes online.",
    url: "https://cybercrime.gov.in",
    tag: "Primary",
  },
  {
    icon: Phone,
    title: "Cyber Crime Helpline — 1930",
    description:
      "24/7 toll-free helpline for reporting financial frauds and cyber crimes. Call immediately if money was stolen.",
    url: "tel:1930",
    tag: "Emergency",
  },
  {
    icon: Shield,
    title: "CERT-In (Indian Computer Emergency Response Team)",
    description:
      "National nodal agency for responding to computer security incidents. Report malware, vulnerabilities, and hacking.",
    url: "https://cert-in.org.in",
    tag: "Technical",
  },
  {
    icon: Landmark,
    title: "RBI Ombudsman",
    description:
      "For complaints related to banking, UPI, wallet, or credit card fraud — file with the Reserve Bank of India.",
    url: "https://cms.rbi.org.in",
    tag: "Financial",
  },
  {
    icon: Building2,
    title: "State Cyber Crime Cells",
    description:
      "Each Indian state has a dedicated cyber crime cell. Visit your nearest police station or state cyber cell.",
    url: "https://cybercrime.gov.in",
    tag: "Local",
  },
  {
    icon: Scale,
    title: "IT Act, 2000 — Legal Reference",
    description:
      "Reference the Information Technology Act for understanding cyber crime laws and penalties in India.",
    url: "https://www.meity.gov.in/content/information-technology-act",
    tag: "Legal",
  },
]

export default function ResourcesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8 lg:py-24">
          {/* Page Header */}
          <div className="mb-12">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-3.5" />
              Back to Home
            </Link>

            <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Official Reporting Resources
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Below are verified government portals, helplines, and agencies
              where you can officially report cyber crimes in India.
            </p>
          </div>

          {/* Resources Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-border/60 bg-card/80 p-6 transition-all hover:border-primary/30 hover:bg-card"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 text-primary group-hover:bg-primary/15 transition-colors">
                    <resource.icon className="size-5" />
                  </div>
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                    {resource.tag}
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {resource.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Visit Resource
                  <ExternalLink className="size-3" />
                </div>
              </a>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Not sure where to start? Let Trustify guide you.
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link href="/report">Start Guided Report</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
