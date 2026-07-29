import * as React from "react";
import { router } from "expo-router";
import type { ChoreAssignment, FamilyReward } from "@skill-spark/contracts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChildren } from "@/children/use-children";
import { BottomNav, BOTTOM_NAV_BASE_HEIGHT } from "@/navigation/bottom-nav";
import { buildHomeViewModel, type LearningCard } from "@/home/home-model";
import { useHomeDashboardData } from "@/home/use-home-dashboard-data";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#f4efff";

export function HomeScreen() {
  const { children, selectedChild, status, error, reload, selectChild } =
    useChildren();
  const insets = useSafeAreaInsets();
  const dashboard = useHomeDashboardData();
  const model = selectedChild
    ? buildHomeViewModel(selectedChild, dashboard.data)
    : null;

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          paddingBottom: BOTTOM_NAV_BASE_HEIGHT + Math.max(insets.bottom, 12) + 88,
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 24) + 20,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <ChildAvatar name={selectedChild?.name ?? "?"} size={76} />
            <View style={{ marginLeft: 14 }}>
              <Text className="text-4xl font-black text-[#243c32]">
                Hi, {selectedChild?.name ?? "there"}
              </Text>
              <Text className="mt-2 text-base font-semibold text-[#5c6f65]">
                Ready for today's learning adventure?
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
          >
            {children.map((child) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedChild?.id === child.id }}
                key={child.id}
                onPress={() => void selectChild(child.id)}
                className="flex-row items-center rounded-full border bg-white px-4 py-3"
                style={{
                  borderColor:
                    selectedChild?.id === child.id ? PURPLE : "#d8cdb8",
                }}
              >
                <ChildAvatar name={child.name} size={30} />
                <Text
                  className="text-base font-black text-[#243c32]"
                  style={{ marginLeft: 8 }}
                >
                  {child.name}
                </Text>
                {selectedChild?.id === child.id ? (
                  <Text
                    className="text-base font-black"
                    style={{ color: PURPLE, marginLeft: 8 }}
                  >
                    ✓
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
          <View
            className="items-center justify-center rounded-full border border-[#d8cdb8] bg-white"
            style={{ height: 52, width: 52 }}
          >
            <Text className="text-2xl">♢</Text>
          </View>
        </View>

        {status === "loading" ? (
          <Panel>
            <ActivityIndicator color={PURPLE} />
            <Text className="mt-4 text-base font-semibold text-[#5c6f65]">
              Loading children...
            </Text>
          </Panel>
        ) : null}

        {status === "error" ? (
          <Panel>
            <Text className="text-xl font-black text-[#243c32]">
              Could not load children
            </Text>
            <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
              {error ?? "Try again when your connection is ready."}
            </Text>
            <PrimaryButton label="Retry" onPress={() => void reload()} />
          </Panel>
        ) : null}

        {status === "ready" && children.length === 0 ? (
          <Panel>
            <Text className="text-xl font-black text-[#243c32]">
              No child profiles yet
            </Text>
            <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
              Child profiles are managed from the parent web dashboard.
            </Text>
          </Panel>
        ) : null}

        {selectedChild && model ? (
          <>
            <FeaturedLearningCard card={model.featured} />

            <View className="mt-5 flex-row gap-3">
              <SummaryCard icon="▣" label="Level" value={model.level} />
              <SummaryCard icon="◖" label="day streak" value={model.streakDays} />
              <SummaryCard icon="★" label="stars" value={model.stars} />
            </View>

            <SectionHeader
              title="Pick up where you left off"
              action="See all"
              onPress={() => router.push("/learn")}
            />
            <View className="mt-3 gap-3">
              {model.learningCards.map((card) => (
                <LearningRow key={card.route} card={card} />
              ))}
            </View>

            <View className="mt-8 flex-row gap-3">
              <QuickAccessCard
                title="Chores"
                body={chorePreviewText(model.chorePreview)}
                action="Open"
                onPress={() => router.push("/chores")}
              />
              <QuickAccessCard
                title="Rewards"
                body={rewardPreviewText(model.rewardPreview)}
                action="Open"
                onPress={() => router.push("/rewards")}
              />
            </View>

            <SectionHeader title="Learning summary" />
            <View className="mt-3 rounded-[28px] border border-[#d8cdb8] bg-white p-5">
              {dashboard.status === "loading" ? (
                <ActivityIndicator color={PURPLE} />
              ) : null}
              {dashboard.status === "error" ? (
                <>
                  <Text className="text-base font-semibold text-[#8a3324]">
                    {dashboard.error}
                  </Text>
                  <PrimaryButton label="Retry" onPress={() => void dashboard.reload()} />
                </>
              ) : null}
              {dashboard.status !== "error"
                ? model.subjectSummaries.map((summary) => (
                    <SubjectProgress key={summary.label} {...summary} />
                  ))
                : null}
            </View>
          </>
        ) : null}
      </ScrollView>
      <BottomNav active="home" />
    </View>
  );
}

function FeaturedLearningCard({ card }: { card: LearningCard }) {
  return (
    <View
      className="mt-8 rounded-[28px] border p-5"
      style={{ backgroundColor: PURPLE_LIGHT, borderColor: "#d7c8ff" }}
    >
      <View className="flex-row items-center">
        <View
          className="items-center justify-center rounded-3xl"
          style={{ backgroundColor: "#e4d8ff", height: 76, width: 76 }}
        >
          <Text className="text-3xl">✦</Text>
        </View>
        <View className="flex-1" style={{ marginLeft: 18 }}>
          <Text className="text-lg font-black" style={{ color: PURPLE }}>
            Continue learning
          </Text>
          <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
            {card.subtitle}
          </Text>
        </View>
      </View>
      <Text className="mt-5 text-3xl font-black text-[#243c32]">
        {card.title}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(card.route)}
        className="mt-4 flex-row items-center justify-center rounded-2xl px-5 py-4"
        style={{ backgroundColor: PURPLE }}
      >
        <Text className="text-base font-black text-white">Continue</Text>
        <Text
          className="text-base font-black text-white"
          style={{ marginLeft: 8 }}
        >
          ›
        </Text>
      </Pressable>
    </View>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <View className="flex-1 rounded-[28px] border border-[#d8cdb8] bg-white p-4">
      <Text className="text-3xl">{icon}</Text>
      <Text className="mt-2 text-2xl font-black text-[#243c32]">{value}</Text>
      <Text className="text-sm font-semibold text-[#5c6f65]">{label}</Text>
    </View>
  );
}

function LearningRow({ card }: { card: LearningCard }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(card.route)}
      className="flex-row items-center rounded-[28px] border border-[#d8cdb8] bg-white p-4"
    >
      <View
        className="items-center justify-center rounded-2xl"
        style={{ backgroundColor: PURPLE_LIGHT, height: 64, width: 64 }}
      >
        <Text className="text-2xl">✎</Text>
      </View>
      <View className="flex-1" style={{ marginLeft: 14 }}>
        <Text className="text-lg font-black text-[#243c32]">{card.title}</Text>
        <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">
          {card.subtitle}
        </Text>
      </View>
      <Text className="text-sm font-black" style={{ color: PURPLE }}>
        {card.progressLabel}
      </Text>
    </Pressable>
  );
}

function QuickAccessCard({
  title,
  body,
  action,
  onPress,
}: {
  title: string;
  body: string;
  action: string;
  onPress(): void;
}) {
  return (
    <View className="flex-1 rounded-[28px] border border-[#d8cdb8] bg-white p-4">
      <Text className="text-lg font-black text-[#243c32]">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-[#5c6f65]">{body}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="mt-4 items-center rounded-2xl border px-4 py-3"
        style={{ borderColor: PURPLE }}
      >
        <Text className="font-black" style={{ color: PURPLE }}>
          {action}
        </Text>
      </Pressable>
    </View>
  );
}

function SubjectProgress({ label, value, percent }: {
  label: string;
  value: string;
  percent: number;
}) {
  return (
    <View className="mt-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-black text-[#243c32]">{label}</Text>
        <Text className="text-sm font-semibold text-[#5c6f65]">{value}</Text>
      </View>
      <View
        className="mt-2 rounded-full"
        style={{ backgroundColor: "#ebe3ff", height: 8 }}
      >
        <View
          className="rounded-full"
          style={{ backgroundColor: PURPLE, height: 8, width: `${percent}%` }}
        />
      </View>
    </View>
  );
}

function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View className="mt-8 flex-row items-center justify-between">
      <Text className="text-xl font-black text-[#243c32]">{title}</Text>
      {action && onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          <Text className="text-base font-black" style={{ color: PURPLE }}>
            {action} ›
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ChildAvatar({ name, size }: { name: string; size: number }) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{ backgroundColor: PURPLE_LIGHT, height: size, width: size }}
    >
      <Text className="font-black" style={{ color: PURPLE, fontSize: size * 0.34 }}>
        {name.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mt-5 items-center rounded-2xl px-5 py-4"
      style={{ backgroundColor: PURPLE }}
    >
      <Text className="font-black text-white">{label}</Text>
    </Pressable>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <View className="mt-10 rounded-[28px] border border-[#d8cdb8] bg-white p-6">
      {children}
    </View>
  );
}

function chorePreviewText(assignments: ChoreAssignment[]) {
  if (assignments.length === 0) return "No active chores right now.";
  const submitted = assignments.filter((item) => item.status === "submitted").length;
  if (submitted > 0) return `${submitted} waiting for grown-up approval.`;
  return `${assignments.length} chore${assignments.length === 1 ? "" : "s"} ready.`;
}

function rewardPreviewText(rewards: FamilyReward[]) {
  if (rewards.length === 0) return "No family rewards available yet.";
  return `${rewards.length} reward${rewards.length === 1 ? "" : "s"} available.`;
}
