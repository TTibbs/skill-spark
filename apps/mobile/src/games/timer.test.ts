import { describe, expect, it } from "vitest";
import { elapsedSeconds, pauseTimer, resumeTimer, startTimer } from "./timer";

describe("active elapsed timer", () => {
  it("counts active time", () => {
    const timer = startTimer(1000);

    expect(elapsedSeconds(timer, 3500)).toBe(3);
  });

  it("pauses elapsed time while backgrounded", () => {
    const active = startTimer(1000);
    const paused = pauseTimer(active, 2500);

    expect(elapsedSeconds(paused, 9000)).toBe(2);

    const resumed = resumeTimer(paused, 10000);

    expect(elapsedSeconds(resumed, 11200)).toBe(3);
  });
});
