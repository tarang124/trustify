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
import { MapPin, Search, ArrowLeft, AlertTriangle } from "lucide-react";

interface GeoIpResult {
  ip: string;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  isp: string | null;
  org: string | null;
  asn: string | null;
  isProxy: boolean;
  isHosting: boolean;
}

const getFlagEmoji = (countryCode: string | null) => {
  if (!countryCode) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function GeoIpPage() {
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
        throw new Error("Failed to lookup location");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const geoipData = result?.geoip?.data as GeoIpResult | undefined;
  const geoipStatus = result?.geoip?.status;
  const geoipError = result?.geoip?.error;

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
          <MapPin className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">IP Geolocation</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Look up the geographic location, ISP, and network details for any IP address or domain.
        </p>

        <Card className="border-border/60 bg-card/80 mb-8">
          <CardHeader>
            <CardTitle>Enter IP or Domain</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="8.8.8.8 or example.com"
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
                  <Search className="mr-2 h-4 w-4" /> Lookup Location
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

        {(isLoading || geoipStatus === 'running' || geoipStatus === 'pending') && !result && (
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

        {geoipStatus === 'failed' && (
           <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Location Lookup Failed</AlertTitle>
            <AlertDescription>{geoipError || "Could not retrieve geolocation data."}</AlertDescription>
          </Alert>
        )}

        {geoipData && (
          <Card className="border-border/60 bg-card/80 rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">IP Address</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-mono font-medium">{geoipData.ip}</span>
                  {geoipData.isProxy && <Badge variant="destructive">Proxy Detected</Badge>}
                  {geoipData.isHosting && <Badge className="bg-amber-500 hover:bg-amber-600">Hosting Provider</Badge>}
                </div>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Country</span>
                <span className="text-foreground flex items-center gap-2">
                  {geoipData.countryCode && getFlagEmoji(geoipData.countryCode)} {geoipData.country || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Region</span>
                <span className="text-foreground">{geoipData.region || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">City</span>
                <span className="text-foreground">{geoipData.city || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">ISP</span>
                <span className="text-foreground">{geoipData.isp || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Organization</span>
                <span className="text-foreground">{geoipData.org || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">ASN</span>
                <span className="text-foreground font-mono">{geoipData.asn || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 border-b border-border/40">
                <span className="text-muted-foreground text-sm font-medium">Coordinates</span>
                <span className="text-foreground">
                  {geoipData.lat !== null && geoipData.lon !== null
                    ? `${geoipData.lat}, ${geoipData.lon}`
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
