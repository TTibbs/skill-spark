import type { MathResultSubmission } from "@skill-spark/contracts";

export type MathsType = MathResultSubmission["type"];

export type MathsQuestion = {
  id: number;
  type: Exclude<MathsType, "division" | "counting">;
  prompt: string;
  answer: number;
  choices: number[];
};

export type MathsSessionState = {
  questions: MathsQuestion[];
  currentIndex: number;
  correct: number;
  incorrect: number;
  answeredChoice: number | null;
  isComplete: boolean;
};

export type MathsSessionSummary = Pick<
  MathResultSubmission,
  "correct" | "incorrect" | "type"
>;

export const MATHS_SESSION_LENGTH = 10;

export function createMathsQuestion(
  id: number,
  age: number,
  random: () => number = Math.random
): MathsQuestion {
  const types: MathsQuestion["type"][] =
    age >= 7
      ? ["addition", "subtraction", "multiplication"]
      : ["addition", "subtraction"];
  const type = types[randomInt(random, 0, types.length - 1)];

  if (type === "multiplication") {
    const left = randomInt(random, 2, age >= 9 ? 9 : 5);
    const right = randomInt(random, 2, age >= 9 ? 9 : 5);
    const answer = left * right;
    return {
      id,
      type,
      prompt: `${left} x ${right}`,
      answer,
      choices: createChoices(answer, random),
    };
  }

  const max = age >= 8 ? 30 : age >= 6 ? 20 : 10;
  const left = randomInt(random, 1, max);
  const right = randomInt(random, 1, max);

  if (type === "subtraction") {
    const bigger = Math.max(left, right);
    const smaller = Math.min(left, right);
    const answer = bigger - smaller;
    return {
      id,
      type,
      prompt: `${bigger} - ${smaller}`,
      answer,
      choices: createChoices(answer, random),
    };
  }

  const answer = left + right;
  return {
    id,
    type,
    prompt: `${left} + ${right}`,
    answer,
    choices: createChoices(answer, random),
  };
}

export function createMathsSession(
  age: number,
  random: () => number = Math.random
): MathsSessionState {
  return {
    questions: Array.from({ length: MATHS_SESSION_LENGTH }, (_, index) =>
      createMathsQuestion(index + 1, age, random)
    ),
    currentIndex: 0,
    correct: 0,
    incorrect: 0,
    answeredChoice: null,
    isComplete: false,
  };
}

export function answerCurrentQuestion(
  state: MathsSessionState,
  choice: number
): MathsSessionState {
  if (state.isComplete || state.answeredChoice !== null) return state;

  const currentQuestion = state.questions[state.currentIndex];
  if (!currentQuestion) return state;

  const isCorrect = choice === currentQuestion.answer;
  return {
    ...state,
    correct: state.correct + (isCorrect ? 1 : 0),
    incorrect: state.incorrect + (isCorrect ? 0 : 1),
    answeredChoice: choice,
  };
}

export function advanceQuestion(state: MathsSessionState): MathsSessionState {
  if (state.answeredChoice === null) return state;

  const nextIndex = state.currentIndex + 1;
  return {
    ...state,
    currentIndex: Math.min(nextIndex, state.questions.length - 1),
    answeredChoice: null,
    isComplete: nextIndex >= state.questions.length,
  };
}

export function sessionSummary(state: MathsSessionState): MathsSessionSummary {
  const counts = state.questions.reduce(
    (totals, question) => ({
      ...totals,
      [question.type]: totals[question.type] + 1,
    }),
    { addition: 0, subtraction: 0, multiplication: 0 }
  );
  const type =
    counts.multiplication >= counts.addition &&
    counts.multiplication >= counts.subtraction
      ? "multiplication"
      : counts.subtraction > counts.addition
        ? "subtraction"
        : "addition";

  return {
    correct: state.correct,
    incorrect: state.incorrect,
    type,
  };
}

function createChoices(answer: number, random: () => number) {
  const choices = new Set<number>([answer]);
  let attempts = 0;
  while (choices.size < 4) {
    const offset = randomInt(random, -8, 8);
    const next = Math.max(0, answer + (offset === 0 ? 1 : offset));
    choices.add(next);
    attempts += 1;
    if (attempts > 40 && choices.size < 4) {
      choices.add(answer + choices.size + 1);
    }
  }
  return shuffle(Array.from(choices), random);
}

function shuffle(values: number[], random: () => number) {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(random, 0, index);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}
