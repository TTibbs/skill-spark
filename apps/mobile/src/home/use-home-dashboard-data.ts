import * as React from "react";
import { useMobileApi } from "@/api/use-mobile-api";
import { useChildren } from "@/children/use-children";
import type { HomeDashboardData } from "./home-model";

export function useHomeDashboardData() {
  const { selectedChild } = useChildren();
  const { api, withRefresh } = useMobileApi();
  const [data, setData] = React.useState<HomeDashboardData>({
    stats: null,
    chores: [],
    rewards: [],
    redemptions: [],
  });
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);
  const requestIdRef = React.useRef(0);

  const load = React.useCallback(async () => {
    if (!selectedChild) {
      requestIdRef.current += 1;
      setData({ stats: null, chores: [], rewards: [], redemptions: [] });
      setStatus("idle");
      setError(null);
      return;
    }

    const childId = selectedChild.id;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus("loading");
    setError(null);

    try {
      const [statsResponse, choreResponse, rewardResponse, redemptionResponse] =
        await withRefresh(() =>
          Promise.all([
            api.stats.aggregate(childId),
            api.chores.listForChild(childId),
            api.rewards.list(),
            api.rewards.listRedemptions(childId),
          ])
        );

      if (requestIdRef.current !== requestId) return;

      setData({
        stats: statsResponse.childStats,
        chores: choreResponse.assignments,
        rewards: rewardResponse.rewards,
        redemptions: redemptionResponse.redemptions,
      });
      setStatus("ready");
    } catch {
      if (requestIdRef.current !== requestId) return;
      setError("Dashboard data could not be loaded.");
      setStatus("error");
    }
  }, [api.chores, api.rewards, api.stats, selectedChild, withRefresh]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { data, status, error, reload: load };
}
