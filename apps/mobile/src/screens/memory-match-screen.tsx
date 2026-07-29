import * as React from "react";
import { Alert, AppState, BackHandler, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { MemoryResultResponse } from "@skill-spark/contracts";
import { useMobileApi } from "@/api/use-mobile-api";
import { useChildren } from "@/children/use-children";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "@/tw";
import {
  createMemorySession,
  isCardVisible,
  memorySessionSummary,
  resetMismatchedSelection,
  selectMemoryCard,
  MEMORY_DIFFICULTY_CONFIG,
  type MemoryCard,
  type MemorySessionState,
} from "@/games/memory-match/state";
import {
  buildMemorySubmission,
  canSubmitMemoryResult,
  initialMemorySubmissionState,
  markMemoryFailed,
  markMemorySubmitted,
  markMemorySubmitting,
  type MemorySubmissionState,
} from "@/games/memory-match/submission";
import {
  captureGameSession,
  type CapturedGameSession,
} from "@/games/session";
import {
  elapsedSeconds,
  pauseTimer,
  resumeTimer,
  startTimer,
  type ActiveElapsedTimer,
} from "@/games/timer";

type GamePhase = "idle" | "playing" | "completed";

export function MemoryMatchScreen() {
  const {
    selectedChild,
    status: childStatus,
    reload: reloadChildren,
    updateSelectedChildProgression,
  } = useChildren();
  const { api, withRefresh } = useMobileApi();
  const { width } = useWindowDimensions();
  const [phase, setPhase] = React.useState<GamePhase>("idle");
  const [session, setSession] = React.useState<CapturedGameSession | null>(null);
  const [memoryState, setMemoryState] =
    React.useState<MemorySessionState | null>(null);
  const [timerSnapshot, setTimerSnapshot] =
    React.useState<ActiveElapsedTimer | null>(null);
  const [displaySeconds, setDisplaySeconds] = React.useState(0);
  const [submission, setSubmission] = React.useState<MemorySubmissionState>(
    initialMemorySubmissionState
  );
  const timerRef = React.useRef<ActiveElapsedTimer | null>(null);
  const mismatchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const submissionRef = React.useRef(submission);
  const inFlightSubmissionRef = React.useRef(false);

  React.useEffect(() => {
    submissionRef.current = submission;
  }, [submission]);

  React.useEffect(() => {
    if (phase !== "playing") return;

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (!timerRef.current) return;

      const now = Date.now();
      if (nextState === "active") {
        timerRef.current = resumeTimer(timerRef.current, now);
      } else {
        timerRef.current = pauseTimer(timerRef.current, now);
      }
      setTimerSnapshot(timerRef.current);
      setDisplaySeconds(elapsedSeconds(timerRef.current, now));
    });

    return () => subscription.remove();
  }, [phase]);

  React.useEffect(() => {
    if (phase !== "playing") return;

    const interval = setInterval(() => {
      if (!timerRef.current) return;
      setDisplaySeconds(elapsedSeconds(timerRef.current, Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  React.useEffect(() => {
    if (phase !== "playing") return;

    const backSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        confirmLeave();
        return true;
      }
    );

    return () => backSubscription.remove();
  }, [phase]);

  React.useEffect(() => {
    return () => {
      if (mismatchTimeoutRef.current) {
        clearTimeout(mismatchTimeoutRef.current);
      }
    };
  }, []);

  const completeGame = React.useCallback(() => {
    if (timerRef.current) {
      timerRef.current = pauseTimer(timerRef.current, Date.now());
      setTimerSnapshot(timerRef.current);
      setDisplaySeconds(elapsedSeconds(timerRef.current, Date.now()));
    }
    setPhase("completed");
  }, []);

  const startGame = React.useCallback(() => {
    if (!selectedChild) return;
    if (mismatchTimeoutRef.current) {
      clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }

    const nextSession = captureGameSession(selectedChild);
    const nextTimer = startTimer(Date.now());
    timerRef.current = nextTimer;
    setTimerSnapshot(nextTimer);
    setDisplaySeconds(0);
    setSession(nextSession);
    setMemoryState(createMemorySession(selectedChild.age));
    setSubmission(initialMemorySubmissionState);
    inFlightSubmissionRef.current = false;
    setPhase("playing");
  }, [selectedChild]);

  const handleCardPress = React.useCallback(
    (cardId: string) => {
      if (!memoryState) return;

      const nextState = selectMemoryCard(memoryState, cardId);
      if (nextState === memoryState) return;

      setMemoryState(nextState);

      if (nextState.locked) {
        void playMemoryHaptic("mismatch");
        mismatchTimeoutRef.current = setTimeout(() => {
          setMemoryState((current) =>
            current ? resetMismatchedSelection(current) : current
          );
          mismatchTimeoutRef.current = null;
        }, 850);
        return;
      }

      if (nextState.matches > memoryState.matches) {
        void playMemoryHaptic(nextState.isComplete ? "complete" : "match");
      }

      if (nextState.isComplete) {
        completeGame();
      }
    },
    [completeGame, memoryState]
  );

  const submitResult = React.useCallback(async () => {
    if (!session || !memoryState || !timerRef.current) return;
    if (!canSubmitMemoryResult(submissionRef.current, session.sessionId)) return;
    if (inFlightSubmissionRef.current) return;

    inFlightSubmissionRef.current = true;
    setSubmission(markMemorySubmitting());

    try {
      const summary = memorySessionSummary(memoryState);
      const response = await withRefresh(() =>
        api.gameResults.submitMemory(
          session.childId,
          buildMemorySubmission(session.sessionId, {
            ...summary,
            timeSpent: elapsedSeconds(
              timerRef.current ?? startTimer(Date.now()),
              Date.now()
            ),
          })
        )
      );
      updateSelectedChildProgression(response.child);
      await reloadChildren();
      setSubmission(markMemorySubmitted(session.sessionId, response));
    } catch {
      setSubmission(
        markMemoryFailed("Your game is complete, but progress could not be saved.")
      );
    } finally {
      inFlightSubmissionRef.current = false;
    }
  }, [
    api.gameResults,
    memoryState,
    reloadChildren,
    session,
    updateSelectedChildProgression,
    withRefresh,
  ]);

  React.useEffect(() => {
    if (phase === "completed") {
      void submitResult();
    }
  }, [phase, submitResult]);

  const pairCount = memoryState
    ? MEMORY_DIFFICULTY_CONFIG[memoryState.difficulty].pairs
    : 0;
  const finalSeconds = timerSnapshot
    ? elapsedSeconds(timerSnapshot, Date.now())
    : displaySeconds;
  const cardGap = 12;
  const contentWidth = Math.max(280, width - 40);
  const cardSize = Math.floor((contentWidth - cardGap * 3) / 4);

  return (
    <ScrollView
      className="flex-1 bg-[#f7f2e8]"
      contentContainerClassName="px-5 pb-10 pt-16"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
            Memory Match
          </Text>
          <Text className="mt-2 text-3xl font-black text-[#243c32]">
            {session?.childName ?? selectedChild?.name ?? "Pick a child"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (phase === "playing") {
              confirmLeave();
              return;
            }
            router.push("/practice");
          }}
          className="rounded-full border border-[#c9d6ce] bg-white px-4 py-3"
        >
          <Text className="text-sm font-black text-[#315f4c]">Learn</Text>
        </Pressable>
      </View>

      {childStatus === "loading" ? (
        <Panel>
          <ActivityIndicator color="#315f4c" />
          <Text className="mt-4 text-base font-semibold text-[#315f4c]">
            Loading child profile...
          </Text>
        </Panel>
      ) : null}

      {!selectedChild && phase === "idle" && childStatus === "ready" ? (
        <Panel>
          <Text className="text-xl font-black text-[#243c32]">
            No child selected
          </Text>
          <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
            Choose a child on the home screen before playing.
          </Text>
        </Panel>
      ) : null}

      {phase === "idle" && selectedChild ? (
        <View className="mt-8 rounded-[28px] bg-[#315f4c] p-6">
          <Text className="text-sm font-black uppercase tracking-[2px] text-[#bad3c7]">
            Picture pairs
          </Text>
          <Text className="mt-2 text-4xl font-black text-white">
            Find every match
          </Text>
          <Text className="mt-2 text-base font-semibold text-[#e5f0ea]">
            Card count adjusts with age. Moves and time are saved when the board
            is complete.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={startGame}
            className="mt-5 items-center rounded-2xl bg-white px-5 py-4"
          >
            <Text className="text-base font-black text-[#315f4c]">
              Start Memory Match
            </Text>
          </Pressable>
        </View>
      ) : null}

      {phase === "playing" && memoryState ? (
        <>
          <View className="mt-8 rounded-[28px] bg-white p-5">
            <Text className="text-sm font-black uppercase tracking-[1.5px] text-[#5d9476]">
              {memoryState.matches}/{pairCount} pairs · {memoryState.moves}{" "}
              moves · {displaySeconds}s
            </Text>
            <Text className="mt-3 text-xl font-black text-[#243c32]">
              {memoryState.message}
            </Text>
          </View>

          <View className="mt-5 flex-row" style={{ flexWrap: "wrap", gap: cardGap }}>
            {memoryState.cards.map((card) => (
              <MemoryCardButton
                key={card.cardId}
                card={card}
                visible={isCardVisible(memoryState, card)}
                disabled={
                  memoryState.locked || card.matched || memoryState.isComplete
                }
                size={cardSize}
                onPress={() => handleCardPress(card.cardId)}
              />
            ))}
          </View>
        </>
      ) : null}

      {phase === "completed" && memoryState && session ? (
        <CompletionPanel
          moves={memoryState.moves}
          seconds={finalSeconds}
          submission={submission}
          onRetry={() => void submitResult()}
          onDone={() => router.push("/practice")}
        />
      ) : null}
    </ScrollView>
  );
}

function MemoryCardButton({
  card,
  visible,
  disabled,
  size,
  onPress,
}: {
  card: MemoryCard;
  visible: boolean;
  disabled: boolean;
  size: number;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        card.matched ? `${card.label}, matched` : visible ? card.label : "Hidden card"
      }
      accessibilityState={{ selected: visible, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center justify-center rounded-2xl border ${
        visible ? "border-[#315f4c] bg-[#e2efe8]" : "border-[#d8cdb8] bg-white"
      }`}
      style={{ height: size, width: size }}
    >
      {visible ? (
        <>
          <Text className="text-3xl">{card.symbol}</Text>
          <Text className="mt-1 text-xs font-black text-[#315f4c]">
            {card.label}
          </Text>
        </>
      ) : (
        <Text className="text-3xl font-black text-[#5d9476]">?</Text>
      )}
    </Pressable>
  );
}

function CompletionPanel({
  moves,
  seconds,
  submission,
  onRetry,
  onDone,
}: {
  moves: number;
  seconds: number;
  submission: MemorySubmissionState;
  onRetry(): void;
  onDone(): void;
}) {
  const result = submission.result as MemoryResultResponse | null;

  return (
    <View className="mt-8 rounded-[28px] bg-white p-6">
      <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
        Session complete
      </Text>
      <Text className="mt-2 text-4xl font-black text-[#243c32]">
        {moves} moves
      </Text>
      <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
        Every pair found in {seconds}s
      </Text>

      {submission.status === "submitting" ? (
        <Text className="mt-4 text-base font-semibold text-[#315f4c]">
          Saving progress...
        </Text>
      ) : null}

      {submission.status === "submitted" && result ? (
        <View className="mt-4 rounded-2xl bg-[#e2efe8] p-4">
          <Text className="text-base font-black text-[#315f4c]">
            +{result.xpEarned} XP saved
          </Text>
          <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">
            Level {result.child.level} · {result.child.reward_points} stars
          </Text>
        </View>
      ) : null}

      {submission.status === "failed" ? (
        <View className="mt-4 rounded-2xl bg-[#f9ded7] p-4">
          <Text className="text-base font-black text-[#8a3324]">
            {submission.error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            className="mt-4 items-center rounded-2xl bg-[#315f4c] px-5 py-4"
          >
            <Text className="font-black text-white">Retry saving</Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={submission.status === "submitting"}
        onPress={onDone}
        className="mt-5 items-center rounded-2xl border border-[#c9d6ce] bg-white px-5 py-4"
      >
        <Text className="font-black text-[#315f4c]">Back to learning</Text>
      </Pressable>
    </View>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <View className="mt-10 items-center rounded-[28px] bg-white p-8">
      {children}
    </View>
  );
}

async function playMemoryHaptic(kind: "match" | "mismatch" | "complete") {
  try {
    if (kind === "mismatch") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics are optional; older development builds may not include the module.
  }
}

function confirmLeave() {
  Alert.alert(
    "Leave Memory Match?",
    "This round is still in progress. Leaving now will lose this session.",
    [
      { text: "Keep playing", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => router.push("/practice"),
      },
    ]
  );
}
