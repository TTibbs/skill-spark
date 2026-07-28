import { describe, expect, it } from "vitest";
import {
  COLOUR_CRITTER_SESSION_LENGTH,
  advanceCritterRound,
  createCritterRound,
  createCritterSession,
  difficultyForAge,
  selectCritterOption,
} from "./state";

describe("colour critter catch state", () => {
  it("chooses age-based difficulty", () => {
    expect(difficultyForAge(5)).toBe("easy");
    expect(difficultyForAge(7)).toBe("medium");
    expect(difficultyForAge(10)).toBe("hard");
  });

  it("generates exactly one matching target option", () => {
    const round = createCritterRound("hard", 1, () => 0.42);
    const matchingOptions = round.options.filter(
      (option) =>
        option.colour.id === round.targetColour.id &&
        option.shape.id === round.targetShape.id
    );

    expect(matchingOptions).toHaveLength(1);
    expect(matchingOptions[0].isTarget).toBe(true);
    expect(round.options.filter((option) => option.isTarget)).toHaveLength(1);
  });

  it("varies option count by difficulty", () => {
    expect(createCritterRound("easy", 1, () => 0).options).toHaveLength(3);
    expect(createCritterRound("medium", 1, () => 0).options).toHaveLength(4);
    expect(createCritterRound("hard", 1, () => 0).options).toHaveLength(6);
  });

  it("tracks correct taps and locks until advanced", () => {
    const session = createCritterSession(6, () => 0);
    const target = session.rounds[0].options.find((option) => option.isTarget);
    expect(target).toBeDefined();

    const answered = selectCritterOption(session, target!.id);
    const ignored = selectCritterOption(answered, session.rounds[0].options[0].id);
    const next = advanceCritterRound(answered);

    expect(answered.correct).toBe(1);
    expect(answered.incorrect).toBe(0);
    expect(answered.locked).toBe(true);
    expect(ignored).toBe(answered);
    expect(next.locked).toBe(false);
    expect(next.currentIndex).toBe(1);
  });

  it("tracks incorrect taps", () => {
    const session = createCritterSession(6, () => 0);
    const distractor = session.rounds[0].options.find(
      (option) => !option.isTarget
    );
    expect(distractor).toBeDefined();

    const answered = selectCritterOption(session, distractor!.id);

    expect(answered.correct).toBe(0);
    expect(answered.incorrect).toBe(1);
    expect(answered.feedback).toBe("incorrect");
  });

  it("completes after the fixed-length session", () => {
    let state = createCritterSession(6, () => 0);

    for (let index = 0; index < COLOUR_CRITTER_SESSION_LENGTH; index += 1) {
      const target = state.rounds[state.currentIndex].options.find(
        (option) => option.isTarget
      );
      state = selectCritterOption(state, target!.id);
      state = advanceCritterRound(state);
    }

    expect(state.isComplete).toBe(true);
    expect(state.correct).toBe(COLOUR_CRITTER_SESSION_LENGTH);
  });
});
