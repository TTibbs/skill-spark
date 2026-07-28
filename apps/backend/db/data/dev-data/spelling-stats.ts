import { SpellingStats } from "../../../types";

export const spellingStats: SpellingStats[] = [
  {
    child_id: 1, // Emma's stats
    stats: {
      totalGames: 4,
      total_learned_words: 4,
      total_hints_used: 5,
      total_correct_guesses: 15,
      total_incorrect_guesses: 5,
      accuracy: 75,
    },
  },
  {
    child_id: 2, // Liam's stats
    stats: {
      totalGames: 1,
      total_learned_words: 1,
      total_hints_used: 0,
      total_correct_guesses: 3,
      total_incorrect_guesses: 0,
      accuracy: 100,
    },
  },
  {
    child_id: 3, // Another child's stats
    stats: {
      totalGames: 1,
      total_learned_words: 1,
      total_hints_used: 1,
      total_correct_guesses: 4,
      total_incorrect_guesses: 1,
      accuracy: 80,
    },
  },
];
