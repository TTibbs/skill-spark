import * as React from "react";
import { RefreshControl } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChildProfileSwitcher } from "@/children/child-profile-switcher";
import { useChildren } from "@/children/use-children";
import { useInsightsData } from "@/insights/use-insights-data";
import { BottomNav, BOTTOM_NAV_BASE_HEIGHT } from "@/navigation/bottom-nav";
import {
  buildPracticeActivities,
  recommendPracticeActivities,
  type PracticeActivity,
} from "@/practice/practice-model";
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

const ACTIVITY_META: Record<
  PracticeActivity["key"],
  { accent: string; badge: string; text: string; bar: string }
> = {
  maths: {
    accent: YELLOW_SOFT,
    badge: YELLOW,
    text: INK,
    bar: "#d7a932",
  },
  memory: {
    accent: PURPLE_SOFT,
    badge: "#c4a3ff",
    text: INK,
    bar: PURPLE,
  },
  spelling: {
    accent: BLUE_SOFT,
    badge: "#9ac9ff",
    text: INK,
    bar: "#4f8fbd",
  },
  shapes: {
    accent: SAGE,
    badge: "#8bdbab",
    text: INK,
    bar: GREEN,
  },
};

export function PracticeScreen() {
  const { children, selectedChild, selectChild, status, error, reload } =
    useChildren();
  const insights = useInsightsData();
  const insets = useSafeAreaInsets();
  const activities = React.useMemo(
    () => buildPracticeActivities(insights.stats),
    [insights.stats]
  );
  const recommendations = React.useMemo(
    () => recommendPracticeActivities(activities, 2),
    [activities]
  );
  const hasActivity = activities.some((activity) => activity.games > 0);

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
            refreshing={insights.status === "loading"}
            tintColor={GREEN}
            onRefresh={() => void insights.reload()}
          />
        }
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-4xl font-black" style={{ color: INK }}>
              Practice
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
              Pick an activity and keep learning moving.
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
            <Text className="text-2xl" style={{ color: INK }}>
              ✎
            </Text>
          </View>
        </View>

        <ChildProfileSwitcher
          className="mt-6"
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
              No child selected
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
              Child profiles are managed from the parent web dashboard.
            </Text>
          </Panel>
        ) : null}

        {selectedChild ? (
          <>
            <View
              className="mt-8 rounded-[28px] border p-5"
              style={{ backgroundColor: GREEN_DARK, borderColor: "#315848" }}
            >
              <Text className="text-lg font-black" style={{ color: "#ffffff" }}>
                Recommended next
              </Text>
              <Text
                className="mt-2 text-base leading-6"
                style={{ color: "#d7e8df" }}
              >
                {hasActivity
                  ? "Based on lower accuracy from existing stats."
                  : "A simple starter path until there is activity history."}
              </Text>
              <View className="mt-4 gap-3">
                {recommendations.map((activity) => (
                  <RecommendationRow key={activity.key} activity={activity} />
                ))}
              </View>
            </View>

            {insights.status === "loading" ? (
              <View className="mt-5 flex-row items-center rounded-2xl bg-[#eaf3ed] p-4">
                <ActivityIndicator color={GREEN} />
                <Text
                  className="text-sm font-semibold"
                  style={{ color: MUTED, marginLeft: 10 }}
                >
                  Loading activity stats...
                </Text>
              </View>
            ) : null}

            {insights.status === "error" ? (
              <View className="mt-5 rounded-2xl bg-[#f9ded7] p-4">
                <Text className="text-base font-black text-[#8a3324]">
                  Stats could not be loaded.
                </Text>
                <Text className="mt-1 text-sm font-semibold text-[#8a3324]">
                  You can still open every activity.
                </Text>
              </View>
            ) : null}

            {!hasActivity && insights.status === "ready" ? (
              <View
                className="mt-5 rounded-2xl border bg-white p-4"
                style={{ borderColor: BORDER }}
              >
                <Text className="text-base font-black" style={{ color: INK }}>
                  No activity history yet
                </Text>
                <Text className="mt-1 text-sm leading-5" style={{ color: MUTED }}>
                  Play a game and this page will show real games played and
                  accuracy.
                </Text>
              </View>
            ) : null}

            <SectionTitle title="All activities" />
            <View className="gap-3">
              {activities.map((activity) => (
                <ActivityCard key={activity.key} activity={activity} />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
      <BottomNav active="practice" />
    </View>
  );
}

function RecommendationRow({ activity }: { activity: PracticeActivity }) {
  const meta = ACTIVITY_META[activity.key];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(activity.route)}
      className="flex-row items-center rounded-2xl border p-4"
      style={{
        backgroundColor: "rgba(255,255,255,0.12)",
        borderColor: "rgba(255,255,255,0.16)",
      }}
    >
      <ActivityIcon activity={activity} size={48} />
      <View className="flex-1" style={{ marginLeft: 14 }}>
        <Text className="text-base font-black" style={{ color: "#ffffff" }}>
          {activity.title}
        </Text>
        <Text
          className="mt-1 text-sm font-semibold"
          style={{ color: "#d8eee4" }}
        >
          {activity.games > 0
            ? `${activity.accuracy}% accuracy`
            : "Ready to begin"}
        </Text>
      </View>
      <Text className="text-2xl font-black" style={{ color: meta.badge }}>
        ›
      </Text>
    </Pressable>
  );
}

function ActivityCard({ activity }: { activity: PracticeActivity }) {
  const meta = ACTIVITY_META[activity.key];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(activity.route)}
      className="rounded-[28px] border p-5"
      style={{
        backgroundColor: meta.accent,
        borderColor: "rgba(35, 55, 47, 0.08)",
      }}
    >
      <View className="flex-row items-center">
        <ActivityIcon activity={activity} size={68} />
        <View className="flex-1" style={{ marginLeft: 16 }}>
          <Text className="text-xl font-black" style={{ color: INK }}>
            {activity.title}
          </Text>
          <Text className="mt-1 text-sm font-semibold" style={{ color: MUTED }}>
            {activity.ageContext}
          </Text>
        </View>
      </View>
      <Text className="mt-4 text-base leading-6" style={{ color: MUTED }}>
        {activity.description}
      </Text>
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-sm font-black" style={{ color: GREEN }}>
          {activity.games > 0
            ? `${activity.games} game${activity.games === 1 ? "" : "s"}`
            : "No games yet"}
        </Text>
        <Text className="text-sm font-black" style={{ color: MUTED }}>
          {activity.games > 0
            ? `${activity.accuracy}% accuracy`
            : activity.statLabel}
        </Text>
      </View>
      <ProgressBar
        activity={activity}
        percent={activity.games > 0 ? activity.accuracy : 0}
      />
    </Pressable>
  );
}

function ActivityIcon({
  activity,
  size,
}: {
  activity: PracticeActivity;
  size: number;
}) {
  const meta = ACTIVITY_META[activity.key];

  return (
    <View
      className="items-center justify-center rounded-2xl"
      style={{ backgroundColor: meta.badge, height: size, width: size }}
    >
      <Text
        className="font-black"
        style={{
          color: meta.text,
          fontSize: activity.icon.length > 1 ? 18 : 28,
        }}
      >
        {activity.icon}
      </Text>
    </View>
  );
}

function ProgressBar({
  activity,
  percent,
}: {
  activity: PracticeActivity;
  percent: number;
}) {
  const meta = ACTIVITY_META[activity.key];

  return (
    <View
      className="mt-3 overflow-hidden rounded-full"
      style={{ backgroundColor: "rgba(255,255,255,0.58)", height: 8 }}
    >
      <View
        className="rounded-full"
        style={{ backgroundColor: meta.bar, height: 8, width: `${percent}%` }}
      />
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
