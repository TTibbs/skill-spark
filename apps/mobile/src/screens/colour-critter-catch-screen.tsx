import * as React from "react";
import { Alert, AppState, BackHandler, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { ShapeResultResponse } from "@skill-spark/contracts";
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
  advanceCritterRound,
  createCritterSession,
  selectCritterOption,
  CRITTER_DIFFICULTY_CONFIG,
  type CritterOption,
  type CritterSessionState,
} from "@/games/colour-critter-catch/state";
import {
  buildColourCritterSubmission,
  canSubmitColourCritterResult,
  initialColourCritterSubmissionState,
  markColourCritterFailed,
  markColourCritterSubmitted,
  markColourCritterSubmitting,
  type ColourCritterSubmissionState,
} from "@/games/colour-critter-catch/submission";
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

export function ColourCritterCatchScreen() {
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
  const [critterState, setCritterState] =
    React.useState<CritterSessionState | null>(null);
  const [timerSnapshot, setTimerSnapshot] =
    React.useState<ActiveElapsedTimer | null>(null);
  const [displaySeconds, setDisplaySeconds] = React.useState(0);
  const [submission, setSubmission] =
    React.useState<ColourCritterSubmissionState>(
      initialColourCritterSubmissionState
    );
  const timerRef = React.useRef<ActiveElapsedTimer | null>(null);
  const transitionTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
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
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
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
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    const nextSession = captureGameSession(selectedChild);
    const nextTimer = startTimer(Date.now());
    timerRef.current = nextTimer;
    setTimerSnapshot(nextTimer);
    setDisplaySeconds(0);
    setSession(nextSession);
    setCritterState(createCritterSession(selectedChild.age));
    setSubmission(initialColourCritterSubmissionState);
    inFlightSubmissionRef.current = false;
    setPhase("playing");
  }, [selectedChild]);

  const handleOptionPress = React.useCallback(
    (optionId: string) => {
      if (!critterState) return;

      const nextState = selectCritterOption(critterState, optionId);
      if (nextState === critterState) return;

      setCritterState(nextState);
      void playCritterHaptic(nextState.feedback);

      transitionTimeoutRef.current = setTimeout(() => {
        setCritterState((current) => {
          if (!current) return current;
          const advanced = advanceCritterRound(current);
          if (advanced.isComplete) {
            completeGame();
          }
          return advanced;
        });
        transitionTimeoutRef.current = null;
      }, nextState.feedback === "correct" ? 650 : 850);
    },
    [completeGame, critterState]
  );

  const submitResult = React.useCallback(async () => {
    if (!session || !critterState || !timerRef.current) return;
    if (!canSubmitColourCritterResult(submissionRef.current, session.sessionId)) {
      return;
    }
    if (inFlightSubmissionRef.current) return;

    inFlightSubmissionRef.current = true;
    setSubmission(markColourCritterSubmitting());

    try {
      const response = await withRefresh(() =>
        api.gameResults.submitShapes(
          session.childId,
          buildColourCritterSubmission(session.sessionId, {
            correct: critterState.correct,
            incorrect: critterState.incorrect,
            timeSpent: elapsedSeconds(
              timerRef.current ?? startTimer(Date.now()),
              Date.now()
            ),
          })
        )
      );
      updateSelectedChildProgression(response.child);
      await reloadChildren();
      setSubmission(markColourCritterSubmitted(session.sessionId, response));
    } catch {
      setSubmission(
        markColourCritterFailed(
          "Your game is complete, but progress could not be saved."
        )
      );
    } finally {
      inFlightSubmissionRef.current = false;
    }
  }, [
    api.gameResults,
    critterState,
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

  const round = critterState?.rounds[critterState.currentIndex] ?? null;
  const questionNumber = critterState ? critterState.currentIndex + 1 : 0;
  const totalQuestions = critterState?.rounds.length ?? 0;
  const optionGap = 12;
  const contentWidth = Math.max(280, width - 40);
  const columns = critterState?.difficulty === "hard" ? 3 : 2;
  const optionSize = Math.floor(
    (contentWidth - optionGap * (columns - 1)) / columns
  );
  const finalSeconds = timerSnapshot
    ? elapsedSeconds(timerSnapshot, Date.now())
    : displaySeconds;

  return (
    <ScrollView
      className="flex-1 bg-[#f7f2e8]"
      contentContainerClassName="px-5 pb-10 pt-16"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
            Colour Critter Catch
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
            router.push("/learn");
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
            Colours and shapes
          </Text>
          <Text className="mt-2 text-4xl font-black text-white">
            Find the critter
          </Text>
          <Text className="mt-2 text-base font-semibold text-[#e5f0ea]">
            Match both the colour and the shape. Harder rounds use more similar
            choices.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={startGame}
            className="mt-5 items-center rounded-2xl bg-white px-5 py-4"
          >
            <Text className="text-base font-black text-[#315f4c]">
              Start Colour Critter Catch
            </Text>
          </Pressable>
        </View>
      ) : null}

      {phase === "playing" && critterState && round ? (
        <>
          <View className="mt-8 rounded-[28px] bg-white p-5">
            <Text className="text-sm font-black uppercase tracking-[1.5px] text-[#5d9476]">
              Round {questionNumber} of {totalQuestions} · {displaySeconds}s
            </Text>
            <Text className="mt-3 text-xl font-black text-[#243c32]">
              Find the {round.targetColour.label} {round.targetShape.label}
            </Text>
            <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
              Use the shape and label too, not just the colour.
            </Text>
          </View>

          <View
            className="mt-5 flex-row"
            style={{ flexWrap: "wrap", gap: optionGap }}
          >
            {round.options.map((option) => (
              <CritterOptionButton
                key={option.id}
                option={option}
                selected={critterState.selectedOptionId === option.id}
                disabled={critterState.locked}
                size={optionSize}
                onPress={() => handleOptionPress(option.id)}
              />
            ))}
          </View>

          {critterState.feedback !== "idle" ? (
            <View
              className={`mt-5 rounded-[28px] p-5 ${
                critterState.feedback === "correct"
                  ? "bg-[#e2efe8]"
                  : "bg-[#f9ded7]"
              }`}
            >
              <Text className="text-xl font-black text-[#243c32]">
                {critterState.feedback === "correct" ? "You found it!" : "Try the next one"}
              </Text>
              <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
                {critterState.feedback === "correct"
                  ? "That critter matched both clues."
                  : `Look for both ${round.targetColour.label} and ${round.targetShape.label}.`}
              </Text>
            </View>
          ) : null}
        </>
      ) : null}

      {phase === "completed" && critterState && session ? (
        <CompletionPanel
          correct={critterState.correct}
          incorrect={critterState.incorrect}
          seconds={finalSeconds}
          submission={submission}
          onRetry={() => void submitResult()}
          onDone={() => router.push("/learn")}
        />
      ) : null}
    </ScrollView>
  );
}

function CritterOptionButton({
  option,
  selected,
  disabled,
  size,
  onPress,
}: {
  option: CritterOption;
  selected: boolean;
  disabled: boolean;
  size: number;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${option.colour.label} ${option.shape.label}`}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center justify-center rounded-[28px] border ${
        selected ? "border-[#315f4c]" : "border-[#d8cdb8]"
      }`}
      style={{ backgroundColor: option.colour.light, height: size, width: size }}
    >
      <Text
        className="text-4xl font-black"
        style={{ color: option.colour.value }}
      >
        {option.shape.symbol}
      </Text>
      <Text className="mt-2 text-sm font-black text-[#243c32]">
        {option.colour.label}
      </Text>
      <Text className="mt-1 text-xs font-semibold text-[#5c6f65]">
        {option.shape.label}
      </Text>
    </Pressable>
  );
}

function CompletionPanel({
  correct,
  incorrect,
  seconds,
  submission,
  onRetry,
  onDone,
}: {
  correct: number;
  incorrect: number;
  seconds: number;
  submission: ColourCritterSubmissionState;
  onRetry(): void;
  onDone(): void;
}) {
  const result = submission.result as ShapeResultResponse | null;

  return (
    <View className="mt-8 rounded-[28px] bg-white p-6">
      <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
        Session complete
      </Text>
      <Text className="mt-2 text-4xl font-black text-[#243c32]">
        {correct} found
      </Text>
      <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
        {incorrect} to practise · {seconds}s
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

async function playCritterHaptic(kind: "correct" | "incorrect" | "idle") {
  if (kind === "idle") return;

  try {
    await Haptics.notificationAsync(
      kind === "correct"
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
  } catch {
    // Haptics are optional; older development builds may not include the module.
  }
}

function confirmLeave() {
  Alert.alert(
    "Leave Colour Critter Catch?",
    "This round is still in progress. Leaving now will lose this session.",
    [
      { text: "Keep catching", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => router.push("/learn"),
      },
    ]
  );
}
