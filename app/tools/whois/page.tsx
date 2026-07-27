"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Search, ArrowLeft, AlertTriangle } from "lucide-react";

interface WhoisResult {
  domain: string;
  registrar: string | null;
  createdDate: string | null;
  expiresDate: string | null;
  domainAgeDays: number | null;
  registrantOrg: string | null;
  nameServers: string[];
  status: string[];
}

export default function WhoisPage() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputValue) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze domain");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const whoisData = result?.whois?.data as WhoisResult | undefined;
  const whoisStatus = result?.whois?.status;
  const whoisError = result?.whois?.error;

  const getAgeBadge = (days: number | null) => {
    if (days === null) return null;
    if (days < 30) return <Badge variant="destructive">New Domain</Badge>;
    if (days < 180) return <Badge className="bg-amber-500 hover:bg-amber-600">Recent Domain</Badge>;
    return <Badge className="bg-emerald-500 hover:bg-emerald-600">Established</Badge>;
  };

  const formatAge = (days: number | null) => {
    if (days === null) return "Unknown";
    if (days < 365) return `${days} days`;
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    return `${years} years, ${months} months`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-20">
        <Link
          href="/tools/threat-intel"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Threat Intel
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">WHOIS Lookup</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Look up domain registration details including registrar, creation date, expiry, and nameservers.
        </p>

        <Card className="border-border/60 bg-card/80 mb-8">
          <CardHeader>
            <CardTitle>Enter Domain</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="example.com"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="border-border/60 bg-secondary/40 focus:border-primary flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAnalyze();
              }}
            />
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !inputValue}
              className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
            >
              {isLoading ? (
                "Analyzing..."
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Lookup WHOIS
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(isLoading || whoisStatus === 'running' || whoisStatus === 'pending') && !result && (
          <Card className="border-border/60 bg-card/80 rounded-xl overflow-hidden">
            <CardContent className="p-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between py-4 px-4 border-b border-border/40">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-48" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {whoisStatus === 'failed' && (
           <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>WHOIS Lookup Failed</AlertTitle>
            <AlertDescription>{whoisError || "Could not retrieve WHOIS data."}</AlertDescription>
          </Alert>
        )}

        {whoisData && (
          <Card className="border-border/60 bg-card/80 rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Domain</span>
                <span className="text-foreground font-medium">{whoisData.domain}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Registrar</span>
                <span className="text-foreground">{whoisData.registrar || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Created Date</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground">
                    {whoisData.createdDate ? new Date(whoisData.createdDate).toLocaleDateString() : "N/A"}
                  </span>
                  {getAgeBadge(whoisData.domainAgeDays)}
                </div>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Expires Date</span>
                <span className="text-foreground">
                   {whoisData.expiresDate ? new Date(whoisData.expiresDate).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Domain Age</span>
                <span className="text-foreground">{formatAge(whoisData.domainAgeDays)}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Registrant Organization</span>
                <span className="text-foreground">{whoisData.registrantOrg || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Name Servers</span>
                <div className="flex flex-col items-end">
                  {whoisData.nameServers?.length > 0 ? (
                    whoisData.nameServers.map((ns, i) => (
                      <span key={i} className="text-foreground text-sm">{ns}</span>
                    ))
                  ) : (
                    <span className="text-foreground">N/A</span>
                  )}
                </div>
              </div>
              {whoisData.status && whoisData.status.length > 0 && (
                <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                  <span className="text-muted-foreground text-sm font-medium">Domain Status</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                    {whoisData.status.map((st, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{st}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
