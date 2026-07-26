# Trustify

[![Live Site](https://img.shields.io/badge/Live-trustify.top-1F3864?style=flat)](https://trustify.top)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

**Trustify** is an AI-powered cyber attack reporting and advisory platform built for Indian citizens. If someone clicks a phishing link, falls for UPI fraud, or suspects a data leak, Trustify guides them through triaging the incident, taking immediate protective action, and connecting with the right official authorities — all without requiring sign-up, and with zero server-side data storage for personal information.

🔗 **Live site:** [trustify.top](https://trustify.top)

---

## ✨ Features

- **URL/Threat Scanner** — check if a link is safe before (or after) clicking it
- **Guided Incident Triage** — questionnaire-based flow to identify the exact type of attack (phishing, ransomware, UPI fraud, identity theft, etc.)
- **Personalized Action Plan** — a checklist of what to do immediately (passwords to change, cards to freeze)
- **OSINT Threat Intelligence** — automated enrichment of suspicious URLs/IPs with WHOIS, GeoIP, SSL inspection, and VirusTotal reputation checks
- **Downloadable Incident Report** — structured report to share with banks or law enforcement
- **Official Resource Links** — direct links to cybercrime.gov.in, CERT-In, RBI Ombudsman, and state cyber cells
- **Privacy-first architecture** — personal data stays client-side; only suspicious URLs/IPs are processed server-side for threat analysis

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI:** shadcn/ui, Tailwind CSS
- **Database:** SQLite via Prisma ORM (local enrichment cache only)
- **OSINT Pipeline:** WHOIS (whoiser), GeoIP (ip-api.com), SSL (Node.js TLS), VirusTotal v3 API

---

## 📂 Project Structure

```
trustify/
├── app/              # Next.js App Router pages & routes
│   └── api/enrich/   # OSINT enrichment API endpoint
├── components/       # Reusable UI components (shadcn/ui)
│   ├── report/       # Incident report form components
│   ├── results/      # Results display (threats, actions, threat intel)
│   └── ui/           # Base shadcn/ui components
├── hooks/            # Custom React hooks
├── lib/              # Utilities, helpers, shared logic
│   └── enrichment/   # OSINT enrichment pipeline modules
├── prisma/           # Database schema & migrations
├── public/           # Static assets
└── styles/           # Global styles
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/tarangpatel-redteam/trustify.git
cd trustify

# Install dependencies
npm install

# Set up the database
cp .env.example .env
npx prisma db push

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it locally.

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (has default) | SQLite database path. Default: `file:prisma/dev.db` |
| `VIRUSTOTAL_API_KEY` | Optional | Free API key from [virustotal.com](https://www.virustotal.com/gui/my-apikey) for URL reputation checks |

> **Note:** Without a VirusTotal API key, the WHOIS, GeoIP, and SSL modules still work — only the VirusTotal reputation tab will show "API key not configured."

---

## 🔍 OSINT Enrichment Pipeline

When a user reports a suspicious URL or IP address, Trustify automatically runs threat intelligence checks:

| Module | Source | API Key? | What it returns |
|--------|--------|----------|-----------------|
| **WHOIS** | whoiser | No | Registrar, domain age, creation/expiry dates, nameservers |
| **GeoIP** | ip-api.com | No | Country, city, ISP, ASN, proxy/hosting flags |
| **SSL** | Node.js TLS | No | Certificate issuer, validity, self-signed check, protocol |
| **VirusTotal** | VirusTotal v3 | Yes (free) | Detection ratio, threat names, engine categories |

Results are cached in a local SQLite database with configurable TTLs (7 days for WHOIS/GeoIP, 24h for SSL, 36h for VirusTotal) to avoid re-hitting rate-limited APIs when multiple users report the same URL.

---

## 👤 Author

**Tarang Patel**
[LinkedIn](https://www.linkedin.com/in/tarangpatel-red-team/) · [GitHub](https://github.com/tarangpatel-redteam)
