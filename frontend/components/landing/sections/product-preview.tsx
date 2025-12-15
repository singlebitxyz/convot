"use client";

import React from "react";
import { Code, FileText, Globe, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function Pill({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-white/10 bg-white/5 text-foreground/70 hover:bg-white/8"
      )}
    >
      <span className={active ? "text-primary" : "text-foreground/60"}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

export default function ProductPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5 shadow-2xl backdrop-blur-sm",
        className
      )}
    >
      {/* Glow effects */}
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(ellipse_at_20%_0%,rgba(247,206,69,0.12),transparent_50%)] blur-2xl" />
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(ellipse_at_80%_100%,rgba(247,206,69,0.08),transparent_50%)] blur-2xl" />

      <div className="relative">
        {/* Pills */}
        <div className="flex flex-wrap gap-2">
          <Pill
            icon={<FileText className="h-3.5 w-3.5" />}
            label="PDFs"
            active
          />
          <Pill icon={<Globe className="h-3.5 w-3.5" />} label="URLs" />
          <Pill icon={<Code className="h-3.5 w-3.5" />} label="1‑line embed" />
          <Pill icon={<Sparkles className="h-3.5 w-3.5" />} label="Insights" />
        </div>

        {/* Main content grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Chat mock - takes more space */}
          <div className="md:col-span-3 flex flex-col rounded-xl border border-white/10 bg-black/40 overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(247,206,69,0.5)]" />
                <p className="text-sm font-semibold text-foreground">
                  Convot Widget
                </p>
              </div>
              <p className="text-[11px] text-foreground/40 font-medium tracking-wide uppercase">
                Live preview
              </p>
            </div>

            {/* Chat messages - scrollable area */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin">
              {/* Bot message */}
              <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white/5 border border-white/8 p-3 text-sm text-foreground/80">
                Ask me anything about your docs.
              </div>

              {/* User message */}
              <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-md bg-primary/15 border border-primary/20 p-3 text-sm text-foreground">
                What&apos;s your refund policy?
              </div>

              {/* Bot response with citations */}
              <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white/5 border border-white/8 p-3 text-sm text-foreground/80">
                <p>Refunds are available within 14 days for annual plans.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-white/5 border border-white/8 px-2 py-1 text-[10px] text-foreground/60">
                    Source: policy.pdf
                  </span>
                  <span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] text-primary">
                    Confidence: high
                  </span>
                </div>
              </div>

              {/* Second user message */}
              <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-md bg-primary/15 border border-primary/20 p-3 text-sm text-foreground">
                How do I upgrade my plan?
              </div>

              {/* Second bot response */}
              <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white/5 border border-white/8 p-3 text-sm text-foreground/80">
                <p>
                  Settings → Billing and click &quot;Upgrade&quot;. You can
                  switch plans anytime.
                </p>
                {/* <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-white/5 border border-white/8 px-2 py-1 text-[10px] text-foreground/60">
                    Source: billing-guide.pdf
                  </span>
                  <span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] text-primary">
                    Confidence: high
                  </span>
                </div> */}
              </div>
            </div>

            {/* Input field - sticky at bottom */}
            <div className="p-3 border-t border-white/8 bg-black/20">
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                <span className="flex-1 text-xs text-foreground/40">
                  Type your question...
                </span>
                <Send className="h-3.5 w-3.5 text-foreground/30" />
              </div>
            </div>
          </div>

          {/* Right column - embed + insights */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Embed card */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Embed in seconds
                  </p>
                  <p className="mt-1 text-xs text-foreground/50">
                    One script tag. Works anywhere.
                  </p>
                </div>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Code className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-white/8 bg-black/60 p-3 font-mono text-[11px] leading-relaxed overflow-x-auto">
                <div className="flex items-center gap-1.5 text-foreground/40 mb-2 pb-2 border-b border-white/5">
                  <div className="h-2 w-2 rounded-full bg-red-400/60" />
                  <div className="h-2 w-2 rounded-full bg-yellow-400/60" />
                  <div className="h-2 w-2 rounded-full bg-green-400/60" />
                  <span className="ml-2 text-[9px]">index.html</span>
                </div>
                <code className="block whitespace-pre text-[10px]">
                  <span className="text-primary/80">&lt;script </span>
                  <span className="text-foreground/50">src</span>
                  <span className="text-foreground/40">=</span>
                  <span className="text-emerald-400/70">
                    &quot;...widget.js&quot;
                  </span>
                  <span className="text-primary/80">/&gt;</span>
                  {"\n"}
                  <span className="text-primary/80">&lt;script&gt;</span>
                  {"\n"}
                  <span className="text-foreground/60">{"  "}Convot.</span>
                  <span className="text-amber-400/80">init</span>
                  <span className="text-foreground/40">{"({ "}</span>
                  <span className="text-foreground/50">token</span>
                  <span className="text-foreground/40">: </span>
                  <span className="text-emerald-400/70">&quot;...&quot;</span>
                  <span className="text-foreground/40">{" })"}</span>
                  {"\n"}
                  <span className="text-primary/80">&lt;/script&gt;</span>
                </code>
              </div>
            </div>

            {/* Insights card */}
            <div className="flex-1 rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-sm font-semibold text-foreground">
                Insights that matter
              </p>
              <p className="mt-1 text-xs text-foreground/50">
                Learn what users ask and where your docs fall short.
              </p>

              <div className="mt-4 space-y-2.5">
                {/* Queries stat with mini bar */}
                <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="h-1 w-6 rounded-full bg-primary" />
                      <div className="h-1 w-4 rounded-full bg-primary/60" />
                      <div className="h-1 w-5 rounded-full bg-primary/40" />
                    </div>
                    <span className="text-xs text-foreground/60">
                      Queries/day
                    </span>
                  </div>
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    312
                  </span>
                </div>

                {/* Resolved stat with progress ring */}
                <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-6 w-6">
                      <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-white/10"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="57"
                          strokeDashoffset="5"
                          strokeLinecap="round"
                          className="text-primary"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-foreground/60">Resolved</span>
                  </div>
                  <span className="text-lg font-bold text-primary tabular-nums">
                    91%
                  </span>
                </div>

                {/* Top topic */}
                <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <span className="text-[10px] font-bold">#1</span>
                    </div>
                    <span className="text-xs text-foreground/60">
                      Top topic
                    </span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    Billing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
