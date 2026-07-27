"use client";

import Link from "next/link";
import { Shield, Globe, MapPin, Lock, Search } from "lucide-react";

export function ToolsToolbar() {
  const tools = [
    {
      name: "Threat Intel",
      icon: Shield,
      href: "/tools/threat-intel",
      isPrimary: true,
    },
    {
      name: "WHOIS",
      icon: Globe,
      href: "/tools/whois",
      isPrimary: false,
    },
    {
      name: "GeoIP",
      icon: MapPin,
      href: "/tools/geoip",
      isPrimary: false,
    },
    {
      name: "SSL Check",
      icon: Lock,
      href: "/tools/ssl",
      isPrimary: false,
    },
    {
      name: "VirusTotal",
      icon: Search,
      href: "/tools/virustotal",
      isPrimary: false,
    },
  ];

  return (
    <section className="w-full max-w-4xl mx-auto px-4 mt-8">
      <div className="border border-border/60 bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
        <h2 className="text-xs uppercase tracking-wider text-primary font-semibold mb-4 text-center">
          Security Tools
        </h2>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:pb-0 md:grid md:grid-cols-5 md:gap-4 no-scrollbar">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className={`
                  snap-center min-w-[100px] flex-shrink-0
                  rounded-xl px-4 py-3 flex flex-col items-center gap-1.5 transition-all
                  hover:scale-105 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]
                  ${
                    tool.isPrimary
                      ? "bg-indigo-600 text-white border-transparent"
                      : "border border-border/60 bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-secondary/80"
                  }
                `}
              >
                <Icon className="size-5" />
                <span className="text-xs font-medium whitespace-nowrap">
                  {tool.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
