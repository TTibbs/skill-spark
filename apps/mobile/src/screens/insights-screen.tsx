import * as React from "react";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChildProfileSwitcher } from "@/children/child-profile-switcher";
import { useChildren } from "@/children/use-children";
import {
  buildInsightsViewModel,
  formatLearningTime,
  type InsightSubject,
} from "@/insights/insights-model";
import { useInsightsData } from "@/insights/use-insights-data";
import { BottomNav, BOTTOM_NAV_BASE_HEIGHT } from "@/navigation/bottom-nav";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";

const INK = "#21372e";
const MUTED = "#66766f";
const GREEN = "#2b5f4b";
const CREAM = "#fbfcf7";
const BORDER = "#d9e5dd";
const YELLOW = "#ffd86f";
const YELLOW_SOFT = "#fff0bd";
const SAGE = "#dceee3";
const BLUE_SOFT = "#dcecff";

export function InsightsScreen() {
  const { children, selectedChild, selectChild, status, error, reload } =
    useChildren();
  const insets = useSafeAreaInsets();
  const insights = useInsightsData();
  const model = selectedChild
    ? buildInsightsViewModel(selectedChild, insights.stats)
    : null;

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
              Insights
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
              See how learning is growing across each activity.
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
              ▥
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
            <Text className="mt-4 text-base font-semibold" style={{ color: MUTED }}>
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
              Create child profiles from the parent web dashboard, then return
              here to follow learning progress.
            </Text>
          </Panel>
        ) : null}

        {selectedChild && model ? (
          <>
            {insights.status === "loading" ? (
              <Panel>
                <ActivityIndicator color={GREEN} />
                <Text
                  className="mt-4 text-base font-semibold"
                  style={{ color: MUTED }}
                >
                  Loading insights...
                </Text>
              </Panel>
            ) : null}

            {insights.status === "error" ? (
              <Panel>
                <Text className="text-xl font-black" style={{ color: INK }}>
                  Could not load insights
                </Text>
                <Text
                  className="mt-2 text-base leading-6"
                  style={{ color: MUTED }}
                >
                  {insights.error}
                </Text>
                <PrimaryButton
                  label="Refresh"
                  onPress={() => void insights.reload()}
                />
              </Panel>
            ) : null}

            {insights.status === "ready" ? (
              <>
                <OverviewCard model={model} />

                {!model.hasActivity ? (
                  <Panel>
                    <Text className="text-xl font-black" style={{ color: INK }}>
                      No learning activity yet
                    </Text>
                    <Text
                      className="mt-2 text-base leading-6"
                      style={{ color: MUTED }}
                    >
                      Complete a learning game and this screen will show real
                      progress for each subject.
                    </Text>
                  </Panel>
                ) : (
                  <View
                    className="mt-8 rounded-[28px] border p-5"
                    style={{
                      backgroundColor: SAGE,
                      borderColor: "#c6ddcf",
                    }}
                  >
                    <Text
                      className="text-lg font-black"
                      style={{ color: GREEN }}
                    >
                      Learning focus
                    </Text>
                    <Text
                      className="mt-1 text-sm font-semibold"
                      style={{ color: MUTED }}
                    >
                      A quick read on where things are strongest and where to
                      practise next.
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

type InsightsScreenModel = ReturnType<typeof buildInsightsViewModel>;

function OverviewCard({ model }: { model: InsightsScreenModel }) {
  return (
    <View
      className="mt-8 rounded-[30px] border p-5"
      style={{
        backgroundColor: "#ffffff",
        borderColor: BORDER,
        boxShadow: "0 16px 34px rgba(47, 72, 61, 0.08)",
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-black" style={{ color: INK }}>
            Overview
          </Text>
          <Text className="mt-1 text-sm font-semibold" style={{ color: MUTED }}>
            Level {model.level} · {model.stars} stars · {model.xp} XP
          </Text>
        </View>
        <View
          className="items-center justify-center rounded-2xl"
          style={{ backgroundColor: YELLOW_SOFT, height: 48, width: 48 }}
        >
          <Text className="text-xl font-black" style={{ color: GREEN }}>
            ★
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row gap-3">
        <SummaryCard label="Games" value={model.totalGames} accent={SAGE} />
        <SummaryCard
          label="Accuracy"
          value={`${model.overallAccuracy}%`}
          accent={YELLOW_SOFT}
        />
        <SummaryCard
          label="Time"
          value={formatLearningTime(model.learningTimeSecs)}
          accent={BLUE_SOFT}
        />
      </View>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <View
      className="flex-1 rounded-[22px] px-4 py-4"
      style={{ backgroundColor: accent }}
    >
      <Text
        className="text-lg font-black"
        style={{ color: INK, fontVariant: ["tabular-nums"] }}
      >
        {value}
      </Text>
      <Text className="mt-2 text-xs font-bold" style={{ color: MUTED }}>
        {label}
      </Text>
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
    <View className="flex-1 rounded-[22px] bg-white p-4">
      <Text className="text-sm font-black" style={{ color: GREEN }}>
        {label}
      </Text>
      <Text className="mt-2 text-lg font-black" style={{ color: INK }}>
        {subject?.label ?? "Not enough data"}
      </Text>
      <Text className="mt-1 text-sm font-semibold" style={{ color: MUTED }}>
        {subject ? `${subject.accuracy}% accuracy` : "Play first"}
      </Text>
    </View>
  );
}

function SubjectCard({ subject }: { subject: InsightSubject }) {
  return (
    <View
      className="rounded-[28px] border bg-white p-5"
      style={{ borderColor: BORDER }}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-black" style={{ color: INK }}>
            {subject.label}
          </Text>
          <Text className="mt-1 text-sm font-semibold" style={{ color: MUTED }}>
            {subject.games} game{subject.games === 1 ? "" : "s"}
          </Text>
        </View>
        <Text className="text-xl font-black" style={{ color: GREEN }}>
          {subject.accuracy}%
        </Text>
      </View>
      <ProgressBar percent={subject.accuracy} />
      <View className="mt-4 flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-sm font-semibold" style={{ color: MUTED }}>
          {subject.primaryMetric}
        </Text>
        <Text
          className="text-right text-sm font-semibold"
          style={{ color: MUTED, flexShrink: 1, maxWidth: "52%" }}
        >
          {subject.secondaryMetric}
        </Text>
      </View>
    </View>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <View
      className="mt-4 overflow-hidden rounded-full"
      style={{ backgroundColor: "#e5eee8", height: 10 }}
    >
      <View
        className="rounded-full"
        style={{ backgroundColor: GREEN, height: 10, width: `${percent}%` }}
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
