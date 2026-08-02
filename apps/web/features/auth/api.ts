"use client";

import { ApiClient, createAuthApi } from "@skill-spark/api-client";
import { getBrowserApiBaseUrl } from "@/features/api/base-url";

const apiBaseUrl = getBrowserApiBaseUrl();

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
