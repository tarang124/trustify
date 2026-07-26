"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Database, AlertCircle, ShieldAlert, Fingerprint, Mail, CreditCard, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DataLeakDemo() {
  const [email, setEmail] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<"idle" | "safe" | "leaked">("idle")

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsScanning(true)
    setResult("idle")

    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false)
      // For demo purposes, "test@example.com" is safe, everything else shows a simulated leak
      if (email.toLowerCase() === "test@example.com") {
        setResult("safe")
      } else {
        setResult("leaked")
      }
    }, 2500)
  }

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-4 py-1.5 text-xs font-medium text-destructive">
            <ShieldAlert className="size-3.5" />
            <span>Interactive Demo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            What happens after you click a bad link?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            When you enter your information into a phishing site, it often ends up for sale on the Dark Web. See how easy it is for hackers to find you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Demo Interface */}
          <div className="rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden relative">
            <div className="h-10 border-b border-border/50 bg-muted/50 flex items-center px-4 gap-2">
              <div className="size-3 rounded-full bg-destructive/80" />
              <div className="size-3 rounded-full bg-amber-500/80" />
              <div className="size-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-xs text-muted-foreground ml-2">DarkWeb_Search_Terminal</span>
            </div>

            <div className="p-8">
              <form onSubmit={handleScan} className="flex gap-3 mb-8">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter an email to simulate a search..."
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <Button type="submit" disabled={isScanning || !email} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  {isScanning ? "Scanning..." : "Simulate Search"}
                </Button>
              </form>

              <div className="min-h-[200px] bg-background border border-border/50 rounded-xl p-6 font-mono text-sm relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {result === "idle" && !isScanning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-muted-foreground h-full flex flex-col items-center justify-center text-center gap-3 pt-6"
                    >
                      <Database className="size-8 opacity-20" />
                      <p>Awaiting query input...<br/>(Try typing any email to see a simulated leak)</p>
                    </motion.div>
                  )}

                  {isScanning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-primary space-y-2"
                    >
                      <p className="animate-pulse">{'>'} Initiating secure connection...</p>
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{'>'} Querying illicit marketplaces...</motion.p>
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>{'>'} Scanning dumped credential databases...</motion.p>
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="animate-pulse text-amber-500">{'>'} Analyzing hash collisions...</motion.p>
                    </motion.div>
                  )}

                  {result === "leaked" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-destructive font-bold flex items-center gap-2">
                        <AlertCircle className="size-4" /> 
                        [!] MATCH FOUND: 3 Breaches associated with {email}
                      </p>
                      <div className="space-y-2 pl-4 border-l-2 border-destructive/30">
                        <div className="text-muted-foreground"><span className="text-foreground">Source_1:</span> "Phishing Campaign DB 2023"</div>
                        <div className="text-muted-foreground"><span className="text-foreground">Compromised_Data:</span> Passwords, Phone Numbers, IP Addresses</div>
                        <div className="text-muted-foreground"><span className="text-foreground">Status:</span> Currently for sale</div>
                      </div>
                      <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-foreground">
                        This is exactly how criminals package and sell the data you accidentally enter into fake websites.
                      </div>
                    </motion.div>
                  )}

                  {result === "safe" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-emerald-500 font-bold flex items-center gap-2">
                        <ShieldAlert className="size-4" /> 
                        [✔] NO EXPOSURES FOUND FOR {email}
                      </p>
                      <p className="text-muted-foreground">Your simulated data appears to be secure at this time.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Educational Content */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Fingerprint className="size-6" />
                </div>
                <h3 className="text-xl font-semibold">The Anatomy of a Phishing Attack</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-14">
                When you click a malicious link from Trustify, it often takes you to a fake login page (like a fake bank or social media site). You type your password, thinking you are logging in.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500">
                  <Database className="size-6" />
                </div>
                <h3 className="text-xl font-semibold">Data Harvesting</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-14">
                The attackers don't log you in; they save your username and password into a database exactly like the one simulated here.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive">
                  <CreditCard className="size-6" />
                </div>
                <h3 className="text-xl font-semibold">The Aftermath</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-14">
                Minutes later, your data is packaged with thousands of others and sold on illicit forums. This can lead to identity theft, financial fraud, and account takeovers.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
