"use client";

import * as React from "react";
import type { ChildStats } from "@skill-spark/contracts";
import { useAuth } from "@/features/auth/use-auth";
import { GAME_RESULT_SAVED_EVENT } from "@/features/game-results/events";

type StatsState = {
  stats: ChildStats | null;
  isLoading: boolean;
  error: string | null;
};

export function useChildStats(childId: number | null) {
  const { status, refreshSession, hasAccessToken } = useAuth();
  const { createChildrenApi } = useAuth();
  const [reloadKey, setReloadKey] = React.useState(0);
  const [state, setState] = React.useState<StatsState>({
    stats: null,
    isLoading: false,
    error: null,
  });

  const api = React.useMemo(() => createChildrenApi(), [createChildrenApi]);

  React.useEffect(() => {
    const reload = (event: Event) => {
      const customEvent = event as CustomEvent<{ childId: number }>;
      if (customEvent.detail?.childId === childId) {
        setReloadKey((key) => key + 1);
      }
    };
    window.addEventListener(GAME_RESULT_SAVED_EVENT, reload);
    return () => window.removeEventListener(GAME_RESULT_SAVED_EVENT, reload);
  }, [childId]);

  React.useEffect(() => {
    if (status !== "authenticated" || childId === null) {
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

        const response = await api.stats.aggregate(childId, controller.signal);

        if (!cancelled) {
          setState({
            stats: response.childStats,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled && !controller.signal.aborted) {
          setState({
            stats: null,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not load learning statistics",
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [api.stats, childId, hasAccessToken, refreshSession, reloadKey, status]);

  if (status !== "authenticated" || childId === null) {
    return {
      stats: null,
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
