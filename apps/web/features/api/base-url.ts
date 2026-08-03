"use client";

const DEFAULT_API_BASE_URL = "/api";

export function getBrowserApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configured) {
    return DEFAULT_API_BASE_URL;
  }

  if (configured.startsWith("/") || /^https?:\/\//i.test(configured)) {
    return configured;
  }

  throw new Error(
    `Invalid NEXT_PUBLIC_API_URL value "${configured}". Use a path starting with "/" or an absolute http(s) URL.`
  );
}
