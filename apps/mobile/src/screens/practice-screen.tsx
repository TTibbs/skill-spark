import * as React from "react";
import { RefreshControl } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChildren } from "@/children/use-children";
import { useInsightsData } from "@/insights/use-insights-data";
import { BottomNav, BOTTOM_NAV_BASE_HEIGHT } from "@/navigation/bottom-nav";
import {
  buildPracticeActivities,
  recommendPracticeActivities,
  type PracticeActivity,
} from "@/practice/practice-model";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#f4efff";

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
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          paddingBottom: BOTTOM_NAV_BASE_HEIGHT + Math.max(insets.bottom, 12) + 88,
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 24) + 20,
        }}
        refreshControl={
          <RefreshControl
            colors={[PURPLE]}
            refreshing={insights.status === "loading"}
            tintColor={PURPLE}
            onRefresh={() => void insights.reload()}
          />
        }
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-4xl font-black text-[#243c32]">Practice</Text>
            <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
              Pick an activity and keep learning moving.
            </Text>
          </View>
          <View
            className="items-center justify-center rounded-full border border-[#d8cdb8] bg-white"
            style={{ height: 58, width: 58 }}
          >
            <Text className="text-2xl">✎</Text>
          </View>
        </View>

        <View className="mt-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
          >
            {children.map((child) => {
              const selected = selectedChild?.id === child.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={child.id}
                  onPress={() => void selectChild(child.id)}
                  className="flex-row items-center rounded-full border bg-white px-4 py-3"
                  style={{ borderColor: selected ? PURPLE : "#d8cdb8" }}
                >
                  <Avatar label={child.name} size={32} />
                  <Text
                    className="text-base font-black text-[#243c32]"
                    style={{ marginLeft: 8 }}
                  >
                    {child.name}
                  </Text>
                  {selected ? (
                    <Text
                      className="text-base font-black"
                      style={{ color: PURPLE, marginLeft: 8 }}
                    >
                      ✓
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
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
              No child selected
            </Text>
            <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
              Child profiles are managed from the parent web dashboard.
            </Text>
          </Panel>
        ) : null}

        {selectedChild ? (
          <>
            <View
              className="mt-8 rounded-[28px] border p-5"
              style={{ backgroundColor: PURPLE_LIGHT, borderColor: "#d7c8ff" }}
            >
              <Text className="text-lg font-black" style={{ color: PURPLE }}>
                Recommended next
              </Text>
              <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
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
              <View className="mt-5 flex-row items-center rounded-2xl bg-[#f4efff] p-4">
                <ActivityIndicator color={PURPLE} />
                <Text
                  className="text-sm font-semibold text-[#5c6f65]"
                  style={{ marginLeft: 10 }}
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
              <View className="mt-5 rounded-2xl border border-[#d8cdb8] bg-white p-4">
                <Text className="text-base font-black text-[#243c32]">
                  No activity history yet
                </Text>
                <Text className="mt-1 text-sm leading-5 text-[#5c6f65]">
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
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(activity.route)}
      className="flex-row items-center rounded-2xl bg-white p-4"
    >
      <ActivityIcon activity={activity} size={48} />
      <View className="flex-1" style={{ marginLeft: 14 }}>
        <Text className="text-base font-black text-[#243c32]">
          {activity.title}
        </Text>
        <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">
          {activity.games > 0
            ? `${activity.accuracy}% accuracy`
            : "Ready to begin"}
        </Text>
      </View>
      <Text className="text-2xl font-black" style={{ color: PURPLE }}>
        ›
      </Text>
    </Pressable>
  );
}

function ActivityCard({ activity }: { activity: PracticeActivity }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(activity.route)}
      className="rounded-[28px] border border-[#d8cdb8] bg-white p-5"
    >
      <View className="flex-row items-center">
        <ActivityIcon activity={activity} size={68} />
        <View className="flex-1" style={{ marginLeft: 16 }}>
          <Text className="text-xl font-black text-[#243c32]">
            {activity.title}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">
            {activity.ageContext}
          </Text>
        </View>
      </View>
      <Text className="mt-4 text-base leading-6 text-[#5c6f65]">
        {activity.description}
      </Text>
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-sm font-black" style={{ color: PURPLE }}>
          {activity.games > 0
            ? `${activity.games} game${activity.games === 1 ? "" : "s"}`
            : "No games yet"}
        </Text>
        <Text className="text-sm font-black text-[#5c6f65]">
          {activity.games > 0 ? `${activity.accuracy}% accuracy` : activity.statLabel}
        </Text>
      </View>
      <ProgressBar percent={activity.games > 0 ? activity.accuracy : 0} />
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
  return (
    <View
      className="items-center justify-center rounded-2xl"
      style={{ backgroundColor: PURPLE_LIGHT, height: size, width: size }}
    >
      <Text
        className="font-black"
        style={{ color: PURPLE, fontSize: activity.icon.length > 1 ? 18 : 28 }}
      >
        {activity.icon}
      </Text>
    </View>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <View
      className="mt-3 overflow-hidden rounded-full"
      style={{ backgroundColor: "#ebe3ff", height: 8 }}
    >
      <View
        className="rounded-full"
        style={{ backgroundColor: PURPLE, height: 8, width: `${percent}%` }}
      />
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="mb-3 mt-8 text-2xl font-black text-[#243c32]">
      {title}
    </Text>
  );
}

function Avatar({ label, size }: { label: string; size: number }) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{ backgroundColor: PURPLE_LIGHT, height: size, width: size }}
    >
      <Text className="font-black" style={{ color: PURPLE, fontSize: size * 0.34 }}>
        {label.slice(0, 1).toUpperCase()}
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
    <View className="mt-8 rounded-[28px] border border-[#d8cdb8] bg-white p-6">
      {children}
    </View>
  );
}
