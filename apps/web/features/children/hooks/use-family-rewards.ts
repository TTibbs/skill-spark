"use client";

import * as React from "react";
import type { FamilyReward } from "@skill-spark/contracts";
import { useAuth } from "@/features/auth/use-auth";

export function useFamilyRewards() {
  const { status, refreshSession, hasAccessToken, createChildrenApi } =
    useAuth();
  const [reloadKey, setReloadKey] = React.useState(0);
  const [state, setState] = React.useState({
    rewards: [] as FamilyReward[],
    isLoading: false,
    error: null as string | null,
  });

  const api = React.useMemo(() => createChildrenApi(), [createChildrenApi]);

  React.useEffect(() => {
    if (status !== "authenticated") return;

    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setState((current) => ({ ...current, isLoading: true, error: null }));
      try {
        if (!hasAccessToken()) {
          const refreshed = await refreshSession();
          if (!refreshed || cancelled) return;
        }
        const response = await api.rewards.list(controller.signal);
        if (!cancelled) {
          if (!Array.isArray(response.rewards)) {
            throw new Error("Reward response was not valid.");
          }
          setState({ rewards: response.rewards, isLoading: false, error: null });
        }
      } catch (error) {
        if (!cancelled && !controller.signal.aborted) {
          setState({
            rewards: [],
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Could not load rewards",
          });
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [api.rewards, hasAccessToken, refreshSession, reloadKey, status]);

  if (status !== "authenticated") {
    return {
      rewards: [],
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
