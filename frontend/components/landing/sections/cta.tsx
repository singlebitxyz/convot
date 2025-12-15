"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@radix-ui/react-icons";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

export default function CTA() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const features = [
    "PDFs, DOCX, URLs, and text",
    "OpenAI or Gemini models",
    "One-line embed + insights",
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(247,206,69,0.08),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Main CTA Card */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 md:p-10 lg:p-12 overflow-hidden">
          {/* Inner glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
            {/* Left content */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                <Sparkles className="h-3 w-3" />
                Ready to ship?
              </div>

              <h3 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Ship your assistant <span className="text-primary">today</span>.
              </h3>

              <p className="mt-4 text-base text-foreground/60 max-w-lg">
                Upload content, configure the bot, and embed it in minutes.
                Analytics included. No credit card required.
              </p>

              {/* Features list */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-foreground/70"
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <CheckIcon className="h-3 w-3" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right CTA box */}
            <div className="lg:w-80 shrink-0">
              <div className="rounded-xl border border-white/10 bg-black/40 p-5">
                <p className="text-base font-semibold text-foreground">
                  Get started in minutes
                </p>
                <p className="mt-1.5 text-sm text-foreground/50">
                  Create your first bot and embed it on your site.
                </p>

                <Button
                  size="lg"
                  className="mt-5 w-full h-11 text-sm font-medium group"
                  onClick={handleGetStarted}
                >
                  {isAuthenticated ? "Go to dashboard" : "Get started free"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>

                <p className="mt-4 text-center text-[11px] text-foreground/40">
                  Free plan available • Secure tokens • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
