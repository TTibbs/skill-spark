import * as React from "react";
import { RefreshControl } from "react-native";
import type { ChoreAssignment, ChoreStatus } from "@skill-spark/contracts";
import { router } from "expo-router";
import { useMobileApi } from "@/api/use-mobile-api";
import { useChildren } from "@/children/use-children";
import {
  canSubmitChore,
  choreStatusLabel,
  groupChores,
  replaceChoreAssignment,
} from "@/chores/chore-state";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";

const SECTION_ORDER: ChoreStatus[] = [
  "assigned",
  "submitted",
  "rejected",
  "approved",
];

export function ChoresScreen() {
  const {
    selectedChild,
    status: childStatus,
    reload: reloadChildren,
  } = useChildren();
  const { api, withRefresh } = useMobileApi();
  const [assignments, setAssignments] = React.useState<ChoreAssignment[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [submittingIds, setSubmittingIds] = React.useState<Set<number>>(
    () => new Set()
  );
  const submittingIdsRef = React.useRef<Set<number>>(new Set());
  const [actionErrors, setActionErrors] = React.useState<Record<number, string>>(
    {}
  );

  const loadChores = React.useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!selectedChild) {
        setAssignments([]);
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
        const response = await withRefresh(() =>
          api.chores.listForChild(selectedChild.id)
        );
        setAssignments(response.assignments);
        setStatus("ready");
      } catch {
        setError("Chores could not be loaded. Check your connection and try again.");
        setStatus("error");
      } finally {
        setRefreshing(false);
      }
    },
    [api.chores, selectedChild, withRefresh]
  );

  React.useEffect(() => {
    void loadChores();
  }, [loadChores]);

  const submitChore = React.useCallback(
    async (assignment: ChoreAssignment) => {
      if (!selectedChild || submittingIdsRef.current.has(assignment.id)) return;
      if (!canSubmitChore(assignment)) return;

      submittingIdsRef.current.add(assignment.id);
      setSubmittingIds((current) => new Set(current).add(assignment.id));
      setActionErrors((current) => {
        const next = { ...current };
        delete next[assignment.id];
        return next;
      });

      try {
        const response = await withRefresh(() =>
          api.chores.submit(selectedChild.id, assignment.id)
        );
        setAssignments((current) =>
          replaceChoreAssignment(current, response.assignment)
        );
        await reloadChildren();
      } catch {
        setActionErrors((current) => ({
          ...current,
          [assignment.id]: "This chore is done, but it could not be saved.",
        }));
      } finally {
        setSubmittingIds((current) => {
          submittingIdsRef.current.delete(assignment.id);
          const next = new Set(current);
          next.delete(assignment.id);
          return next;
        });
      }
    },
    [api.chores, reloadChildren, selectedChild, withRefresh]
  );

  const sections = React.useMemo(() => groupChores(assignments), [assignments]);

  return (
    <ScrollView
      className="flex-1 bg-[#f7f2e8]"
      contentContainerClassName="px-5 pb-10 pt-16"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadChores("refresh")}
          tintColor="#315f4c"
        />
      }
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
            Chores
          </Text>
          <Text className="mt-2 text-3xl font-black text-[#243c32]">
            {selectedChild ? `${selectedChild.name}'s list` : "Pick a child"}
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

      {childStatus === "loading" || status === "loading" ? (
        <View className="mt-10 items-center rounded-[28px] bg-white p-8">
          <ActivityIndicator color="#315f4c" />
          <Text className="mt-4 text-base font-semibold text-[#315f4c]">
            Loading chores...
          </Text>
        </View>
      ) : null}

      {!selectedChild && childStatus === "ready" ? (
        <EmptyCard
          title="No child selected"
          body="Choose or create a child profile before checking chores."
        />
      ) : null}

      {status === "error" ? (
        <View className="mt-10 rounded-[28px] bg-white p-6">
          <Text className="text-xl font-black text-[#243c32]">
            Could not load chores
          </Text>
          <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadChores()}
            className="mt-5 items-center rounded-2xl bg-[#315f4c] px-5 py-4"
          >
            <Text className="font-black text-white">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {status === "ready" && assignments.length === 0 ? (
        <EmptyCard
          title="No chores yet"
          body="There are no assigned chores for this child right now."
        />
      ) : null}

      {status === "ready"
        ? SECTION_ORDER.map((section) =>
            sections[section].length > 0 ? (
              <View key={section} className="mt-8">
                <Text className="text-lg font-black text-[#243c32]">
                  {choreStatusLabel(section)}
                </Text>
                <View className="mt-3 gap-3">
                  {sections[section].map((assignment) => (
                    <ChoreCard
                      key={assignment.id}
                      assignment={assignment}
                      error={actionErrors[assignment.id] ?? null}
                      isSubmitting={submittingIds.has(assignment.id)}
                      onSubmit={() => void submitChore(assignment)}
                    />
                  ))}
                </View>
              </View>
            ) : null
          )
        : null}
    </ScrollView>
  );
}

function ChoreCard({
  assignment,
  error,
  isSubmitting,
  onSubmit,
}: {
  assignment: ChoreAssignment;
  error: string | null;
  isSubmitting: boolean;
  onSubmit(): void;
}) {
  const canSubmit = canSubmitChore(assignment);

  return (
    <View className="rounded-[28px] border border-[#d8cdb8] bg-white p-5">
      <Text className="text-lg font-black text-[#243c32]">
        {assignment.chore.title}
      </Text>
      {assignment.chore.description ? (
        <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
          {assignment.chore.description}
        </Text>
      ) : null}
      <Text className="mt-3 text-sm font-black uppercase tracking-[1.5px] text-[#5d9476]">
        +{assignment.assigned_xp_reward} XP · +
        {assignment.assigned_reward_points} stars
      </Text>

      {assignment.rejection_reason ? (
        <Text className="mt-3 rounded-2xl bg-[#f9ded7] px-4 py-3 text-sm font-semibold text-[#8a3324]">
          {assignment.rejection_reason}
        </Text>
      ) : null}

      {error ? (
        <Text className="mt-3 rounded-2xl bg-[#f9ded7] px-4 py-3 text-sm font-semibold text-[#8a3324]">
          {error}
        </Text>
      ) : null}

      {canSubmit ? (
        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={onSubmit}
          className={`mt-4 items-center rounded-2xl px-5 py-4 ${
            isSubmitting ? "bg-[#9ab9a8]" : "bg-[#315f4c]"
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="font-black text-white">
              {assignment.status === "rejected" ? "Try again" : "Mark as done"}
            </Text>
          )}
        </Pressable>
      ) : (
        <Text className="mt-4 text-base font-semibold text-[#315f4c]">
          {assignment.status === "submitted"
            ? "Waiting for grown-up"
            : "Approved"}
        </Text>
      )}
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
