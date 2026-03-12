import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="relative mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-card/80 px-6 py-14 text-center sm:px-12">
          {/* Subtle glow */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-primary/5" />

          <div className="relative">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Shield className="size-7 text-primary" />
            </div>

            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Ready to Report an Incident?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              It takes less than 5 minutes. Our guided questionnaire will help
              you identify the threat, secure your accounts, and connect with the
              right authorities.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="text-base px-8 h-12 font-semibold shadow-[0_0_20px_rgba(0,212,255,0.15)]">
                <Link href="/report">
                  Start Report Now
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              {[
                "No sign-up required",
                "100% private",
                "Free to use",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <div className="size-1.5 rounded-full bg-primary/60" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
