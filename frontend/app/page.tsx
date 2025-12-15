import React from "react";
import { ForceDarkMode } from "@/components/landing/force-dark-mode";
import { SectionHeader } from "@/components/landing/section-header";
import CTA from "@/components/landing/sections/cta";
import Features from "@/components/landing/sections/features";
import Footer from "@/components/landing/sections/footer";
import Hero from "@/components/landing/sections/hero";
import HowItWorks from "@/components/landing/sections/how-it-works";
import Logos from "@/components/landing/sections/logos";
import Navbar from "@/components/landing/sections/navbar";
import Pricing from "@/components/landing/sections/pricing";
import Testimonials from "@/components/landing/sections/testimonials";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export default function LandingPage() {
  return (
    <>
      <ForceDarkMode />
      <div className="min-h-screen relative">
        {/* Solid black background - always dark for branding */}
        <div className="fixed inset-0 bg-background" />

        {/* Content wrapper */}
        <div className="relative z-10">
          <Navbar />

          {/* Hero Section */}
          <RevealOnScroll direction="up" delay={200}>
            <Hero />
          </RevealOnScroll>

          {/* Social Proof */}
          <RevealOnScroll direction="up" delay={120}>
            <Logos />
          </RevealOnScroll>

          {/* How it works */}
          <RevealOnScroll direction="up" delay={160}>
            <HowItWorks />
          </RevealOnScroll>

          {/* Features Section */}
          <div id="features" className="py-4 sm:py-14 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <RevealOnScroll direction="up" delay={100}>
                <SectionHeader
                  title="Everything you need — nothing you don’t"
                  subtitle="A focused set of features designed for modern AI landing pages: fast setup, grounded answers, and a beautiful embed experience."
                  align="left"
                />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={300}>
                <Features />
              </RevealOnScroll>
            </div>
          </div>

          {/* Testimonials Section */}
          {/* <div className="py-4 sm:py-14">
            <RevealOnScroll direction="up" delay={200}>
              <Testimonials />
            </RevealOnScroll>
          </div> */}

          {/* Pricing Section */}
          <div className="py-4 sm:py-14">
            <RevealOnScroll direction="up" delay={200}>
              <Pricing />
            </RevealOnScroll>
          </div>

          {/* Use Cases Section */}
          <div className="py-4 sm:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <RevealOnScroll direction="up" delay={100}>
                <SectionHeader
                  title="Built for real teams"
                  subtitle="Support, docs, internal enablement — wherever users need quick, correct answers."
                  align="left"
                />
              </RevealOnScroll>
              {/* Final CTA */}
              <RevealOnScroll direction="up" delay={200}>
                <CTA />
              </RevealOnScroll>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
}
