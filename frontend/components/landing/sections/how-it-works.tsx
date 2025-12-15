"use client";

import React from "react";
import { Code, FileText, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/landing/section-header";

const steps = [
  {
    icon: FileText,
    title: "Connect your knowledge",
    description:
      "Upload PDFs/DOCX, paste text, or crawl URLs. Convot chunks and indexes your content automatically.",
  },
  {
    icon: Sparkles,
    title: "Tune the assistant",
    description:
      "Set your tone, choose OpenAI or Gemini, and lock in guardrails so answers stay on-brand and grounded.",
  },
  {
    icon: Code,
    title: "Embed everywhere",
    description:
      "Drop a one-line script into your site. Your widget starts answering instantly, with analytics built in.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <SectionHeader
          title="From docs to answers in minutes"
          subtitle="A clean workflow that feels like modern AI products: connect, configure, embed."
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-base font-semibold text-foreground">
                  {step.title}
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


