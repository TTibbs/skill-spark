import * as React from "react";
import type { ChildProfile } from "@skill-spark/contracts";
import { ApiError } from "@skill-spark/api-client";
import { createMobileApi } from "@/api/client";
import { useAuth } from "@/auth/use-auth";
import { selectedChildStorage } from "@/storage/session-storage";
import { loadOwnedChildren, selectOwnedChild } from "./child-session";
import { ChildrenContext } from "./children-context";

export function ChildrenProvider({ children }: { children: React.ReactNode }) {
  const { user, status: authStatus, accessToken, refreshSession } = useAuth();
  const [ownedChildren, setOwnedChildren] = React.useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = React.useState<ChildProfile | null>(
    null
  );
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);
  const accessTokenRef = React.useRef(accessToken);

  React.useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const api = React.useMemo(
    () => createMobileApi(() => accessTokenRef.current),
    []
  );

  const loadChildren = React.useCallback(async () => {
    if (!user || authStatus !== "authenticated") {
      setOwnedChildren([]);
      setSelectedChild(null);
      setStatus("idle");
      await selectedChildStorage.clearSelectedChildId();
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const nextState = await loadOwnedChildren({
        userId: user.id,
        childrenApi: api.children,
        storage: selectedChildStorage,
      });
      setOwnedChildren(nextState.children);
      setSelectedChild(nextState.selectedChild);
      setStatus("ready");
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed) {
          const nextState = await loadOwnedChildren({
            userId: user.id,
            childrenApi: api.children,
            storage: selectedChildStorage,
          });
          setOwnedChildren(nextState.children);
          setSelectedChild(nextState.selectedChild);
          setStatus("ready");
          return;
        }
      }

      setError("Child profiles could not be loaded.");
      setStatus("error");
    }
  }, [api.children, authStatus, refreshSession, user]);

  React.useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  const selectChild = React.useCallback(
    async (childId: number) => {
      const nextChild = await selectOwnedChild({
        children: ownedChildren,
        childId,
        storage: selectedChildStorage,
      });
      setSelectedChild(nextChild);
    },
    [ownedChildren]
  );

  const value = React.useMemo(
    () => ({
      children: ownedChildren,
      selectedChild,
      status,
      error,
      reload: loadChildren,
      selectChild,
    }),
    [error, loadChildren, ownedChildren, selectChild, selectedChild, status]
  );

  return (
    <ChildrenContext.Provider value={value}>
      {children}
    </ChildrenContext.Provider>
  );
}
