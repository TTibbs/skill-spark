"use client";

import * as React from "react";
import type { ChoreAssignment } from "@skill-spark/contracts";
import { useAuth } from "@/features/auth/use-auth";

type ChoreState = {
  assignments: ChoreAssignment[];
  isLoading: boolean;
  error: string | null;
};

export function useChildChores(childId: number | null) {
  const { status, refreshSession, hasAccessToken, createChildrenApi } =
    useAuth();
  const [reloadKey, setReloadKey] = React.useState(0);
  const [state, setState] = React.useState<ChoreState>({
    assignments: [],
    isLoading: false,
    error: null,
  });

  const api = React.useMemo(() => createChildrenApi(), [createChildrenApi]);

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

        const response = await api.chores.listForChild(
          childId,
          controller.signal
        );

        if (!cancelled) {
          setState({
            assignments: response.assignments,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled && !controller.signal.aborted) {
          setState({
            assignments: [],
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not load chores",
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [api.chores, childId, hasAccessToken, refreshSession, reloadKey, status]);

  if (status !== "authenticated" || childId === null) {
    return {
      assignments: [],
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
