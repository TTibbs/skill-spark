import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import RewardsPage from "./page";
import { useAuth } from "@/features/auth/use-auth";
import { useChildren } from "@/features/children/hooks/use-children";
import { useFamilyRewards } from "@/features/children/hooks/use-family-rewards";
import { useRewardRedemptions } from "@/features/children/hooks/use-reward-redemptions";
import { useSelectedChild } from "@/features/children/hooks/use-selected-child";
import type { BrowserChildrenApi } from "@/features/children/api";

const replace = vi.fn();
const retryChildren = vi.fn();
const retryRewards = vi.fn();
const retryRedemptions = vi.fn();
const requestReward = vi.fn();
const cancelReward = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/features/auth/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/features/children/hooks/use-children", () => ({
  useChildren: vi.fn(),
}));

vi.mock("@/features/children/hooks/use-family-rewards", () => ({
  useFamilyRewards: vi.fn(),
}));

vi.mock("@/features/children/hooks/use-reward-redemptions", () => ({
  useRewardRedemptions: vi.fn(),
}));

vi.mock("@/features/children/hooks/use-selected-child", () => ({
  useSelectedChild: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseChildren = vi.mocked(useChildren);
const mockedUseFamilyRewards = vi.mocked(useFamilyRewards);
const mockedUseRewardRedemptions = vi.mocked(useRewardRedemptions);
const mockedUseSelectedChild = vi.mocked(useSelectedChild);

const child = {
  id: 1,
  user_id: 1,
  name: "Avery",
  age: 6,
  xp: 120,
  level: 2,
  reward_points: 25,
  last_played: "2026-07-28T00:00:00.000Z",
  created_at: "2026-07-01T00:00:00.000Z",
  updated_at: "2026-07-28T00:00:00.000Z",
};

beforeEach(() => {
  replace.mockReset();
  retryChildren.mockReset();
  retryRewards.mockReset();
  retryRedemptions.mockReset();
  requestReward.mockReset().mockResolvedValue({});
  cancelReward.mockReset().mockResolvedValue({});

  mockedUseAuth.mockReturnValue({
    user: null,
    status: "authenticated",
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn().mockResolvedValue(true),
    hasAccessToken: vi.fn().mockReturnValue(true),
    createChildrenApi: () =>
      ({
        children: {
          listForUser: vi.fn(),
          getForUser: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          archive: vi.fn(),
        },
        chores: {
          listForChild: vi.fn(),
          assign: vi.fn(),
          remove: vi.fn(),
          submit: vi.fn(),
          approve: vi.fn(),
          reject: vi.fn(),
        },
        stats: {
          aggregate: vi.fn(),
          math: vi.fn(),
          spelling: vi.fn(),
          memory: vi.fn(),
          shapes: vi.fn(),
        },
        gameResults: {
          submitMath: vi.fn(),
          submitMemory: vi.fn(),
          submitSpelling: vi.fn(),
          submitShapes: vi.fn(),
        },
        rewards: {
          list: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          archive: vi.fn(),
          listRedemptions: vi.fn(),
          request: requestReward,
          approve: vi.fn(),
          reject: vi.fn(),
          cancel: cancelReward,
        },
        words: {
          list: vi.fn(),
        },
      }) satisfies BrowserChildrenApi,
  });
  mockedUseChildren.mockReturnValue({
    children: [child],
    isLoading: false,
    error: null,
    retry: retryChildren,
  });
  mockedUseSelectedChild.mockReturnValue({
    selectedChild: child,
    selectedChildId: child.id,
    selectChild: vi.fn(),
  });
  mockedUseFamilyRewards.mockReturnValue({
    rewards: [
      {
        id: 1,
        user_id: 1,
        title: "Choose movie night",
        description: "Pick the family film.",
        star_cost: 20,
        image_url: null,
        is_active: true,
        archived_at: null,
        created_at: "2026-07-28T00:00:00.000Z",
        updated_at: "2026-07-28T00:00:00.000Z",
      },
      {
        id: 2,
        user_id: 1,
        title: "Theme park trip",
        description: null,
        star_cost: 100,
        image_url: null,
        is_active: true,
        archived_at: null,
        created_at: "2026-07-28T00:00:00.000Z",
        updated_at: "2026-07-28T00:00:00.000Z",
      },
    ],
    isLoading: false,
    error: null,
    retry: retryRewards,
  });
  mockedUseRewardRedemptions.mockReturnValue({
    redemptions: [
      {
        id: 8,
        reward_id: 1,
        child_id: 1,
        user_id: 1,
        status: "requested",
        reward_title: "Choose movie night",
        reward_description: "Pick the family film.",
        star_cost: 20,
        requested_at: "2026-07-28T00:00:00.000Z",
        reviewed_at: null,
        reviewed_by: null,
        cancelled_at: null,
        rejection_reason: null,
        refunded_at: null,
        created_at: "2026-07-28T00:00:00.000Z",
        updated_at: "2026-07-28T00:00:00.000Z",
      },
    ],
    isLoading: false,
    error: null,
    retry: retryRedemptions,
  });
});

afterEach(() => {
  cleanup();
});

describe("RewardsPage", () => {
  test("renders real family rewards and requests an affordable reward", async () => {
    render(<RewardsPage />);

    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getAllByText("Choose movie night").length).toBeGreaterThan(0);
    expect(screen.getByText("Theme park trip")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep earning" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Request reward" }));

    await waitFor(() => {
      expect(requestReward).toHaveBeenCalledWith(1, { rewardId: 1 });
    });
    expect(retryChildren).toHaveBeenCalledOnce();
    expect(retryRewards).toHaveBeenCalledOnce();
    expect(retryRedemptions).toHaveBeenCalledOnce();
  });

  test("cancels a pending redemption request", async () => {
    render(<RewardsPage />);

    await userEvent.click(screen.getByRole("button", { name: "Cancel request" }));

    await waitFor(() => {
      expect(cancelReward).toHaveBeenCalledWith(1, 8);
    });
  });
});
