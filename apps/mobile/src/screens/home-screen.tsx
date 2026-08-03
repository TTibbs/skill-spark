import * as React from "react";
import { router } from "expo-router";
import type { ChoreAssignment, FamilyReward } from "@skill-spark/contracts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChildProfileSwitcher } from "@/children/child-profile-switcher";
import { useChildren } from "@/children/use-children";
import { BottomNav, BOTTOM_NAV_BASE_HEIGHT } from "@/navigation/bottom-nav";
import { buildHomeViewModel, type LearningCard } from "@/home/home-model";
import { useHomeDashboardData } from "@/home/use-home-dashboard-data";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";

const INK = "#21372e";
const MUTED = "#66766f";
const GREEN = "#2b5f4b";
const GREEN_DARK = "#203c32";
const SAGE = "#dceee3";
const CREAM = "#fbfcf7";
const BORDER = "#d9e5dd";
const YELLOW = "#ffd86f";
const YELLOW_SOFT = "#fff0bd";
const PURPLE = "#7b61b8";
const PURPLE_SOFT = "#eadfff";
const BLUE_SOFT = "#dcecff";
const PEACH_SOFT = "#ffe1cf";

const GAME_META: Record<
  LearningCard["route"],
  { icon: string; accent: string; badge: string; shadow: string }
> = {
  "/games/maths-meadow": {
    icon: "123",
    accent: YELLOW_SOFT,
    badge: YELLOW,
    shadow: "rgba(131, 101, 28, 0.16)",
  },
  "/games/spelling-garden": {
    icon: "ABC",
    accent: BLUE_SOFT,
    badge: "#9ac9ff",
    shadow: "rgba(44, 101, 148, 0.14)",
  },
  "/games/memory-match": {
    icon: "••",
    accent: PURPLE_SOFT,
    badge: "#c4a3ff",
    shadow: "rgba(99, 72, 160, 0.14)",
  },
  "/games/colour-critter-catch": {
    icon: "◆",
    accent: SAGE,
    badge: "#8bdbab",
    shadow: "rgba(54, 120, 80, 0.14)",
  },
};

export function HomeScreen() {
  const { children, selectedChild, status, error, reload, selectChild } =
    useChildren();
  const insets = useSafeAreaInsets();
  const dashboard = useHomeDashboardData();
  const model = selectedChild
    ? buildHomeViewModel(selectedChild, dashboard.data)
    : null;

  return (
    <View className="flex-1" style={{ backgroundColor: CREAM }}>
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          gap: 18,
          paddingBottom:
            BOTTOM_NAV_BASE_HEIGHT + Math.max(insets.bottom, 12) + 28,
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 24) + 18,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-black uppercase tracking-[2px] text-[#789086]">
              Questlings
            </Text>
            <Text
              className="mt-1 text-4xl font-black leading-[42px]"
              style={{ color: INK }}
            >
              Hi, {selectedChild?.name ?? "there"}
            </Text>
          </View>

          <ChildAvatar name={selectedChild?.name ?? "?"} size={58} />
        </View>

        <ChildProfileSwitcher
          children={children}
          selectedChildId={selectedChild?.id}
          onSelect={(childId) => void selectChild(childId)}
        />

        {status === "loading" ? (
          <Panel>
            <ActivityIndicator color={GREEN} />
            <Text
              className="mt-4 text-base font-semibold"
              style={{ color: MUTED }}
            >
              Loading children...
            </Text>
          </Panel>
        ) : null}

        {status === "error" ? (
          <Panel>
            <Text className="text-xl font-black" style={{ color: INK }}>
              Could not load children
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
              {error ?? "Try again when your connection is ready."}
            </Text>
            <PrimaryButton label="Retry" onPress={() => void reload()} />
          </Panel>
        ) : null}

        {status === "ready" && children.length === 0 ? (
          <Panel>
            <Text className="text-xl font-black" style={{ color: INK }}>
              No child profiles yet
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
              Child profiles are managed from the parent web dashboard.
            </Text>
          </Panel>
        ) : null}

        {selectedChild && model ? (
          <>
            <HeroLearningCard
              card={model.featured}
              childName={selectedChild.name}
            />

            <View className="flex-row gap-3">
              <SummaryCard
                label="Level"
                value={model.level}
                icon="🌱"
                accent={SAGE}
              />
              <SummaryCard
                label="Stars"
                value={model.stars}
                icon="★"
                accent={YELLOW_SOFT}
              />
              <SummaryCard
                label="Streak"
                value={model.streakDays}
                icon="🔥"
                accent={PEACH_SOFT}
              />
            </View>

            <SectionHeader
              title="Small games, clear goals"
              action="See all"
              onPress={() => router.push("/practice")}
            />

            <View className="gap-3">
              {model.learningCards.map((card) => (
                <LearningRow key={card.route} card={card} />
              ))}
            </View>

            <View className="flex-row gap-3">
              <QuickAccessCard
                title="Chores"
                icon="✓"
                body={chorePreviewText(model.chorePreview)}
                action="Open"
                accent={SAGE}
                onPress={() => router.push("/chores")}
              />
              <QuickAccessCard
                title="Rewards"
                icon="★"
                body={rewardPreviewText(model.rewardPreview)}
                action="Open"
                accent={YELLOW_SOFT}
                onPress={() => router.push("/rewards")}
              />
            </View>

            <SectionHeader title="Learning summary" />
            <View
              className="rounded-[34px] border p-5"
              style={{
                backgroundColor: "rgba(255,255,255,0.82)",
                borderColor: BORDER,
                boxShadow: "0 18px 42px rgba(47, 72, 61, 0.08)",
              }}
            >
              {dashboard.status === "loading" ? (
                <ActivityIndicator color={GREEN} />
              ) : null}
              {dashboard.status === "error" ? (
                <>
                  <Text className="text-base font-semibold text-[#8a3324]">
                    {dashboard.error}
                  </Text>
                  <PrimaryButton
                    label="Retry"
                    onPress={() => void dashboard.reload()}
                  />
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

function HeroLearningCard({
  card,
  childName,
}: {
  card: LearningCard;
  childName: string;
}) {
  const meta = GAME_META[card.route];

  return (
    <View
      className="overflow-hidden rounded-[40px] border p-5"
      style={{
        backgroundColor: GREEN_DARK,
        borderColor: "#315848",
        boxShadow: "0 24px 60px rgba(32, 60, 50, 0.22)",
      }}
    >
      <View
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full"
        style={{ backgroundColor: "rgba(255,216,111,0.2)" }}
      />
      <View
        className="absolute -bottom-16 left-10 h-36 w-36 rounded-full"
        style={{ backgroundColor: "rgba(139,219,171,0.18)" }}
      />

      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text
            className="text-sm font-black uppercase tracking-[2px]"
            style={{ color: "#d9eee4" }}
          >
            Today's adventure
          </Text>
          <Text
            className="mt-2 text-3xl font-black leading-9"
            style={{ color: "#ffffff" }}
          >
            Continue {card.title}
          </Text>
          <Text
            className="mt-3 text-base font-semibold leading-6"
            style={{ color: "#e6f3ed" }}
          >
            {childName} can build progress with a short, focused activity.
          </Text>
        </View>

        <View
          className="items-center justify-center rounded-[28px]"
          style={{
            backgroundColor: "rgba(255,255,255,0.14)",
            borderColor: "rgba(255,255,255,0.18)",
            borderWidth: 1,
            height: 72,
            width: 72,
          }}
        >
          <Text className="text-xl font-black" style={{ color: "#ffffff" }}>
            {meta.icon}
          </Text>
        </View>
      </View>

      <View
        className="mt-5 rounded-[24px] border p-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderColor: "rgba(255,255,255,0.16)",
        }}
      >
        <Text className="text-base font-black" style={{ color: "#ffffff" }}>
          {card.subtitle}
        </Text>
        <Text
          className="mt-1 text-sm font-semibold"
          style={{ color: "#d8eee4" }}
        >
          {card.progressLabel}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(card.route)}
        className="mt-5 flex-row items-center justify-center rounded-[24px] border px-5 py-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.12)",
          borderColor: "rgba(255,255,255,0.24)",
        }}
      >
        <Text className="text-base font-black" style={{ color: "#ffffff" }}>
          Start playing
        </Text>
        <Text className="ml-2 text-lg font-black" style={{ color: "#ffffff" }}>
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
  accent,
}: {
  icon: string;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <View
      className="flex-1 rounded-[30px] border px-4 py-3"
      style={{
        backgroundColor: accent,
        borderColor: "rgba(35, 55, 47, 0.08)",
      }}
    >
      <Text className="text-xl">{icon}</Text>
      <Text
        className="mt-2 text-2xl font-black"
        style={{ color: INK, fontVariant: ["tabular-nums"] }}
      >
        {value}
      </Text>
      <Text className="text-xs font-bold" style={{ color: MUTED }}>
        {label}
      </Text>
    </View>
  );
}

function LearningRow({ card }: { card: LearningCard }) {
  const meta = GAME_META[card.route];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(card.route)}
      className="flex-row items-center rounded-[32px] border p-4"
      style={{
        backgroundColor: meta.accent,
        borderColor: "rgba(35, 55, 47, 0.08)",
        boxShadow: `0 12px 28px ${meta.shadow}`,
      }}
    >
      <View
        className="items-center justify-center rounded-[22px]"
        style={{ backgroundColor: meta.badge, height: 58, width: 58 }}
      >
        <Text className="text-base font-black" style={{ color: INK }}>
          {meta.icon}
        </Text>
      </View>
      <View className="ml-5 flex-1">
        <Text className="text-lg font-black" style={{ color: INK }}>
          {card.title}
        </Text>
        <Text className="mt-1 text-sm font-semibold" style={{ color: MUTED }}>
          {card.subtitle}
        </Text>
        <Text className="mt-2 text-sm font-black" style={{ color: GREEN }}>
          {card.progressLabel}
        </Text>
      </View>
      <View className="pl-3">
        <Text className="text-lg font-black" style={{ color: GREEN }}>
          ›
        </Text>
      </View>
    </Pressable>
  );
}

function QuickAccessCard({
  title,
  icon,
  body,
  action,
  accent,
  onPress,
}: {
  title: string;
  icon: string;
  body: string;
  action: string;
  accent: string;
  onPress(): void;
}) {
  return (
    <View
      className="flex-1 rounded-[32px] border p-4"
      style={{
        backgroundColor: accent,
        borderColor: "rgba(35, 55, 47, 0.08)",
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-black" style={{ color: INK }}>
          {title}
        </Text>
        <Text className="text-xl font-black" style={{ color: GREEN }}>
          {icon}
        </Text>
      </View>
      <Text
        className="mt-3 min-h-12 text-sm font-semibold leading-5"
        style={{ color: MUTED }}
      >
        {body}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="mt-4 items-center rounded-2xl border px-4 py-3"
        style={{ borderColor: GREEN, backgroundColor: "rgba(255,255,255,0.5)" }}
      >
        <Text className="font-black" style={{ color: GREEN }}>
          {action}
        </Text>
      </Pressable>
    </View>
  );
}

function SubjectProgress({
  label,
  value,
  percent,
}: {
  label: string;
  value: string;
  percent: number;
}) {
  return (
    <View className="py-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-black" style={{ color: INK }}>
          {label}
        </Text>
        <Text className="text-sm font-semibold" style={{ color: MUTED }}>
          {value}
        </Text>
      </View>
      <View
        className="mt-3 overflow-hidden rounded-full"
        style={{ backgroundColor: "#e5eee8", height: 10 }}
      >
        <View
          className="rounded-full"
          style={{ backgroundColor: GREEN, height: 10, width: `${percent}%` }}
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
    <View className="mt-2 flex-row items-center justify-between">
      <Text className="text-xl font-black" style={{ color: INK }}>
        {title}
      </Text>
      {action && onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          <Text className="text-base font-black" style={{ color: GREEN }}>
            {action} ›
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ChildAvatar({
  name,
  size,
}: {
  name: string;
  size: number;
}) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        backgroundColor: YELLOW,
        borderColor: "#e2b94d",
        borderWidth: 1,
        height: size,
        width: size,
      }}
    >
      <Text
        className="font-black"
        style={{ color: INK, fontSize: size * 0.34 }}
      >
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
      style={{ backgroundColor: GREEN }}
    >
      <Text className="font-black text-white">{label}</Text>
    </Pressable>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="rounded-[28px] border p-6"
      style={{
        backgroundColor: "rgba(255,255,255,0.84)",
        borderColor: BORDER,
      }}
    >
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
