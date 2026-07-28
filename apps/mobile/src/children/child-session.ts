import type { ChildrenApi } from "@skill-spark/api-client";
import type { ChildProfile } from "@skill-spark/contracts";
import type { SelectedChildStorage } from "@/storage/session-storage";
import { selectInitialChild } from "./selection";

export type LoadedChildrenState = {
  children: ChildProfile[];
  selectedChild: ChildProfile | null;
};

export async function loadOwnedChildren({
  userId,
  childrenApi,
  storage,
}: {
  userId: number;
  childrenApi: Pick<ChildrenApi, "listForUser">;
  storage: SelectedChildStorage;
}): Promise<LoadedChildrenState> {
  const response = await childrenApi.listForUser(userId);
  const storedChildId = await storage.getSelectedChildId();
  const selectedChild = selectInitialChild(response.children, storedChildId);

  if (selectedChild) {
    await storage.setSelectedChildId(selectedChild.id);
  } else {
    await storage.clearSelectedChildId();
  }

  return {
    children: response.children,
    selectedChild,
  };
}

export async function selectOwnedChild({
  children,
  childId,
  storage,
}: {
  children: ChildProfile[];
  childId: number;
  storage: SelectedChildStorage;
}) {
  const selectedChild = children.find((child) => child.id === childId);
  const nextChild = selectedChild ?? selectInitialChild(children, null);

  if (nextChild) {
    await storage.setSelectedChildId(nextChild.id);
  } else {
    await storage.clearSelectedChildId();
  }

  return nextChild;
}
