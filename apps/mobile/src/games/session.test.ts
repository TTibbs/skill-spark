import { describe, expect, it } from "vitest";
import type { ChildProfile } from "@skill-spark/contracts";
import { captureGameSession, createGameSessionId } from "./session";

describe("game session", () => {
  it("captures the selected child when the session starts", () => {
    const child = childProfile({ id: 12, name: "Maya" });
    const session = captureGameSession(child, () => 1000, () => "session-1");

    expect(session).toEqual({
      childId: 12,
      childName: "Maya",
      sessionId: "session-1",
      startedAt: 1000,
    });
  });

  it("creates a fallback session id without crypto.randomUUID", () => {
    const sessionId = createGameSessionId(() => 123456, () => 0.5, null);

    expect(sessionId).toMatch(/^mobile-/);
  });
});

function childProfile(overrides: Partial<ChildProfile> = {}): ChildProfile {
  return {
    id: 1,
    user_id: 1,
    name: "Alex",
    age: 7,
    xp: 0,
    level: 1,
    reward_points: 0,
    last_played: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    archived_at: null,
    ...overrides,
  };
}
