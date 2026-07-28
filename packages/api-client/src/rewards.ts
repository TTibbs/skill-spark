import type {
  CreateFamilyRewardInput,
  CreateRewardRedemptionInput,
  FamilyRewardListResponse,
  FamilyRewardResponse,
  RejectRewardRedemptionInput,
  RewardRedemptionListResponse,
  RewardRedemptionResponse,
  UpdateFamilyRewardInput,
} from "@skill-spark/contracts";
import type { ApiClient } from "./client";

export const createRewardsApi = (client: ApiClient) => ({
  list(signal?: AbortSignal) {
    return client.get<FamilyRewardListResponse>("/rewards", { signal });
  },

  create(input: CreateFamilyRewardInput, signal?: AbortSignal) {
    return client.post<FamilyRewardResponse>("/rewards", {
      body: input,
      signal,
    });
  },

  update(
    rewardId: number,
    input: UpdateFamilyRewardInput,
    signal?: AbortSignal
  ) {
    return client.patch<FamilyRewardResponse>(`/rewards/${rewardId}`, {
      body: input,
      signal,
    });
  },

  archive(rewardId: number, signal?: AbortSignal) {
    return client.delete<void>(`/rewards/${rewardId}`, { signal });
  },

  listRedemptions(childId: number, signal?: AbortSignal) {
    return client.get<RewardRedemptionListResponse>(
      `/children/${childId}/reward-redemptions`,
      { signal }
    );
  },

  request(
    childId: number,
    input: CreateRewardRedemptionInput,
    signal?: AbortSignal
  ) {
    return client.post<RewardRedemptionResponse>(
      `/children/${childId}/reward-redemptions`,
      { body: input, signal }
    );
  },

  approve(childId: number, requestId: number, signal?: AbortSignal) {
    return client.post<RewardRedemptionResponse>(
      `/children/${childId}/reward-redemptions/${requestId}/approve`,
      { signal }
    );
  },

  reject(
    childId: number,
    requestId: number,
    input: RejectRewardRedemptionInput = {},
    signal?: AbortSignal
  ) {
    return client.post<RewardRedemptionResponse>(
      `/children/${childId}/reward-redemptions/${requestId}/reject`,
      { body: input, signal }
    );
  },

  cancel(childId: number, requestId: number, signal?: AbortSignal) {
    return client.post<RewardRedemptionResponse>(
      `/children/${childId}/reward-redemptions/${requestId}/cancel`,
      { signal }
    );
  },
});

export type RewardsApi = ReturnType<typeof createRewardsApi>;
