export interface ReportFormData {
  // Step 1 - Where did this happen?
  platform: string

  // Step 2 - What suspicious activity?
  suspiciousActivities: string[]

  // Step 3 - What permissions were requested?
  devicePermissions: string[]
  personalInfoShared: string[]
  accountAccessGiven: string[]

  // Step 4 - What was the impact?
  impacts: string[]

  // Step 5 - Timeline & context
  whenHappened: string
  clickedSuspiciousLink: string
  downloadedFile: string
  sharedOTP: string
  allowedRemoteAccess: string
  concernLevel: number
}

export const initialFormData: ReportFormData = {
  platform: "",
  suspiciousActivities: [],
  devicePermissions: [],
  personalInfoShared: [],
  accountAccessGiven: [],
  impacts: [],
  whenHappened: "",
  clickedSuspiciousLink: "",
  downloadedFile: "",
  sharedOTP: "",
  allowedRemoteAccess: "",
  concernLevel: 0,
}

export const STEP_LABELS = [
  "Platform",
  "Activity",
  "Permissions",
  "Impact",
  "Timeline",
] as const

export const STEP_TITLES = [
  "Where did this happen?",
  "What suspicious activity did you notice?",
  "What permissions were requested or did you allow?",
  "What was the impact?",
  "Timeline and context",
] as const

export const STEP_DESCRIPTIONS = [
  "Tell us which platform or channel the incident occurred on.",
  "Select all suspicious behaviors you experienced.",
  "Select any permissions or information that were requested or shared.",
  "What consequences have you noticed so far?",
  "Help us understand the timeline and circumstances.",
] as const
