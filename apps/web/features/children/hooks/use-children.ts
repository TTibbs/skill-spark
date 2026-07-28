"use client";

import * as React from "react";
import type { ChildProfile } from "@skill-spark/contracts";
import { useAuth } from "@/features/auth/use-auth";
import { GAME_RESULT_SAVED_EVENT } from "@/features/game-results/events";

type LoadState = {
  children: ChildProfile[];
  isLoading: boolean;
  error: string | null;
};

export function useChildren() {
  const { user, status, refreshSession, hasAccessToken } = useAuth();
  const { createChildrenApi } = useAuth();
  const [reloadKey, setReloadKey] = React.useState(0);
  const [state, setState] = React.useState<LoadState>({
    children: [],
    isLoading: false,
    error: null,
  });

  const api = React.useMemo(() => createChildrenApi(), [createChildrenApi]);

  React.useEffect(() => {
    const reload = () => setReloadKey((key) => key + 1);
    window.addEventListener(GAME_RESULT_SAVED_EVENT, reload);
    return () => window.removeEventListener(GAME_RESULT_SAVED_EVENT, reload);
  }, []);

  React.useEffect(() => {
    if (status !== "authenticated" || !user) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        if (!hasAccessToken()) {
          const refreshed = await refreshSession();
          if (!refreshed || cancelled) return;
        }

        const response = await api.children.listForUser(
          user.id,
          controller.signal
        );

        if (!cancelled) {
          setState({
            children: response.children,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled && !controller.signal.aborted) {
          setState({
            children: [],
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not load child profiles",
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [api.children, hasAccessToken, refreshSession, reloadKey, status, user]);

  if (status !== "authenticated" || !user) {
    return {
      children: [],
      isLoading: false,
      error: null,
      retry: () => setReloadKey((key) => key + 1),
    };
  }

  return {
    ...state,
    retry: () => setReloadKey((key) => key + 1),
  };
}
