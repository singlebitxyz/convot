"use client";

import React from "react";
import { Briefcase, Building2, Globe, Rocket, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const companies = [
  { name: "Acme Corp", icon: Building2 },
  { name: "Northwind", icon: Briefcase },
  { name: "Starlight", icon: Rocket },
  { name: "Keystone", icon: Shield },
  { name: "Pinecone", icon: Zap },
  { name: "Globex", icon: Globe },
];

export default function Logos({ className }: { className?: string }) {
  return (
    <section className={cn("relative", className)} aria-label="Social proof">
      {/* Subtle divider line */}
      {/* <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground/50 tracking-wide">
            Trusted by teams building support, docs, and internal knowledge bots
          </p>
        </div>

        {/* Logo grid with fade edges */}
        <div className="relative mt-10">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {companies.map(({ name, icon: Icon }) => (
              <div
                key={name}
                className="group flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-foreground/40 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground/50 group-hover:text-foreground/70 transition-colors">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        {/* <div className="mt-12 flex items-center justify-center gap-8 md:gap-16">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground tabular-nums">
              500+
            </p>
            <p className="mt-1 text-xs text-foreground/40">Active bots</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground tabular-nums">
              1M+
            </p>
            <p className="mt-1 text-xs text-foreground/40">Queries answered</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground tabular-nums">
              99.9%
            </p>
            <p className="mt-1 text-xs text-foreground/40">Uptime</p>
          </div>
        </div> */}
      </div>
    </section>
  );
}
