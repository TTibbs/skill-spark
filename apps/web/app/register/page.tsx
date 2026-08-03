"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ApiError } from "@skill-spark/api-client";
import { TactileButton } from "@/components/ui/tactile-button";
import {
  AuthShell,
  Field,
  FormMessage,
  inputClassName,
} from "@/features/auth/components/auth-shell";
import { useAuth } from "@/features/auth/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (username.trim().length < 3 || username.trim().length > 30) {
      setError("Username must be between 3 and 30 characters.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
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
      await register({
        username: username.trim(),
        display_name: displayName.trim() || undefined,
        email: email.trim(),
        password,
      });
      router.push("/parents");
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : "Unable to create your account right now.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Start with a parent account. Child profiles can be added later."
      footer={
        <>
          Already registered?{" "}
          <Link className="font-bold text-[#315f4c]" href="/login">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <FormMessage>{error}</FormMessage> : null}
        <Field label="Username">
          <input
            className={inputClassName}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        </Field>
        <Field label="Display name">
          <input
            className={inputClassName}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="name"
          />
        </Field>
        <Field label="Email">
          <input
            className={inputClassName}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
          />
        </Field>
        <Field label="Password">
          <input
            className={inputClassName}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm password">
          <input
            className={inputClassName}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
          />
        </Field>
        <TactileButton
          type="submit"
          disabled={isSubmitting}
          effect="press"
          className="min-h-12 w-full rounded-2xl border-[#15271f] bg-[#244137] px-5 py-0 font-black text-white hover:bg-[#2e4c40] hover:text-white disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </TactileButton>
      </form>
    </AuthShell>
  );
}
