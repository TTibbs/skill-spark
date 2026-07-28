import * as React from "react";
import { ApiError } from "@skill-spark/api-client";
import { useAuth } from "@/auth/use-auth";
import { createMobileApi } from "./client";

export function useMobileApi() {
  const { accessToken, refreshSession } = useAuth();
  const accessTokenRef = React.useRef(accessToken);

  React.useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const api = React.useMemo(
    () => createMobileApi(() => accessTokenRef.current),
    []
  );

  const withRefresh = React.useCallback(
    async <T,>(request: () => Promise<T>) => {
      try {
        return await request();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          const refreshed = await refreshSession();
          if (refreshed) {
            return request();
          }
        }
        throw error;
      }
    },
    [refreshSession]
  );

  return { api, withRefresh };
}
