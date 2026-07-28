/**
 *
 * @param word
 * @param perfectScore
 * @param hintsUsed
 * @returns
 * - 0.5xp per letter (reduced from 1xp)
 * - 5xp for completing a word (reduced from 10xp)
 * - 10xp bonus for completing a word without hints (reduced from 20xp)
 * - 50% bonus for completing a word of 5 letters to 10 letters
 * - 100% bonus for completing a word of 10 letters and over
 */
export const calculateWordXP = (
  word: string,
  hintsUsed: number,
  totalCorrectGuesses: number,
  totalIncorrectGuesses: number
): number => {
  if (totalCorrectGuesses === 0 && totalIncorrectGuesses > 0) {
    return 5; // Reduced from 10
  }

  let xp = 5; // Reduced from 10
  let accuracy = 0;

  xp += Math.round(word.length * 0.5); // Reduced from word.length

  // Removed hint penalty

  if (hintsUsed === 0) {
    xp += 10; // Reduced from 20
  }

  accuracy =
    (totalCorrectGuesses / (totalCorrectGuesses + totalIncorrectGuesses)) * 100;

  if (accuracy === 100) {
    xp += 10; // Reduced from 20
  } else if (accuracy > 90) {
    xp += 5; // Reduced from 10
  } else if (accuracy > 80) {
    xp += 3; // Reduced from 5
  }

  return Math.round(xp);
};

/**
 *
 * @param correct
 * @param incorrect
 * @returns
 * - 5xp per correct answer (reduced from 10xp)
 * - 10xp bonus for perfect score (reduced from 20xp)
 * - 5xp bonus for being a good sport if no answers are correct (reduced from 10xp)
 */
export const calculateMathXP = (correct: number, incorrect: number): number => {
  let xp = 0;
  const correctAnswer = 5; // Reduced from 10

  xp += correct * correctAnswer;

  // Apply good sport bonus first
  if (correct === 0 && incorrect > 0) {
    xp += 5; // Reduced from 10
  }

  // Removed incorrect answer penalty

  // Apply perfect score bonus
  if (correct > 0 && incorrect === 0) {
    xp += 10; // Reduced from 20
  }

  return Math.max(0, Math.round(xp));
};

/**
 * Calculate XP based on time spent in seconds.
 *
 * @param timeSpent Time spent in seconds
 * @returns Total XP earned
 *
 * XP Rules:
 * - 15xp base for completing the activity (reduced from 30xp)
 * - +15xp if completed in under 30 seconds (reduced from 30xp)
 * - +5xp if completed in under 60 seconds (reduced from 10xp)
 * - +3xp if completed in under 90 seconds (reduced from 5xp)
 * - +1xp if completed in under 120 seconds (reduced from 2xp)
 * - +15xp if completed in under 12 moves (reduced from 30xp)
 * - +5xp if completed in under 24 moves (reduced from 10xp)
 * - No bonus if over 120 seconds (reduced from 150 seconds)
 * - No bonus if over 24 moves
 */
export const calculateMemoryXP = (
  totalMoves: number,
  timeSpent?: number
): number => {
  let xp = 15; // Reduced from 30

  // Only apply time-based bonuses if timeSpent is provided
  if (typeof timeSpent === "number") {
    if (timeSpent < 30) {
      xp += 15; // Reduced from 30
    } else if (timeSpent < 60) {
      xp += 5; // Reduced from 10
    } else if (timeSpent < 90) {
      xp += 3; // Reduced from 5
    } else if (timeSpent < 120) {
      xp += 1; // Reduced from 2
    } else {
      xp += 0;
    }
  }

  if (totalMoves < 12) {
    xp += 15; // Reduced from 30
  } else if (totalMoves < 24) {
    xp += 5; // Reduced from 10
  }

  return Math.max(0, Math.round(xp));
};

/**
 *
 * @param correct
 * @param incorrect
 * @returns
 * - 5xp per correct shape (reduced from 10xp)
 * - 10xp bonus for completing all shapes (reduced from 20xp)
 * - +15xp if completed in under 30 seconds (reduced from 30xp)
 * - +5xp if completed in under 60 seconds (reduced from 10xp)
 * - +3xp if completed in under 90 seconds (reduced from 5xp)
 * - +1xp if completed in under 120 seconds (reduced from 2xp)
 */
export const calculateShapeXP = (
  correct: number,
  incorrect: number,
  timeSpent?: number
): number => {
  let xp = 0;
  const correctAnswer = 5; // Reduced from 10

  xp += correct * correctAnswer;
  // Removed incorrect answer penalty

  if (correct === correct + incorrect && incorrect === 0) {
    xp += 10; // Reduced from 20
  }

  if (timeSpent && timeSpent < 30) {
    xp += 15; // Reduced from 30
  } else if (timeSpent && timeSpent < 60) {
    xp += 5; // Reduced from 10
  } else if (timeSpent && timeSpent < 90) {
    xp += 3; // Reduced from 5
  } else if (timeSpent && timeSpent < 120) {
    xp += 1; // Reduced from 2
  } else {
    xp += 0;
  }

  return Math.max(0, Math.round(xp));
};
