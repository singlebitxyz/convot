"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Github } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { TextLogo } from "@/components/ui/text-logo";

export type IconProps = React.HTMLAttributes<SVGElement>;

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/85 via-background/60 to-transparent backdrop-blur" />

      <div className="relative pointer-events-auto max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="no-hover flex items-center gap-2"
            aria-label="Convot home"
          >
            <TextLogo showIcon iconSize={22} className="text-base" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-foreground/70">
            <Link
              href="/#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How it works
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden sm:inline-flex border-white/10 bg-white/5 hover:bg-white/10 hover:text-foreground"
              onClick={() =>
                window.open("https://github.com/namanbarkiya/convot", "_blank")
              }
            >
              <Github className="h-4 w-4" />
              GitHub
              <ArrowUpRight className="h-4 w-4 opacity-70" />
            </Button>
            <Button
              onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
            >
              {isAuthenticated ? "Dashboard" : "Get started"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
