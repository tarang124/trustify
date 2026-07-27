"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Search, Globe, MapPin, Lock, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThreatIntelPanel } from "@/components/results/threat-intel-panel";
import type { EnrichmentResponse } from "@/lib/enrichment-types";

export default function ThreatIntelPage() {
  const [url, setUrl] = useState("");
  const [enrichment, setEnrichment] = useState<EnrichmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setEnrichment(null);

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to run analysis");
      }

      const data = await response.json();
      setEnrichment(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 lg:px-8 lg:py-20">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Shield className="h-6 w-6 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Threat Intelligence</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Comprehensive threat analysis — WHOIS, GeoIP, SSL, and VirusTotal checks in one scan.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>Target Selection</CardTitle>
            <CardDescription>Enter a domain, URL, or IP address for full enrichment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                placeholder="https://suspicious-site.com or 192.168.1.1"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 border-border/60 bg-secondary/40 focus:border-indigo-500"
                disabled={loading}
              />
              <Button type="submit" disabled={loading} className="min-w-[160px] bg-indigo-600 hover:bg-indigo-700">
                {loading ? "Analyzing..." : "Run Full Analysis"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3 mb-10 text-sm">
          <span className="text-muted-foreground">Or use individual tools:</span>
          <Button variant="outline" size="sm" asChild className="h-8 border-border/60">
            <Link href="/tools/whois" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              <span>WHOIS</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 border-border/60">
            <Link href="/tools/geoip" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
              <span>GeoIP</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 border-border/60">
            <Link href="/tools/ssl" className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>SSL</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 border-border/60">
            <Link href="/tools/virustotal" className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-red-500" />
              <span>VirusTotal</span>
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(enrichment || loading) && !error && (
          <div className="mt-8">
            <ThreatIntelPanel
              enrichment={enrichment}
              isLoading={loading}
              error={error}
              onRetry={() => handleSubmit()}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
