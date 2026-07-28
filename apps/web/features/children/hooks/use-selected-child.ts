"use client";

import * as React from "react";
import type { ChildProfile } from "@skill-spark/contracts";

const STORAGE_KEY = "skill-spark:selected-child-id";

export function useSelectedChild(children: ChildProfile[]) {
  const [candidateChildId, setCandidateChildId] = React.useState<number | null>(
    () => {
      if (typeof window === "undefined") return null;
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? Number(stored) : NaN;
      return Number.isInteger(parsed) ? parsed : null;
    }
  );

  const selectedChildId = React.useMemo(() => {
    if (children.length === 0) return null;
    const stillValid = children.some((child) => child.id === candidateChildId);
    return stillValid ? candidateChildId : children[0].id;
  }, [candidateChildId, children]);

  React.useEffect(() => {
    if (selectedChildId !== null) {
      window.localStorage.setItem(STORAGE_KEY, String(selectedChildId));
    }
  }, [selectedChildId]);

  const selectChild = React.useCallback((childId: number) => {
    setCandidateChildId(childId);
    window.localStorage.setItem(STORAGE_KEY, String(childId));
  }, []);

  const selectedChild =
    children.find((child) => child.id === selectedChildId) ?? null;

  return {
    selectedChild,
    selectedChildId,
    selectChild,
  };
}
