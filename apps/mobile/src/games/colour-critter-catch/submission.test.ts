import { describe, expect, it } from "vitest";
import type { ShapeResultResponse } from "@skill-spark/contracts";
import {
  buildColourCritterSubmission,
  canSubmitColourCritterResult,
  initialColourCritterSubmissionState,
  markColourCritterFailed,
  markColourCritterSubmitted,
  markColourCritterSubmitting,
} from "./submission";

const response: ShapeResultResponse = {
  child: {
    id: 11,
    user_id: 4,
    name: "Rowan",
    age: 6,
    xp: 210,
    level: 5,
    reward_points: 18,
    last_played: "2026-07-29T10:00:00.000Z",
    created_at: "2026-07-20T10:00:00.000Z",
    updated_at: "2026-07-29T10:00:00.000Z",
  },
  stats: {
    totalGames: 2,
    totalShapes: 16,
    totalCorrectShapes: 13,
    totalIncorrectShapes: 3,
    overallAccuracy: 81.25,
    totalTimeSecs: 74,
    bestTimeSecs: 31,
  },
  xpEarned: 20,
  message: "Shape result saved",
  completedAchievements: [],
};

describe("colour critter submission state", () => {
  it("prevents duplicate in-flight and submitted sessions", () => {
    expect(
      canSubmitColourCritterResult(
        initialColourCritterSubmissionState,
        "session-1"
      )
    ).toBe(true);
    expect(
      canSubmitColourCritterResult(markColourCritterSubmitting(), "session-1")
    ).toBe(false);
    expect(
      canSubmitColourCritterResult(
        markColourCritterSubmitted("session-1", response),
        "session-1"
      )
    ).toBe(false);
  });

  it("allows retry after failure with the same session id", () => {
    const failed = markColourCritterFailed("No network");

    expect(failed.status).toBe("failed");
    expect(canSubmitColourCritterResult(failed, "session-1")).toBe(true);
    expect(
      buildColourCritterSubmission("session-1", {
        correct: 7,
        incorrect: 1,
        timeSpent: 48,
      })
    ).toEqual({
      sessionId: "session-1",
      correct: 7,
      incorrect: 1,
      timeSpent: 48,
    });
  });

  it("stores authoritative progression after success", () => {
    const submitted = markColourCritterSubmitted("session-1", response);

    expect(submitted.result?.child.xp).toBe(210);
    expect(submitted.result?.child.level).toBe(5);
    expect(submitted.result?.child.reward_points).toBe(18);
  });
});
