export type ChoreStatus = "assigned" | "submitted" | "approved" | "rejected";

export type ChoreDefinition = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  xp: number;
  reward_points: number;
  user_id: number;
  created_at: string;
  updated_at: string;
};

export type ChoreAssignment = {
  id: number;
  chore_id: number;
  child_id: number;
  status: ChoreStatus;
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
  chore: ChoreDefinition;
};

export type ChoreListResponse = {
  assignments: ChoreAssignment[];
};

export type ChoreAssignmentResponse = {
  assignment: ChoreAssignment;
};

export type RejectChoreInput = {
  reason?: string;
};

export type ProgressionAward = {
  xp: number;
  reward_points: number;
};

export type ChoreApprovalResponse = {
  assignment: ChoreAssignment;
  progression: {
    xp: number;
    level: number;
    reward_points: number;
  };
  awarded: ProgressionAward;
};
