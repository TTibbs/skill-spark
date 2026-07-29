import { describe, expect, test } from "vitest";
import type { ChildStats } from "@skill-spark/contracts";
import {
  buildPracticeActivities,
  recommendPracticeActivities,
} from "./practice-model";

const stats: ChildStats = {
  choreStats: {
    child_id: 1,
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
    child_id: 1,
    stats: {
      totalGames: 3,
      totalProblems: 30,
      correctAnswers: 15,
      incorrectAnswers: 15,
      overallAccuracy: 50,
      addition: { correct: 0, incorrect: 0, accuracy: 0 },
      subtraction: { correct: 0, incorrect: 0, accuracy: 0 },
      multiplication: { correct: 0, incorrect: 0, accuracy: 0 },
      division: { correct: 0, incorrect: 0, accuracy: 0 },
      counting: { correct: 0, incorrect: 0, accuracy: 0 },
    },
  },
  spellingStats: {
    child_id: 1,
    stats: {
      totalGames: 5,
      total_learned_words: 10,
      total_hints_used: 2,
      total_correct_guesses: 10,
      total_incorrect_guesses: 3,
      accuracy: 77,
    },
    learned_words: [],
  },
  memoryStats: {
    child_id: 1,
    stats: {
      totalGames: 2,
      totalMoves: 18,
      totalTimeSecs: 120,
      bestTimeSecs: 60,
      fewestMoves: 8,
      picture: {
        gamesPlayed: 2,
        totalMoves: 18,
        totalTimeSecs: 120,
        bestTimeSecs: 60,
        fewestMoves: 8,
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
      totalGames: 4,
      totalShapes: 16,
      totalCorrectShapes: 15,
      totalIncorrectShapes: 1,
      overallAccuracy: 94,
      totalTimeSecs: 90,
      bestTimeSecs: 20,
    },
  },
};

describe("practice model", () => {
  test("prioritises active subjects with lower accuracy", () => {
    const recommendations = recommendPracticeActivities(
      buildPracticeActivities(stats),
      3
    );

    expect(recommendations.map((activity) => activity.key)).toEqual([
      "maths",
      "spelling",
      "shapes",
    ]);
  });

  test("falls back to static ordering when there is no activity", () => {
    const recommendations = recommendPracticeActivities(
      buildPracticeActivities(null),
      4
    );

    expect(recommendations.map((activity) => activity.key)).toEqual([
      "maths",
      "memory",
      "spelling",
      "shapes",
    ]);
    expect(recommendations.every((activity) => activity.games === 0)).toBe(true);
  });

  test("maps routes and zero values safely", () => {
    const activities = buildPracticeActivities(null);

    expect(activities.map((activity) => activity.route)).toEqual([
      "/games/maths-meadow",
      "/games/memory-match",
      "/games/spelling-garden",
      "/games/colour-critter-catch",
    ]);
    expect(activities.every((activity) => activity.accuracy === 0)).toBe(true);
    expect(activities.every((activity) => activity.statLabel === "Ready to play"))
      .toBe(true);
  });
});
