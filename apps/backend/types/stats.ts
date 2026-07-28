import { Achievement } from "./rewards";
import { ChildProfile } from "./user";

export interface MathStats {
  child_id: number | null;
  stats: MathStatsData;
}

export interface MathStatsData {
  totalGames: number;
  totalProblems: number;
  correctAnswers: number;
  incorrectAnswers: number;
  overallAccuracy: number;
  addition: MathActivityStats;
  subtraction: MathActivityStats;
  multiplication: MathActivityStats;
  division: MathActivityStats;
  counting: MathActivityStats;
}

export interface MathActivityStats {
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface UpdateMathStatsResult {
  child: ChildProfile;
  stats: MathStatsData;
  completedAchievements: Achievement[];
  xpEarned: number;
}

export interface Word {
  word_id?: number;
  word: string;
  image: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface WordCategory {
  name: string;
}

export interface WordAndStats {
  word_id: number;
  word: string;
  times_learned: number;
  child_id: number;
  stats: SpellingStatsData;
}

export interface SpellingStats {
  child_id: number | null;
  stats: SpellingStatsData;
  learned_words?: LearnedWord[];
  created_at?: string;
  updated_at?: string;
}

export interface SpellingStatsData {
  totalGames: number;
  total_learned_words: number;
  total_hints_used: number;
  total_correct_guesses: number;
  total_incorrect_guesses: number;
  accuracy: number;
}

export interface SpellingStatsUpdate {
  hintsUsed: number;
  totalCorrectGuesses: number;
  totalIncorrectGuesses: number;
}

export interface LearnedWord {
  word_id: number;
  word: string;
  image: string;
  category: string;
  learned_at: string;
  times_learned: number;
  child_id: number | null;
}

export interface TestWord {
  word_id: string;
  word: string;
  category: string;
  image: string;
}

export interface CreateTestWordParams {
  word: string;
  category: string;
  image: string;
}

export interface MemoryStats {
  child_id: number | null;
  stats: MemoryStatsData;
  updated_at?: string;
  xp_earned?: number;
}

export interface MemoryStatsData {
  totalGames: number;
  totalMoves: number;
  totalTimeSecs: number;
  bestTimeSecs: number | null;
  fewestMoves: number | null;
  picture: {
    gamesPlayed: number;
    totalMoves: number;
    totalTimeSecs: number;
    bestTimeSecs: number | null;
    fewestMoves: number | null;
  };
  sound: {
    gamesPlayed: number;
    totalMoves: number;
    totalTimeSecs: number;
    bestTimeSecs: number | null;
    fewestMoves: number | null;
  };
}

export interface UpdateMemoryStatsResult {
  child: ChildProfile;
  stats: MemoryStatsData;
  completedAchievements: Achievement[];
  xpEarned: number;
}

export interface Shape {
  name: string;
  description: string;
  image: string;
}

export interface ShapeStats {
  child_id: number | null;
  stats: ShapeStatsData;
  updated_at?: string;
  xp_earned?: number;
}

export interface ShapeStatsData {
  totalGames: number;
  totalShapes: number;
  totalCorrectShapes: number;
  totalIncorrectShapes: number;
  overallAccuracy: number;
  totalTimeSecs: number;
  bestTimeSecs: number;
}
