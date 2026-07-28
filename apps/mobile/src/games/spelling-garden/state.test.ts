import { describe, expect, it } from "vitest";
import type { Word } from "@skill-spark/contracts";
import {
  advanceSpellingChallenge,
  createSpellingSession,
  difficultyForAge,
  normalizeSpellingAnswer,
  selectAgeAppropriateWords,
  spellingSessionAnchorWord,
  submitSpellingAnswer,
  updateSpellingInput,
  wordDifficulty,
} from "./state";

const words: Word[] = [
  { word_id: 1, word: "cat", image: null, category: "Animals" },
  { word_id: 2, word: "dog", image: null, category: "Animals" },
  { word_id: 3, word: "sun", image: null, category: "Nature" },
  { word_id: 4, word: "moon", image: null, category: "Space" },
  { word_id: 5, word: "tree", image: null, category: "Nature" },
  { word_id: 6, word: "apple", image: null, category: "Food" },
  { word_id: 7, word: "rocket", image: null, category: "Space" },
  { word_id: 8, word: "planet", image: null, category: "Space" },
];

describe("spelling garden state", () => {
  it("chooses age and word difficulty", () => {
    expect(difficultyForAge(5)).toBe("easy");
    expect(difficultyForAge(7)).toBe("medium");
    expect(difficultyForAge(10)).toBe("hard");
    expect(wordDifficulty("cat")).toBe("easy");
    expect(wordDifficulty("apple")).toBe("medium");
    expect(wordDifficulty("rocket")).toBe("hard");
  });

  it("normalises typed answers safely", () => {
    expect(normalizeSpellingAnswer("  C-A-T! ")).toBe("cat");
    expect(normalizeSpellingAnswer("Café")).toBe("cafe");
  });

  it("selects age-appropriate backend words", () => {
    const selected = selectAgeAppropriateWords(words, 5, () => 0);

    expect(selected).toHaveLength(3);
    expect(selected.every((word) => word.word.length <= 3)).toBe(true);
  });

  it("tracks correct and incorrect answers through a fixed session", () => {
    let state = createSpellingSession(words, 8, () => 0);
    expect(state).not.toBeNull();
    state = updateSpellingInput(state!, state!.challenges[0].word.toUpperCase());
    state = submitSpellingAnswer(state);

    expect(state.correct).toBe(1);
    expect(state.feedback).toBe("correct");

    state = advanceSpellingChallenge(state);
    state = updateSpellingInput(state, "wrong");
    state = submitSpellingAnswer(state);

    expect(state.incorrect).toBe(1);
    expect(state.feedback).toBe("incorrect");
    expect(state.lastAnswer).toBe(state.challenges[1].word);
  });

  it("completes after the selected word list is exhausted", () => {
    let state = createSpellingSession(words.slice(0, 2), 5, () => 0);
    expect(state).not.toBeNull();

    for (const challenge of state!.challenges) {
      state = updateSpellingInput(state!, challenge.word);
      state = submitSpellingAnswer(state);
      state = advanceSpellingChallenge(state);
    }

    expect(state!.isComplete).toBe(true);
    expect(spellingSessionAnchorWord(state!).wordId).toBe(1);
  });
});
