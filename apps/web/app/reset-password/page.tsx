"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { ApiError, ApiClient, createAuthApi } from "@skill-spark/api-client";
import {
  AuthShell,
  Field,
  FormMessage,
  inputClassName,
} from "@/features/auth/components/auth-shell";

const authApi = createAuthApi(
  new ApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    credentials: "include",
  })
);

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("This reset link is missing a token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.resetPassword({
        token,
        newPassword: password,
      });
      setMessage(response.message);
      window.setTimeout(() => router.push("/login"), 1200);
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : "Unable to reset your password right now.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      description="Use a fresh password with at least eight characters."
      footer={
        <Link className="font-bold text-[#315f4c]" href="/login">
          Back to login
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <FormMessage>{error}</FormMessage> : null}
        {message ? <FormMessage tone="success">{message}</FormMessage> : null}
        <Field label="New password">
          <input
            className={inputClassName}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm new password">
          <input
            className={inputClassName}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
          />
        </Field>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full rounded-2xl bg-[#244137] px-5 font-black text-white shadow-[0_6px_0_#15271f] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save new password"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <AuthShell
          title="Choose a new password"
          description="Loading your reset link."
          footer={
            <Link className="font-bold text-[#315f4c]" href="/login">
              Back to login
            </Link>
          }
        >
          <p className="text-sm font-semibold text-[#66766f]">Loading...</p>
        </AuthShell>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
