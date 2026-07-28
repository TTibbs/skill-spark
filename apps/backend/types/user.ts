import { MathStats, MemoryStats, ShapeStats, SpellingStats } from "./index";

export interface User {
  id?: number;
  username: string;
  display_name: string;
  email: string;
  password_hash: string;
  profile_image_url?: string;
  is_parent: boolean;
  total_children?: number;
  timezone: string;
  user_preferences: UserPreferences;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
  language: "en" | "es" | "fr" | "de" | "it" | "pt" | "ru" | "zh";
  pin_key: string | null;
  has_pin?: boolean;
}

export interface ChildProfile {
  id?: number;
  user_id: number;
  name: string;
  age: number;
  xp: number;
  level: number;
  reward_points: number;
  last_played: Date | null;
  created_at: Date;
  updated_at: Date;
  total_learned_words: number;
}

export interface ChildStats {
  id: number;
  user_id: number;
  child_id: number;
  math_stats: {
    totalProblems: number;
    correctAnswers: number;
    incorrectAnswers: number;
    addition?: MathStats;
    subtraction?: MathStats;
    multiplication?: MathStats;
    division?: MathStats;
  };
  spelling_stats: SpellingStats[];
  shape_stats: ShapeStats[];
  memory_stats: MemoryStats[];
  created_at: Date;
  updated_at: Date;
}
