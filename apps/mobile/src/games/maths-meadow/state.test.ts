import { describe, expect, it } from "vitest";
import {
  answerCurrentQuestion,
  createMathsQuestion,
  createMathsSession,
  sessionSummary,
} from "./state";

describe("maths meadow state", () => {
  it("generates age-appropriate questions with the answer included", () => {
    const question = createMathsQuestion(1, 8, fixedRandom(0.1, 0.2, 0.3));

    expect(["addition", "subtraction", "multiplication"]).toContain(
      question.type
    );
    expect(question.choices).toContain(question.answer);
    expect(question.choices).toHaveLength(4);
  });

  it("tracks correct and incorrect answers", () => {
    const session = createMathsSession(6, fixedRandom(0.1));
    const question = session.questions[0];
    const correct = answerCurrentQuestion(session, question.answer);
    const ignoredSecondTap = answerCurrentQuestion(correct, question.answer + 1);

    expect(correct.correct).toBe(1);
    expect(correct.incorrect).toBe(0);
    expect(ignoredSecondTap).toBe(correct);

    const nextSession = {
      ...session,
      currentIndex: 1,
      answeredChoice: null,
    };
    const wrong = answerCurrentQuestion(
      nextSession,
      nextSession.questions[1].answer + 99
    );

    expect(wrong.correct).toBe(0);
    expect(wrong.incorrect).toBe(1);
  });

  it("creates a backend submission summary", () => {
    const session = {
      ...createMathsSession(8, fixedRandom(0.1)),
      correct: 7,
      incorrect: 3,
    };

    expect(sessionSummary(session)).toMatchObject({
      correct: 7,
      incorrect: 3,
    });
  });
});

function fixedRandom(...values: number[]) {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0.1;
    index += 1;
    return value;
  };
}
