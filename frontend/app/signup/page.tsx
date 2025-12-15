import Link from "next/link";
import { AuthGuard } from "@/components/auth";
import { AuthForm } from "@/components/forms/auth-form";
import { TextLogo } from "@/components/ui/text-logo";
import { Rocket } from "lucide-react";

export default function SignupPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="relative min-h-svh flex items-center justify-center p-4">
        {/* Background effects */}
        <div className="fixed inset-0 bg-background" />
        <div className="fixed inset-0 bg-grid-white/[0.02] bg-grid-16" />
        <div className="pointer-events-none fixed -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(247,206,69,0.12),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none fixed -bottom-40 left-1/4 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(247,206,69,0.08),transparent_60%)] blur-3xl" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <TextLogo showIcon iconSize={28} className="text-xl" />
            </Link>
          </div>

          {/* Signup card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary mb-4">
                <Rocket className="h-3 w-3" />
                Get started free
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-foreground/50">
                Start building AI-powered assistants in minutes
              </p>
            </div>

            <AuthForm mode="signup" />
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-foreground/40">
            By signing up, you agree to our{" "}
            <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
