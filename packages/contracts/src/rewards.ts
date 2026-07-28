export type FamilyReward = {
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
};

export type RewardRedemptionStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "cancelled";

export type RewardRedemption = {
  id: number;
  reward_id: number | null;
  child_id: number;
  user_id: number;
  status: RewardRedemptionStatus;
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
};

export type CreateFamilyRewardInput = {
  title: string;
  description?: string | null;
  star_cost: number;
  image_url?: string | null;
  is_active?: boolean;
};

export type UpdateFamilyRewardInput = Partial<CreateFamilyRewardInput>;

export type FamilyRewardListResponse = {
  rewards: FamilyReward[];
};

export type FamilyRewardResponse = {
  reward: FamilyReward;
};

export type CreateRewardRedemptionInput = {
  rewardId: number;
};

export type RejectRewardRedemptionInput = {
  reason?: string;
};

export type RewardRedemptionListResponse = {
  redemptions: RewardRedemption[];
};

export type RewardRedemptionResponse = {
  redemption: RewardRedemption;
  child: {
    id: number;
    xp: number;
    level: number;
    reward_points: number;
  };
};
