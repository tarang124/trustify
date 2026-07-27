"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, AlertTriangle, ExternalLink, Info } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface VirusTotalResult {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  totalEngines: number;
  permalink: string | null;
  scanDate: string | null;
  categories: Record<string, string>;
  threatNames: string[];
}

export default function VirusTotalPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VirusTotalResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch VirusTotal data");
      }

      const data = await response.json();
      if (data.virustotal?.error) {
        throw new Error(data.virustotal.error);
      }

      setResult(data.virustotal?.data || null);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isMissingApiKey = error?.includes("VIRUSTOTAL_API_KEY");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 lg:px-8 lg:py-20">
        <div className="mb-8">
          <Link href="/tools/threat-intel" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Threat Intelligence
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">VirusTotal Scanner</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Check any URL against 90+ security engines for malware, phishing, and other threats.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur mb-8 shadow-sm">
          <CardHeader>
            <CardTitle>Target URL</CardTitle>
            <CardDescription>Enter a URL to scan it with VirusTotal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 border-border/60 bg-secondary/40 focus:border-primary"
                disabled={loading}
              />
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? "Scanning..." : "Scan URL"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isMissingApiKey && (
          <Alert variant="default" className="mb-8 border-amber-500/50 bg-amber-500/10 text-amber-500">
            <Info className="h-4 w-4 !text-amber-500" />
            <AlertTitle>API Key Not Configured</AlertTitle>
            <AlertDescription>The VirusTotal API key is missing. Please configure it in your environment variables to use this tool.</AlertDescription>
          </Alert>
        )}

        {error && !isMissingApiKey && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <Card className="border-border/60 bg-card/80 rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-secondary/20 pb-6 border-b border-border/40 text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  <span className={result.malicious > 0 ? "text-red-500 text-3xl font-bold" : "text-emerald-500 text-3xl font-bold"}>
                    {result.malicious}
                  </span>
                  <span className="text-muted-foreground text-xl mx-2">/</span>
                  <span className="text-foreground text-xl">{result.totalEngines}</span>
                </h2>
                <CardDescription>engines detected this as malicious</CardDescription>
                
                <div className="flex h-3 w-full rounded-full overflow-hidden mt-6 max-w-md mx-auto">
                  {result.malicious > 0 && <div style={{ width: `${(result.malicious / result.totalEngines) * 100}%` }} className="bg-red-500" title="Malicious" />}
                  {result.suspicious > 0 && <div style={{ width: `${(result.suspicious / result.totalEngines) * 100}%` }} className="bg-amber-500" title="Suspicious" />}
                  {result.harmless > 0 && <div style={{ width: `${(result.harmless / result.totalEngines) * 100}%` }} className="bg-emerald-500" title="Harmless" />}
                  {result.undetected > 0 && <div style={{ width: `${(result.undetected / result.totalEngines) * 100}%` }} className="bg-muted" title="Undetected" />}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="flex flex-col items-center justify-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <span className="text-2xl font-bold text-red-500">{result.malicious}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Malicious</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <span className="text-2xl font-bold text-amber-500">{result.suspicious}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Suspicious</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <span className="text-2xl font-bold text-emerald-500">{result.harmless}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Harmless</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg border border-border/40">
                    <span className="text-2xl font-bold text-muted-foreground">{result.undetected}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Undetected</span>
                  </div>
                </div>

                {result.threatNames && result.threatNames.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Threat Names</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.threatNames.map((threat, i) => (
                        <Badge key={i} variant="outline" className="border-red-500 text-red-500 bg-red-500/10">
                          {threat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.categories && Object.keys(result.categories).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Categories</h3>
                    <div className="border border-border/40 rounded-lg overflow-hidden">
                      {Object.entries(result.categories).map(([engine, category], i) => (
                        <div key={i} className="flex justify-between items-center py-2.5 px-4 border-b border-border/40 last:border-0">
                          <span className="font-medium text-sm">{engine}</span>
                          <span className="text-sm text-muted-foreground">{category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.permalink && (
                  <div className="flex justify-center mt-8">
                    <Button variant="outline" asChild>
                      <a href={result.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        View Full Report on VirusTotal
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
