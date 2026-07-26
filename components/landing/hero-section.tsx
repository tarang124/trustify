"use client"

import Link from "next/link"
import { motion } from "motion/react"
import {
  Shield,
  ArrowRight,
  AlertTriangle,
  FileSearch,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-400">
            <Shield className="size-3.5" />
            <span>AI-Powered Cybersecurity Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-balance text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            You Clicked a Bad Link.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-indigo-500">What Happens Next?</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Don't panic. Hackers rely on fear to steal more of your data. Trustify walks
            you through identifying the threat, taking immediate action, and
            securing your accounts.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="text-base px-8 h-12 font-semibold shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-indigo-600 hover:bg-indigo-500 text-white">
              <Link href="/scanner">
                Check URL Safety
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8 h-12 font-semibold"
            >
              <Link href="/report">Recovery Action Plan</Link>
            </Button>
          </div>

          {/* Emergency Helpline */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm">
            <AlertTriangle className="size-4 text-destructive" />
            <span className="text-muted-foreground">
              For financial fraud emergencies, call{" "}
              <a href="tel:1930" className="font-bold text-foreground">
                1930
              </a>{" "}
              immediately
            </span>
          </div>
        </div>

        {/* Stats / Steps Cards */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              icon: AlertTriangle,
              title: "1. Triage the Leak",
              description:
                "Answer guided questions to determine exactly what type of data the malicious website stole.",
              step: "01",
            },
            {
              icon: FileSearch,
              title: "2. Immediate Action",
              description:
                "Receive a personalized checklist of which passwords to change and which bank cards to freeze.",
              step: "02",
            },
            {
              icon: ClipboardList,
              title: "3. Future Protection",
              description:
                "Learn how to set up Two-Factor Authentication and password managers to stay safe forever.",
              step: "03",
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative rounded-2xl border border-border/50 bg-card/80 p-8 transition-all hover:-translate-y-2 hover:border-indigo-500/50 hover:shadow-[0_10px_40px_rgba(99,102,241,0.1)]"
            >
              <div className="absolute right-6 top-6 font-mono text-sm text-muted-foreground/30 font-bold">
                {item.step}
              </div>
              <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                <item.icon className="size-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">
                {item.title}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
