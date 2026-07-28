import { describe, expect, it } from "vitest";
import type { ChoreAssignment, ChoreStatus } from "@skill-spark/contracts";
import {
  canSubmitChore,
  choreStatusLabel,
  groupChores,
  replaceChoreAssignment,
} from "./chore-state";

describe("chore-state", () => {
  it("groups chore loading results by lifecycle status", () => {
    const assignments = [
      choreAssignment({ id: 1, status: "assigned" }),
      choreAssignment({ id: 2, status: "submitted" }),
      choreAssignment({ id: 3, status: "approved" }),
      choreAssignment({ id: 4, status: "rejected" }),
    ];

    const grouped = groupChores(assignments);

    expect(grouped.assigned).toHaveLength(1);
    expect(grouped.submitted).toHaveLength(1);
    expect(grouped.approved).toHaveLength(1);
    expect(grouped.rejected).toHaveLength(1);
  });

  it("allows submitting assigned and rejected chores only", () => {
    expect(canSubmitChore(choreAssignment({ status: "assigned" }))).toBe(true);
    expect(canSubmitChore(choreAssignment({ status: "rejected" }))).toBe(true);
    expect(canSubmitChore(choreAssignment({ status: "submitted" }))).toBe(false);
    expect(canSubmitChore(choreAssignment({ status: "approved" }))).toBe(false);
  });

  it("replaces an assignment after successful submit", () => {
    const original = [
      choreAssignment({ id: 1, status: "assigned" }),
      choreAssignment({ id: 2, status: "assigned" }),
    ];
    const submitted = choreAssignment({ id: 1, status: "submitted" });

    expect(replaceChoreAssignment(original, submitted)).toEqual([
      submitted,
      original[1],
    ]);
  });

  it("uses child-facing chore status labels", () => {
    expect(choreStatusLabel("assigned")).toBe("Ready to do");
    expect(choreStatusLabel("submitted")).toBe("Waiting for grown-up");
    expect(choreStatusLabel("approved")).toBe("Approved");
    expect(choreStatusLabel("rejected")).toBe("Try again");
  });
});

function choreAssignment(
  overrides: Partial<ChoreAssignment> & { status?: ChoreStatus } = {}
): ChoreAssignment {
  const status = overrides.status ?? "assigned";
  return {
    id: overrides.id ?? 1,
    chore_id: 10,
    child_id: 20,
    status,
    assigned_at: "2026-01-01T00:00:00.000Z",
    submitted_at: status === "submitted" ? "2026-01-01T01:00:00.000Z" : null,
    reviewed_at: status === "approved" || status === "rejected" ? "2026-01-01T02:00:00.000Z" : null,
    reviewed_by: status === "approved" || status === "rejected" ? 1 : null,
    rejection_reason: status === "rejected" ? "Try once more" : null,
    assigned_xp_reward: 15,
    assigned_reward_points: 3,
    awarded_xp: status === "approved" ? 15 : 0,
    awarded_reward_points: status === "approved" ? 3 : 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    chore: {
      id: 10,
      title: "Water plants",
      description: "Give the plants a drink",
      category: "home",
      xp: 15,
      reward_points: 3,
      user_id: 1,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    ...overrides,
  };
}
