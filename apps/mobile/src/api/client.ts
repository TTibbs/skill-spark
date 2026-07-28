import {
  createApiClient,
  createAuthApi,
  createChildrenApi,
  createChoresApi,
  createRewardsApi,
} from "@skill-spark/api-client";
import { getApiBaseUrl } from "@/config/env";

export function createMobileApi(getAccessToken: () => string | null) {
  const client = createApiClient({
    baseUrl: getApiBaseUrl(),
    getAccessToken,
  });

  return {
    auth: createAuthApi(client),
    children: createChildrenApi(client),
    chores: createChoresApi(client),
    rewards: createRewardsApi(client),
  };
}
