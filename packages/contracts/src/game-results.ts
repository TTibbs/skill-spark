import type {
  ChildProfile,
} from "./children";
import type {
  MathStatsData,
  MemoryStatsData,
  ShapeStatsData,
  SpellingStatsData,
} from "./stats";

export type GameSessionId = string;

export type ProgressionUpdate = {
  xp: number;
  level: number;
  reward_points: number;
};

export type CompletedAchievement = {
  id: number;
  title: string;
  description?: string | null;
  xp_reward: number;
  points_reward: number;
  category: string;
  is_achieved?: boolean;
};

export type MathResultSubmission = {
  sessionId: GameSessionId;
  correct: number;
  incorrect: number;
  timeSpent: number;
  type: "addition" | "subtraction" | "multiplication" | "division" | "counting";
};

export type MemoryResultSubmission = {
  sessionId: GameSessionId;
  totalMoves: number;
  timeSpent: number;
  type: "picture" | "sound";
};

export type SpellingResultSubmission = {
  sessionId: GameSessionId;
  correct_attempts: number;
  total_attempts: number;
  timeSpent: number;
  hintsUsed: number;
};

export type ShapeResultSubmission = {
  sessionId: GameSessionId;
  correct: number;
  incorrect: number;
  timeSpent: number;
};

export type GameResultResponse<TStats> = {
  child: ChildProfile;
  stats?: TStats;
  spelling_stats?: TStats;
  xpEarned: number;
  message: string;
  completedAchievements: CompletedAchievement[];
};

export type MathResultResponse = GameResultResponse<MathStatsData>;
export type MemoryResultResponse = GameResultResponse<MemoryStatsData>;
export type SpellingResultResponse = GameResultResponse<SpellingStatsData>;
export type ShapeResultResponse = GameResultResponse<ShapeStatsData>;

export type Word = {
  word_id: number;
  word: string;
  image: string | null;
  category: string;
  created_at?: string;
  updated_at?: string;
};

export type WordListResponse = {
  words: Word[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
