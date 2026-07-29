import { describe, expect, it } from "vitest";
import type {
  FamilyReward,
  RewardRedemption,
  RewardRedemptionStatus,
} from "@skill-spark/contracts";
import {
  activeRewards,
  addRequestedRedemption,
  canCancelRedemption,
  canRequestReward,
  canRequestRewardNow,
  groupRedemptions,
  hasPendingRedemption,
  replaceRedemption,
  rewardRequestState,
} from "./reward-state";

describe("reward-state", () => {
  it("filters active family rewards", () => {
    const rewards = [
      familyReward({ id: 1, is_active: true, archived_at: null }),
      familyReward({ id: 2, is_active: false, archived_at: null }),
      familyReward({ id: 3, is_active: true, archived_at: "2026-01-01" }),
    ];

    expect(activeRewards(rewards).map((reward) => reward.id)).toEqual([1]);
  });

  it("detects affordable and unaffordable rewards", () => {
    expect(canRequestReward(familyReward({ star_cost: 5 }), 8)).toBe(true);
    expect(canRequestReward(familyReward({ star_cost: 10 }), 8)).toBe(false);
    expect(canRequestReward(familyReward({ is_active: false }), 99)).toBe(false);
  });

  it("detects pending redemptions and blocks duplicate requests", () => {
    const reward = familyReward({ id: 12, star_cost: 5 });
    const pending = redemption({ reward_id: 12, status: "requested" });
    const approved = redemption({ reward_id: 12, status: "approved" });

    expect(hasPendingRedemption(reward, [pending])).toBe(true);
    expect(hasPendingRedemption(reward, [approved])).toBe(false);
    expect(canRequestRewardNow(reward, 10, [pending])).toBe(false);
    expect(canRequestRewardNow(reward, 10, [approved])).toBe(true);
  });

  it("builds request states for affordable, pending and unaffordable rewards", () => {
    const reward = familyReward({ id: 12, star_cost: 8 });

    expect(rewardRequestState(reward, 12, [])).toMatchObject({
      canRequest: true,
      label: "Available",
      actionLabel: "Request reward",
    });
    expect(
      rewardRequestState(reward, 12, [
        redemption({ reward_id: 12, status: "requested" }),
      ])
    ).toMatchObject({
      canRequest: false,
      pending: true,
      actionLabel: "Waiting for grown-up",
    });
    expect(rewardRequestState(reward, 5, [])).toMatchObject({
      canRequest: false,
      label: "3 more stars needed",
      actionLabel: "Need more stars",
    });
  });

  it("groups reward loading results by redemption status", () => {
    const redemptions = [
      redemption({ id: 1, status: "requested" }),
      redemption({ id: 2, status: "approved" }),
      redemption({ id: 3, status: "rejected" }),
      redemption({ id: 4, status: "cancelled" }),
    ];

    const grouped = groupRedemptions(redemptions);

    expect(grouped.requested).toHaveLength(1);
    expect(grouped.approved).toHaveLength(1);
    expect(grouped.rejected).toHaveLength(1);
    expect(grouped.cancelled).toHaveLength(1);
  });

  it("allows cancelling pending requests only", () => {
    expect(canCancelRedemption(redemption({ status: "requested" }))).toBe(true);
    expect(canCancelRedemption(redemption({ status: "approved" }))).toBe(false);
    expect(canCancelRedemption(redemption({ status: "rejected" }))).toBe(false);
    expect(canCancelRedemption(redemption({ status: "cancelled" }))).toBe(false);
  });

  it("prepends new reward requests and replaces cancelled requests", () => {
    const existing = [redemption({ id: 1, status: "approved" })];
    const requested = redemption({ id: 2, status: "requested" });
    const withRequest = addRequestedRedemption(existing, requested);

    expect(withRequest).toEqual([requested, existing[0]]);

    const cancelled = redemption({ id: 2, status: "cancelled" });
    expect(replaceRedemption(withRequest, cancelled)).toEqual([
      cancelled,
      existing[0],
    ]);
  });
});

function familyReward(overrides: Partial<FamilyReward> = {}): FamilyReward {
  return {
    id: overrides.id ?? 1,
    user_id: 1,
    title: "Movie night",
    description: "Pick the family film",
    star_cost: overrides.star_cost ?? 10,
    image_url: null,
    is_active: overrides.is_active ?? true,
    archived_at: overrides.archived_at ?? null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function redemption(
  overrides: Partial<RewardRedemption> & { status?: RewardRedemptionStatus } = {}
): RewardRedemption {
  const status = overrides.status ?? "requested";
  return {
    id: overrides.id ?? 1,
    reward_id: 10,
    child_id: 20,
    user_id: 1,
    status,
    reward_title: "Movie night",
    reward_description: "Pick the family film",
    star_cost: 10,
    requested_at: "2026-01-01T00:00:00.000Z",
    reviewed_at: status === "approved" || status === "rejected" ? "2026-01-01T02:00:00.000Z" : null,
    reviewed_by: status === "approved" || status === "rejected" ? 1 : null,
    cancelled_at: status === "cancelled" ? "2026-01-01T02:00:00.000Z" : null,
    rejection_reason: status === "rejected" ? "Save a few more stars" : null,
    refunded_at: status === "rejected" || status === "cancelled" ? "2026-01-01T02:00:00.000Z" : null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
