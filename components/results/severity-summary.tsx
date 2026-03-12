import type { DetectedAttack } from "@/lib/detect-attacks"
import { ShieldAlert, ShieldCheck, Shield, ShieldQuestion } from "lucide-react"
import { cn } from "@/lib/utils"

interface SeveritySummaryProps {
  attacks: DetectedAttack[]
}

export function SeveritySummary({ attacks }: SeveritySummaryProps) {
  const highest = attacks.reduce<string>((acc, a) => {
    const order = ["Critical", "High", "Medium", "Low"]
    return order.indexOf(a.severity) < order.indexOf(acc) ? a.severity : acc
  }, "Low")

  const counts = {
    Critical: attacks.filter((a) => a.severity === "Critical").length,
    High: attacks.filter((a) => a.severity === "High").length,
    Medium: attacks.filter((a) => a.severity === "Medium").length,
    Low: attacks.filter((a) => a.severity === "Low").length,
  }

  const config: Record<
    string,
    {
      icon: typeof ShieldAlert
      label: string
      sublabel: string
      iconColor: string
      bg: string
      border: string
    }
  > = {
    Critical: {
      icon: ShieldAlert,
      label: "Critical Threat Level",
      sublabel: "Immediate action required. Your data and/or finances are at serious risk.",
      iconColor: "text-red-400",
      bg: "bg-red-500/5",
      border: "border-red-500/30",
    },
    High: {
      icon: ShieldAlert,
      label: "High Threat Level",
      sublabel: "Urgent action recommended. Your accounts or identity may be compromised.",
      iconColor: "text-orange-400",
      bg: "bg-orange-500/5",
      border: "border-orange-500/30",
    },
    Medium: {
      icon: Shield,
      label: "Medium Threat Level",
      sublabel: "Action needed. There are signs of compromise that require attention.",
      iconColor: "text-yellow-400",
      bg: "bg-yellow-500/5",
      border: "border-yellow-500/30",
    },
    Low: {
      icon: ShieldCheck,
      label: "Low Threat Level",
      sublabel: "Precautionary action advised. Some suspicious activity was detected.",
      iconColor: "text-green-400",
      bg: "bg-green-500/5",
      border: "border-green-500/30",
    },
  }

  const c = config[highest] || config.Medium
  const Icon = c.icon

  return (
    <div className={cn("rounded-xl border p-5 md:p-6", c.bg, c.border)}>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            highest === "Critical"
              ? "bg-red-500/10"
              : highest === "High"
              ? "bg-orange-500/10"
              : highest === "Medium"
              ? "bg-yellow-500/10"
              : "bg-green-500/10"
          )}
        >
          <Icon className={cn("size-6", c.iconColor)} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground md:text-2xl text-balance">
            {c.label}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {c.sublabel}
          </p>

          {/* Counts bar */}
          <div className="mt-4 flex flex-wrap gap-3">
            {attacks.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                <ShieldQuestion className="size-3" />
                {attacks.length} threat{attacks.length > 1 ? "s" : ""} identified
              </span>
            )}
            {counts.Critical > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                <span className="size-1.5 rounded-full bg-red-500" />
                {counts.Critical} Critical
              </span>
            )}
            {counts.High > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                <span className="size-1.5 rounded-full bg-orange-500" />
                {counts.High} High
              </span>
            )}
            {counts.Medium > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                <span className="size-1.5 rounded-full bg-yellow-500" />
                {counts.Medium} Medium
              </span>
            )}
            {counts.Low > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                <span className="size-1.5 rounded-full bg-green-500" />
                {counts.Low} Low
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
