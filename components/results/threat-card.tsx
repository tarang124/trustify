"use client"

import { useState } from "react"
import type { DetectedAttack, Severity } from "@/lib/detect-attacks"
import { cn } from "@/lib/utils"
import {
  Lock,
  Monitor,
  Smartphone,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  Wifi,
  KeyRound,
  Bug,
  Landmark,
  Users,
  Megaphone,
  Keyboard,
  AlertTriangle,
  UserX,
  ChevronDown,
  ShieldAlert,
  Crosshair,
} from "lucide-react"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Lock,
  Monitor,
  Smartphone,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  Wifi,
  KeyRound,
  Bug,
  Landmark,
  Users,
  Megaphone,
  Keyboard,
  AlertTriangle,
  UserX,
}

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Critical: {
    label: "Critical",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
  },
  High: {
    label: "High",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
  },
  Medium: {
    label: "Medium",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    dot: "bg-yellow-500",
  },
  Low: {
    label: "Low",
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/30",
    dot: "bg-green-500",
  },
}

interface ThreatCardProps {
  attack: DetectedAttack
  index: number
}

export function ThreatCard({ attack, index }: ThreatCardProps) {
  const [expanded, setExpanded] = useState(index === 0)
  const Icon = ICONS[attack.icon] || AlertTriangle
  const sev = SEVERITY_CONFIG[attack.severity]

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border transition-all",
        sev.border,
        expanded ? "bg-card" : "bg-card/60 hover:bg-card/80"
      )}
    >
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 p-5 text-left md:p-6"
        aria-expanded={expanded}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            sev.bg
          )}
        >
          <Icon className={cn("size-5", sev.text)} />
        </div>

        {/* Title + badge */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-bold text-foreground">
              {attack.name}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                sev.bg,
                sev.text
              )}
            >
              <span className={cn("size-1.5 rounded-full", sev.dot)} />
              {sev.label}
            </span>
          </div>
          {!expanded && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {attack.description}
            </p>
          )}
        </div>

        {/* Expand chevron */}
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border/60 px-5 pb-6 pt-5 md:px-6">
          {/* Description */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {attack.description}
          </p>

          {/* Attacker access */}
          <div className="mt-5 rounded-lg border border-border/60 bg-secondary/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Crosshair className="size-3.5 text-destructive" />
              <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                What the attacker may have access to
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {attack.attackerAccess}
            </p>
          </div>

          {/* Action steps */}
          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="size-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Recommended Actions
              </span>
            </div>
            <ol className="flex flex-col gap-2.5">
              {attack.actions.map((action, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground/90">
                    {action}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Report links */}
          <div className="mt-5">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Report To
            </span>
            <div className="flex flex-wrap gap-2">
              {attack.reportTo.map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                  )}
                >
                  {r.name}
                  <svg
                    className="size-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
