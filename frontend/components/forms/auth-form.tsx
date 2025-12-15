"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { FormField } from "@/components/forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useLogin, useSignup } from "@/lib/query/hooks/auth";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData extends LoginFormData {
  name: string;
  confirmPassword: string;
}

interface AuthFormProps {
  mode: "login" | "signup";
  className?: string;
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  className,
  onSuccess,
}) => {
  const isLogin = mode === "login";
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const { error: notifyError } = useNotifications();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: isLogin
      ? {
          email: "user@guest.com",
          password: "",
        }
      : undefined,
  });

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
    // Prevent signup form submission (email/password signup is disabled)
    if (!isLogin) {
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await loginMutation.mutateAsync(data as LoginFormData);
      } else {
        await signupMutation.mutateAsync(data as SignupFormData);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSocialLoading(true);
    try {
      const supabase = createClient();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=/dashboard`
          : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: redirectTo ? { redirectTo } : undefined,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      notifyError(
        "Google Sign-In Failed",
        error instanceof Error
          ? error.message
          : "We couldn't connect to Google right now. Please try again."
      );
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <div className="space-y-5">
        {/* Google Sign In - Primary option */}
        <Button
          variant="outline"
          className="w-full h-11 text-sm font-medium border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSocialLoading}
        >
          {isSocialLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Redirecting to Google...
            </>
          ) : (
            <>
              <GoogleIcon />
              <span className="ml-2">Continue with Google</span>
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-transparent px-4 text-foreground/40">
              or continue with email
            </span>
          </div>
        </div>

        {!isLogin && (
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
            <p className="text-xs text-primary text-center">
              Email signup is not available yet. Please sign up with Google above.
            </p>
          </div>
        )}

        {!isLogin && (
          <FormField
            label="Name"
            error={
              (errors as Record<string, { message?: string }>).name?.message
            }
            required
          >
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <Input
                {...register("name" as keyof SignupFormData)}
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                disabled={!isLogin}
                className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </FormField>
        )}

        <FormField label="Email" error={errors.email?.message} required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <Input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              autoComplete="username"
              disabled={!isLogin}
              className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={!isLogin}
              className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>
          {isLogin && (
            <div className="flex justify-end mt-2">
              <Link
                href="#"
                className="text-xs text-foreground/50 hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </FormField>

        {!isLogin && (
          <FormField
            label="Confirm Password"
            error={
              (errors as Record<string, { message?: string }>).confirmPassword
                ?.message
            }
            required
          >
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <Input
                {...register("confirmPassword" as keyof SignupFormData)}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={!isLogin}
                className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </FormField>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-sm font-medium group"
          disabled={isLoading || !isLogin}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            <>
              {isLogin ? "Sign in" : "Create account"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-foreground/50">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </form>
  );
};

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-5 w-5"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);
