import { PremiumReward } from "../../../types";

export const premiumRewards: PremiumReward[] = [
  {
    title: "Premium Avatar Pack",
    description: "Unlock 10 exclusive character avatars",
    points_required: 200,
    is_active: false,
    category: "premium",
    does_expire: false,
    duration_days: 0,
  },
  {
    title: "Double XP Boost",
    description: "Earn double XP for 7 days",
    points_required: 100,
    is_active: true,
    category: "premium",
    does_expire: true,
    duration_days: 7,
  },
  {
    title: "Disabled Reward",
    description: "This reward is disabled",
    points_required: 100,
    is_active: false,
    category: "premium",
    does_expire: false,
    duration_days: 0,
  },
];
