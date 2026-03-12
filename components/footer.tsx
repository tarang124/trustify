import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                <Shield className="size-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Trust<span className="text-primary">ify</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              Empowering Indian citizens to identify, report, and recover from
              cyber attacks with expert guidance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/report", label: "Report Incident" },
                { href: "/resources", label: "Resources" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Official Resources
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                {
                  href: "https://cybercrime.gov.in",
                  label: "National Cyber Crime Portal",
                },
                {
                  href: "https://cert-in.org.in",
                  label: "CERT-In",
                },
                {
                  href: "https://rbi.org.in",
                  label: "RBI (Financial Frauds)",
                },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-border/60 pt-8 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-xs text-muted-foreground">
            Trustify is an educational advisory tool. For emergencies, call
            the Cyber Crime Helpline at{" "}
            <span className="font-semibold text-primary">1930</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            Not affiliated with any government body.
          </p>
        </div>
      </div>
    </footer>
  )
}
