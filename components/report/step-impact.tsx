"use client"

import type { ReportFormData } from "@/lib/report-types"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const IMPACTS = [
  "Nothing visible yet",
  "Lost money or unauthorized transactions",
  "Account was locked or taken over",
  "Personal data was leaked",
  "Received threats or blackmail",
  "My contacts were spammed",
  "Device stopped working",
  "Files are inaccessible or encrypted",
  "Getting strange targeted ads",
  "Receiving spam messages now",
  "A fake profile was made using my identity",
  "Not sure",
]

interface StepImpactProps {
  data: ReportFormData
  onChange: (updates: Partial<ReportFormData>) => void
}

export function StepImpact({ data, onChange }: StepImpactProps) {
  function toggleImpact(impact: string) {
    const current = data.impacts
    const updated = current.includes(impact)
      ? current.filter((i) => i !== impact)
      : [...current, impact]
    onChange({ impacts: updated })
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="mb-2 text-xs text-muted-foreground">
        Select all that apply
      </p>
      <div className="grid grid-cols-1 gap-2.5">
        {IMPACTS.map((impact) => {
          const isChecked = data.impacts.includes(impact)
          return (
            <button
              key={impact}
              type="button"
              onClick={() => toggleImpact(impact)}
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
                {impact}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
