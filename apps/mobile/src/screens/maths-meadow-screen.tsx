import * as React from "react";
import { Alert, AppState, BackHandler } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { MathResultResponse } from "@skill-spark/contracts";
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
  answerCurrentQuestion,
  createMathsSession,
  sessionSummary,
  type MathsSessionState,
} from "@/games/maths-meadow/state";
import {
  buildMathsSubmission,
  canSubmitMathsResult,
  initialMathsSubmissionState,
  markMathsFailed,
  markMathsSubmitted,
  markMathsSubmitting,
  type MathsSubmissionState,
} from "@/games/maths-meadow/submission";
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

export function MathsMeadowScreen() {
  const {
    selectedChild,
    status: childStatus,
    reload: reloadChildren,
    updateSelectedChildProgression,
  } = useChildren();
  const { api, withRefresh } = useMobileApi();
  const [phase, setPhase] = React.useState<GamePhase>("idle");
  const [session, setSession] = React.useState<CapturedGameSession | null>(null);
  const [mathsState, setMathsState] = React.useState<MathsSessionState | null>(
    null
  );
  const [timerSnapshot, setTimerSnapshot] =
    React.useState<ActiveElapsedTimer | null>(null);
  const [displaySeconds, setDisplaySeconds] = React.useState(0);
  const [submission, setSubmission] = React.useState<MathsSubmissionState>(
    initialMathsSubmissionState
  );
  const timerRef = React.useRef<ActiveElapsedTimer | null>(null);
  const phaseRef = React.useRef<GamePhase>("idle");
  const submissionRef = React.useRef(submission);
  const inFlightSubmissionRef = React.useRef(false);

  React.useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

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

  const startGame = React.useCallback(() => {
    if (!selectedChild) return;

    const nextSession = captureGameSession(selectedChild);
    const nextTimer = startTimer(Date.now());
    timerRef.current = nextTimer;
    setTimerSnapshot(nextTimer);
    setDisplaySeconds(0);
    setSession(nextSession);
    setMathsState(createMathsSession(selectedChild.age));
    setSubmission(initialMathsSubmissionState);
    inFlightSubmissionRef.current = false;
    setPhase("playing");
  }, [selectedChild]);

  const completeGame = React.useCallback(() => {
    if (timerRef.current) {
      timerRef.current = pauseTimer(timerRef.current, Date.now());
      setTimerSnapshot(timerRef.current);
      setDisplaySeconds(elapsedSeconds(timerRef.current, Date.now()));
    }
    setPhase("completed");
  }, []);

  const answerQuestion = React.useCallback(
    (choice: number) => {
      if (!mathsState || mathsState.answeredChoice !== null) return;

      const currentQuestion = mathsState.questions[mathsState.currentIndex];
      const isCorrect = choice === currentQuestion?.answer;
      void playAnswerHaptic(isCorrect);
      setMathsState(answerCurrentQuestion(mathsState, choice));
    },
    [mathsState]
  );

  const goNext = React.useCallback(() => {
    if (!mathsState || mathsState.answeredChoice === null) return;

    const nextIndex = mathsState.currentIndex + 1;
    if (nextIndex >= mathsState.questions.length) {
      completeGame();
      return;
    }

    setMathsState({
      ...mathsState,
      currentIndex: nextIndex,
      answeredChoice: null,
    });
  }, [completeGame, mathsState]);

  const submitResult = React.useCallback(async () => {
    if (!session || !mathsState || !timerRef.current) return;
    if (!canSubmitMathsResult(submissionRef.current, session.sessionId)) return;
    if (inFlightSubmissionRef.current) return;

    inFlightSubmissionRef.current = true;
    setSubmission(markMathsSubmitting());

    try {
      const summary = sessionSummary(mathsState);
      const response = await withRefresh(() =>
        api.gameResults.submitMath(
          session.childId,
          buildMathsSubmission(session.sessionId, {
            ...summary,
            timeSpent: elapsedSeconds(timerRef.current ?? startTimer(Date.now()), Date.now()),
          })
        )
      );
      updateSelectedChildProgression(response.child);
      await reloadChildren();
      setSubmission(markMathsSubmitted(session.sessionId, response));
    } catch {
      setSubmission(
        markMathsFailed("Your game is complete, but progress could not be saved.")
      );
    } finally {
      inFlightSubmissionRef.current = false;
    }
  }, [
    api.gameResults,
    mathsState,
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

  const currentQuestion = mathsState?.questions[mathsState.currentIndex] ?? null;
  const answeredChoice = mathsState?.answeredChoice ?? null;
  const answeredCorrectly =
    currentQuestion && answeredChoice !== null
      ? answeredChoice === currentQuestion.answer
      : null;
  const totalQuestions = mathsState?.questions.length ?? 0;
  const questionNumber = mathsState ? mathsState.currentIndex + 1 : 0;
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
            Maths Meadow
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
            Short session
          </Text>
          <Text className="mt-2 text-4xl font-black text-white">
            10 questions
          </Text>
          <Text className="mt-2 text-base font-semibold text-[#e5f0ea]">
            Addition, subtraction and multiplication based on age.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={startGame}
            className="mt-5 items-center rounded-2xl bg-white px-5 py-4"
          >
            <Text className="text-base font-black text-[#315f4c]">
              Start Maths Meadow
            </Text>
          </Pressable>
        </View>
      ) : null}

      {phase === "playing" && mathsState && currentQuestion ? (
        <>
          <View className="mt-8 rounded-[28px] bg-white p-5">
            <Text className="text-sm font-black uppercase tracking-[1.5px] text-[#5d9476]">
              Question {questionNumber} of {totalQuestions} · {displaySeconds}s
            </Text>
            <Text className="mt-4 text-4xl font-black text-[#243c32]">
              {currentQuestion.prompt}
            </Text>
            <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
              Choose the answer.
            </Text>
          </View>

          <View className="mt-5 gap-3">
            {currentQuestion.choices.map((choice) => {
              const wasChosen = mathsState.answeredChoice === choice;
              const isAnswer = currentQuestion.answer === choice;
              const answered = mathsState.answeredChoice !== null;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={choice}
                  disabled={answered}
                  onPress={() => answerQuestion(choice)}
                  className={`items-center rounded-2xl border px-5 py-4 ${
                    wasChosen && isAnswer
                      ? "border-[#315f4c] bg-[#e2efe8]"
                      : wasChosen
                        ? "border-[#d8cdb8] bg-[#f9ded7]"
                        : "border-[#d8cdb8] bg-white"
                  }`}
                >
                  <Text className="text-2xl font-black text-[#243c32]">
                    {choice}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {answeredCorrectly !== null ? (
            <View className="mt-5 rounded-[28px] bg-white p-5">
              <Text className="text-xl font-black text-[#243c32]">
                {answeredCorrectly ? "Nice work!" : "Good try"}
              </Text>
              <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
                {answeredCorrectly
                  ? "That answer is correct."
                  : `The answer is ${currentQuestion.answer}.`}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={goNext}
                className="mt-4 items-center rounded-2xl bg-[#315f4c] px-5 py-4"
              >
                <Text className="font-black text-white">
                  {questionNumber === totalQuestions ? "Finish" : "Next"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}

      {phase === "completed" && mathsState && session ? (
        <CompletionPanel
          correct={mathsState.correct}
          incorrect={mathsState.incorrect}
          seconds={finalSeconds}
          submission={submission}
          onRetry={() => void submitResult()}
          onDone={() => router.push("/learn")}
        />
      ) : null}
    </ScrollView>
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
  submission: MathsSubmissionState;
  onRetry(): void;
  onDone(): void;
}) {
  const result = submission.result as MathResultResponse | null;

  return (
    <View className="mt-8 rounded-[28px] bg-white p-6">
      <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
        Session complete
      </Text>
      <Text className="mt-2 text-4xl font-black text-[#243c32]">
        {correct} correct
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

async function playAnswerHaptic(isCorrect: boolean) {
  try {
    await Haptics.notificationAsync(
      isCorrect
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
  } catch {
    // Haptics are optional; older development builds may not include the module.
  }
}

function confirmLeave() {
  Alert.alert(
    "Leave Maths Meadow?",
    "This round is still in progress. Leaving now will lose this session.",
    [
      { text: "Keep playing", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => router.push("/learn"),
      },
    ]
  );
}
