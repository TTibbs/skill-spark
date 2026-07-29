import * as React from "react";
import type { ChildStats } from "@skill-spark/contracts";
import { useMobileApi } from "@/api/use-mobile-api";
import { useChildren } from "@/children/use-children";

export function useInsightsData() {
  const { selectedChild } = useChildren();
  const { api, withRefresh } = useMobileApi();
  const [stats, setStats] = React.useState<ChildStats | null>(null);
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);
  const requestIdRef = React.useRef(0);

  const load = React.useCallback(async () => {
    if (!selectedChild) {
      requestIdRef.current += 1;
      setStats(null);
      setStatus("idle");
      setError(null);
      return;
    }

    const childId = selectedChild.id;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStats(null);
    setStatus("loading");
    setError(null);

    try {
      const response = await withRefresh(() => api.stats.aggregate(childId));
      if (requestIdRef.current !== requestId) return;
      setStats(response.childStats);
      setStatus("ready");
    } catch {
      if (requestIdRef.current !== requestId) return;
      setStats(null);
      setError("Insights could not be loaded.");
      setStatus("error");
    }
  }, [api.stats, selectedChild, withRefresh]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { stats, status, error, reload: load };
}
