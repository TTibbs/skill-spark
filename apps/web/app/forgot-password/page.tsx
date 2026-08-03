"use client";

import Link from "next/link";
import * as React from "react";
import { ApiError, ApiClient, createAuthApi } from "@skill-spark/api-client";
import { TactileButton } from "@/components/ui/tactile-button";
import { getBrowserApiBaseUrl } from "@/features/api/base-url";
import {
  AuthShell,
  Field,
  FormMessage,
  inputClassName,
} from "@/features/auth/components/auth-shell";

const authApi = createAuthApi(
  new ApiClient({
    baseUrl: getBrowserApiBaseUrl(),
    credentials: "include",
  })
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Enter the email address for your account.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.forgotPassword({ email: email.trim() });
      setMessage(response.message);
    } catch (caught) {
      const fallback =
        "If your account exists, you will receive a password reset email shortly";
      setMessage(caught instanceof ApiError ? fallback : fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      description="We will send reset instructions when an account exists."
      footer={
        <Link className="font-bold text-[#315f4c]" href="/login">
          Back to login
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <FormMessage>{error}</FormMessage> : null}
        {message ? <FormMessage tone="success">{message}</FormMessage> : null}
        <Field label="Email">
          <input
            className={inputClassName}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
          />
        </Field>
        <TactileButton
          type="submit"
          disabled={isSubmitting}
          effect="press"
          className="min-h-12 w-full rounded-2xl border-[#15271f] bg-[#244137] px-5 py-0 font-black text-white hover:bg-[#2e4c40] hover:text-white disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </TactileButton>
      </form>
    </AuthShell>
  );
}
