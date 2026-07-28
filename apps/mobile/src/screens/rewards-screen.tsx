import * as React from "react";
import { RefreshControl } from "react-native";
import type {
  FamilyReward,
  RewardRedemption,
  RewardRedemptionStatus,
} from "@skill-spark/contracts";
import { router } from "expo-router";
import { ApiError } from "@skill-spark/api-client";
import { useMobileApi } from "@/api/use-mobile-api";
import { useChildren } from "@/children/use-children";
import {
  activeRewards,
  addRequestedRedemption,
  canCancelRedemption,
  canRequestReward,
  groupRedemptions,
  replaceRedemption,
} from "@/rewards/reward-state";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";

const HISTORY_ORDER: RewardRedemptionStatus[] = [
  "requested",
  "approved",
  "rejected",
  "cancelled",
];

export function RewardsScreen() {
  const {
    selectedChild,
    status: childStatus,
    reload: reloadChildren,
    updateSelectedChildProgression,
  } = useChildren();
  const { api, withRefresh } = useMobileApi();
  const [rewards, setRewards] = React.useState<FamilyReward[]>([]);
  const [redemptions, setRedemptions] = React.useState<RewardRedemption[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [requestingIds, setRequestingIds] = React.useState<Set<number>>(
    () => new Set()
  );
  const requestingIdsRef = React.useRef<Set<number>>(new Set());
  const [cancellingIds, setCancellingIds] = React.useState<Set<number>>(
    () => new Set()
  );
  const cancellingIdsRef = React.useRef<Set<number>>(new Set());
  const [actionErrors, setActionErrors] = React.useState<Record<string, string>>(
    {}
  );

  const loadRewards = React.useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!selectedChild) {
        setRewards([]);
        setRedemptions([]);
        setStatus("idle");
        return;
      }

      if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setStatus("loading");
      }
      setError(null);

      try {
        const [rewardResponse, redemptionResponse] = await withRefresh(() =>
          Promise.all([
            api.rewards.list(),
            api.rewards.listRedemptions(selectedChild.id),
          ])
        );
        setRewards(rewardResponse.rewards);
        setRedemptions(redemptionResponse.redemptions);
        setStatus("ready");
      } catch {
        setError("Rewards could not be loaded. Check your connection and try again.");
        setStatus("error");
      } finally {
        setRefreshing(false);
      }
    },
    [api.rewards, selectedChild, withRefresh]
  );

  React.useEffect(() => {
    void loadRewards();
  }, [loadRewards]);

  const requestReward = React.useCallback(
    async (reward: FamilyReward) => {
      if (!selectedChild || requestingIdsRef.current.has(reward.id)) return;
      if (!canRequestReward(reward, selectedChild.reward_points)) return;

      requestingIdsRef.current.add(reward.id);
      setRequestingIds((current) => new Set(current).add(reward.id));
      setActionErrors((current) => {
        const next = { ...current };
        delete next[`reward-${reward.id}`];
        return next;
      });

      try {
        const response = await withRefresh(() =>
          api.rewards.request(selectedChild.id, { rewardId: reward.id })
        );
        setRedemptions((current) =>
          addRequestedRedemption(current, response.redemption)
        );
        updateSelectedChildProgression(response.child);
        await reloadChildren();
      } catch (requestError) {
        setActionErrors((current) => ({
          ...current,
          [`reward-${reward.id}`]:
            requestError instanceof ApiError && requestError.status === 409
              ? "Not enough stars for this reward yet."
              : "This reward could not be requested.",
        }));
      } finally {
        setRequestingIds((current) => {
          requestingIdsRef.current.delete(reward.id);
          const next = new Set(current);
          next.delete(reward.id);
          return next;
        });
      }
    },
    [
      api.rewards,
      reloadChildren,
      selectedChild,
      updateSelectedChildProgression,
      withRefresh,
    ]
  );

  const cancelRedemption = React.useCallback(
    async (redemption: RewardRedemption) => {
      if (!selectedChild || cancellingIdsRef.current.has(redemption.id)) return;
      if (!canCancelRedemption(redemption)) return;

      cancellingIdsRef.current.add(redemption.id);
      setCancellingIds((current) => new Set(current).add(redemption.id));
      setActionErrors((current) => {
        const next = { ...current };
        delete next[`redemption-${redemption.id}`];
        return next;
      });

      try {
        const response = await withRefresh(() =>
          api.rewards.cancel(selectedChild.id, redemption.id)
        );
        setRedemptions((current) =>
          replaceRedemption(current, response.redemption)
        );
        updateSelectedChildProgression(response.child);
        await reloadChildren();
      } catch {
        setActionErrors((current) => ({
          ...current,
          [`redemption-${redemption.id}`]:
            "This request could not be cancelled.",
        }));
      } finally {
        setCancellingIds((current) => {
          cancellingIdsRef.current.delete(redemption.id);
          const next = new Set(current);
          next.delete(redemption.id);
          return next;
        });
      }
    },
    [
      api.rewards,
      reloadChildren,
      selectedChild,
      updateSelectedChildProgression,
      withRefresh,
    ]
  );

  const visibleRewards = React.useMemo(() => activeRewards(rewards), [rewards]);
  const redemptionSections = React.useMemo(
    () => groupRedemptions(redemptions),
    [redemptions]
  );

  return (
    <ScrollView
      className="flex-1 bg-[#f7f2e8]"
      contentContainerClassName="px-5 pb-10 pt-16"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadRewards("refresh")}
          tintColor="#315f4c"
        />
      }
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
            Rewards
          </Text>
          <Text className="mt-2 text-3xl font-black text-[#243c32]">
            {selectedChild ? `${selectedChild.name}'s stars` : "Pick a child"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/home")}
          className="rounded-full border border-[#c9d6ce] bg-white px-4 py-3"
        >
          <Text className="text-sm font-black text-[#315f4c]">Home</Text>
        </Pressable>
      </View>

      {selectedChild ? (
        <View className="mt-8 rounded-[28px] bg-[#315f4c] p-6">
          <Text className="text-sm font-black uppercase tracking-[2px] text-[#bad3c7]">
            Current stars
          </Text>
          <Text className="mt-2 text-4xl font-black text-white">
            {selectedChild.reward_points}
          </Text>
        </View>
      ) : null}

      {childStatus === "loading" || status === "loading" ? (
        <View className="mt-10 items-center rounded-[28px] bg-white p-8">
          <ActivityIndicator color="#315f4c" />
          <Text className="mt-4 text-base font-semibold text-[#315f4c]">
            Loading rewards...
          </Text>
        </View>
      ) : null}

      {!selectedChild && childStatus === "ready" ? (
        <EmptyCard
          title="No child selected"
          body="Choose or create a child profile before requesting rewards."
        />
      ) : null}

      {status === "error" ? (
        <View className="mt-10 rounded-[28px] bg-white p-6">
          <Text className="text-xl font-black text-[#243c32]">
            Could not load rewards
          </Text>
          <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadRewards()}
            className="mt-5 items-center rounded-2xl bg-[#315f4c] px-5 py-4"
          >
            <Text className="font-black text-white">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {status === "ready" ? (
        <>
          <View className="mt-8">
            <Text className="text-lg font-black text-[#243c32]">
              Family rewards
            </Text>
            {visibleRewards.length === 0 ? (
              <Text className="mt-3 rounded-[28px] bg-white p-5 text-base leading-6 text-[#5c6f65]">
                No family rewards are available yet.
              </Text>
            ) : (
              <View className="mt-3 gap-3">
                {visibleRewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    starBalance={selectedChild?.reward_points ?? 0}
                    error={actionErrors[`reward-${reward.id}`] ?? null}
                    isRequesting={requestingIds.has(reward.id)}
                    onRequest={() => void requestReward(reward)}
                  />
                ))}
              </View>
            )}
          </View>

          {HISTORY_ORDER.map((section) =>
            redemptionSections[section].length > 0 ? (
              <View key={section} className="mt-8">
                <Text className="text-lg font-black text-[#243c32]">
                  {redemptionLabel(section)}
                </Text>
                <View className="mt-3 gap-3">
                  {redemptionSections[section].map((redemption) => (
                    <RedemptionCard
                      key={redemption.id}
                      redemption={redemption}
                      error={actionErrors[`redemption-${redemption.id}`] ?? null}
                      isCancelling={cancellingIds.has(redemption.id)}
                      onCancel={() => void cancelRedemption(redemption)}
                    />
                  ))}
                </View>
              </View>
            ) : null
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

function RewardCard({
  reward,
  starBalance,
  error,
  isRequesting,
  onRequest,
}: {
  reward: FamilyReward;
  starBalance: number;
  error: string | null;
  isRequesting: boolean;
  onRequest(): void;
}) {
  const affordable = canRequestReward(reward, starBalance);

  return (
    <View className="rounded-[28px] border border-[#d8cdb8] bg-white p-5">
      <Text className="text-lg font-black text-[#243c32]">{reward.title}</Text>
      {reward.description ? (
        <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
          {reward.description}
        </Text>
      ) : null}
      <Text className="mt-3 text-sm font-black uppercase tracking-[1.5px] text-[#5d9476]">
        {reward.star_cost} stars
      </Text>
      {error ? (
        <Text className="mt-3 rounded-2xl bg-[#f9ded7] px-4 py-3 text-sm font-semibold text-[#8a3324]">
          {error}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        disabled={!affordable || isRequesting}
        onPress={onRequest}
        className={`mt-4 items-center rounded-2xl px-5 py-4 ${
          affordable ? "bg-[#315f4c]" : "bg-[#c9d6ce]"
        }`}
      >
        {isRequesting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="font-black text-white">
            {affordable ? "Request reward" : "Need more stars"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function RedemptionCard({
  redemption,
  error,
  isCancelling,
  onCancel,
}: {
  redemption: RewardRedemption;
  error: string | null;
  isCancelling: boolean;
  onCancel(): void;
}) {
  const canCancel = canCancelRedemption(redemption);

  return (
    <View className="rounded-[28px] border border-[#d8cdb8] bg-white p-5">
      <Text className="text-lg font-black text-[#243c32]">
        {redemption.reward_title}
      </Text>
      <Text className="mt-2 text-base font-semibold text-[#315f4c]">
        {redemption.star_cost} stars · {redemptionLabel(redemption.status)}
      </Text>
      {redemption.rejection_reason ? (
        <Text className="mt-3 rounded-2xl bg-[#f9ded7] px-4 py-3 text-sm font-semibold text-[#8a3324]">
          {redemption.rejection_reason}
        </Text>
      ) : null}
      {error ? (
        <Text className="mt-3 rounded-2xl bg-[#f9ded7] px-4 py-3 text-sm font-semibold text-[#8a3324]">
          {error}
        </Text>
      ) : null}
      {canCancel ? (
        <Pressable
          accessibilityRole="button"
          disabled={isCancelling}
          onPress={onCancel}
          className="mt-4 items-center rounded-2xl border border-[#c9d6ce] bg-white px-5 py-4"
        >
          {isCancelling ? (
            <ActivityIndicator color="#315f4c" />
          ) : (
            <Text className="font-black text-[#315f4c]">Cancel request</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <View className="mt-10 rounded-[28px] bg-white p-6">
      <Text className="text-xl font-black text-[#243c32]">{title}</Text>
      <Text className="mt-2 text-base leading-6 text-[#5c6f65]">{body}</Text>
    </View>
  );
}

function redemptionLabel(status: RewardRedemptionStatus) {
  switch (status) {
    case "requested":
      return "Waiting for grown-up";
    case "approved":
      return "Approved";
    case "rejected":
      return "Not this time";
    case "cancelled":
      return "Cancelled";
  }
}
