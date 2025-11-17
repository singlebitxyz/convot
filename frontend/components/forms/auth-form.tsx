"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { FormField, FormSubmit } from "@/components/forms";
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
      <div className="space-y-4">
        {!isLogin && (
          <div className="flex justify-center">
            <Badge variant="default" className="text-sm p-2">
              Email signup is not available yet. Please sign up with Google
              below.
            </Badge>
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
            <Input
              {...register("name" as keyof SignupFormData)}
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              disabled={!isLogin}
            />
          </FormField>
        )}

        <FormField label="Email" error={errors.email?.message} required>
          <Input
            {...register("email")}
            type="email"
            placeholder="m@example.com"
            autoComplete="username"
            disabled={!isLogin}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <div className="space-y-2">
            <Input
              {...register("password")}
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={!isLogin}
            />
            {isLogin && (
              <div className="flex justify-end">
                <Link
                  href="#"
                  className="text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </div>
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
            <Input
              {...register("confirmPassword" as keyof SignupFormData)}
              type="password"
              autoComplete="new-password"
              disabled={!isLogin}
            />
          </FormField>
        )}

        <FormSubmit isLoading={isLoading} disabled={!isLogin}>
          {isLogin ? "Login" : "Sign Up"}
        </FormSubmit>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSocialLoading}
        >
          {isSocialLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to Google...
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </Button>
      </div>

      <div className="text-center text-sm">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Login
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
    className="h-4 w-4"
  >
    <path
      d="M21.805 10.023H12.2v3.955h5.483c-.236 1.266-1.418 3.711-5.483 3.711-3.301 0-5.99-2.739-5.99-6.105 0-3.366 2.689-6.105 5.99-6.105 1.878 0 3.144.8 3.864 1.489l2.64-2.546C17.468 2.732 15.063 1.5 12.2 1.5 6.807 1.5 2.5 5.796 2.5 11.083c0 5.287 4.307 9.583 9.7 9.583 5.601 0 9.3-3.939 9.3-9.492 0-.637-.081-1.126-.195-1.151z"
      fill="currentColor"
    />
  </svg>
);
