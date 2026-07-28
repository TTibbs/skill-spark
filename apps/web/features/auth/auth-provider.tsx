"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type {
  AuthenticatedUser,
  LoginInput,
  RegisterInput,
} from "@skill-spark/contracts";
import { ApiError } from "@skill-spark/api-client";
import { createBrowserChildrenApi } from "@/features/children/api";
import { createBrowserAuthApi } from "./api";
import { AuthContext, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProtectedPath =
    pathname?.startsWith("/parents") ||
    pathname?.startsWith("/chores") ||
    pathname?.startsWith("/rewards") ||
    false;
  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");
  const accessTokenRef = React.useRef<string | null>(null);
  const refreshPromiseRef = React.useRef<Promise<boolean> | null>(null);
  const protectedRefreshAttemptedRef = React.useRef(false);
  const authApiRef = React.useRef<ReturnType<typeof createBrowserAuthApi> | null>(
    null
  );

  const clearSession = React.useCallback(() => {
    accessTokenRef.current = null;
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const getAuthApi = React.useCallback(() => {
    if (!authApiRef.current) {
      authApiRef.current = createBrowserAuthApi(
        () => accessTokenRef.current,
        () => {
          accessTokenRef.current = null;
        }
      );
    }

    return authApiRef.current;
  }, []);

  const createChildrenApi = React.useCallback(
    () =>
      createBrowserChildrenApi(
        () => accessTokenRef.current,
        () => {
          accessTokenRef.current = null;
        }
      ),
    []
  );

  const loadCurrentUser = React.useCallback(
    async (accessToken: string) => {
      accessTokenRef.current = accessToken;
      const authApi = getAuthApi();
      const response = await authApi.me();
      setUser(response.data.user);
      setStatus("authenticated");
    },
    [getAuthApi]
  );

  const refreshSession = React.useCallback(async () => {
    if (accessTokenRef.current) {
      return true;
    }

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const authApi = getAuthApi();
        const response = await authApi.refreshToken({
          refreshTokenMode: "cookie",
        });
        await loadCurrentUser(response.data.accessToken);
        return true;
      } catch {
        clearSession();
        return false;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [clearSession, getAuthApi, loadCurrentUser]);

  React.useEffect(() => {
    if (!isProtectedPath) {
      protectedRefreshAttemptedRef.current = false;
      if (!accessTokenRef.current) {
        setStatus("unauthenticated");
      }
      return;
    }

    if (accessTokenRef.current || protectedRefreshAttemptedRef.current) return;
    protectedRefreshAttemptedRef.current = true;

    void refreshSession();
  }, [isProtectedPath, refreshSession]);

  const hasAccessToken = React.useCallback(
    () => accessTokenRef.current !== null,
    []
  );

  const login = React.useCallback(
    async (input: LoginInput) => {
      const authApi = getAuthApi();
      const response = await authApi.login({
        ...input,
        refreshTokenMode: "cookie",
      });
      accessTokenRef.current = response.data.accessToken;
      setUser(response.data.user);
      setStatus("authenticated");
    },
    [getAuthApi]
  );

  const register = React.useCallback(
    async (input: RegisterInput) => {
      const authApi = getAuthApi();
      const response = await authApi.register({
        ...input,
        refreshTokenMode: "cookie",
      });
      accessTokenRef.current = response.data.accessToken;
      setUser(response.data.user);
      setStatus("authenticated");
    },
    [getAuthApi]
  );

  const logout = React.useCallback(async () => {
    try {
      const authApi = getAuthApi();
      await authApi.logout();
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error;
      }
    } finally {
      clearSession();
    }
  }, [clearSession, getAuthApi]);

  const value = React.useMemo(
    () => ({
      user,
      status,
      login,
      register,
      logout,
      refreshSession,
      hasAccessToken,
      createChildrenApi,
    }),
    [
      user,
      status,
      login,
      register,
      logout,
      refreshSession,
      hasAccessToken,
      createChildrenApi,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
