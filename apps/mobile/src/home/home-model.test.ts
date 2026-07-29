import { describe, expect, test } from "vitest";
import type {
  ChildProfile,
  ChildStats,
  ChoreAssignment,
  FamilyReward,
  RewardRedemption,
} from "@skill-spark/contracts";
import { buildHomeViewModel } from "./home-model";

const child: ChildProfile = {
  id: 1,
  user_id: 1,
  name: "Alex",
  age: 8,
  xp: 220,
  level: 4,
  reward_points: 18,
  last_played: null,
  created_at: "2026-07-29T00:00:00.000Z",
  updated_at: "2026-07-29T00:00:00.000Z",
};

const stats: ChildStats = {
  choreStats: {
    child_id: 1,
    stats: {
      total_completed: 3,
      total_xp_earned: 45,
      daily_completed: 1,
      weekly_completed: 2,
      monthly_completed: 3,
      streak_days: 5,
      longest_streak: 7,
    },
  },
  mathStats: {
    child_id: 1,
    stats: {
      totalGames: 4,
      totalProblems: 20,
      correctAnswers: 16,
      incorrectAnswers: 4,
      overallAccuracy: 80,
      addition: { correct: 8, incorrect: 1, accuracy: 89 },
      subtraction: { correct: 5, incorrect: 2, accuracy: 71 },
      multiplication: { correct: 3, incorrect: 1, accuracy: 75 },
      division: { correct: 0, incorrect: 0, accuracy: 0 },
      counting: { correct: 0, incorrect: 0, accuracy: 0 },
    },
  },
  spellingStats: {
    child_id: 1,
    stats: {
      totalGames: 2,
      total_learned_words: 7,
      total_hints_used: 0,
      total_correct_guesses: 8,
      total_incorrect_guesses: 2,
      accuracy: 80,
    },
    learned_words: [],
  },
  memoryStats: {
    child_id: 1,
    stats: {
      totalGames: 1,
      totalMoves: 12,
      totalTimeSecs: 44,
      bestTimeSecs: 44,
      fewestMoves: 12,
      picture: {
        gamesPlayed: 1,
        totalMoves: 12,
        totalTimeSecs: 44,
        bestTimeSecs: 44,
        fewestMoves: 12,
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
    child_id: 1,
    stats: {
      totalGames: 0,
      totalShapes: 0,
      totalCorrectShapes: 0,
      totalIncorrectShapes: 0,
      overallAccuracy: 0,
      totalTimeSecs: 0,
      bestTimeSecs: 0,
    },
  },
};

const chore = (status: ChoreAssignment["status"]): ChoreAssignment => ({
  id: status.length,
  chore_id: 1,
  child_id: 1,
  status,
  assigned_at: "2026-07-29T00:00:00.000Z",
  submitted_at: null,
  reviewed_at: null,
  reviewed_by: null,
  rejection_reason: null,
  assigned_xp_reward: 10,
  assigned_reward_points: 2,
  awarded_xp: 0,
  awarded_reward_points: 0,
  created_at: "2026-07-29T00:00:00.000Z",
  updated_at: "2026-07-29T00:00:00.000Z",
  chore: {
    id: 1,
    title: "Tidy toys",
    description: null,
    category: "home",
    xp: 10,
    reward_points: 2,
    user_id: 1,
    created_at: "2026-07-29T00:00:00.000Z",
    updated_at: "2026-07-29T00:00:00.000Z",
  },
});

const reward: FamilyReward = {
  id: 1,
  user_id: 1,
  title: "Choose a film",
  description: null,
  star_cost: 10,
  image_url: null,
  is_active: true,
  archived_at: null,
  created_at: "2026-07-29T00:00:00.000Z",
  updated_at: "2026-07-29T00:00:00.000Z",
};

const redemption: RewardRedemption = {
  id: 1,
  reward_id: 1,
  child_id: 1,
  user_id: 1,
  status: "requested",
  reward_title: "Choose a film",
  reward_description: null,
  star_cost: 10,
  requested_at: "2026-07-29T00:00:00.000Z",
  reviewed_at: null,
  reviewed_by: null,
  cancelled_at: null,
  rejection_reason: null,
  refunded_at: null,
  created_at: "2026-07-29T00:00:00.000Z",
  updated_at: "2026-07-29T00:00:00.000Z",
};

describe("home view model", () => {
  test("maps real child progression, chores, rewards and stats", () => {
    const model = buildHomeViewModel(child, {
      stats,
      chores: [chore("assigned"), chore("submitted"), chore("approved")],
      rewards: [reward],
      redemptions: [redemption],
    });

    expect(model.level).toBe(4);
    expect(model.stars).toBe(18);
    expect(model.streakDays).toBe(5);
    expect(model.chorePreview.map((item) => item.status)).toEqual([
      "assigned",
      "submitted",
    ]);
    expect(model.rewardPreview[0].title).toBe("Choose a film");
    expect(model.pendingRewards[0].status).toBe("requested");
    expect(model.learningCards.map((card) => card.route)).toEqual([
      "/games/maths-meadow",
      "/games/spelling-garden",
      "/games/memory-match",
      "/games/colour-critter-catch",
    ]);
    expect(model.subjectSummaries.find((item) => item.label === "Maths"))
      .toMatchObject({ value: "4 games", percent: 80 });
  });
});
