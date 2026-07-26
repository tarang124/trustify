import type { ReportFormData } from "./report-types"

export type Severity = "Critical" | "High" | "Medium" | "Low"

export interface DetectedAttack {
  name: string
  severity: Severity
  icon: string
  description: string
  attackerAccess: string
  actions: string[]
  reportTo: { name: string; url: string }[]
}

// Helper predicates
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

function hasPermission(data: ReportFormData, fragment: string): boolean {
  return data.devicePermissions.some((p) =>
    p.toLowerCase().includes(fragment.toLowerCase())
  )
}

function credentialsShared(data: ReportFormData): boolean {
  return (
    sharedInfo(data, "username and password") ||
    sharedInfo(data, "otp") ||
    sharedInfo(data, "card number") ||
    sharedInfo(data, "bank account")
  )
}

// Official Indian reporting resources
const CERT_IN = { name: "CERT-In", url: "https://www.cert-in.org.in/" }
const CYBER_CRIME_PORTAL = {
  name: "National Cyber Crime Portal",
  url: "https://cybercrime.gov.in/",
}
const HELPLINE_1930 = {
  name: "Cyber Crime Helpline 1930",
  url: "tel:1930",
}
const RBI = {
  name: "RBI Sachet Portal",
  url: "https://sachet.rbi.org.in/",
}
const LOCAL_POLICE = {
  name: "Local Police / FIR",
  url: "https://cybercrime.gov.in/",
}

export function detectAttacks(data: ReportFormData): DetectedAttack[] {
  const attacks: DetectedAttack[] = []

  // 1. Ransomware
  if (hasActivity(data, "files got encrypted") || hasActivity(data, "ransom message")) {
    attacks.push({
      name: "Ransomware",
      severity: "Critical",
      icon: "Lock",
      description:
        "Ransomware is malicious software that encrypts your files and demands payment for their release. Attackers typically gain access through phishing emails, malicious downloads, or vulnerable software.",
      attackerAccess:
        "Full access to your files, potentially your entire system. They can encrypt, delete, or exfiltrate your data before locking it.",
      actions: [
        "Disconnect the affected device from the internet and all networks immediately",
        "Do NOT pay the ransom — there is no guarantee your files will be restored",
        "Photograph the ransom message with another device for evidence",
        "Report to CERT-In and file a complaint on cybercrime.gov.in",
        "Contact a professional data recovery service if files are critical",
        "After recovery, install reputable antivirus software and update all systems",
      ],
      reportTo: [CERT_IN, CYBER_CRIME_PORTAL, LOCAL_POLICE],
    })
  }

  // 2. Remote Access Trojan (RAT)
  if (
    hasActivity(data, "screen was being controlled remotely") ||
    data.allowedRemoteAccess === "Yes"
  ) {
    attacks.push({
      name: "Remote Access Trojan (RAT)",
      severity: "Critical",
      icon: "Monitor",
      description:
        "A Remote Access Trojan gives attackers full control of your device without your knowledge. They can view your screen, access files, and use your device as if they were sitting in front of it.",
      attackerAccess:
        "Complete control of your device — files, camera, microphone, keystrokes, passwords, banking apps, and all personal data stored on the device.",
      actions: [
        "Disconnect the device from the internet immediately (Wi-Fi and mobile data)",
        "Uninstall any remote access apps (TeamViewer, AnyDesk, etc.) you recently installed",
        "Change all passwords from a DIFFERENT, clean device",
        "Run a full antivirus scan and consider factory resetting the device",
        "Enable 2-Factor Authentication on all important accounts",
        "Monitor your bank accounts for unauthorized transactions",
      ],
      reportTo: [CERT_IN, CYBER_CRIME_PORTAL, HELPLINE_1930],
    })
  }

  // 3. SIM Swap Fraud
  if (
    data.platform === "banking" &&
    data.sharedOTP === "Yes" &&
    hasImpact(data, "money") 
  ) {
    attacks.push({
      name: "SIM Swap Fraud",
      severity: "Critical",
      icon: "Smartphone",
      description:
        "SIM swap fraud occurs when attackers convince your telecom provider to transfer your phone number to a new SIM card. This gives them access to all OTPs and SMS-based verifications.",
      attackerAccess:
        "All SMS-based OTPs, two-factor authentication codes, bank transaction approvals, and any account recoverable via your phone number.",
      actions: [
        "Contact your telecom provider IMMEDIATELY to report the SIM swap and block the number",
        "Call your bank's helpline to freeze all accounts linked to that number",
        "File a complaint at cybercrime.gov.in with your transaction details",
        "Call the Cyber Crime Helpline 1930 for financial fraud assistance",
        "Visit your bank branch with an ID to recover your accounts",
        "Switch to app-based 2FA (Google Authenticator) instead of SMS-based",
      ],
      reportTo: [HELPLINE_1930, CYBER_CRIME_PORTAL, RBI, LOCAL_POLICE],
    })
  }

  // 4. Vishing (Voice Phishing)
  if (
    data.platform === "phone" &&
    (sharedInfo(data, "otp") ||
      sharedInfo(data, "bank account") ||
      sharedInfo(data, "card number"))
  ) {
    attacks.push({
      name: "Vishing (Voice Phishing)",
      severity: "High",
      icon: "Phone",
      description:
        "Vishing is a phone-based social engineering attack where scammers impersonate bank officials, government agencies, or tech support to trick you into revealing sensitive information.",
      attackerAccess:
        "Whatever information you shared — potentially bank account details, OTPs, card numbers, or personal identifiers that can be used for financial fraud.",
      actions: [
        "Call your bank immediately and report the incident — request a temporary account freeze",
        "Change your internet banking and UPI passwords from a secure device",
        "Block the caller's number and save it as evidence",
        "File a complaint at cybercrime.gov.in with the caller's number and conversation details",
        "Alert your family members as scammers may try to contact them next",
        "Never share OTP, CVV, or PIN over the phone — banks will never ask for these",
      ],
      reportTo: [HELPLINE_1930, CYBER_CRIME_PORTAL, RBI],
    })
  }

  // 5. Phishing
  if (
    data.platform === "email" &&
    data.clickedSuspiciousLink === "Yes" &&
    credentialsShared(data)
  ) {
    attacks.push({
      name: "Phishing",
      severity: "High",
      icon: "Mail",
      description:
        "Phishing is a technique where attackers send fraudulent emails disguised as legitimate communications to steal your login credentials, financial information, or install malware.",
      attackerAccess:
        "Login credentials to your email and linked accounts, personal information, and potentially financial data if banking details were entered on the fake site.",
      actions: [
        "Change the password for the compromised account immediately from a clean device",
        "Enable 2-Factor Authentication on the affected account",
        "Check for unauthorized email forwarding rules or connected apps in your email settings",
        "Scan your device for malware using reputable antivirus software",
        "Report the phishing email to your email provider (mark as phishing/spam)",
        "Monitor your accounts for suspicious activity over the next 30 days",
      ],
      reportTo: [CERT_IN, CYBER_CRIME_PORTAL],
    })
  }

  // 6. Smishing
  if (
    data.platform === "messaging" &&
    data.clickedSuspiciousLink === "Yes"
  ) {
    attacks.push({
      name: "Smishing (SMS Phishing)",
      severity: "Low",
      icon: "MessageSquare",
      description:
        "Smishing uses fraudulent SMS or messaging app messages containing malicious links to steal personal data or install malware on your device.",
      attackerAccess:
        "Depending on the link's payload — potentially device access, login credentials, or personal information if you entered data on the linked site.",
      actions: [
        "Do not click any more links from the same sender",
        "Clear your browser history and cookies",
        "Run an antivirus scan on your device",
        "Block the sender's number",
        "If you entered any information, change those credentials immediately",
        "Report the number to your telecom provider for spam blocking",
      ],
      reportTo: [CYBER_CRIME_PORTAL, CERT_IN],
    })
  }

  // 7. Spyware / Stalkerware
  if (
    (hasPermission(data, "camera") ||
      hasPermission(data, "microphone") ||
      hasPermission(data, "location")) &&
    hasActivity(data, "webcam or mic turned on by itself")
  ) {
    attacks.push({
      name: "Spyware / Stalkerware",
      severity: "Medium",
      icon: "Eye",
      description:
        "Spyware secretly monitors your device activity — recording calls, capturing screenshots, tracking location, and accessing your camera and microphone without consent.",
      attackerAccess:
        "Real-time access to your camera, microphone, GPS location, call logs, messages, browsing history, and potentially all data on your device.",
      actions: [
        "Check your installed apps for anything unfamiliar and uninstall suspicious apps",
        "Revoke camera, microphone, and location permissions for apps you don't recognize",
        "Run a reputable anti-spyware scan (Malwarebytes, Norton)",
        "Consider factory resetting the device if spyware persists",
        "Change all passwords from a different, clean device",
        "If you suspect a known person, this may be a criminal offence — contact the police",
      ],
      reportTo: [CYBER_CRIME_PORTAL, LOCAL_POLICE],
    })
  }

  // 8. Man-in-the-Middle (MITM)
  if (
    data.platform === "wifi" &&
    (hasImpact(data, "money") || credentialsShared(data))
  ) {
    attacks.push({
      name: "Man-in-the-Middle Attack",
      severity: "Medium",
      icon: "Wifi",
      description:
        "A Man-in-the-Middle attack intercepts your communication over an unsecured network. Attackers can capture everything you transmit — passwords, messages, and financial data.",
      attackerAccess:
        "All data transmitted over the compromised network — login credentials, banking details, emails, and any unencrypted communications.",
      actions: [
        "Disconnect from the public Wi-Fi immediately",
        "Change all passwords for accounts accessed during that session",
        "Check your bank accounts for unauthorized transactions",
        "Avoid using public Wi-Fi for banking or sensitive activities in the future",
        "Use a trusted VPN when connecting to public networks",
        "Enable HTTPS-only mode in your browser settings",
      ],
      reportTo: [CERT_IN, CYBER_CRIME_PORTAL],
    })
  }

  // 9. Identity Theft
  if (
    (sharedInfo(data, "aadhaar") ||
      sharedInfo(data, "pan") ||
      sharedInfo(data, "passport")) &&
    (hasImpact(data, "fake profile") || hasImpact(data, "data was leaked"))
  ) {
    attacks.push({
      name: "Identity Theft",
      severity: "High",
      icon: "UserX",
      description:
        "Identity theft occurs when someone uses your personal identification documents (Aadhaar, PAN, Passport) to impersonate you for fraud, loans, or criminal activities.",
      attackerAccess:
        "Your government-issued identity, which can be used to open bank accounts, take loans, create fake profiles, or commit crimes in your name.",
      actions: [
        "Lock your Aadhaar biometrics at myaadhaar.uidai.gov.in immediately",
        "File an identity theft complaint at cybercrime.gov.in",
        "Alert your bank and request enhanced verification for all transactions",
        "Check your CIBIL score for any unauthorized loans or credit inquiries",
        "File a police FIR with copies of your ID documents",
        "Monitor for any legal notices or communications from unknown institutions",
      ],
      reportTo: [CYBER_CRIME_PORTAL, LOCAL_POLICE, HELPLINE_1930],
    })
  }

  // 10. Account Takeover
  if (
    hasActivity(data, "password stopped working") ||
    hasActivity(data, "unknown logins")
  ) {
    attacks.push({
      name: "Account Takeover",
      severity: "High",
      icon: "KeyRound",
      description:
        "Account takeover happens when attackers gain unauthorized access to your online accounts by stealing or guessing your credentials, then lock you out.",
      attackerAccess:
        "Full control of the compromised account — they can read messages, send communications as you, access linked services, and change recovery options.",
      actions: [
        "Use the 'Forgot Password' or account recovery option immediately",
        "If recovery email/phone is also compromised, contact the platform's support directly",
        "Enable 2-Factor Authentication on all recovered accounts",
        "Check for and remove unfamiliar connected apps or sessions",
        "Change passwords on all accounts that used the same credentials",
        "Alert your contacts that your account was compromised — they may receive scam messages",
      ],
      reportTo: [CYBER_CRIME_PORTAL, CERT_IN],
    })
  }

  // 11. Malware
  if (
    (hasActivity(data, "unknown apps appeared") ||
      hasActivity(data, "device became slow")) &&
    (hasPermission(data, "storage") || hasPermission(data, "accessibility"))
  ) {
    attacks.push({
      name: "Malware Infection",
      severity: "Medium",
      icon: "Bug",
      description:
        "Malware is malicious software installed on your device, often through fake apps or downloads. It can steal data, monitor activity, or damage your system.",
      attackerAccess:
        "Depending on permissions granted — potentially full device access including files, contacts, messages, and the ability to install additional malicious software.",
      actions: [
        "Boot your device in Safe Mode and uninstall recently installed or unrecognized apps",
        "Revoke Storage and Accessibility permissions from suspicious apps",
        "Run a full device scan with reputable antivirus software",
        "Clear your browser cache, cookies, and saved passwords",
        "If issues persist, back up important data and factory reset the device",
        "Only install apps from official stores (Google Play, App Store) going forward",
      ],
      reportTo: [CERT_IN, CYBER_CRIME_PORTAL],
    })
  }

  // 12. UPI Fraud
  if (
    data.platform === "banking" &&
    hasImpact(data, "money")
  ) {
    // Only add if SIM Swap wasn't already detected (to avoid duplication)
    if (!attacks.some((a) => a.name === "SIM Swap Fraud")) {
      attacks.push({
        name: "UPI / Banking Fraud",
        severity: "Medium",
        icon: "Landmark",
        description:
          "UPI fraud involves unauthorized transactions through your UPI-linked bank account, often via fake payment requests, QR codes, or social engineering.",
        attackerAccess:
          "Access to your bank account via UPI. They may have your UPI PIN, linked bank details, or the ability to initiate transactions.",
        actions: [
          "Call your bank's helpline immediately to report the fraud and request a freeze",
          "Call the Cyber Crime Helpline 1930 within 24 hours for fastest resolution",
          "File a complaint at cybercrime.gov.in with transaction IDs and screenshots",
          "Change your UPI PIN and internet banking password",
          "Delink your bank account from UPI temporarily if fraud continues",
          "Keep all SMS transaction alerts as evidence",
        ],
        reportTo: [HELPLINE_1930, RBI, CYBER_CRIME_PORTAL, LOCAL_POLICE],
      })
    }
  }

  // 13. Social Engineering
  if (
    (data.personalInfoShared.length > 0) &&
    (data.platform === "phone" || data.platform === "social")
  ) {
    // Only add if Vishing wasn't already caught
    if (!attacks.some((a) => a.name === "Vishing (Voice Phishing)")) {
      attacks.push({
        name: "Social Engineering",
        severity: "Low",
        icon: "Users",
        description:
          "Social engineering manipulates people into divulging confidential information through psychological tactics — building trust, creating urgency, or impersonating authority figures.",
        attackerAccess:
          "Whatever personal information you shared. This can be combined with other data to perform more sophisticated attacks or identity fraud.",
        actions: [
          "Stop all communication with the suspected attacker immediately",
          "Document all interactions — save messages, call logs, and screenshots",
          "Change passwords for any accounts you discussed or revealed",
          "Alert your family and close contacts about the incident",
          "Be wary of follow-up contacts — attackers may try again with different pretexts",
          "Report the incident to the platform where contact was made",
        ],
        reportTo: [CYBER_CRIME_PORTAL, LOCAL_POLICE],
      })
    }
  }

  // 14. Adware
  if (
    hasActivity(data, "constant pop-ups") ||
    hasActivity(data, "redirected to a different website")
  ) {
    attacks.push({
      name: "Adware",
      severity: "Low",
      icon: "Megaphone",
      description:
        "Adware aggressively displays unwanted advertisements, pop-ups, and redirects. While not always directly harmful, it can lead to malicious sites and degrade your device's performance.",
      attackerAccess:
        "Your browsing habits and activity data. Adware can also serve as a gateway for more serious malware if you interact with the ads.",
      actions: [
        "Identify and uninstall recently installed apps or browser extensions",
        "Clear your browser cache, cookies, and reset browser settings to default",
        "Install an ad blocker extension for your browser",
        "Run an anti-malware scan to remove adware components",
        "Avoid downloading software from unofficial sources",
        "Check your browser's homepage and default search engine settings",
      ],
      reportTo: [CERT_IN],
    })
  }

  // 15. Keylogger
  if (
    credentialsShared(data) &&
    data.clickedSuspiciousLink !== "Yes"
  ) {
    // Only add if no other credential-theft attack was detected
    const credentialAttacks = ["Phishing", "Vishing (Voice Phishing)", "Man-in-the-Middle Attack"]
    if (!attacks.some((a) => credentialAttacks.includes(a.name))) {
      attacks.push({
        name: "Keylogger",
        severity: "Low",
        icon: "Keyboard",
        description:
          "A keylogger silently records every keystroke you make, capturing passwords, messages, and sensitive information without your knowledge.",
        attackerAccess:
          "All typed information — passwords, credit card numbers, personal messages, search queries, and any other text input on the infected device.",
        actions: [
          "Run a full antivirus and anti-malware scan on your device",
          "Change all passwords from a DIFFERENT, clean device",
          "Check for unauthorized browser extensions or background processes",
          "Enable 2-Factor Authentication on all critical accounts",
          "Consider using a password manager with auto-fill (reduces keylogging risk)",
          "If on a shared/public computer, avoid entering sensitive information",
        ],
        reportTo: [CERT_IN, CYBER_CRIME_PORTAL],
      })
    }
  }

  // Fallback: if no specific attack was matched
  if (attacks.length === 0) {
    attacks.push({
      name: "Suspicious Activity Detected",
      severity: "Medium",
      icon: "AlertTriangle",
      description:
        "While we couldn't identify a specific attack pattern, the activity you described is suspicious and warrants caution. Cyber threats can take many forms, and early action is key.",
      attackerAccess:
        "Unknown at this time. The reported activity suggests potential unauthorized access or social engineering attempts that should be investigated further.",
      actions: [
        "Change your passwords for all important accounts as a precaution",
        "Enable 2-Factor Authentication wherever possible",
        "Run a full antivirus scan on all your devices",
        "Monitor your bank statements and online accounts for unusual activity",
        "Report any financial loss to the Cyber Crime Helpline 1930",
        "Save all evidence (screenshots, messages, transaction records) for future reference",
      ],
      reportTo: [CYBER_CRIME_PORTAL, HELPLINE_1930, CERT_IN],
    })
  }

  return attacks
}
