export interface Achievement {
  id?: number;
  child_id?: number;
  title: string;
  description: string;
  // The stat this achievement tracks (e.g., 'problems', 'games', 'correctAnswers', etc.)
  criteria:
    | "problems"
    | "totalGames"
    | "total_learned_words"
    | "total_completed"
    | "daily_completed"
    | "weekly_completed"
    | "monthly_completed"
    | "correctAnswers"
    | "incorrectAnswers"
    | "accuracy"
    | "addition"
    | "subtraction"
    | "multiplication"
    | "division"
    | "counting"
    | "bestTimeSecs"
    | "totalCorrectShapes"
    | "fewestMoves"
    | "custom";
  // The value required to complete the achievement for the given criteria
  required_value: number;
  xp_reward: number;
  points_reward: number;
  is_active: boolean;
  image_url: string;
  category: string;
  is_achieved: boolean;
  is_special: boolean;
  // Optionally, for more granularity (e.g., 'addition', 'subtraction')
  statKey?: string;
}

export interface AchievementProgress {
  achievements: {
    word_challenges?: number;
    [key: string]: any;
  };
}

export interface PremiumReward {
  id?: number;
  title: string;
  description: string;
  points_required: number;
  is_active: boolean;
  category: string;
  does_expire: boolean;
  duration_days: number;
}

export interface PremiumRewardPurchase {
  id?: number;
  reward_id: number;
  child_id: number;
  purchase_date: string;
  is_activated: boolean;
  expiry_date?: string;
}

export interface PremiumRewardWithPurchase extends PremiumReward {
  purchase_id?: number;
  purchase_date?: string;
  is_activated?: boolean;
  expiry_date?: string;
}

export type RedemptionStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "cancelled";

export interface FamilyReward {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  star_cost: number;
  image_url: string | null;
  is_active: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RewardRedemption {
  id: number;
  reward_id: number | null;
  child_id: number;
  user_id: number;
  status: RedemptionStatus;
  reward_title: string;
  reward_description: string | null;
  star_cost: number;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  cancelled_at: string | null;
  rejection_reason: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
  reward?: FamilyReward | null;
}
