"use client"

import type { ReportFormData } from "@/lib/report-types"
import { cn } from "@/lib/utils"
import {
  Globe,
  Smartphone,
  Monitor,
  Mail,
  MessageSquare,
  Phone,
  Users,
  Landmark,
  QrCode,
  Wifi,
  HelpCircle,
} from "lucide-react"

const PLATFORMS = [
  { value: "website", label: "Website / Web App", icon: Globe },
  { value: "android", label: "Mobile App (Android)", icon: Smartphone },
  { value: "ios", label: "Mobile App (iOS)", icon: Smartphone },
  { value: "desktop", label: "Desktop Application", icon: Monitor },
  { value: "email", label: "Email", icon: Mail },
  { value: "messaging", label: "SMS / WhatsApp / Telegram", icon: MessageSquare },
  { value: "phone", label: "Phone Call", icon: Phone },
  { value: "social", label: "Social Media", icon: Users },
  { value: "banking", label: "Online Banking / UPI App", icon: Landmark },
  { value: "qr", label: "QR Code Scan", icon: QrCode },
  { value: "wifi", label: "Public Wi-Fi", icon: Wifi },
  { value: "unsure", label: "I'm not sure", icon: HelpCircle },
]

interface StepPlatformProps {
  data: ReportFormData
  onChange: (updates: Partial<ReportFormData>) => void
}

export function StepPlatform({ data, onChange }: StepPlatformProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PLATFORMS.map((platform) => {
        const Icon = platform.icon
        const isSelected = data.platform === platform.value
        return (
          <button
            key={platform.value}
            type="button"
            onClick={() => onChange({ platform: platform.value })}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
              isSelected
                ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                : "border-border/60 bg-secondary/40 hover:border-primary/40 hover:bg-secondary/80"
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {platform.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
