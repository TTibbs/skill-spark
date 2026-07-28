export type { Database, Json } from "./database.types";
export type * from "./auth";
export type * from "./users";
export type * from "./children";
export type * from "./stats";
export type * from "./game-results";
export type * from "./chores";
export type * from "./rewards";

export type MemoryGameResult = {
  totalMoves: number;
  timeSpent: number;
  type: "picture" | "sound";
};

export type MathsGameResult = {
  correct: number;
  incorrect: number;
  timeSpent: number;
  type:
    | "addition"
    | "subtraction"
    | "multiplication"
    | "division"
    | "counting";
};

export type SpellingGameResult = {
  correct_attempts: number;
  total_attempts: number;
  timeSpent: number;
  hintsUsed: number;
};
