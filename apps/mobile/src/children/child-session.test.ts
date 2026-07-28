import { describe, expect, test, vi } from "vitest";
import type { ChildrenApi } from "@skill-spark/api-client";
import type { ChildProfile } from "@skill-spark/contracts";
import type { SelectedChildStorage } from "@/storage/session-storage";
import { loadOwnedChildren, selectOwnedChild } from "./child-session";

function child(id: number, name: string): ChildProfile {
  return {
    id,
    user_id: 1,
    name,
    age: 6,
    xp: id * 10,
    level: id,
    reward_points: id * 3,
    last_played: null,
    created_at: "2026-07-28T00:00:00.000Z",
    updated_at: "2026-07-28T00:00:00.000Z",
  };
}

function createSelectedChildStorage(storedChildId: number | null) {
  let selectedChildId = storedChildId;
  const storage: SelectedChildStorage = {
    getSelectedChildId: vi.fn(async () => selectedChildId),
    setSelectedChildId: vi.fn(async (childId: number) => {
      selectedChildId = childId;
    }),
    clearSelectedChildId: vi.fn(async () => {
      selectedChildId = null;
    }),
  };
  return storage;
}

describe("child session helpers", () => {
  test("loads children and restores a valid selected child", async () => {
    const children = [child(1, "Avery"), child(2, "Riley")];
    const storage = createSelectedChildStorage(2);
    const childrenApi = {
      listForUser: vi.fn(async () => ({ children })),
    } as Pick<ChildrenApi, "listForUser">;

    const state = await loadOwnedChildren({
      userId: 1,
      childrenApi,
      storage,
    });

    expect(childrenApi.listForUser).toHaveBeenCalledWith(1);
    expect(state.selectedChild?.id).toBe(2);
    expect(storage.setSelectedChildId).toHaveBeenCalledWith(2);
  });

  test("falls back to the first child when stored selection is stale", async () => {
    const children = [child(1, "Avery"), child(2, "Riley")];
    const storage = createSelectedChildStorage(99);
    const childrenApi = {
      listForUser: vi.fn(async () => ({ children })),
    } as Pick<ChildrenApi, "listForUser">;

    const state = await loadOwnedChildren({
      userId: 1,
      childrenApi,
      storage,
    });

    expect(state.selectedChild?.id).toBe(1);
    expect(storage.setSelectedChildId).toHaveBeenCalledWith(1);
  });

  test("clears stored selection when there are no children", async () => {
    const storage = createSelectedChildStorage(1);
    const childrenApi = {
      listForUser: vi.fn(async () => ({ children: [] })),
    } as Pick<ChildrenApi, "listForUser">;

    const state = await loadOwnedChildren({
      userId: 1,
      childrenApi,
      storage,
    });

    expect(state.selectedChild).toBeNull();
    expect(storage.clearSelectedChildId).toHaveBeenCalledTimes(1);
  });

  test("switches to an owned child and persists the ID", async () => {
    const children = [child(1, "Avery"), child(2, "Riley")];
    const storage = createSelectedChildStorage(1);

    const selectedChild = await selectOwnedChild({
      children,
      childId: 2,
      storage,
    });

    expect(selectedChild?.id).toBe(2);
    expect(storage.setSelectedChildId).toHaveBeenCalledWith(2);
  });
});
