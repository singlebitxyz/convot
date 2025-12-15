"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Shield, Zap } from "lucide-react";
import ProductPreview from "@/components/landing/sections/product-preview";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24">
      {/* Layered background effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_50%_30%,rgba(247,206,69,0.15),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-0 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,206,69,0.08),transparent_70%)] blur-2xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero content - stacked on mobile, side by side on desktop */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-12 xl:gap-16">
          {/* Left column - Text content */}
          <div className="flex-1 max-w-2xl xl:max-w-xl">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
            >
              <Zap className="h-3 w-3 mr-1.5" />
              AI-powered docs assistant
            </Badge>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
              Turn your content into an{" "}
              <span className="relative">
                <span className="text-primary">instant</span>
                <svg
                  className="absolute left-0 w-full h-2 text-primary/40"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 7 Q 25 0, 50 4 T 100 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              support assistant.
            </h1>

            <p className="mt-6 text-lg text-foreground/60 leading-relaxed">
              Train an on-brand chatbot on PDFs, URLs, and text — embed it with
              one line of code. Get answers users trust and insights your team
              can act on.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="group h-12 px-6 text-base font-medium"
                onClick={() =>
                  router.push(isAuthenticated ? "/dashboard" : "/login")
                }
              >
                {isAuthenticated ? "Go to dashboard" : "Get started free"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base font-medium border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
                onClick={() =>
                  window.open(
                    "https://github.com/namanbarkiya/convot",
                    "_blank"
                  )
                }
              >
                View docs
              </Button>
            </div>

            {/* Mini feature highlights */}
            <div className="mt-10 flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <span>5 min setup</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-4 w-4" />
                </div>
                <span>SOC 2 compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <span>No-code required</span>
              </div>
            </div>
          </div>

          {/* Right column - Product preview */}
          <div className="flex-1 xl:flex-none xl:w-[580px]">
            <ProductPreview className="w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
