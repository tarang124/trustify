"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SslResult {
  issuer: string | null;
  subject: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysUntilExpiry: number | null;
  isSelfSigned: boolean;
  isExpired: boolean;
  protocol: string | null;
  serialNumber: string | null;
  subjectAltNames: string[];
}

export default function SslCheckerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SslResult | null>(null);

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
        throw new Error("Failed to fetch SSL data");
      }

      const data = await response.json();
      if (data.ssl?.error) {
        throw new Error(data.ssl.error);
      }

      setResult(data.ssl?.data || null);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

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
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SSL Certificate Checker</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Inspect SSL/TLS certificates for any domain — check validity, issuer, expiry, and detect self-signed or expired certificates.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur mb-8 shadow-sm">
          <CardHeader>
            <CardTitle>Target Domain</CardTitle>
            <CardDescription>Enter a domain name to inspect its SSL/TLS certificate.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 border-border/60 bg-secondary/40 focus:border-primary"
                disabled={loading}
              />
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? "Checking..." : "Check Certificate"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            {result.isSelfSigned && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Self-Signed Certificate</AlertTitle>
                <AlertDescription>This certificate was not issued by a trusted CA.</AlertDescription>
              </Alert>
            )}
            
            {result.isExpired && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Certificate Expired</AlertTitle>
                <AlertDescription>This certificate is no longer valid.</AlertDescription>
              </Alert>
            )}

            <Card className="border-border/60 bg-card/80 rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-secondary/20 pb-4 border-b border-border/40">
                <CardTitle className="text-xl">Certificate Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  <div className="flex justify-between items-center py-3 px-6">
                    <span className="text-muted-foreground font-medium">Subject</span>
                    <span className="font-semibold">{result.subject || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-6">
                    <span className="text-muted-foreground font-medium">Issuer</span>
                    <span>{result.issuer || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-6">
                    <span className="text-muted-foreground font-medium">Valid From</span>
                    <span>{result.validFrom ? new Date(result.validFrom).toLocaleString() : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-6">
                    <span className="text-muted-foreground font-medium">Valid To</span>
                    <span>{result.validTo ? new Date(result.validTo).toLocaleString() : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-6">
                    <span className="text-muted-foreground font-medium">Days Until Expiry</span>
                    <div>
                      {result.daysUntilExpiry !== null ? (
                        <Badge variant="outline" className={
                          result.daysUntilExpiry < 30 ? "border-red-500 text-red-500" :
                          result.daysUntilExpiry < 90 ? "border-amber-500 text-amber-500" :
                          "border-emerald-500 text-emerald-500"
                        }>
                          {result.daysUntilExpiry} days
                        </Badge>
                      ) : "N/A"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 px-6">
                    <span className="text-muted-foreground font-medium">Protocol</span>
                    <span>{result.protocol || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-6">
                    <span className="text-muted-foreground font-medium">Serial Number</span>
                    <span className="font-mono text-xs max-w-[200px] sm:max-w-[300px] truncate">{result.serialNumber || "N/A"}</span>
                  </div>
                  {result.subjectAltNames && result.subjectAltNames.length > 0 && (
                    <div className="flex flex-col py-4 px-6 gap-2">
                      <span className="text-muted-foreground font-medium">Subject Alternative Names</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {result.subjectAltNames.map((san, i) => (
                          <Badge key={i} variant="secondary">{san}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
