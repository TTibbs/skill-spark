import { describe, expect, test } from "vitest";
import type { ChildProfile, ChildStats } from "@skill-spark/contracts";
import {
  buildInsightsViewModel,
  clampPercent,
  formatLearningTime,
} from "./insights-model";

const child: ChildProfile = {
  id: 7,
  user_id: 1,
  name: "Emma",
  age: 5,
  xp: 840,
  level: 8,
  reward_points: 120,
  last_played: null,
  created_at: "2026-07-01T00:00:00.000Z",
  updated_at: "2026-07-01T00:00:00.000Z",
};

const stats: ChildStats = {
  choreStats: {
    child_id: child.id,
    stats: {
      total_completed: 2,
      total_xp_earned: 40,
      daily_completed: 1,
      weekly_completed: 2,
      monthly_completed: 2,
      streak_days: 2,
      longest_streak: 3,
    },
  },
  mathStats: {
    child_id: child.id,
    stats: {
      totalGames: 3,
      totalProblems: 30,
      correctAnswers: 24,
      incorrectAnswers: 6,
      overallAccuracy: 80,
      addition: { correct: 10, incorrect: 2, accuracy: 83 },
      subtraction: { correct: 8, incorrect: 3, accuracy: 73 },
      multiplication: { correct: 6, incorrect: 1, accuracy: 86 },
      division: { correct: 0, incorrect: 0, accuracy: 0 },
      counting: { correct: 0, incorrect: 0, accuracy: 0 },
    },
  },
  spellingStats: {
    child_id: child.id,
    stats: {
      totalGames: 2,
      total_learned_words: 9,
      total_hints_used: 1,
      total_correct_guesses: 9,
      total_incorrect_guesses: 3,
      accuracy: 75,
    },
    learned_words: [],
  },
  memoryStats: {
    child_id: child.id,
    stats: {
      totalGames: 1,
      totalMoves: 16,
      totalTimeSecs: 120,
      bestTimeSecs: 120,
      fewestMoves: 16,
      picture: {
        gamesPlayed: 1,
        totalMoves: 16,
        totalTimeSecs: 120,
        bestTimeSecs: 120,
        fewestMoves: 16,
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
    child_id: child.id,
    stats: {
      totalGames: 4,
      totalShapes: 20,
      totalCorrectShapes: 19,
      totalIncorrectShapes: 1,
      overallAccuracy: 95,
      totalTimeSecs: 240,
      bestTimeSecs: 60,
    },
  },
};

describe("insights model", () => {
  test("maps aggregate stats into overall and subject summaries", () => {
    const model = buildInsightsViewModel(child, stats);

    expect(model.level).toBe(8);
    expect(model.xp).toBe(840);
    expect(model.stars).toBe(120);
    expect(model.totalGames).toBe(10);
    expect(model.learningTimeSecs).toBe(360);
    expect(model.overallAccuracy).toBe(88);
    expect(model.strongestSubject?.label).toBe("Memory");
    expect(model.practiceSubject?.label).toBe("Spelling");
    expect(model.subjects.map((subject) => subject.label)).toEqual([
      "Maths",
      "Spelling",
      "Memory",
      "Shapes",
    ]);
  });

  test("handles children with no stats as an empty state", () => {
    const model = buildInsightsViewModel(child, null);

    expect(model.hasActivity).toBe(false);
    expect(model.totalGames).toBe(0);
    expect(model.overallAccuracy).toBe(0);
    expect(model.strongestSubject).toBeNull();
    expect(model.practiceSubject).toBeNull();
    expect(model.subjects.every((subject) => subject.accuracy === 0)).toBe(true);
  });

  test("clamps percentages and formats learning time", () => {
    expect(clampPercent(Number.NaN)).toBe(0);
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(99.6)).toBe(100);
    expect(clampPercent(130)).toBe(100);
    expect(formatLearningTime(0)).toBe("0 min");
    expect(formatLearningTime(15)).toBe("15 sec");
    expect(formatLearningTime(125)).toBe("2 min");
    expect(formatLearningTime(3720)).toBe("1 hr 2 min");
  });
});
