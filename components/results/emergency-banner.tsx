import type { DetectedAttack } from "@/lib/detect-attacks"
import { Phone, ExternalLink, AlertTriangle } from "lucide-react"

interface EmergencyBannerProps {
  attacks: DetectedAttack[]
}

export function EmergencyBanner({ attacks }: EmergencyBannerProps) {
  const hasCritical = attacks.some((a) => a.severity === "Critical")
  const hasFinancial = attacks.some(
    (a) =>
      a.name.includes("SIM Swap") ||
      a.name.includes("UPI") ||
      a.name.includes("Vishing") ||
      a.name.includes("Banking")
  )

  if (!hasCritical && !hasFinancial) return null

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-400" />
        <div>
          <h3 className="text-base font-bold text-red-400">
            Immediate Action Required
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {hasFinancial
              ? "If you have lost money or suspect financial fraud, call the Cyber Crime Helpline immediately. Reporting within 24 hours significantly increases recovery chances."
              : "This is a critical-level threat. Take the recommended actions below immediately and report the incident to the authorities."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/30"
            >
              <Phone className="size-4" />
              Call 1930 Now
            </a>
            <a
              href="https://cybercrime.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <ExternalLink className="size-3.5" />
              cybercrime.gov.in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
