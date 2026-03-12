"use client"

import type { ReportFormData } from "@/lib/report-types"
import { cn } from "@/lib/utils"
import { Check, Smartphone, User, KeyRound } from "lucide-react"

const PERMISSION_GROUPS = [
  {
    title: "Device Permissions",
    icon: Smartphone,
    field: "devicePermissions" as const,
    options: [
      "Camera",
      "Microphone",
      "Location/GPS",
      "Contacts",
      "Call logs or SMS",
      "Storage/Files",
      "Screen recording",
      "Accessibility service",
      "Device Administrator rights",
      "Install unknown apps",
    ],
  },
  {
    title: "Personal Info Shared",
    icon: User,
    field: "personalInfoShared" as const,
    options: [
      "Full name",
      "Date of birth",
      "Aadhaar/National ID",
      "PAN Card",
      "Bank account number",
      "Card number/CVV/expiry",
      "OTP",
      "Username and password",
      "Passport or Driving license",
    ],
  },
  {
    title: "Account Access Given",
    icon: KeyRound,
    field: "accountAccessGiven" as const,
    options: [
      "Login via Google or Facebook",
      "Email account access",
      "Social media access",
      "Cloud storage access",
    ],
  },
]

interface StepPermissionsProps {
  data: ReportFormData
  onChange: (updates: Partial<ReportFormData>) => void
}

export function StepPermissions({ data, onChange }: StepPermissionsProps) {
  function toggleItem(
    field: "devicePermissions" | "personalInfoShared" | "accountAccessGiven",
    item: string
  ) {
    const current = data[field]
    const updated = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item]
    onChange({ [field]: updated })
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-muted-foreground">
        Select all that apply in each category
      </p>
      {PERMISSION_GROUPS.map((group) => {
        const Icon = group.icon
        return (
          <div key={group.title}>
            {/* Group header */}
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <Icon className="size-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {group.title}
              </h3>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {group.options.map((option) => {
                const isChecked = data[group.field].includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleItem(group.field, option)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all",
                      isChecked
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border/60 bg-secondary/40 hover:border-primary/40 hover:bg-secondary/80"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-4.5 shrink-0 items-center justify-center rounded border transition-colors",
                        isChecked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-secondary"
                      )}
                    >
                      {isChecked && <Check className="size-2.5" />}
                    </div>
                    <span
                      className={cn(
                        "text-sm transition-colors",
                        isChecked ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {option}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
