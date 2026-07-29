import * as React from "react";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChildren } from "@/children/use-children";
import {
  buildInsightsViewModel,
  formatLearningTime,
  type InsightSubject,
} from "@/insights/insights-model";
import { useInsightsData } from "@/insights/use-insights-data";
import { BottomNav, BOTTOM_NAV_BASE_HEIGHT } from "@/navigation/bottom-nav";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#f4efff";

export function InsightsScreen() {
  const { children, selectedChild, selectChild, status, error, reload } =
    useChildren();
  const insets = useSafeAreaInsets();
  const insights = useInsightsData();
  const model = selectedChild
    ? buildInsightsViewModel(selectedChild, insights.stats)
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
            <Text className="text-4xl font-black text-[#243c32]">Insights</Text>
            <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
              See how learning is growing across each activity.
            </Text>
          </View>
          <View
            className="items-center justify-center rounded-full border border-[#d8cdb8] bg-white"
            style={{ height: 58, width: 58 }}
          >
            <Text className="text-2xl">▥</Text>
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
              No child profiles yet
            </Text>
            <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
              Create child profiles from the parent web dashboard, then return
              here to follow learning progress.
            </Text>
          </Panel>
        ) : null}

        {selectedChild && model ? (
          <>
            <View className="mt-8 rounded-[28px] border border-[#d8cdb8] bg-white p-5">
              <View className="flex-row items-center">
                <Avatar label={model.child.name} size={70} />
                <View className="flex-1" style={{ marginLeft: 16 }}>
                  <Text className="text-2xl font-black text-[#243c32]">
                    {model.child.name}
                  </Text>
                  <Text className="mt-1 text-base font-semibold text-[#5c6f65]">
                    Age {model.child.age}
                  </Text>
                </View>
              </View>
              <View className="mt-5 flex-row gap-3">
                <MiniMetric label="Level" value={model.level} />
                <MiniMetric label="XP" value={model.xp} />
                <MiniMetric label="Stars" value={model.stars} />
              </View>
            </View>

            {insights.status === "loading" ? (
              <Panel>
                <ActivityIndicator color={PURPLE} />
                <Text className="mt-4 text-base font-semibold text-[#5c6f65]">
                  Loading insights...
                </Text>
              </Panel>
            ) : null}

            {insights.status === "error" ? (
              <Panel>
                <Text className="text-xl font-black text-[#243c32]">
                  Could not load insights
                </Text>
                <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
                  {insights.error}
                </Text>
                <PrimaryButton label="Refresh" onPress={() => void insights.reload()} />
              </Panel>
            ) : null}

            {insights.status === "ready" ? (
              <>
                <View className="mt-5 flex-row gap-3">
                  <SummaryCard label="Games" value={model.totalGames} />
                  <SummaryCard
                    label="Accuracy"
                    value={`${model.overallAccuracy}%`}
                  />
                  <SummaryCard
                    label="Time"
                    value={formatLearningTime(model.learningTimeSecs)}
                  />
                </View>

                {!model.hasActivity ? (
                  <Panel>
                    <Text className="text-xl font-black text-[#243c32]">
                      No learning activity yet
                    </Text>
                    <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
                      Complete a learning game and this screen will show real
                      progress for each subject.
                    </Text>
                  </Panel>
                ) : (
                  <View className="mt-8 rounded-[28px] border p-5" style={{
                    backgroundColor: PURPLE_LIGHT,
                    borderColor: "#d7c8ff",
                  }}>
                    <Text className="text-lg font-black" style={{ color: PURPLE }}>
                      Learning focus
                    </Text>
                    <View className="mt-4 flex-row gap-3">
                      <FocusCard
                        label="Strongest"
                        subject={model.strongestSubject}
                      />
                      <FocusCard
                        label="Practice"
                        subject={model.practiceSubject}
                      />
                    </View>
                  </View>
                )}

                <SectionTitle title="Subjects" />
                <View className="gap-3">
                  {model.subjects.map((subject) => (
                    <SubjectCard key={subject.key} subject={subject} />
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : null}
      </ScrollView>
      <BottomNav active="insights" />
    </View>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <View className="flex-1 rounded-[24px] border border-[#d8cdb8] bg-white p-4">
      <Text className="text-2xl font-black text-[#243c32]">{value}</Text>
      <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">{label}</Text>
    </View>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 rounded-2xl" style={{ backgroundColor: PURPLE_LIGHT, padding: 14 }}>
      <Text className="text-xl font-black text-[#243c32]">{value}</Text>
      <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">{label}</Text>
    </View>
  );
}

function FocusCard({
  label,
  subject,
}: {
  label: string;
  subject: InsightSubject | null;
}) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-4">
      <Text className="text-sm font-black" style={{ color: PURPLE }}>
        {label}
      </Text>
      <Text className="mt-2 text-lg font-black text-[#243c32]">
        {subject?.label ?? "Not enough data"}
      </Text>
      <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">
        {subject ? `${subject.accuracy}% accuracy` : "Play first"}
      </Text>
    </View>
  );
}

function SubjectCard({ subject }: { subject: InsightSubject }) {
  return (
    <View className="rounded-[28px] border border-[#d8cdb8] bg-white p-5">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-black text-[#243c32]">
            {subject.label}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">
            {subject.games} game{subject.games === 1 ? "" : "s"}
          </Text>
        </View>
        <Text className="text-xl font-black" style={{ color: PURPLE }}>
          {subject.accuracy}%
        </Text>
      </View>
      <ProgressBar percent={subject.accuracy} />
      <View className="mt-4 flex-row gap-3">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-[#5c6f65]">
            {subject.primaryMetric}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-right text-sm font-semibold text-[#5c6f65]">
            {subject.secondaryMetric}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <View
      className="mt-4 overflow-hidden rounded-full"
      style={{ backgroundColor: "#ebe3ff", height: 10 }}
    >
      <View
        className="rounded-full"
        style={{ backgroundColor: PURPLE, height: 10, width: `${percent}%` }}
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
