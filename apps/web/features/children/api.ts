"use client";

import {
  ApiClient,
  createChildrenApi,
  createChoresApi,
  createGameResultsApi,
  createRewardsApi,
  createStatsApi,
  createWordsApi,
} from "@skill-spark/api-client";
import { getBrowserApiBaseUrl } from "@/features/api/base-url";

const apiBaseUrl = getBrowserApiBaseUrl();

export const createBrowserChildrenApi = (
  getAccessToken: () => string | null,
  onUnauthorized?: () => void
) => {
  const client = new ApiClient({
    baseUrl: apiBaseUrl,
    getAccessToken,
    onUnauthorized,
    credentials: "include",
  });

  return {
    children: createChildrenApi(client),
    chores: createChoresApi(client),
    stats: createStatsApi(client),
    gameResults: createGameResultsApi(client),
    rewards: createRewardsApi(client),
    words: createWordsApi(client),
  };
};

export type BrowserChildrenApi = ReturnType<typeof createBrowserChildrenApi>;
