import type { Word } from "@skill-spark/contracts";

export type SpellingDifficulty = "easy" | "medium" | "hard";

export type SpellingChallenge = {
  wordId: number;
  word: string;
  category: string;
  clue: string;
};

export type SpellingSessionState = {
  difficulty: SpellingDifficulty;
  challenges: SpellingChallenge[];
  currentIndex: number;
  correct: number;
  incorrect: number;
  input: string;
  feedback: "idle" | "correct" | "incorrect";
  lastAnswer: string | null;
  isComplete: boolean;
};

export const SPELLING_SESSION_LENGTH = 5;

export function difficultyForAge(age: number): SpellingDifficulty {
  if (age >= 9) return "hard";
  if (age >= 7) return "medium";
  return "easy";
}

export function normalizeSpellingAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

export function wordDifficulty(word: string): SpellingDifficulty {
  const normalized = normalizeSpellingAnswer(word);
  if (normalized.length <= 3) return "easy";
  if (normalized.length <= 5) return "medium";
  return "hard";
}

export function toSpellingChallenge(word: Word): SpellingChallenge {
  const normalized = normalizeSpellingAnswer(word.word);
  return {
    wordId: word.word_id,
    word: normalized,
    category: word.category,
    clue: `Spell the ${word.category.toLowerCase()} word`,
  };
}

export function selectAgeAppropriateWords(
  words: readonly Word[],
  age: number,
  random: () => number = Math.random
): SpellingChallenge[] {
  const difficulty = difficultyForAge(age);
  const challenges = words
    .map(toSpellingChallenge)
    .filter((challenge) => challenge.word.length > 0);
  const preferred = challenges.filter(
    (challenge) => wordDifficulty(challenge.word) === difficulty
  );
  const pool = preferred.length > 0 ? preferred : challenges;

  return shuffle(pool, random).slice(0, SPELLING_SESSION_LENGTH);
}

export function createSpellingSession(
  words: readonly Word[],
  age: number,
  random: () => number = Math.random
): SpellingSessionState | null {
  const challenges = selectAgeAppropriateWords(words, age, random);
  if (challenges.length === 0) return null;

  return {
    difficulty: difficultyForAge(age),
    challenges,
    currentIndex: 0,
    correct: 0,
    incorrect: 0,
    input: "",
    feedback: "idle",
    lastAnswer: null,
    isComplete: false,
  };
}

export function updateSpellingInput(
  state: SpellingSessionState,
  input: string
): SpellingSessionState {
  if (state.isComplete || state.feedback !== "idle") return state;
  return { ...state, input };
}

export function submitSpellingAnswer(
  state: SpellingSessionState
): SpellingSessionState {
  if (state.isComplete || state.feedback !== "idle") return state;

  const challenge = state.challenges[state.currentIndex];
  if (!challenge) return state;

  const isCorrect =
    normalizeSpellingAnswer(state.input) === normalizeSpellingAnswer(challenge.word);

  return {
    ...state,
    correct: state.correct + (isCorrect ? 1 : 0),
    incorrect: state.incorrect + (isCorrect ? 0 : 1),
    feedback: isCorrect ? "correct" : "incorrect",
    lastAnswer: challenge.word,
  };
}

export function advanceSpellingChallenge(
  state: SpellingSessionState
): SpellingSessionState {
  if (state.feedback === "idle") return state;

  const nextIndex = state.currentIndex + 1;
  const isComplete = nextIndex >= state.challenges.length;

  return {
    ...state,
    currentIndex: isComplete ? state.currentIndex : nextIndex,
    input: "",
    feedback: "idle",
    lastAnswer: null,
    isComplete,
  };
}

export function spellingSessionAnchorWord(state: SpellingSessionState) {
  return state.challenges[Math.min(state.currentIndex, state.challenges.length - 1)];
}

function shuffle<T>(items: readonly T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
