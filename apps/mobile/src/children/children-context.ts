import { createContext } from "react";
import type { ChildProfile } from "@skill-spark/contracts";

export type ChildrenContextValue = {
  children: ChildProfile[];
  selectedChild: ChildProfile | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  reload(): Promise<void>;
  selectChild(childId: number): Promise<void>;
};

export const ChildrenContext = createContext<ChildrenContextValue | null>(null);
