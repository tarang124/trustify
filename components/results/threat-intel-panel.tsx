"use client"

import React from "react"
import { Shield, Fingerprint, Clock, AlertTriangle, Globe, MapPin, Search, Lock, Activity } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { EnrichmentResponse, VirusTotalResult, ModuleResult } from "@/lib/enrichment-types"

interface ThreatIntelPanelProps {
  enrichment: EnrichmentResponse | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

function formatDomainAge(days: number | null): string {
  if (days === null) return "Unknown"
  if (days < 30) return `${days} days`
  if (days < 365) return `${Math.floor(days / 30)} months`
  const years = Math.floor(days / 365)
  const remainingMonths = Math.floor((days % 365) / 30)
  if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`
  return `${years} year${years > 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  } catch {
    return "—"
  }
}

function getVerdictColor(vt: VirusTotalResult): 'clean' | 'suspicious' | 'malicious' {
  if (vt.malicious > 0) return 'malicious'
  if (vt.suspicious > 0) return 'suspicious'
  return 'clean'
}

function getDomainAgeRisk(days: number | null): 'safe' | 'warning' | 'danger' {
  if (days === null) return 'safe'
  if (days < 30) return 'danger'
  if (days < 180) return 'warning'
  return 'safe'
}

function SeverityBadge({ type, children }: { type: 'clean' | 'warning' | 'danger' | 'info', children: React.ReactNode }) {
  const styles = {
    clean: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-red-500/15 text-red-400 border-red-500/30",
    info: "bg-sky-500/15 text-sky-400 border-sky-500/30"
  }
  return (
    <Badge variant="outline" className={`border ${styles[type]}`}>
      {children}
    </Badge>
  )
}

function KeyValueRow({ label, value, highlight }: { label: string, value: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-4 border-b border-border/40 ${highlight ? 'bg-secondary/40' : ''}`}>
      <span className="text-sm text-muted-foreground font-medium mb-1 sm:mb-0">{label}</span>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

function TabSkeleton() {
  return (
    <div className="space-y-4 py-4 animate-in fade-in">
      <Skeleton className="h-8 w-full bg-secondary/40" />
      <Skeleton className="h-8 w-full bg-secondary/40" />
      <Skeleton className="h-8 w-3/4 bg-secondary/40" />
      <Skeleton className="h-8 w-full bg-secondary/40" />
    </div>
  )
}

function ModuleErrorAlert({ error, onRetry }: { error: string, onRetry?: () => void }) {
  return (
    <Alert variant="destructive" className="my-4 bg-red-500/10 border-red-500/30 text-red-400">
      <AlertTriangle className="size-4" />
      <AlertTitle>Module Failed</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="h-7 border-red-500/50 hover:bg-red-500/20 text-red-400">
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

function ModuleRateLimitedAlert() {
  return (
    <Alert className="my-4 bg-amber-500/10 border-amber-500/30 text-amber-400">
      <Clock className="size-4" />
      <AlertTitle>Rate Limited</AlertTitle>
      <AlertDescription>
        This module is currently rate limited. Please try again later.
      </AlertDescription>
    </Alert>
  )
}

export function ThreatIntelPanel({ enrichment, isLoading, error, onRetry }: ThreatIntelPanelProps) {
  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
        <AlertTriangle className="size-4" />
        <AlertTitle>Threat Intelligence Failed</AlertTitle>
        <AlertDescription className="flex items-center justify-between mt-2">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={onRetry} className="border-red-500/50 hover:bg-red-500/20 text-red-400">
            Retry Analysis
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading && !enrichment) {
    return (
      <Card className="border-border/60 bg-card/80 overflow-hidden shadow-[0_0_15px_rgba(0,212,255,0.05)]">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary animate-pulse" />
              <CardTitle className="text-lg">Threat Intelligence</CardTitle>
            </div>
            <Badge variant="outline" className="animate-pulse">Analyzing...</Badge>
          </div>
          <Progress value={undefined} className="h-1 mt-4" />
        </CardHeader>
        <CardContent className="p-6">
          <TabSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (!enrichment) return null

  const isPending = (status: string) => status === 'pending' || status === 'running'
  
  return (
    <Card className="border-border/60 bg-card overflow-hidden shadow-[0_0_15px_rgba(0,212,255,0.1)] transition-all">
      <CardHeader className="border-b border-border/40 pb-4 bg-secondary/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Fingerprint className="size-5 text-primary" />
            <CardTitle className="text-lg text-primary tracking-wide">Threat Intelligence</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {enrichment.cached && (
              <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border/50 gap-1">
                <Clock className="size-3" /> Cached
              </Badge>
            )}
            <Badge variant="outline" className={
              enrichment.overallStatus === 'completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : 
              enrichment.overallStatus === 'failed' ? "bg-red-500/10 text-red-400 border-red-500/30" : 
              "bg-sky-500/10 text-sky-400 border-sky-500/30"
            }>
              {enrichment.overallStatus.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      {isLoading && <Progress value={undefined} className="h-0.5 rounded-none" />}
      
      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b border-border/40 px-4">
            <TabsList className="bg-transparent h-12 p-0 space-x-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 h-12 bg-transparent">Overview</TabsTrigger>
              <TabsTrigger value="whois" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 h-12 bg-transparent">WHOIS</TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 h-12 bg-transparent">Network</TabsTrigger>
              <TabsTrigger value="ssl" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 h-12 bg-transparent">SSL</TabsTrigger>
              <TabsTrigger value="virustotal" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 h-12 bg-transparent">VirusTotal</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-0 animate-in fade-in">
              <div className="mb-6 flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Target Analysis</span>
                <div className="text-lg font-mono text-foreground">{enrichment.normalizedTarget}</div>
                <span className="text-xs text-muted-foreground mt-1">Last checked: {formatDate(enrichment.lastCheckedAt)}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-secondary/20 border-border/40 shadow-none">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Shield className="size-3" /> Reputation</span>
                    {isPending(enrichment.virustotal.status) ? <Skeleton className="h-6 w-16" /> : 
                     enrichment.virustotal.data ? (
                      <div>
                        {(() => {
                          const vt = enrichment.virustotal.data
                          const color = getVerdictColor(vt)
                          return (
                            <SeverityBadge type={color === 'clean' ? 'clean' : color === 'suspicious' ? 'warning' : 'danger'}>
                              {vt.malicious} / {vt.totalEngines}
                            </SeverityBadge>
                          )
                        })()}
                      </div>
                    ) : <span className="text-sm">—</span>}
                  </CardContent>
                </Card>
                
                <Card className="bg-secondary/20 border-border/40 shadow-none">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Clock className="size-3" /> Domain Age</span>
                    {isPending(enrichment.whois.status) ? <Skeleton className="h-6 w-20" /> : 
                     enrichment.whois.data ? (
                      <div>
                        {(() => {
                          const days = enrichment.whois.data.domainAgeDays
                          const risk = getDomainAgeRisk(days)
                          return (
                            <SeverityBadge type={risk === 'safe' ? 'clean' : risk === 'warning' ? 'warning' : 'danger'}>
                              {formatDomainAge(days)}
                            </SeverityBadge>
                          )
                        })()}
                      </div>
                    ) : <span className="text-sm">—</span>}
                  </CardContent>
                </Card>
                
                <Card className="bg-secondary/20 border-border/40 shadow-none">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Lock className="size-3" /> SSL Status</span>
                    {isPending(enrichment.ssl.status) ? <Skeleton className="h-6 w-16" /> : 
                     enrichment.ssl.data ? (
                      <div>
                        {(() => {
                          const ssl = enrichment.ssl.data
                          if (ssl.isExpired) return <SeverityBadge type="danger">Expired</SeverityBadge>
                          if (ssl.isSelfSigned) return <SeverityBadge type="warning">Self-Signed</SeverityBadge>
                          return <SeverityBadge type="clean">Valid</SeverityBadge>
                        })()}
                      </div>
                    ) : <span className="text-sm">—</span>}
                  </CardContent>
                </Card>
                
                <Card className="bg-secondary/20 border-border/40 shadow-none">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><MapPin className="size-3" /> Location</span>
                    {isPending(enrichment.geoip.status) ? <Skeleton className="h-6 w-16" /> : 
                     enrichment.geoip.data ? (
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        {enrichment.geoip.data.countryCode ? ` ${enrichment.geoip.data.countryCode}` : "Unknown"}
                      </div>
                    ) : <span className="text-sm">—</span>}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* WHOIS TAB */}
            <TabsContent value="whois" className="mt-0 animate-in fade-in">
              {isPending(enrichment.whois.status) ? <TabSkeleton /> : 
               enrichment.whois.status === 'failed' ? <ModuleErrorAlert error={enrichment.whois.error || "Failed to fetch WHOIS data"} /> :
               enrichment.whois.status === 'rate_limited' ? <ModuleRateLimitedAlert /> :
               enrichment.whois.data ? (
                <div className="border border-border/40 rounded-lg overflow-hidden bg-card/50">
                  <KeyValueRow label="Domain" value={enrichment.whois.data.domain} highlight />
                  <KeyValueRow label="Registrar" value={enrichment.whois.data.registrar || "—"} />
                  <KeyValueRow label="Created Date" highlight value={
                    <div className="flex items-center gap-2">
                      <span>{formatDate(enrichment.whois.data.createdDate)}</span>
                      {enrichment.whois.data.domainAgeDays !== null && (
                        <SeverityBadge type={getDomainAgeRisk(enrichment.whois.data.domainAgeDays) === 'danger' ? 'danger' : 'info'}>
                          {formatDomainAge(enrichment.whois.data.domainAgeDays)} old
                        </SeverityBadge>
                      )}
                    </div>
                  } />
                  <KeyValueRow label="Expires Date" value={formatDate(enrichment.whois.data.expiresDate)} />
                  <KeyValueRow label="Registrant Org" value={enrichment.whois.data.registrantOrg || "—"} highlight />
                  <KeyValueRow label="Name Servers" value={
                    enrichment.whois.data.nameServers.length > 0 ? 
                    <div className="flex flex-wrap gap-1">
                      {enrichment.whois.data.nameServers.map(ns => (
                        <Badge key={ns} variant="outline" className="text-xs border-border/50 bg-secondary/30">{ns}</Badge>
                      ))}
                    </div> : "—"
                  } />
                  <KeyValueRow label="Status" value={
                    enrichment.whois.data.status.length > 0 ?
                    <div className="flex flex-wrap gap-1">
                      {enrichment.whois.data.status.map(s => (
                        <Badge key={s} variant="outline" className="text-xs border-border/50 bg-secondary/30 truncate max-w-[200px]">{s}</Badge>
                      ))}
                    </div> : "—"
                  } highlight />
                </div>
               ) : <div className="text-sm text-muted-foreground py-4 text-center">No WHOIS data available</div>}
            </TabsContent>

            {/* NETWORK TAB */}
            <TabsContent value="network" className="mt-0 animate-in fade-in">
              {isPending(enrichment.geoip.status) ? <TabSkeleton /> : 
               enrichment.geoip.status === 'failed' ? <ModuleErrorAlert error={enrichment.geoip.error || "Failed to fetch Network data"} /> :
               enrichment.geoip.status === 'rate_limited' ? <ModuleRateLimitedAlert /> :
               enrichment.geoip.data ? (
                <div className="border border-border/40 rounded-lg overflow-hidden bg-card/50">
                  <KeyValueRow label="IP Address" value={enrichment.geoip.data.ip} highlight />
                  <KeyValueRow label="Location" value={
                    <div className="flex items-center gap-2">
                      <span>{[enrichment.geoip.data.city, enrichment.geoip.data.region, enrichment.geoip.data.country].filter(Boolean).join(", ") || "—"}</span>
                      {enrichment.geoip.data.lat !== null && enrichment.geoip.data.lon !== null && (
                        <span className="text-xs text-muted-foreground">({enrichment.geoip.data.lat}, {enrichment.geoip.data.lon})</span>
                      )}
                    </div>
                  } />
                  <KeyValueRow label="ISP" value={enrichment.geoip.data.isp || "—"} highlight />
                  <KeyValueRow label="Organization" value={enrichment.geoip.data.org || "—"} />
                  <KeyValueRow label="ASN" value={enrichment.geoip.data.asn || "—"} highlight />
                  <KeyValueRow label="Flags" value={
                    <div className="flex gap-2">
                      {enrichment.geoip.data.isProxy ? <SeverityBadge type="warning">Proxy/VPN</SeverityBadge> : <SeverityBadge type="info">Not a Proxy</SeverityBadge>}
                      {enrichment.geoip.data.isHosting ? <SeverityBadge type="info">Datacenter/Hosting</SeverityBadge> : null}
                    </div>
                  } />
                </div>
               ) : <div className="text-sm text-muted-foreground py-4 text-center">No Network data available</div>}
            </TabsContent>

            {/* SSL TAB */}
            <TabsContent value="ssl" className="mt-0 animate-in fade-in">
              {isPending(enrichment.ssl.status) ? <TabSkeleton /> : 
               enrichment.ssl.status === 'failed' ? <ModuleErrorAlert error={enrichment.ssl.error || "Failed to fetch SSL data"} /> :
               enrichment.ssl.status === 'rate_limited' ? <ModuleRateLimitedAlert /> :
               enrichment.ssl.data ? (
                <div className="flex flex-col gap-4">
                  {(enrichment.ssl.data.isExpired || enrichment.ssl.data.isSelfSigned) && (
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
                      <AlertTriangle className="size-4" />
                      <AlertTitle>SSL Certificate Warning</AlertTitle>
                      <AlertDescription>
                        {enrichment.ssl.data.isExpired ? "This certificate has expired." : "This certificate is self-signed and may not be trusted."}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="border border-border/40 rounded-lg overflow-hidden bg-card/50">
                    <KeyValueRow label="Subject" value={enrichment.ssl.data.subject || "—"} highlight />
                    <KeyValueRow label="Issuer" value={enrichment.ssl.data.issuer || "—"} />
                    <KeyValueRow label="Validity" highlight value={
                      <div className="flex items-center gap-2">
                        <span>{formatDate(enrichment.ssl.data.validFrom)} to {formatDate(enrichment.ssl.data.validTo)}</span>
                        {enrichment.ssl.data.daysUntilExpiry !== null && (
                          <Badge variant="outline" className={`text-xs ${enrichment.ssl.data.daysUntilExpiry < 30 ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-border/50'}`}>
                            {enrichment.ssl.data.daysUntilExpiry} days left
                          </Badge>
                        )}
                      </div>
                    } />
                    <KeyValueRow label="Protocol" value={enrichment.ssl.data.protocol || "—"} />
                    <KeyValueRow label="Serial Number" value={<span className="font-mono text-xs break-all">{enrichment.ssl.data.serialNumber || "—"}</span>} highlight />
                    <KeyValueRow label="Subject Alt Names" value={
                      enrichment.ssl.data.subjectAltNames.length > 0 ?
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-2">
                        {enrichment.ssl.data.subjectAltNames.map(san => (
                          <Badge key={san} variant="outline" className="text-xs border-border/50 bg-secondary/30">{san}</Badge>
                        ))}
                      </div> : "—"
                    } />
                  </div>
                </div>
               ) : <div className="text-sm text-muted-foreground py-4 text-center">No SSL data available</div>}
            </TabsContent>

            {/* VIRUSTOTAL TAB */}
            <TabsContent value="virustotal" className="mt-0 animate-in fade-in">
              {isPending(enrichment.virustotal.status) ? <TabSkeleton /> : 
               enrichment.virustotal.status === 'failed' ? <ModuleErrorAlert error={enrichment.virustotal.error || "Failed to fetch VirusTotal data"} /> :
               enrichment.virustotal.status === 'rate_limited' ? <ModuleRateLimitedAlert /> :
               enrichment.virustotal.data ? (
                <div className="flex flex-col gap-6">
                  {/* Detection Bar */}
                  <div className="bg-secondary/20 p-4 rounded-lg border border-border/40">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium">Detection Ratio</span>
                      <span className="text-2xl font-bold text-foreground">
                        {enrichment.virustotal.data.malicious} <span className="text-sm font-normal text-muted-foreground">/ {enrichment.virustotal.data.totalEngines}</span>
                      </span>
                    </div>
                    
                    <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden flex mb-4">
                      {enrichment.virustotal.data.totalEngines > 0 && (
                        <>
                          <div style={{ width: `${(enrichment.virustotal.data.malicious / enrichment.virustotal.data.totalEngines) * 100}%` }} className="bg-red-500"></div>
                          <div style={{ width: `${(enrichment.virustotal.data.suspicious / enrichment.virustotal.data.totalEngines) * 100}%` }} className="bg-amber-500"></div>
                          <div style={{ width: `${(enrichment.virustotal.data.harmless / enrichment.virustotal.data.totalEngines) * 100}%` }} className="bg-emerald-500"></div>
                          <div style={{ width: `${(enrichment.virustotal.data.undetected / enrichment.virustotal.data.totalEngines) * 100}%` }} className="bg-slate-500"></div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400 gap-1.5"><div className="size-2 rounded-full bg-red-500"></div> Malicious: {enrichment.virustotal.data.malicious}</Badge>
                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400 gap-1.5"><div className="size-2 rounded-full bg-amber-500"></div> Suspicious: {enrichment.virustotal.data.suspicious}</Badge>
                      <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 gap-1.5"><div className="size-2 rounded-full bg-emerald-500"></div> Harmless: {enrichment.virustotal.data.harmless}</Badge>
                      <Badge variant="outline" className="bg-slate-500/10 border-slate-500/30 text-slate-400 gap-1.5"><div className="size-2 rounded-full bg-slate-500"></div> Undetected: {enrichment.virustotal.data.undetected}</Badge>
                    </div>
                  </div>
                  
                  {enrichment.virustotal.data.threatNames.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2"><Activity className="size-4" /> Detected Threats</h4>
                      <div className="flex flex-wrap gap-2">
                        {enrichment.virustotal.data.threatNames.map(threat => (
                          <Badge key={threat} variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400">{threat}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {enrichment.virustotal.data.permalink && (
                    <Button asChild variant="outline" className="w-full sm:w-auto self-start bg-secondary/20 hover:bg-secondary/40 border-border/60 text-primary">
                      <a href={enrichment.virustotal.data.permalink} target="_blank" rel="noopener noreferrer">
                        <Search className="size-4 mr-2" />
                        View Full VirusTotal Report
                      </a>
                    </Button>
                  )}
                </div>
               ) : <div className="text-sm text-muted-foreground py-4 text-center">No VirusTotal data available</div>}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
