"use client"

import { STEP_LABELS } from "@/lib/report-types"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressStepperProps {
  currentStep: number
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const percentage = ((currentStep + 1) / STEP_LABELS.length) * 100

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-5 md:p-6">
      {/* Top label row */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          Step {currentStep + 1} of {STEP_LABELS.length}
        </span>
        <span className="text-muted-foreground">
          {Math.round(percentage)}% Complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step labels row */}
      <div className="mt-4 hidden justify-between sm:flex">
        {STEP_LABELS.map((label, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          return (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary/20 text-primary ring-1 ring-primary/40",
                  !isCompleted && !isCurrent && "bg-secondary text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-3" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs transition-colors",
                  isCurrent && "font-medium text-primary",
                  isCompleted && "text-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mobile: current step label only */}
      <p className="mt-3 text-xs font-medium text-primary sm:hidden">
        {STEP_LABELS[currentStep]}
      </p>
    </div>
  )
}
