import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ParentsPage from "./page";
import { useAuth } from "@/features/auth/use-auth";
import { useChildChores } from "@/features/children/hooks/use-child-chores";
import { useChildren } from "@/features/children/hooks/use-children";
import { useChildStats } from "@/features/children/hooks/use-child-stats";
import { useFamilyRewards } from "@/features/children/hooks/use-family-rewards";
import { useRewardRedemptions } from "@/features/children/hooks/use-reward-redemptions";

const replace = vi.fn();
const retryChildren = vi.fn();
const retryStats = vi.fn();
const retryChores = vi.fn();
const retryRewards = vi.fn();
const retryRedemptions = vi.fn();
const createChildrenApi = vi.fn();
const createChild = vi.fn();
const updateChild = vi.fn();
const archiveChild = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/features/auth/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/features/children/hooks/use-children", () => ({
  useChildren: vi.fn(),
}));

vi.mock("@/features/children/hooks/use-child-chores", () => ({
  useChildChores: vi.fn(),
}));

vi.mock("@/features/children/hooks/use-child-stats", () => ({
  useChildStats: vi.fn(),
}));

vi.mock("@/features/children/hooks/use-family-rewards", () => ({
  useFamilyRewards: vi.fn(),
}));

vi.mock("@/features/children/hooks/use-reward-redemptions", () => ({
  useRewardRedemptions: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseChildChores = vi.mocked(useChildChores);
const mockedUseChildren = vi.mocked(useChildren);
const mockedUseChildStats = vi.mocked(useChildStats);
const mockedUseFamilyRewards = vi.mocked(useFamilyRewards);
const mockedUseRewardRedemptions = vi.mocked(useRewardRedemptions);

const children = [
  {
    id: 1,
    user_id: 1,
    name: "Emma",
    age: 5,
    xp: 150,
    level: 2,
    reward_points: 100,
    last_played: "2026-07-27T12:00:00.000Z",
    created_at: "2026-07-01T12:00:00.000Z",
    updated_at: "2026-07-27T12:00:00.000Z",
  },
  {
    id: 2,
    user_id: 1,
    name: "Liam",
    age: 3,
    xp: 75,
    level: 1,
    reward_points: 0,
    last_played: null,
    created_at: "2026-07-01T12:00:00.000Z",
    updated_at: "2026-07-27T12:00:00.000Z",
  },
];

const statsFor = (childId: number) => ({
  choreStats: {
    child_id: childId,
    stats: {
      total_completed: 0,
      total_xp_earned: 0,
      daily_completed: 0,
      weekly_completed: 0,
      monthly_completed: 0,
      streak_days: 0,
      longest_streak: 0,
    },
  },
  mathStats: {
    child_id: childId,
    stats: {
      totalGames: childId === 1 ? 3 : 0,
      totalProblems: childId === 1 ? 10 : 0,
      correctAnswers: childId === 1 ? 8 : 0,
      incorrectAnswers: childId === 1 ? 2 : 0,
      overallAccuracy: childId === 1 ? 80 : 0,
      addition: { correct: 8, incorrect: 2, accuracy: 80 },
      subtraction: { correct: 0, incorrect: 0, accuracy: 0 },
      multiplication: { correct: 0, incorrect: 0, accuracy: 0 },
      division: { correct: 0, incorrect: 0, accuracy: 0 },
      counting: { correct: 0, incorrect: 0, accuracy: 0 },
    },
  },
  spellingStats: {
    child_id: childId,
    learned_words: [],
    stats: {
      totalGames: childId === 1 ? 2 : 0,
      total_learned_words: childId === 1 ? 4 : 0,
      total_hints_used: 1,
      total_correct_guesses: childId === 1 ? 6 : 0,
      total_incorrect_guesses: childId === 1 ? 1 : 0,
      accuracy: childId === 1 ? 86 : 0,
    },
  },
  memoryStats: {
    child_id: childId,
    stats: {
      totalGames: childId === 1 ? 1 : 0,
      totalMoves: childId === 1 ? 12 : 0,
      totalTimeSecs: childId === 1 ? 45 : 0,
      bestTimeSecs: childId === 1 ? 45 : null,
      fewestMoves: childId === 1 ? 12 : null,
      picture: {
        gamesPlayed: childId === 1 ? 1 : 0,
        totalMoves: childId === 1 ? 12 : 0,
        totalTimeSecs: childId === 1 ? 45 : 0,
        bestTimeSecs: childId === 1 ? 45 : null,
        fewestMoves: childId === 1 ? 12 : null,
      },
      sound: {
        gamesPlayed: 0,
        totalMoves: 0,
        totalTimeSecs: 0,
        bestTimeSecs: null,
        fewestMoves: null,
      },
    },
  },
  shapeStats: {
    child_id: childId,
    stats: {
      totalGames: childId === 1 ? 1 : 0,
      totalShapes: childId === 1 ? 5 : 0,
      totalCorrectShapes: childId === 1 ? 5 : 0,
      totalIncorrectShapes: 0,
      overallAccuracy: childId === 1 ? 100 : 0,
      totalTimeSecs: childId === 1 ? 30 : 0,
      bestTimeSecs: childId === 1 ? 30 : 0,
    },
  },
});

beforeEach(() => {
  window.localStorage.clear();
  replace.mockReset();
  retryChildren.mockReset();
  retryStats.mockReset();
  retryChores.mockReset();
  retryRewards.mockReset();
  retryRedemptions.mockReset();
  createChild.mockReset().mockResolvedValue({ newChildProfile: children[1] });
  updateChild.mockReset().mockResolvedValue({ updatedChildProfile: children[0] });
  archiveChild.mockReset().mockResolvedValue(undefined);
  createChildrenApi.mockReset();
  createChildrenApi.mockReturnValue({
    children: {
      create: createChild,
      update: updateChild,
      archive: archiveChild,
    },
    chores: {
      approve: vi.fn().mockResolvedValue({}),
      reject: vi.fn().mockResolvedValue({}),
    },
    rewards: {
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      approve: vi.fn().mockResolvedValue({}),
      reject: vi.fn().mockResolvedValue({}),
    },
  });
  mockedUseAuth.mockReturnValue({
    user: {
      id: 1,
      username: "parent",
      display_name: "Parent",
      email: "parent@example.test",
      profile_image_url: null,
      is_parent: true,
      total_children: 2,
      timezone: "Europe/London",
      user_preferences: {
        notificationsEnabled: true,
        theme: "system",
        language: "en",
        has_pin: false,
      },
      created_at: "2026-07-01T12:00:00.000Z",
      updated_at: "2026-07-27T12:00:00.000Z",
    },
    status: "authenticated",
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn().mockResolvedValue(true),
    hasAccessToken: vi.fn().mockReturnValue(true),
    createChildrenApi,
  });
  mockedUseChildren.mockReturnValue({
    children,
    isLoading: false,
    error: null,
    retry: retryChildren,
  });
  mockedUseChildChores.mockReturnValue({
    assignments: [],
    isLoading: false,
    error: null,
    retry: retryChores,
  });
  mockedUseFamilyRewards.mockReturnValue({
    rewards: [],
    isLoading: false,
    error: null,
    retry: retryRewards,
  });
  mockedUseRewardRedemptions.mockReturnValue({
    redemptions: [],
    isLoading: false,
    error: null,
    retry: retryRedemptions,
  });
  mockedUseChildStats.mockImplementation((childId) => ({
    stats: childId === null ? null : statsFor(childId),
    isLoading: false,
    error: null,
    retry: retryStats,
  }));
});

afterEach(() => {
  cleanup();
});

describe("ParentsPage data integration", () => {
  test("loads real children and does not show mock child names", async () => {
    render(<ParentsPage />);

    expect(await screen.findByText("Emma's progress")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.queryByText("Alex's progress")).not.toBeInTheDocument();
    expect(screen.queryByText("Mia")).not.toBeInTheDocument();
  });

  test("switches child profiles and requests stats for the selected child", async () => {
    render(<ParentsPage />);

    await userEvent.click(screen.getByRole("button", { name: /liam/i }));

    await waitFor(() => {
      expect(screen.getByText("Liam's progress")).toBeInTheDocument();
    });
    expect(mockedUseChildStats).toHaveBeenLastCalledWith(2);
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });

  test("rejects stale stored child selection", async () => {
    window.localStorage.setItem("skill-spark:selected-child-id", "999");

    render(<ParentsPage />);

    expect(await screen.findByText("Emma's progress")).toBeInTheDocument();
  });

  test("shows a no-child empty state", async () => {
    mockedUseChildren.mockReturnValue({
      children: [],
      isLoading: false,
      error: null,
      retry: retryChildren,
    });

    render(<ParentsPage />);

    expect(await screen.findByText("No child profiles yet")).toBeInTheDocument();
  });

  test("shows a child-list error and retries", async () => {
    mockedUseChildren.mockReturnValue({
      children: [],
      isLoading: false,
      error: "Could not load child profiles",
      retry: retryChildren,
    });

    render(<ParentsPage />);

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(retryChildren).toHaveBeenCalledOnce();
  });

  test("shows a stats error and retry action", async () => {
    mockedUseChildStats.mockReturnValue({
      stats: null,
      isLoading: false,
      error: "Could not load learning statistics",
      retry: retryStats,
    });

    render(<ParentsPage />);

    await userEvent.click(await screen.findByRole("button", { name: /try again/i }));
    expect(retryStats).toHaveBeenCalledOnce();
  });

  test("creates a child and selects it after save", async () => {
    render(<ParentsPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Add child" }));
    await userEvent.type(screen.getByLabelText("Name"), "Avery");
    await userEvent.clear(screen.getByLabelText("Age"));
    await userEvent.type(screen.getByLabelText("Age"), "6");
    await userEvent.click(
      screen.getAllByRole("button", { name: "Add child" }).at(-1) as HTMLElement
    );

    await waitFor(() => {
      expect(createChild).toHaveBeenCalledWith({ name: "Avery", age: 6 });
    });
    expect(window.localStorage.getItem("skill-spark:selected-child-id")).toBe(
      "2"
    );
    expect(retryChildren).toHaveBeenCalled();
  });

  test("edits and archives the selected child", async () => {
    render(<ParentsPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Edit" }));
    await userEvent.clear(screen.getByLabelText("Name"));
    await userEvent.type(screen.getByLabelText("Name"), "Emma Updated");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateChild).toHaveBeenCalledWith(1, {
        name: "Emma Updated",
        age: 5,
      });
    });

    await userEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(
      await screen.findByRole("dialog", { name: /archive emma/i })
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Archive child" }));
    await waitFor(() => {
      expect(archiveChild).toHaveBeenCalledWith(1);
    });
    expect(retryChildren).toHaveBeenCalled();
  });
});
