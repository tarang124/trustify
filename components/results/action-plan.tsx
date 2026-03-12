"use client"

import { useState } from "react"
import type { ReportFormData } from "@/lib/report-types"
import type { DetectedAttack } from "@/lib/detect-attacks"
import { cn } from "@/lib/utils"
import { Check, Circle, AlertTriangle, Clock, CalendarDays } from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

interface ActionItem {
  id: string
  text: string
}

type Priority = "now" | "today" | "week"

interface PrioritySection {
  priority: Priority
  label: string
  icon: React.ComponentType<{ className?: string }>
  dotColor: string
  headerBg: string
  headerText: string
  borderColor: string
  checkBg: string
  checkBorder: string
  items: ActionItem[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function hasAttack(attacks: DetectedAttack[], ...names: string[]): boolean {
  return attacks.some((a) =>
    names.some((n) => a.name.toLowerCase().includes(n.toLowerCase()))
  )
}

function hasActivity(data: ReportFormData, fragment: string): boolean {
  return data.suspiciousActivities.some((a) =>
    a.toLowerCase().includes(fragment.toLowerCase())
  )
}

function hasImpact(data: ReportFormData, fragment: string): boolean {
  return data.impacts.some((i) =>
    i.toLowerCase().includes(fragment.toLowerCase())
  )
}

function sharedInfo(data: ReportFormData, fragment: string): boolean {
  return data.personalInfoShared.some((p) =>
    p.toLowerCase().includes(fragment.toLowerCase())
  )
}

function anyFinancialInfoShared(data: ReportFormData): boolean {
  return (
    sharedInfo(data, "bank account") ||
    sharedInfo(data, "card number") ||
    sharedInfo(data, "otp") ||
    hasImpact(data, "money")
  )
}

// ─── Build action items ─────────────────────────────────────────────────────

function buildNowItems(
  data: ReportFormData,
  attacks: DetectedAttack[]
): ActionItem[] {
  const items: ActionItem[] = []

  // Change passwords — account takeover, phishing, vishing, keylogger
  if (
    hasAttack(attacks, "account takeover", "phishing", "vishing", "keylogger")
  ) {
    items.push({
      id: "now-passwords",
      text: "Change passwords for all affected accounts immediately",
    })
  }

  // Call bank — money lost, card shared, UPI fraud
  if (
    hasImpact(data, "money") ||
    sharedInfo(data, "card number") ||
    hasAttack(attacks, "upi", "sim swap")
  ) {
    items.push({
      id: "now-bank",
      text: "Call your bank and block your card/account",
    })
  }

  // Revoke permissions — any device permission granted
  if (data.devicePermissions.length > 0) {
    items.push({
      id: "now-permissions",
      text: "Revoke suspicious app permissions on your device",
    })
  }

  // Uninstall unknown apps — malware or spyware
  if (hasAttack(attacks, "malware", "spyware")) {
    items.push({
      id: "now-uninstall",
      text: "Uninstall any unknown or recently installed apps",
    })
  }

  // Disconnect from internet — RAT
  if (hasAttack(attacks, "remote access trojan")) {
    items.push({
      id: "now-disconnect",
      text: "Disconnect from the internet immediately (Wi-Fi and mobile data)",
    })
  }

  // Do NOT pay ransom — ransomware
  if (hasAttack(attacks, "ransomware")) {
    items.push({
      id: "now-ransom",
      text: "Do NOT pay the ransom — there is no guarantee of file recovery",
    })
  }

  // Contact telecom — SIM swap
  if (hasAttack(attacks, "sim swap")) {
    items.push({
      id: "now-telecom",
      text: "Contact your telecom provider immediately about SIM issues",
    })
  }

  return items
}

function buildTodayItems(
  data: ReportFormData,
  attacks: DetectedAttack[]
): ActionItem[] {
  const items: ActionItem[] = []

  // Antivirus scan — malware, spyware, RAT, keylogger
  if (
    hasAttack(attacks, "malware", "spyware", "remote access trojan", "keylogger")
  ) {
    items.push({
      id: "today-antivirus",
      text: "Run a full antivirus scan on your device",
    })
  }

  // Screenshot evidence — always
  items.push({
    id: "today-evidence",
    text: "Screenshot and save all evidence (messages, URLs, transaction IDs)",
  })

  // Warn contacts — messages sent from account
  if (hasActivity(data, "messages sent from my account")) {
    items.push({
      id: "today-warn",
      text: "Warn your contacts — they may receive fake messages from your account",
    })
  }

  // Check login sessions — account takeover, phishing
  if (hasAttack(attacks, "account takeover", "phishing")) {
    items.push({
      id: "today-sessions",
      text: "Check all your active login sessions and log out unknown devices",
    })
  }

  // File complaint — always
  items.push({
    id: "today-complaint",
    text: "File a complaint on cybercrime.gov.in or call 1930",
  })

  return items
}

function buildWeekItems(
  data: ReportFormData,
  attacks: DetectedAttack[]
): ActionItem[] {
  const items: ActionItem[] = []

  // 2FA — always
  items.push({
    id: "week-2fa",
    text: "Enable two-factor authentication on all accounts",
  })

  // haveibeenpwned — credentials or email shared
  if (
    sharedInfo(data, "username and password") ||
    sharedInfo(data, "otp") ||
    data.platform === "email"
  ) {
    items.push({
      id: "week-breach",
      text: "Check if your data was leaked at haveibeenpwned.com",
    })
  }

  // Update software — always
  items.push({
    id: "week-update",
    text: "Update all your apps, browser, and operating system",
  })

  // Review permissions — always
  items.push({
    id: "week-review",
    text: "Review all apps that have permissions on your phone",
  })

  // Monitor bank — financial info shared or money lost
  if (anyFinancialInfoShared(data)) {
    items.push({
      id: "week-monitor",
      text: "Monitor your bank statements daily for 30 days",
    })
  }

  return items
}

// ─── Component ──────────────────────────────────────────────────────────────

interface ActionPlanProps {
  data: ReportFormData
  attacks: DetectedAttack[]
}

export function ActionPlan({ data, attacks }: ActionPlanProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const sections: PrioritySection[] = [
    {
      priority: "now",
      label: "Do Right Now",
      icon: AlertTriangle,
      dotColor: "bg-red-500",
      headerBg: "bg-red-500/10",
      headerText: "text-red-400",
      borderColor: "border-red-500/30",
      checkBg: "bg-red-500",
      checkBorder: "border-red-500",
      items: buildNowItems(data, attacks),
    },
    {
      priority: "today",
      label: "Do Today",
      icon: Clock,
      dotColor: "bg-yellow-500",
      headerBg: "bg-yellow-500/10",
      headerText: "text-yellow-400",
      borderColor: "border-yellow-500/30",
      checkBg: "bg-yellow-500",
      checkBorder: "border-yellow-500",
      items: buildTodayItems(data, attacks),
    },
    {
      priority: "week",
      label: "Do This Week",
      icon: CalendarDays,
      dotColor: "bg-emerald-500",
      headerBg: "bg-emerald-500/10",
      headerText: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      checkBg: "bg-emerald-500",
      checkBorder: "border-emerald-500",
      items: buildWeekItems(data, attacks),
    },
  ]

  // Count totals
  const totalItems = sections.reduce((n, s) => n + s.items.length, 0)
  const totalChecked = checked.size

  return (
    <section className="flex flex-col gap-5">
      {/* Section header with completion counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="size-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
            Your Action Plan
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {totalChecked}/{totalItems} completed
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: totalItems > 0 ? `${(totalChecked / totalItems) * 100}%` : "0%",
          }}
        />
      </div>

      {/* Priority sections */}
      {sections.map((section) => {
        if (section.items.length === 0) return null
        const Icon = section.icon
        const sectionChecked = section.items.filter((item) =>
          checked.has(item.id)
        ).length

        return (
          <div
            key={section.priority}
            className={cn(
              "overflow-hidden rounded-xl border",
              section.borderColor,
              "bg-card/80"
            )}
          >
            {/* Section header */}
            <div
              className={cn(
                "flex items-center justify-between px-5 py-3.5",
                section.headerBg
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn("size-4", section.headerText)} />
                <h3
                  className={cn(
                    "text-sm font-bold uppercase tracking-wider",
                    section.headerText
                  )}
                >
                  {section.label}
                </h3>
              </div>
              <span
                className={cn("text-xs font-medium", section.headerText)}
              >
                {sectionChecked}/{section.items.length}
              </span>
            </div>

            {/* Checklist items */}
            <div className="flex flex-col divide-y divide-border/40">
              {section.items.map((item) => {
                const isChecked = checked.has(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "flex items-start gap-3.5 px-5 py-3.5 text-left transition-all",
                      isChecked
                        ? "bg-secondary/30"
                        : "hover:bg-secondary/20"
                    )}
                    aria-pressed={isChecked}
                  >
                    {/* Custom checkbox */}
                    <div
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-all",
                        isChecked
                          ? cn(section.checkBg, section.checkBorder, "text-background")
                          : "border-border bg-secondary"
                      )}
                    >
                      {isChecked ? (
                        <Check className="size-3" strokeWidth={3} />
                      ) : (
                        <Circle className="size-2 text-muted-foreground/30" />
                      )}
                    </div>

                    {/* Text */}
                    <span
                      className={cn(
                        "text-sm leading-relaxed transition-all",
                        isChecked
                          ? "text-muted-foreground line-through decoration-muted-foreground/40"
                          : "text-foreground"
                      )}
                    >
                      {item.text}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </section>
  )
}
