import { describe, expect, it } from "vitest";
import type { SpellingResultResponse } from "@skill-spark/contracts";
import {
  buildSpellingSubmission,
  canSubmitSpellingResult,
  initialSpellingSubmissionState,
  markSpellingFailed,
  markSpellingSubmitted,
  markSpellingSubmitting,
} from "./submission";

const response: SpellingResultResponse = {
  child: {
    id: 9,
    user_id: 3,
    name: "Alex",
    age: 7,
    xp: 180,
    level: 4,
    reward_points: 16,
    last_played: "2026-07-29T10:00:00.000Z",
    created_at: "2026-07-20T10:00:00.000Z",
    updated_at: "2026-07-29T10:00:00.000Z",
  },
  spelling_stats: {
    totalGames: 4,
    total_learned_words: 12,
    total_hints_used: 0,
    total_correct_guesses: 18,
    total_incorrect_guesses: 3,
    accuracy: 85.7,
  },
  xpEarned: 25,
  message: "Spelling result saved",
  completedAchievements: [],
};

describe("spelling submission state", () => {
  it("prevents duplicate in-flight and submitted sessions", () => {
    expect(
      canSubmitSpellingResult(initialSpellingSubmissionState, "session-1")
    ).toBe(true);
    expect(canSubmitSpellingResult(markSpellingSubmitting(), "session-1")).toBe(
      false
    );
    expect(
      canSubmitSpellingResult(
        markSpellingSubmitted("session-1", response),
        "session-1"
      )
    ).toBe(false);
  });

  it("allows retry after failure with the same session id", () => {
    const failed = markSpellingFailed("No network");

    expect(failed.status).toBe("failed");
    expect(canSubmitSpellingResult(failed, "session-1")).toBe(true);
    expect(
      buildSpellingSubmission("session-1", {
        correct_attempts: 4,
        total_attempts: 5,
        timeSpent: 42,
      })
    ).toEqual({
      sessionId: "session-1",
      correct_attempts: 4,
      total_attempts: 5,
      timeSpent: 42,
      hintsUsed: 0,
    });
  });

  it("stores authoritative progression after success", () => {
    const submitted = markSpellingSubmitted("session-1", response);

    expect(submitted.result?.child.xp).toBe(180);
    expect(submitted.result?.child.level).toBe(4);
    expect(submitted.result?.child.reward_points).toBe(16);
  });
});
