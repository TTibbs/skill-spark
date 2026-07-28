import { User, ChildProfile } from "./user";
import { UserSession } from "./auth";
import { Chore, ChoreCategory, ChoreStats } from "./chores";
import {
  MathStats,
  ShapeStats,
  MemoryStats,
  Shape,
  Word,
  LearnedWord,
  SpellingStats,
  WordCategory,
} from "./stats";
import { Achievement, PremiumReward } from "./rewards";

export * from "./auth";
export * from "./chores";
export * from "./rewards";
export * from "./stats";
export * from "./user";

export interface QueryParams {
  limit?: number;
  page?: number;
  category?: string;
}

export interface SeedData {
  users: User[];
  userSessions: UserSession[];
  childProfiles?: ChildProfile[];
  chores?: Chore[];
  choreCategories?: ChoreCategory[];
  choreStats?: ChoreStats[];
  learnedWords?: LearnedWord[];
  mathStats?: MathStats[];
  spellingStats?: SpellingStats[];
  shapeStats?: ShapeStats[];
  memoryStats?: MemoryStats[];
  achievements?: Achievement[];
  wordCategories?: WordCategory[];
  words?: Word[];
  premiumRewards?: PremiumReward[];
  shapes?: Shape[];
}
