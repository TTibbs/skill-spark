import { describe, expect, it } from "vitest";
import type { MemoryResultResponse } from "@skill-spark/contracts";
import {
  buildMemorySubmission,
  canSubmitMemoryResult,
  initialMemorySubmissionState,
  markMemoryFailed,
  markMemorySubmitted,
  markMemorySubmitting,
} from "./submission";

const response: MemoryResultResponse = {
  child: {
    id: 7,
    user_id: 2,
    name: "Maya",
    age: 8,
    xp: 140,
    level: 3,
    reward_points: 11,
    last_played: "2026-07-28T10:00:00.000Z",
    created_at: "2026-07-20T10:00:00.000Z",
    updated_at: "2026-07-28T10:00:00.000Z",
  },
  stats: {
    totalGames: 3,
    totalMoves: 24,
    totalTimeSecs: 92,
    bestTimeSecs: 31,
    fewestMoves: 8,
    picture: {
      gamesPlayed: 3,
      totalMoves: 24,
      totalTimeSecs: 92,
      bestTimeSecs: 31,
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
  xpEarned: 20,
  message: "Memory result saved",
  completedAchievements: [],
};

describe("memory submission state", () => {
  it("prevents duplicate in-flight and submitted sessions", () => {
    expect(canSubmitMemoryResult(initialMemorySubmissionState, "session-1")).toBe(
      true
    );
    expect(canSubmitMemoryResult(markMemorySubmitting(), "session-1")).toBe(
      false
    );
    expect(
      canSubmitMemoryResult(markMemorySubmitted("session-1", response), "session-1")
    ).toBe(false);
    expect(
      canSubmitMemoryResult(markMemorySubmitted("session-1", response), "session-2")
    ).toBe(true);
  });

  it("allows retry after failure with the same session id", () => {
    const failed = markMemoryFailed("No network");

    expect(failed.status).toBe("failed");
    expect(canSubmitMemoryResult(failed, "session-1")).toBe(true);
    expect(buildMemorySubmission("session-1", {
      totalMoves: 8,
      timeSpent: 45,
      type: "picture",
    })).toEqual({
      sessionId: "session-1",
      totalMoves: 8,
      timeSpent: 45,
      type: "picture",
    });
  });

  it("stores authoritative progression after success", () => {
    const submitted = markMemorySubmitted("session-1", response);

    expect(submitted.result?.child.xp).toBe(140);
    expect(submitted.result?.child.level).toBe(3);
    expect(submitted.result?.child.reward_points).toBe(11);
  });
});
