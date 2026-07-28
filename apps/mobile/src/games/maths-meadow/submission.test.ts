import { describe, expect, it } from "vitest";
import type { MathResultResponse } from "@skill-spark/contracts";
import {
  buildMathsSubmission,
  canSubmitMathsResult,
  initialMathsSubmissionState,
  markMathsFailed,
  markMathsSubmitted,
  markMathsSubmitting,
} from "./submission";

describe("maths meadow submission", () => {
  it("prevents duplicate submission while saving and after success", () => {
    expect(canSubmitMathsResult(initialMathsSubmissionState, "session-1")).toBe(
      true
    );
    expect(canSubmitMathsResult(markMathsSubmitting(), "session-1")).toBe(false);
    expect(
      canSubmitMathsResult(
        markMathsSubmitted("session-1", mathResponse()),
        "session-1"
      )
    ).toBe(false);
  });

  it("allows retry after failure with the same session id", () => {
    const failed = markMathsFailed();

    expect(canSubmitMathsResult(failed, "session-1")).toBe(true);
    expect(
      buildMathsSubmission("session-1", {
        correct: 8,
        incorrect: 2,
        timeSpent: 45,
        type: "addition",
      })
    ).toEqual({
      sessionId: "session-1",
      correct: 8,
      incorrect: 2,
      timeSpent: 45,
      type: "addition",
    });
  });

  it("keeps authoritative child progression after success", () => {
    const submitted = markMathsSubmitted("session-1", mathResponse());

    expect(submitted.result?.child).toMatchObject({
      xp: 120,
      level: 3,
      reward_points: 14,
    });
  });
});

function mathResponse(): MathResultResponse {
  return {
    child: {
      id: 1,
      user_id: 1,
      name: "Alex",
      age: 7,
      xp: 120,
      level: 3,
      reward_points: 14,
      last_played: "2026-01-01T00:00:00.000Z",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    stats: {
      totalGames: 1,
      totalProblems: 10,
      correctAnswers: 8,
      incorrectAnswers: 2,
      overallAccuracy: 80,
      addition: { correct: 8, incorrect: 2, accuracy: 80 },
      subtraction: { correct: 0, incorrect: 0, accuracy: 0 },
      multiplication: { correct: 0, incorrect: 0, accuracy: 0 },
      division: { correct: 0, incorrect: 0, accuracy: 0 },
      counting: { correct: 0, incorrect: 0, accuracy: 0 },
    },
    xpEarned: 20,
    message: "Math stats updated successfully",
    completedAchievements: [],
  };
}
