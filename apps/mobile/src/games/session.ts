import type { ChildProfile } from "@skill-spark/contracts";

export type CapturedGameSession = {
  childId: number;
  childName: string;
  sessionId: string;
  startedAt: number;
};

export function createGameSessionId(
  now = Date.now,
  random = Math.random,
  randomUUID: (() => string) | null | undefined =
    globalThis.crypto?.randomUUID?.bind(globalThis.crypto)
) {
  if (typeof randomUUID === "function") {
    return randomUUID();
  }

  return `mobile-${now().toString(36)}-${random().toString(36).slice(2, 10)}`;
}

export function captureGameSession(
  child: ChildProfile,
  now = Date.now,
  createSessionId = createGameSessionId
): CapturedGameSession {
  return {
    childId: child.id,
    childName: child.name,
    sessionId: createSessionId(),
    startedAt: now(),
  };
}
