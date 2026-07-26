import {
  ShieldCheck,
  FileText,
  Globe,
  Lock,
  Zap,
  Users,
} from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Threat Identification",
    description:
      "Our guided questionnaire helps you accurately identify the type of cyber attack — phishing, ransomware, UPI fraud, identity theft, and more.",
  },
  {
    icon: FileText,
    title: "Downloadable Report",
    description:
      "Generate a structured incident report you can download and share with law enforcement or your bank for faster resolution.",
  },
  {
    icon: Globe,
    title: "Official Resources",
    description:
      "Direct links to cybercrime.gov.in, CERT-In, RBI Ombudsman, and state-level cyber cells for filing official complaints.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Your data never leaves your device. Trustify runs entirely in your browser with zero server-side storage.",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description:
      "Get an immediate threat assessment and a personalized recovery action plan based on your specific situation.",
  },
  {
    icon: Users,
    title: "For All Indians",
    description:
      "Designed for everyone — from tech-savvy users to senior citizens. Simple language, clear steps, zero jargon.",
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            How Trustify Helps
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything You Need After a Cyber Attack
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            From identifying the threat to filing an official report — Trustify
            provides end-to-end guidance for Indian citizens.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/60 bg-card/60 p-6 transition-all hover:border-primary/20 hover:bg-card"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 text-primary group-hover:bg-primary/15 transition-colors">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
