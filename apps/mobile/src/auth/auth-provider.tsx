import * as React from "react";
import type { LoginInput } from "@skill-spark/contracts";
import { AuthContext } from "./auth-context";
import { MobileSessionManager } from "./mobile-session";
import { createMobileApi } from "@/api/client";
import { secureRefreshTokenStorage } from "@/storage/session-storage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const managerRef = React.useRef<MobileSessionManager | null>(null);
  const [status, setStatus] = React.useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");
  const [user, setUser] = React.useState(
    managerRef.current?.getState().user ?? null
  );
  const [accessToken, setAccessToken] = React.useState<string | null>(null);

  if (!managerRef.current) {
    const api = createMobileApi(() => managerRef.current?.getAccessToken() ?? null);
    managerRef.current = new MobileSessionManager(
      api.auth,
      secureRefreshTokenStorage
    );
  }

  const syncState = React.useCallback(() => {
    const state = managerRef.current?.getState();
    setUser(state?.user ?? null);
    setAccessToken(state?.accessToken ?? null);
    setStatus(state?.user ? "authenticated" : "unauthenticated");
  }, []);

  React.useEffect(() => {
    let mounted = true;
    void managerRef.current
      ?.restore()
      .then(() => {
        if (mounted) syncState();
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
          setAccessToken(null);
          setStatus("unauthenticated");
        }
      });

    return () => {
      mounted = false;
    };
  }, [syncState]);

  const login = React.useCallback(
    async (input: LoginInput) => {
      setStatus("loading");
      await managerRef.current?.login(input);
      syncState();
    },
    [syncState]
  );

  const logout = React.useCallback(async () => {
    await managerRef.current?.logout();
    syncState();
  }, [syncState]);

  const refreshSession = React.useCallback(async () => {
    try {
      await managerRef.current?.refreshSession();
      syncState();
      return true;
    } catch {
      await managerRef.current?.clear();
      syncState();
      return false;
    }
  }, [syncState]);

  const value = React.useMemo(
    () => ({
      user,
      status,
      accessToken,
      login,
      logout,
      refreshSession,
    }),
    [accessToken, login, logout, refreshSession, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
