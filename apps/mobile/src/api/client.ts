import {
  createApiClient,
  createAuthApi,
  createChildrenApi,
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
  };
}
