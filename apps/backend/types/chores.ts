export interface Chore {
  id?: number;
  title: string;
  description: string;
  category: string;
  xp: number;
  reward_points?: number;
  user_id?: number | null;
  created_at?: string;
  updated_at?: string;
  is_completed?: boolean;
  assigned_at?: string;
  completed_at?: string;
  xp_earned?: number;
  completion_count?: number;
}

export type ChoreAssignmentStatus =
  | "assigned"
  | "submitted"
  | "approved"
  | "rejected";

export interface ChoreAssignment {
  id: number;
  chore_id: number;
  child_id: number;
  status: ChoreAssignmentStatus;
  assigned_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  rejection_reason: string | null;
  assigned_xp_reward: number;
  assigned_reward_points: number;
  awarded_xp: number;
  awarded_reward_points: number;
  created_at: string;
  updated_at: string;
  chore: Chore;
}

export interface ChoreCategory {
  name: string;
  description: string;
}

export interface AssignedChore extends Chore {
  chore_id: number;
  child_chore_id: number;
  is_completed: boolean;
  completion_count: number;
  last_completed_at?: string | null;
}

export interface ChoreStats {
  child_id?: number;
  stats: ChoreStatsData;
  updated_at?: string;
}

export interface ChoreStatsData {
  total_completed: number;
  total_xp_earned: number;
  daily_completed: number;
  weekly_completed: number;
  monthly_completed: number;
  streak_days: number;
  longest_streak: number;
}
