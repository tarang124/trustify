"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  type ReportFormData,
  initialFormData,
  STEP_TITLES,
  STEP_DESCRIPTIONS,
} from "@/lib/report-types"
import { ProgressStepper } from "./progress-stepper"
import { StepPlatform } from "./step-platform"
import { StepActivity } from "./step-activity"
import { StepPermissions } from "./step-permissions"
import { StepImpact } from "./step-impact"
import { StepTimeline } from "./step-timeline"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Lock,
  Clock,
  AlertTriangle,
} from "lucide-react"

export function ReportForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ReportFormData>(initialFormData)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [isAnimating, setIsAnimating] = useState(false)

  const updateFormData = useCallback(
    (updates: Partial<ReportFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }))
    },
    []
  )

  function canProceed(): boolean {
    switch (currentStep) {
      case 0:
        return formData.platform !== ""
      case 1:
        return formData.suspiciousActivities.length > 0
      case 2:
        // Permissions step is optional — user may not have shared any
        return true
      case 3:
        return formData.impacts.length > 0
      case 4:
        return (
          formData.whenHappened !== "" &&
          formData.clickedSuspiciousLink !== "" &&
          formData.downloadedFile !== "" &&
          formData.sharedOTP !== "" &&
          formData.allowedRemoteAccess !== "" &&
          formData.concernLevel > 0
        )
      default:
        return false
    }
  }

  function goNext() {
    if (!canProceed()) return
    if (currentStep < 4) {
      setDirection("forward")
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep((s) => s + 1)
        setIsAnimating(false)
      }, 200)
    } else {
      // Submit — store in sessionStorage for results page
      sessionStorage.setItem("trustify-report", JSON.stringify(formData))
      router.push("/results")
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setDirection("backward")
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep((s) => s - 1)
        setIsAnimating(false)
      }, 200)
    }
  }

  const animationClass = isAnimating
    ? direction === "forward"
      ? "opacity-0 translate-x-4"
      : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0"

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={currentStep} />

      {/* Step card */}
      <div className="rounded-xl border border-border/60 bg-card/80 p-5 md:p-8">
        {/* Step header */}
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-2">
            <AlertTriangle className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Step {currentStep + 1}
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground md:text-xl text-balance">
            {STEP_TITLES[currentStep]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {STEP_DESCRIPTIONS[currentStep]}
          </p>
        </div>

        {/* Step content with transition */}
        <div
          className={`transition-all duration-200 ease-out ${animationClass}`}
        >
          {currentStep === 0 && (
            <StepPlatform data={formData} onChange={updateFormData} />
          )}
          {currentStep === 1 && (
            <StepActivity data={formData} onChange={updateFormData} />
          )}
          {currentStep === 2 && (
            <StepPermissions data={formData} onChange={updateFormData} />
          )}
          {currentStep === 3 && (
            <StepImpact data={formData} onChange={updateFormData} />
          )}
          {currentStep === 4 && (
            <StepTimeline data={formData} onChange={updateFormData} />
          )}
        </div>

        {/* Navigation footer */}
        <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>

          <Button
            size="sm"
            onClick={goNext}
            disabled={!canProceed()}
            className="gap-1.5"
          >
            {currentStep === 4 ? (
              <>
                <Shield className="size-3.5" />
                Analyze Threat
              </>
            ) : (
              <>
                Next
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Trust footer */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Lock className="size-3.5 text-primary/60" />
          Private & Secure
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-primary/60" />
          Takes ~5 minutes
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="size-3.5 text-primary/60" />
          No data stored
        </div>
      </div>
    </div>
  )
}
