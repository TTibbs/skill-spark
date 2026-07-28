import Link from "next/link";
import type * as React from "react";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfcf7] px-5 py-16 text-[#23372f]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#dbe8dc] bg-white p-6 shadow-[0_24px_70px_rgba(45,69,58,0.12)] sm:p-8">
        <Link
          href="/"
          className="text-sm font-black uppercase tracking-[0.18em] text-[#4f7b66]"
        >
          Skill Spark
        </Link>
        <h1 className="mt-5 text-3xl font-black tracking-[-0.035em]">
          {title}
        </h1>
        <p className="mt-2 leading-7 text-[#66766f]">{description}</p>
        <div className="mt-7">{children}</div>
        <div className="mt-6 text-center text-sm text-[#66766f]">{footer}</div>
      </section>
    </main>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#30483e]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClassName =
  "min-h-12 w-full rounded-2xl border border-[#cddfd2] bg-[#fbfcf7] px-4 text-[#22372f] outline-none transition focus:border-[#4f7b66] focus:ring-4 focus:ring-[#dbeee3]";

export function FormMessage({
  children,
  tone = "error",
}: {
  children: React.ReactNode;
  tone?: "error" | "success";
}) {
  return (
    <p
      className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
        tone === "success"
          ? "bg-[#e5f5eb] text-[#2b6047]"
          : "bg-[#fff0eb] text-[#9a3c22]"
      }`}
    >
      {children}
    </p>
  );
}
