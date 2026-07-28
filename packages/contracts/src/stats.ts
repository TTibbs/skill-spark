export type SubjectAccuracyStats = {
  correct: number;
  incorrect: number;
  accuracy: number;
};

export type MathStatsData = {
  totalGames: number;
  totalProblems: number;
  correctAnswers: number;
  incorrectAnswers: number;
  overallAccuracy: number;
  addition: SubjectAccuracyStats;
  subtraction: SubjectAccuracyStats;
  multiplication: SubjectAccuracyStats;
  division: SubjectAccuracyStats;
  counting: SubjectAccuracyStats;
};

export type MathStats = {
  child_id: number;
  stats: MathStatsData;
  created_at?: string;
  updated_at?: string;
};

export type LearnedWord = {
  word_id: number;
  word: string;
  image: string;
  category: string;
  learned_at: string;
  times_learned: number;
};

export type SpellingStatsData = {
  totalGames: number;
  total_learned_words: number;
  total_hints_used: number;
  total_correct_guesses: number;
  total_incorrect_guesses: number;
  accuracy: number;
};

export type SpellingStats = {
  child_id: number;
  stats: SpellingStatsData;
  learned_words: LearnedWord[];
  created_at?: string;
  updated_at?: string;
};

export type MemoryTypeStats = {
  gamesPlayed: number;
  totalMoves: number;
  totalTimeSecs: number;
  bestTimeSecs: number | null;
  fewestMoves: number | null;
};

export type MemoryStatsData = {
  totalGames: number;
  totalMoves: number;
  totalTimeSecs: number;
  bestTimeSecs: number | null;
  fewestMoves: number | null;
  picture: MemoryTypeStats;
  sound: MemoryTypeStats;
};

export type MemoryStats = {
  child_id: number;
  stats: MemoryStatsData;
  updated_at?: string;
};

export type ShapeStatsData = {
  totalGames: number;
  totalShapes: number;
  totalCorrectShapes: number;
  totalIncorrectShapes: number;
  overallAccuracy: number;
  totalTimeSecs: number;
  bestTimeSecs: number;
};

export type ShapeStats = {
  child_id: number;
  stats: ShapeStatsData;
  updated_at?: string;
};

export type ChildStats = {
  choreStats: {
    child_id: number;
    stats: {
      total_completed: number;
      total_xp_earned: number;
      daily_completed: number;
      weekly_completed: number;
      monthly_completed: number;
      streak_days: number;
      longest_streak: number;
    };
    updated_at?: string;
  };
  mathStats: MathStats;
  spellingStats: SpellingStats;
  shapeStats: ShapeStats;
  memoryStats: MemoryStats;
};

export type ChildStatsResponse = {
  childStats: ChildStats;
};

export type MathStatsResponse = {
  mathStats: MathStats;
};

export type SpellingStatsResponse = {
  spellingStats: SpellingStats;
};

export type MemoryStatsResponse = {
  memoryStats: MemoryStats;
};

export type ShapeStatsResponse = {
  shapeStats: ShapeStats;
};
