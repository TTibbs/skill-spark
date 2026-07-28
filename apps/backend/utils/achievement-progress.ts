// Simple, direct achievement progress extraction
import {
  MathStats,
  MathStatsData,
  SpellingStats,
  SpellingStatsData,
  ShapeStats,
  ShapeStatsData,
  MemoryStats,
  MemoryStatsData,
} from "../types/stats";
import { ChoreStats, ChoreStatsData } from "../types/chores";

// Type for the composite stats object returned by selectStats
export type CompositeStats = {
  choreStats: ChoreStats;
  mathStats: MathStats;
  spellingStats: SpellingStats | null | {};
  shapeStats: ShapeStats;
  memoryStats: MemoryStats;
};

// Union type for individual stats, data types, or composite stats
export type AllStats =
  | MathStats
  | MathStatsData
  | SpellingStats
  | SpellingStatsData
  | ShapeStats
  | ShapeStatsData
  | MemoryStats
  | MemoryStatsData
  | ChoreStats
  | ChoreStatsData
  | CompositeStats;

// Simple criteria definitions
export const TIME_BASED_CRITERIA = new Set([
  "bestTimeSecs",
  "time",
  "fewestMoves",
]);

// Direct progress extractors for each category
export function getMathProgress(
  stats: MathStats | MathStatsData,
  criteria: string
): number {
  if (!stats) return 0;

  // Handle both full stats object and just the data
  const s = "stats" in stats ? stats.stats : stats;
  if (!s) return 0;

  switch (criteria) {
    case "games":
    case "totalGames":
      return s.totalGames || 0;
    case "problems":
      return s.totalProblems || 0;
    case "correctAnswers":
      return s.correctAnswers || 0;
    case "incorrectAnswers":
      return s.incorrectAnswers || 0;
    case "accuracy":
      return s.overallAccuracy || 0;
    case "addition":
      return s.addition?.correct || 0;
    case "subtraction":
      return s.subtraction?.correct || 0;
    case "multiplication":
      return s.multiplication?.correct || 0;
    case "division":
      return s.division?.correct || 0;
    case "counting":
      return s.counting?.correct || 0;
    default:
      return 0;
  }
}

export function getSpellingProgress(
  stats: SpellingStats | SpellingStatsData,
  criteria: string
): number {
  if (!stats) return 0;

  // Handle both full stats object and just the data
  const s = "stats" in stats ? stats.stats : stats;
  if (!s) return 0;

  switch (criteria) {
    case "totalGames":
      return s.totalGames || 0;
    case "total_learned_words":
      return s.total_learned_words || 0;
    case "total_hints_used":
      return s.total_hints_used || 0;
    case "total_correct_guesses":
      return s.total_correct_guesses || 0;
    case "total_incorrect_guesses":
      return s.total_incorrect_guesses || 0;
    case "accuracy":
      return s.accuracy || 0;
    default:
      return 0;
  }
}

export function getShapesProgress(
  stats: ShapeStats | ShapeStatsData,
  criteria: string
): number {
  if (!stats) return 0;

  // Handle both full stats object and just the data
  const s = "stats" in stats ? stats.stats : stats;
  if (!s) return 0;

  switch (criteria) {
    case "games":
    case "totalGames":
      return s.totalGames || 0;
    case "problems":
    case "totalShapes":
      return s.totalShapes || 0;
    case "totalCorrectShapes":
      return s.totalCorrectShapes || 0;
    case "totalIncorrectShapes":
      return s.totalIncorrectShapes || 0;
    case "accuracy":
    case "overallAccuracy":
      return s.overallAccuracy || 0;
    case "totalTimeSecs":
      return s.totalTimeSecs || 0;
    case "bestTimeSecs":
      return s.bestTimeSecs || 0;
    default:
      return 0;
  }
}

export function getMemoryProgress(
  stats: MemoryStats | MemoryStatsData,
  criteria: string
): number {
  if (!stats) return 0;

  // Handle both full stats object and just the data
  const s = "stats" in stats ? stats.stats : stats;
  if (!s) return 0;

  switch (criteria) {
    case "totalGames":
      return s.totalGames || 0;
    case "totalMoves":
      return s.totalMoves || 0;
    case "totalTimeSecs":
      return s.totalTimeSecs || 0;
    case "bestTimeSecs":
      return s.bestTimeSecs || 0;
    case "fewestMoves":
      return s.fewestMoves || 0;
    case "picture_games":
      return s.picture?.gamesPlayed || 0;
    case "sound_games":
      return s.sound?.gamesPlayed || 0;
    case "picture_moves":
      return s.picture?.totalMoves || 0;
    case "sound_moves":
      return s.sound?.totalMoves || 0;
    default:
      return 0;
  }
}

export function getChoresProgress(
  stats: ChoreStats | ChoreStatsData,
  criteria: string
): number {
  if (!stats) return 0;

  // Handle both full stats object and just the data
  const s = "stats" in stats ? stats.stats : stats;
  if (!s) return 0;

  switch (criteria) {
    case "problems":
    case "total_completed":
      return s.total_completed || 0;
    case "total_xp_earned":
      return s.total_xp_earned || 0;
    case "daily_completed":
      return s.daily_completed || 0;
    case "weekly_completed":
      return s.weekly_completed || 0;
    case "monthly_completed":
      return s.monthly_completed || 0;
    case "streak_days":
      return s.streak_days || 0;
    case "longest_streak":
      return s.longest_streak || 0;
    default:
      return 0;
  }
}

// Helper to check if stats is composite type
function isCompositeStats(stats: AllStats): stats is CompositeStats {
  return (
    stats &&
    typeof stats === "object" &&
    "choreStats" in stats &&
    "mathStats" in stats
  );
}

// Main progress extraction function
export function getAchievementProgress(
  stats: AllStats,
  category: string,
  criteria: string
): number {
  if (!stats) return 0;

  // Handle composite stats (from selectStats)
  if (isCompositeStats(stats)) {
    switch (category) {
      case "math":
        return stats.mathStats ? getMathProgress(stats.mathStats, criteria) : 0;
      case "spelling":
        return stats.spellingStats &&
          typeof stats.spellingStats === "object" &&
          "stats" in stats.spellingStats
          ? getSpellingProgress(stats.spellingStats, criteria)
          : 0;
      case "shapes":
        return stats.shapeStats
          ? getShapesProgress(stats.shapeStats, criteria)
          : 0;
      case "memory":
        return stats.memoryStats
          ? getMemoryProgress(stats.memoryStats, criteria)
          : 0;
      case "chores":
        return stats.choreStats
          ? getChoresProgress(stats.choreStats, criteria)
          : 0;
      default:
        return 0;
    }
  }

  // Handle individual stats objects or data objects
  switch (category) {
    case "math":
      return stats
        ? getMathProgress(stats as MathStats | MathStatsData, criteria)
        : 0;
    case "spelling":
      return stats
        ? getSpellingProgress(
            stats as SpellingStats | SpellingStatsData,
            criteria
          )
        : 0;
    case "shapes":
      return stats
        ? getShapesProgress(stats as ShapeStats | ShapeStatsData, criteria)
        : 0;
    case "memory":
      return stats
        ? getMemoryProgress(stats as MemoryStats | MemoryStatsData, criteria)
        : 0;
    case "chores":
      return stats
        ? getChoresProgress(stats as ChoreStats | ChoreStatsData, criteria)
        : 0;
    default:
      return 0;
  }
}

// Simple check for time-based criteria
export function isTimeBasedAchievement(criteria: string): boolean {
  return TIME_BASED_CRITERIA.has(criteria);
}
