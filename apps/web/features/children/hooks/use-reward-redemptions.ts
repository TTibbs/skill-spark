"use client";

import * as React from "react";
import type { RewardRedemption } from "@skill-spark/contracts";
import { useAuth } from "@/features/auth/use-auth";

export function useRewardRedemptions(childId: number | null) {
  const { status, refreshSession, hasAccessToken, createChildrenApi } =
    useAuth();
  const [reloadKey, setReloadKey] = React.useState(0);
  const [state, setState] = React.useState({
    redemptions: [] as RewardRedemption[],
    isLoading: false,
    error: null as string | null,
  });

  const api = React.useMemo(() => createChildrenApi(), [createChildrenApi]);

  React.useEffect(() => {
    if (status !== "authenticated" || childId === null) return;

    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setState((current) => ({ ...current, isLoading: true, error: null }));
      try {
        if (!hasAccessToken()) {
          const refreshed = await refreshSession();
          if (!refreshed || cancelled) return;
        }
        const response = await api.rewards.listRedemptions(
          childId,
          controller.signal
        );
        if (!cancelled) {
          if (!Array.isArray(response.redemptions)) {
            throw new Error("Reward request response was not valid.");
          }
          setState({
            redemptions: response.redemptions,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled && !controller.signal.aborted) {
          setState({
            redemptions: [],
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not load reward requests",
          });
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [api.rewards, childId, hasAccessToken, refreshSession, reloadKey, status]);

  if (status !== "authenticated" || childId === null) {
    return {
      redemptions: [],
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
