"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    handle: "University of Technology",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
    content:
      "Convot transformed how we handle student inquiries. We uploaded our course catalogs and policies, and now students get instant answers 24/7.",
    role: "Academic Affairs Director",
  },
  {
    name: "Alex Rodriguez",
    handle: "TechCorp Solutions",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content:
      "Our support team was overwhelmed with FAQs. Convot reduced ticket volume by 60% by answering common questions automatically using our documentation.",
    role: "Customer Success Manager",
  },
  {
    name: "Maya Patel",
    handle: "KnowledgeBase Inc",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content:
      "We crawled our entire documentation site and embedded Convot. Users can now search through thousands of articles conversationally.",
    role: "Product Manager",
  },
  {
    name: "Jordan Kim",
    handle: "Internal Tools Team",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content:
      "Convot helps our team quickly find information from training materials and policy documents. The analytics show us what questions are most common.",
    role: "HR Technology Lead",
  },
  {
    name: "Emma Thompson",
    handle: "E-commerce Platform",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    content:
      "Setup took less than 10 minutes. We uploaded our product guides and return policies, and customers get instant help without waiting for support.",
    role: "Operations Director",
  },
  {
    name: "David Park",
    handle: "Healthcare Network",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    content:
      "Convot handles patient inquiries about appointments, insurance, and services. The security and compliance features give us confidence.",
    role: "IT Director",
  },
];

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) {
  return (
    <Card
      className="h-full p-6 bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-colors"
    >
      <CardContent className="p-0 h-full flex flex-col justify-between">
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
          &ldquo;{testimonial.content}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback>
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-sm text-foreground">
              {testimonial.name}
            </div>
            <div className="text-xs text-foreground/60">
              {testimonial.role} • {testimonial.handle}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Testimonials() {
  return (
    <section className="overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
            Trusted by teams worldwide
          </h2>
          <p className="text-base text-foreground/70 max-w-2xl">
            Universities, companies, and internal teams use Convot to reduce
            support load and make knowledge instantly accessible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={`${testimonial.name}-${testimonial.handle}`}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
