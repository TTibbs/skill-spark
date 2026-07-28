import { MathStats } from "../../../types";

export const mathStats: MathStats[] = [
  {
    child_id: 1,
    stats: {
      // Overall stats
      totalGames: 9,
      totalProblems: 19,
      correctAnswers: 19,
      incorrectAnswers: 0,
      overallAccuracy: 100,

      // Individual activity stats
      addition: {
        correct: 5,
        incorrect: 0,
        accuracy: 100,
      },
      subtraction: {
        correct: 5,
        incorrect: 0,
        accuracy: 100,
      },
      multiplication: {
        correct: 5,
        incorrect: 0,
        accuracy: 100,
      },
      division: {
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
      counting: {
        correct: 4,
        incorrect: 0,
        accuracy: 100,
      },
    },
  },
  {
    child_id: 2,
    stats: {
      // Overall stats
      totalGames: 4,
      totalProblems: 4,
      correctAnswers: 3,
      incorrectAnswers: 1,
      overallAccuracy: 75,

      // Individual activity stats with default values
      addition: {
        correct: 1,
        incorrect: 0,
        accuracy: 100,
      },
      subtraction: {
        correct: 1,
        incorrect: 0,
        accuracy: 100,
      },
      multiplication: {
        correct: 0,
        incorrect: 1,
        accuracy: 0,
      },
      division: {
        correct: 1,
        incorrect: 0,
        accuracy: 100,
      },
      counting: {
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
    },
  },
  {
    child_id: 3,
    stats: {
      // Overall stats
      totalGames: 0,
      totalProblems: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      overallAccuracy: 0,

      // Individual activity stats with default values
      addition: {
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
      subtraction: {
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
      multiplication: {
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
      division: {
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
      counting: {
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
    },
  },
];
