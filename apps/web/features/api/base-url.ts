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

  console.error(
    `Invalid NEXT_PUBLIC_API_URL value "${configured}". Falling back to ${DEFAULT_API_BASE_URL}.`
  );
  return DEFAULT_API_BASE_URL;
}
