"use client";

import { ApiClient, createAuthApi } from "@skill-spark/api-client";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const createBrowserAuthApi = (
  getAccessToken: () => string | null,
  onUnauthorized?: () => void
) => {
  const client = new ApiClient({
    baseUrl: apiBaseUrl,
    getAccessToken,
    onUnauthorized,
    credentials: "include",
  });

  return createAuthApi(client);
};
