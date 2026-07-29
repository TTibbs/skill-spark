import type {
  FamilyReward,
  RewardRedemption,
  RewardRedemptionStatus,
} from "@skill-spark/contracts";

export type RedemptionSections = Record<RewardRedemptionStatus, RewardRedemption[]>;

export function activeRewards(rewards: FamilyReward[]) {
  return rewards.filter((reward) => reward.is_active && !reward.archived_at);
}

export function canRequestReward(reward: FamilyReward, starBalance: number) {
  return reward.is_active && !reward.archived_at && starBalance >= reward.star_cost;
}

export function hasPendingRedemption(
  reward: FamilyReward,
  redemptions: RewardRedemption[]
) {
  return redemptions.some(
    (redemption) =>
      redemption.status === "requested" && redemption.reward_id === reward.id
  );
}

export function canRequestRewardNow(
  reward: FamilyReward,
  starBalance: number,
  redemptions: RewardRedemption[]
) {
  return (
    canRequestReward(reward, starBalance) &&
    !hasPendingRedemption(reward, redemptions)
  );
}

export function rewardRequestState(
  reward: FamilyReward,
  starBalance: number,
  redemptions: RewardRedemption[]
) {
  const pending = hasPendingRedemption(reward, redemptions);
  const affordable = canRequestReward(reward, starBalance);

  if (pending) {
    return {
      affordable,
      canRequest: false,
      pending,
      label: "Already requested",
      actionLabel: "Waiting for grown-up",
    };
  }

  if (affordable) {
    return {
      affordable,
      canRequest: true,
      pending,
      label: "Available",
      actionLabel: "Request reward",
    };
  }

  return {
    affordable,
    canRequest: false,
    pending,
    label: `${Math.max(reward.star_cost - starBalance, 0)} more stars needed`,
    actionLabel: "Need more stars",
  };
}

export function canCancelRedemption(redemption: RewardRedemption) {
  return redemption.status === "requested";
}

export function addRequestedRedemption(
  redemptions: RewardRedemption[],
  redemption: RewardRedemption
) {
  return [redemption, ...redemptions];
}

export function replaceRedemption(
  redemptions: RewardRedemption[],
  nextRedemption: RewardRedemption
) {
  return redemptions.map((redemption) =>
    redemption.id === nextRedemption.id ? nextRedemption : redemption
  );
}

export function groupRedemptions(
  redemptions: RewardRedemption[]
): RedemptionSections {
  return {
    requested: redemptions.filter(
      (redemption) => redemption.status === "requested"
    ),
    approved: redemptions.filter((redemption) => redemption.status === "approved"),
    rejected: redemptions.filter((redemption) => redemption.status === "rejected"),
    cancelled: redemptions.filter(
      (redemption) => redemption.status === "cancelled"
    ),
  };
}
