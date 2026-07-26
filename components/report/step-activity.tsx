"use client"

import type { ReportFormData } from "@/lib/report-types"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const ACTIVITIES = [
  "App asked for unusual permissions",
  "Device became slow or hot",
  "Unknown apps appeared",
  "Messages sent from my account that I didn't send",
  "My account password stopped working",
  "I was redirected to a different website",
  "Constant pop-ups appeared",
  "Webcam or mic turned on by itself",
  "My files got encrypted or I see a ransom message",
  "Money was deducted without my action",
  "My personal info appeared online",
  "Someone knew things only I should know",
  "My screen was being controlled remotely",
  "Unknown logins detected",
  "Other",
]

interface StepActivityProps {
  data: ReportFormData
  onChange: (updates: Partial<ReportFormData>) => void
}

export function StepActivity({ data, onChange }: StepActivityProps) {
  function toggleActivity(activity: string) {
    const current = data.suspiciousActivities
    const updated = current.includes(activity)
      ? current.filter((a) => a !== activity)
      : [...current, activity]
    onChange({ suspiciousActivities: updated })
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="mb-2 text-xs text-muted-foreground">
        Select all that apply
      </p>
      <div className="grid grid-cols-1 gap-2.5">
        {ACTIVITIES.map((activity) => {
          const isChecked = data.suspiciousActivities.includes(activity)
          return (
            <button
              key={activity}
              type="button"
              onClick={() => toggleActivity(activity)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
                isChecked
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border/60 bg-secondary/40 hover:border-primary/40 hover:bg-secondary/80"
              )}
            >
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                  isChecked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary"
                )}
              >
                {isChecked && <Check className="size-3" />}
              </div>
              <span
                className={cn(
                  "text-sm transition-colors",
                  isChecked ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {activity}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
