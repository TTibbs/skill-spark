"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ApiError } from "@skill-spark/api-client";
import {
  AuthShell,
  Field,
  FormMessage,
  inputClassName,
} from "@/features/auth/components/auth-shell";
import { useAuth } from "@/features/auth/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError("Enter your email or username and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedIdentifier = identifier.trim();
      await login({
        password,
        ...(trimmedIdentifier.includes("@")
          ? { email: trimmedIdentifier }
          : { username: trimmedIdentifier }),
      });
      router.push("/parents");
    } catch (caught) {
      console.error("Login failed", caught);
      const message =
        caught instanceof ApiError
          ? caught.message
          : process.env.NODE_ENV === "development" && caught instanceof Error
            ? `Unable to log in right now: ${caught.message}`
          : "Unable to log in right now.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to manage learning, chores and rewards."
      footer={
        <>
          New to Skill Spark?{" "}
          <Link className="font-bold text-[#315f4c]" href="/register">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <FormMessage>{error}</FormMessage> : null}

        <Field label="Email or username">
          <input
            className={inputClassName}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              className={`${inputClassName} pr-20`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#315f4c]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full rounded-2xl bg-[#244137] px-5 font-black text-white shadow-[0_6px_0_#15271f] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <Link
          href="/forgot-password"
          className="block text-center text-sm font-bold text-[#315f4c]"
        >
          Forgot your password?
        </Link>
      </form>
    </AuthShell>
  );
}
