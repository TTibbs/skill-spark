export type ActiveElapsedTimer = {
  elapsedMs: number;
  activeStartedAt: number | null;
};

export function startTimer(now: number): ActiveElapsedTimer {
  return {
    elapsedMs: 0,
    activeStartedAt: now,
  };
}

export function pauseTimer(timer: ActiveElapsedTimer, now: number) {
  if (timer.activeStartedAt === null) return timer;

  return {
    elapsedMs: timer.elapsedMs + Math.max(0, now - timer.activeStartedAt),
    activeStartedAt: null,
  };
}

export function resumeTimer(timer: ActiveElapsedTimer, now: number) {
  if (timer.activeStartedAt !== null) return timer;

  return {
    ...timer,
    activeStartedAt: now,
  };
}

export function elapsedSeconds(timer: ActiveElapsedTimer, now: number) {
  const activeMs =
    timer.activeStartedAt === null ? 0 : Math.max(0, now - timer.activeStartedAt);
  return Math.max(1, Math.ceil((timer.elapsedMs + activeMs) / 1000));
}
