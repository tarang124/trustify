"use client"

import type { ReportFormData } from "@/lib/report-types"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

const WHEN_OPTIONS = ["Today", "Yesterday", "This week", "This month", "Longer ago"]

const YES_NO_NOTSURE = ["Yes", "No", "Not sure"] as const
const YES_NO = ["Yes", "No"] as const

interface StepTimelineProps {
  data: ReportFormData
  onChange: (updates: Partial<ReportFormData>) => void
}

function RadioGroup({
  label,
  options,
  value,
  onSelect,
}: {
  label: string
  options: readonly string[]
  value: string
  onSelect: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                isSelected
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "border-border/60 bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:bg-secondary/80"
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="group p-0.5 transition-transform hover:scale-110"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  star <= value
                    ? "fill-primary text-primary"
                    : "fill-transparent text-muted-foreground/40 group-hover:text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {value === 0 && "Rate your concern"}
          {value === 1 && "Not very concerned"}
          {value === 2 && "Slightly concerned"}
          {value === 3 && "Moderately concerned"}
          {value === 4 && "Very concerned"}
          {value === 5 && "Extremely concerned"}
        </span>
      </div>
    </div>
  )
}

export function StepTimeline({ data, onChange }: StepTimelineProps) {
  return (
    <div className="flex flex-col gap-6">
      <RadioGroup
        label="When did this happen?"
        options={WHEN_OPTIONS}
        value={data.whenHappened}
        onSelect={(v) => onChange({ whenHappened: v })}
      />

      <div className="h-px bg-border/60" />

      <RadioGroup
        label="Did you click any suspicious link?"
        options={YES_NO_NOTSURE}
        value={data.clickedSuspiciousLink}
        onSelect={(v) => onChange({ clickedSuspiciousLink: v })}
      />

      <RadioGroup
        label="Did you download any file?"
        options={YES_NO_NOTSURE}
        value={data.downloadedFile}
        onSelect={(v) => onChange({ downloadedFile: v })}
      />

      <div className="h-px bg-border/60" />

      <RadioGroup
        label="Did you share an OTP with anyone?"
        options={YES_NO}
        value={data.sharedOTP}
        onSelect={(v) => onChange({ sharedOTP: v })}
      />

      <RadioGroup
        label="Did you allow anyone remote access to your device?"
        options={YES_NO}
        value={data.allowedRemoteAccess}
        onSelect={(v) => onChange({ allowedRemoteAccess: v })}
      />

      <div className="h-px bg-border/60" />

      <StarRating
        label="How concerned are you?"
        value={data.concernLevel}
        onChange={(v) => onChange({ concernLevel: v })}
      />
    </div>
  )
}
