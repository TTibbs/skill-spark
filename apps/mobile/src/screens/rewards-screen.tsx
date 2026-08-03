import * as React from "react";
import { Alert, RefreshControl } from "react-native";
import type {
  FamilyReward,
  RewardRedemption,
  RewardRedemptionStatus,
} from "@skill-spark/contracts";
import { ApiError } from "@skill-spark/api-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMobileApi } from "@/api/use-mobile-api";
import { ChildProfileSwitcher } from "@/children/child-profile-switcher";
import { useChildren } from "@/children/use-children";
import { BottomNav, BOTTOM_NAV_BASE_HEIGHT } from "@/navigation/bottom-nav";
import {
  activeRewards,
  addRequestedRedemption,
  canCancelRedemption,
  canRequestRewardNow,
  groupRedemptions,
  hasPendingRedemption,
  replaceRedemption,
  rewardRequestState,
} from "@/rewards/reward-state";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";

const INK = "#21372e";
const MUTED = "#66766f";
const GREEN = "#2b5f4b";
const CREAM = "#fbfcf7";
const BORDER = "#d9e5dd";
const YELLOW = "#ffd86f";
const YELLOW_SOFT = "#fff0bd";
const SAGE = "#dceee3";

export function RewardsScreen() {
  const {
    children,
    selectedChild,
    status: childStatus,
    error: childError,
    reload: reloadChildren,
    selectChild,
    updateSelectedChildProgression,
  } = useChildren();
  const { api, withRefresh } = useMobileApi();
  const insets = useSafeAreaInsets();
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
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const requestIdRef = React.useRef(0);

  const loadRewards = React.useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!selectedChild) {
        requestIdRef.current += 1;
        setRewards([]);
        setRedemptions([]);
        setStatus("idle");
        setError(null);
        return;
      }

      const childId = selectedChild.id;
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setRewards([]);
        setRedemptions([]);
        setStatus("loading");
      }
      setError(null);

      try {
        const [rewardResponse, redemptionResponse] = await withRefresh(() =>
          Promise.all([
            api.rewards.list(),
            api.rewards.listRedemptions(childId),
          ])
        );
        if (requestIdRef.current !== requestId) return;
        setRewards(rewardResponse.rewards);
        setRedemptions(redemptionResponse.redemptions);
        setStatus("ready");
      } catch {
        if (requestIdRef.current !== requestId) return;
        setError("Rewards could not be loaded. Check your connection and try again.");
        setStatus("error");
      } finally {
        if (requestIdRef.current === requestId) setRefreshing(false);
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
      if (!canRequestRewardNow(reward, selectedChild.reward_points, redemptions)) {
        return;
      }

      requestingIdsRef.current.add(reward.id);
      setRequestingIds((current) => new Set(current).add(reward.id));
      setSuccessMessage(null);
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
        setSuccessMessage(`${reward.title} requested. Stars updated.`);
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
      redemptions,
      reloadChildren,
      selectedChild,
      updateSelectedChildProgression,
      withRefresh,
    ]
  );

  const confirmRequestReward = React.useCallback(
    (reward: FamilyReward) => {
      if (!selectedChild) return;
      Alert.alert(
        "Spend stars?",
        `Request ${reward.title} for ${reward.star_cost} stars? A grown-up will review it.`,
        [
          { text: "Not now", style: "cancel" },
          {
            text: "Request",
            onPress: () => void requestReward(reward),
          },
        ]
      );
    },
    [requestReward, selectedChild]
  );

  const cancelRedemption = React.useCallback(
    async (redemption: RewardRedemption) => {
      if (!selectedChild || cancellingIdsRef.current.has(redemption.id)) return;
      if (!canCancelRedemption(redemption)) return;

      cancellingIdsRef.current.add(redemption.id);
      setCancellingIds((current) => new Set(current).add(redemption.id));
      setSuccessMessage(null);
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
        setSuccessMessage("Request cancelled. Stars refunded.");
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
  const isLoading = childStatus === "loading" || status === "loading";

  return (
    <View className="flex-1" style={{ backgroundColor: CREAM }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom:
            BOTTOM_NAV_BASE_HEIGHT + Math.max(insets.bottom, 12) + 88,
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 24) + 20,
        }}
        refreshControl={
          <RefreshControl
            colors={[GREEN]}
            refreshing={refreshing}
            tintColor={GREEN}
            onRefresh={() => void loadRewards("refresh")}
          />
        }
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-4xl font-black" style={{ color: INK }}>
              Rewards
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
              Request family rewards using earned stars.
            </Text>
          </View>
          <View
            className="items-center justify-center rounded-full border"
            style={{
              backgroundColor: YELLOW,
              borderColor: "#e2b94d",
              height: 58,
              width: 58,
            }}
          >
            <Text className="font-black" style={{ color: INK, fontSize: 24 }}>
              ☆
            </Text>
          </View>
        </View>

        <ChildProfileSwitcher
          className="mt-6"
          children={children}
          selectedChildId={selectedChild?.id}
          onSelect={(childId) => void selectChild(childId)}
        />

        {selectedChild ? (
          <View
            className="mt-8 rounded-[28px] border p-5"
            style={{ backgroundColor: YELLOW_SOFT, borderColor: "#eadca8" }}
          >
            <Text className="text-lg font-black" style={{ color: GREEN }}>
              Current stars
            </Text>
            <View className="mt-3 flex-row flex-wrap items-end justify-between gap-3">
              <Text
                className="font-black"
                style={{ color: INK, fontSize: 52, lineHeight: 58 }}
              >
                {selectedChild.reward_points}
              </Text>
              <Text className="mb-2 text-base font-semibold" style={{ color: MUTED }}>
                Level {selectedChild.level} · {selectedChild.xp} XP
              </Text>
            </View>
          </View>
        ) : null}

        {successMessage ? (
          <Text
            className="mt-5 rounded-2xl px-4 py-3 text-sm font-black"
            style={{ backgroundColor: SAGE, color: GREEN }}
          >
            {successMessage}
          </Text>
        ) : null}

        {isLoading ? (
          <Panel>
            <ActivityIndicator color={GREEN} />
            <Text className="mt-4 text-base font-semibold" style={{ color: MUTED }}>
              Loading rewards...
            </Text>
          </Panel>
        ) : null}

        {!selectedChild && childStatus === "ready" ? (
          <Panel>
            <Text className="text-xl font-black" style={{ color: INK }}>
              No child selected
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
              Choose or create a child profile before requesting rewards.
            </Text>
          </Panel>
        ) : null}

        {childStatus === "error" ? (
          <Panel>
            <Text className="text-xl font-black" style={{ color: INK }}>
              Could not load children
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
              {childError ?? "Try again when your connection is ready."}
            </Text>
          </Panel>
        ) : null}

        {status === "error" ? (
          <Panel>
            <Text className="text-xl font-black" style={{ color: INK }}>
              Could not load rewards
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
              {error}
            </Text>
            <PrimaryButton label="Retry" onPress={() => void loadRewards()} />
          </Panel>
        ) : null}

        {status === "ready" ? (
          <>
            <SectionTitle title="Family rewards" />
            {visibleRewards.length === 0 ? (
              <Panel>
                <Text className="text-xl font-black" style={{ color: INK }}>
                  No rewards yet
                </Text>
                <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
                  Family rewards are created from the parent web dashboard.
                </Text>
              </Panel>
            ) : (
              <View className="gap-3">
                {visibleRewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    starBalance={selectedChild?.reward_points ?? 0}
                    redemptions={redemptions}
                    error={actionErrors[`reward-${reward.id}`] ?? null}
                    isRequesting={requestingIds.has(reward.id)}
                    onRequest={() => confirmRequestReward(reward)}
                  />
                ))}
              </View>
            )}

            {redemptionSections.requested.length > 0 ? (
              <RedemptionSection
                title="Waiting for grown-up"
                redemptions={redemptionSections.requested}
                actionErrors={actionErrors}
                cancellingIds={cancellingIds}
                onCancel={(redemption) => void cancelRedemption(redemption)}
              />
            ) : null}

            {(["approved", "rejected", "cancelled"] as const).map((section) =>
              redemptionSections[section].length > 0 ? (
                <RedemptionSection
                  key={section}
                  title={redemptionLabel(section)}
                  redemptions={redemptionSections[section]}
                  actionErrors={actionErrors}
                  cancellingIds={cancellingIds}
                  onCancel={(redemption) => void cancelRedemption(redemption)}
                />
              ) : null
            )}
          </>
        ) : null}
      </ScrollView>
      <BottomNav active="rewards" />
    </View>
  );
}

function RewardCard({
  reward,
  starBalance,
  redemptions,
  error,
  isRequesting,
  onRequest,
}: {
  reward: FamilyReward;
  starBalance: number;
  redemptions: RewardRedemption[];
  error: string | null;
  isRequesting: boolean;
  onRequest(): void;
}) {
  const requestState = rewardRequestState(reward, starBalance, redemptions);
  const disabled = !requestState.canRequest || isRequesting;

  return (
    <View
      className="rounded-[28px] border p-5"
      style={{ backgroundColor: "#ffffff", borderColor: BORDER }}
    >
      <View className="flex-row items-center">
        <View
          className="items-center justify-center rounded-2xl"
          style={{ backgroundColor: YELLOW_SOFT, height: 64, width: 64 }}
        >
          <Text className="text-3xl" style={{ color: GREEN }}>
            ★
          </Text>
        </View>
        <View className="flex-1" style={{ marginLeft: 16 }}>
          <Text className="text-xl font-black" style={{ color: INK }}>
            {reward.title}
          </Text>
          <Text className="mt-1 text-sm font-black" style={{ color: GREEN }}>
            {reward.star_cost} stars · {requestState.label}
          </Text>
        </View>
      </View>
      {reward.description ? (
        <Text className="mt-4 text-base leading-6" style={{ color: MUTED }}>
          {reward.description}
        </Text>
      ) : null}
      {error ? (
        <Text className="mt-4 rounded-2xl bg-[#f9ded7] px-4 py-3 text-sm font-semibold text-[#8a3324]">
          {error}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onRequest}
        className="mt-4 items-center rounded-2xl px-5 py-4"
        style={{ backgroundColor: disabled ? "#cfdad3" : GREEN }}
      >
        {isRequesting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="font-black" style={{ color: "#ffffff" }}>
            {requestState.actionLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function RedemptionSection({
  title,
  redemptions,
  actionErrors,
  cancellingIds,
  onCancel,
}: {
  title: string;
  redemptions: RewardRedemption[];
  actionErrors: Record<string, string>;
  cancellingIds: Set<number>;
  onCancel(redemption: RewardRedemption): void;
}) {
  return (
    <View className="mt-8">
      <Text className="mb-3 text-2xl font-black" style={{ color: INK }}>
        {title}
      </Text>
      <View className="gap-3">
        {redemptions.map((redemption) => (
          <RedemptionCard
            key={redemption.id}
            redemption={redemption}
            error={actionErrors[`redemption-${redemption.id}`] ?? null}
            isCancelling={cancellingIds.has(redemption.id)}
            onCancel={() => onCancel(redemption)}
          />
        ))}
      </View>
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
    <View
      className="rounded-[28px] border bg-white p-5"
      style={{ borderColor: BORDER }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-black" style={{ color: INK }}>
            {redemption.reward_title}
          </Text>
          <Text className="mt-1 text-sm font-black" style={{ color: GREEN }}>
            {redemption.star_cost} stars · {redemptionLabel(redemption.status)}
          </Text>
        </View>
      </View>
      {redemption.reward_description ? (
        <Text className="mt-3 text-sm leading-5" style={{ color: MUTED }}>
          {redemption.reward_description}
        </Text>
      ) : null}
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
          className="mt-4 items-center rounded-2xl border px-5 py-4"
          style={{ borderColor: GREEN }}
        >
          {isCancelling ? (
            <ActivityIndicator color={GREEN} />
          ) : (
            <Text className="font-black" style={{ color: GREEN }}>
              Cancel request
            </Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="mb-3 mt-8 text-2xl font-black" style={{ color: INK }}>
      {title}
    </Text>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mt-5 items-center rounded-2xl px-5 py-4"
      style={{ backgroundColor: GREEN }}
    >
      <Text className="font-black" style={{ color: "#ffffff" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="mt-8 rounded-[28px] border bg-white p-6"
      style={{ borderColor: BORDER }}
    >
      {children}
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
