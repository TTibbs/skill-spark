import * as React from "react";
import { Alert, AppState, BackHandler, Keyboard } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { SpellingResultResponse, Word } from "@skill-spark/contracts";
import { useMobileApi } from "@/api/use-mobile-api";
import { useChildren } from "@/children/use-children";
import {
  ActivityIndicator,
  Pressable,
  ScreenKeyboardView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "@/tw";
import {
  advanceSpellingChallenge,
  createSpellingSession,
  spellingSessionAnchorWord,
  submitSpellingAnswer,
  updateSpellingInput,
  type SpellingSessionState,
} from "@/games/spelling-garden/state";
import {
  buildSpellingSubmission,
  canSubmitSpellingResult,
  initialSpellingSubmissionState,
  markSpellingFailed,
  markSpellingSubmitted,
  markSpellingSubmitting,
  type SpellingSubmissionState,
} from "@/games/spelling-garden/submission";
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

export function SpellingGardenScreen() {
  const {
    selectedChild,
    status: childStatus,
    reload: reloadChildren,
    updateSelectedChildProgression,
  } = useChildren();
  const { api, withRefresh } = useMobileApi();
  const [words, setWords] = React.useState<Word[]>([]);
  const [wordsStatus, setWordsStatus] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [phase, setPhase] = React.useState<GamePhase>("idle");
  const [session, setSession] = React.useState<CapturedGameSession | null>(null);
  const [spellingState, setSpellingState] =
    React.useState<SpellingSessionState | null>(null);
  const [timerSnapshot, setTimerSnapshot] =
    React.useState<ActiveElapsedTimer | null>(null);
  const [displaySeconds, setDisplaySeconds] = React.useState(0);
  const [submission, setSubmission] = React.useState<SpellingSubmissionState>(
    initialSpellingSubmissionState
  );
  const timerRef = React.useRef<ActiveElapsedTimer | null>(null);
  const submissionRef = React.useRef(submission);
  const inFlightSubmissionRef = React.useRef(false);

  React.useEffect(() => {
    submissionRef.current = submission;
  }, [submission]);

  const loadWords = React.useCallback(async () => {
    setWordsStatus("loading");
    try {
      const response = await withRefresh(() => api.words.list({ limit: 100 }));
      setWords(response.words);
      setWordsStatus("ready");
    } catch {
      setWordsStatus("error");
    }
  }, [api.words, withRefresh]);

  React.useEffect(() => {
    if (childStatus === "ready") {
      void loadWords();
    }
  }, [childStatus, loadWords]);

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

  const completeGame = React.useCallback(() => {
    Keyboard.dismiss();
    if (timerRef.current) {
      timerRef.current = pauseTimer(timerRef.current, Date.now());
      setTimerSnapshot(timerRef.current);
      setDisplaySeconds(elapsedSeconds(timerRef.current, Date.now()));
    }
    setPhase("completed");
  }, []);

  const startGame = React.useCallback(() => {
    if (!selectedChild) return;

    const nextState = createSpellingSession(words, selectedChild.age);
    if (!nextState) return;

    const nextSession = captureGameSession(selectedChild);
    const nextTimer = startTimer(Date.now());
    timerRef.current = nextTimer;
    setTimerSnapshot(nextTimer);
    setDisplaySeconds(0);
    setSession(nextSession);
    setSpellingState(nextState);
    setSubmission(initialSpellingSubmissionState);
    inFlightSubmissionRef.current = false;
    setPhase("playing");
  }, [selectedChild, words]);

  const submitAnswer = React.useCallback(() => {
    if (!spellingState || spellingState.feedback !== "idle") return;

    const nextState = submitSpellingAnswer(spellingState);
    if (nextState === spellingState) return;

    Keyboard.dismiss();
    void playSpellingHaptic(nextState.feedback);
    setSpellingState(nextState);
  }, [spellingState]);

  const goNext = React.useCallback(() => {
    if (!spellingState || spellingState.feedback === "idle") return;

    const nextState = advanceSpellingChallenge(spellingState);
    setSpellingState(nextState);
    if (nextState.isComplete) {
      completeGame();
    }
  }, [completeGame, spellingState]);

  const submitResult = React.useCallback(async () => {
    if (!session || !spellingState || !timerRef.current) return;
    if (!canSubmitSpellingResult(submissionRef.current, session.sessionId)) return;
    if (inFlightSubmissionRef.current) return;

    const anchorWord = spellingSessionAnchorWord(spellingState);
    if (!anchorWord) return;

    inFlightSubmissionRef.current = true;
    setSubmission(markSpellingSubmitting());

    try {
      const response = await withRefresh(() =>
        api.gameResults.submitSpelling(
          session.childId,
          anchorWord.wordId,
          buildSpellingSubmission(session.sessionId, {
            correct_attempts: spellingState.correct,
            total_attempts: spellingState.correct + spellingState.incorrect,
            timeSpent: elapsedSeconds(
              timerRef.current ?? startTimer(Date.now()),
              Date.now()
            ),
          })
        )
      );
      updateSelectedChildProgression(response.child);
      await reloadChildren();
      setSubmission(markSpellingSubmitted(session.sessionId, response));
    } catch {
      setSubmission(
        markSpellingFailed("Your game is complete, but progress could not be saved.")
      );
    } finally {
      inFlightSubmissionRef.current = false;
    }
  }, [
    api.gameResults,
    reloadChildren,
    session,
    spellingState,
    updateSelectedChildProgression,
    withRefresh,
  ]);

  React.useEffect(() => {
    if (phase === "completed") {
      void submitResult();
    }
  }, [phase, submitResult]);

  const currentChallenge =
    spellingState?.challenges[spellingState.currentIndex] ?? null;
  const questionNumber = spellingState ? spellingState.currentIndex + 1 : 0;
  const totalQuestions = spellingState?.challenges.length ?? 0;
  const finalSeconds = timerSnapshot
    ? elapsedSeconds(timerSnapshot, Date.now())
    : displaySeconds;
  const canStart = Boolean(selectedChild && wordsStatus === "ready" && words.length > 0);

  return (
    <ScreenKeyboardView className="flex-1 bg-[#f7f2e8]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-16"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
              Spelling Garden
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

        {childStatus === "loading" || wordsStatus === "loading" ? (
          <Panel>
            <ActivityIndicator color="#315f4c" />
            <Text className="mt-4 text-base font-semibold text-[#315f4c]">
              Loading spelling words...
            </Text>
          </Panel>
        ) : null}

        {wordsStatus === "error" && phase === "idle" ? (
          <Panel>
            <Text className="text-xl font-black text-[#243c32]">
              Words could not be loaded
            </Text>
            <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
              Check the API connection and try again.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadWords()}
              className="mt-5 items-center rounded-2xl bg-[#315f4c] px-5 py-4"
            >
              <Text className="font-black text-white">Retry</Text>
            </Pressable>
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

        {phase === "idle" && canStart ? (
          <View className="mt-8 rounded-[28px] bg-[#315f4c] p-6">
            <Text className="text-sm font-black uppercase tracking-[2px] text-[#bad3c7]">
              Word round
            </Text>
            <Text className="mt-2 text-4xl font-black text-white">
              Spell five words
            </Text>
            <Text className="mt-2 text-base font-semibold text-[#e5f0ea]">
              Read the clue, type the word, and grow progress when the round is
              complete.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={startGame}
              className="mt-5 items-center rounded-2xl bg-white px-5 py-4"
            >
              <Text className="text-base font-black text-[#315f4c]">
                Start Spelling Garden
              </Text>
            </Pressable>
          </View>
        ) : null}

        {phase === "playing" && spellingState && currentChallenge ? (
          <>
            <View className="mt-8 rounded-[28px] bg-white p-5">
              <Text className="text-sm font-black uppercase tracking-[1.5px] text-[#5d9476]">
                Word {questionNumber} of {totalQuestions} · {displaySeconds}s
              </Text>
              <Text className="mt-3 text-xl font-black text-[#243c32]">
                {currentChallenge.clue}
              </Text>
              <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
                Category: {currentChallenge.category}
              </Text>
            </View>

            <View className="mt-5 rounded-[28px] bg-white p-5">
              <Text className="mb-2 text-sm font-bold text-[#315f4c]">
                Your spelling
              </Text>
              <TextInput
                accessibilityLabel="Spelling answer"
                autoCapitalize="none"
                autoCorrect={false}
                editable={spellingState.feedback === "idle"}
                keyboardType="default"
                onChangeText={(value) =>
                  setSpellingState((current) =>
                    current ? updateSpellingInput(current, value) : current
                  )
                }
                onSubmitEditing={submitAnswer}
                returnKeyType="done"
                value={spellingState.input}
                className="rounded-2xl border border-[#cbd8cf] bg-[#fbfaf5] px-4 py-4 text-base text-[#243c32]"
              />
              <Pressable
                accessibilityRole="button"
                disabled={spellingState.feedback !== "idle"}
                onPress={submitAnswer}
                className={`mt-4 items-center rounded-2xl px-5 py-4 ${
                  spellingState.feedback === "idle"
                    ? "bg-[#315f4c]"
                    : "bg-[#c9d6ce]"
                }`}
              >
                <Text className="font-black text-white">Check answer</Text>
              </Pressable>
            </View>

            {spellingState.feedback !== "idle" ? (
              <View
                className={`mt-5 rounded-[28px] p-5 ${
                  spellingState.feedback === "correct"
                    ? "bg-[#e2efe8]"
                    : "bg-[#f9ded7]"
                }`}
              >
                <Text className="text-xl font-black text-[#243c32]">
                  {spellingState.feedback === "correct" ? "Correct!" : "Good try"}
                </Text>
                <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
                  {spellingState.feedback === "correct"
                    ? "That spelling is right."
                    : `The word was ${spellingState.lastAnswer}.`}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={goNext}
                  className="mt-4 items-center rounded-2xl bg-[#315f4c] px-5 py-4"
                >
                  <Text className="font-black text-white">
                    {questionNumber === totalQuestions ? "Finish" : "Next word"}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}

        {phase === "completed" && spellingState && session ? (
          <CompletionPanel
            correct={spellingState.correct}
            incorrect={spellingState.incorrect}
            seconds={finalSeconds}
            submission={submission}
            onRetry={() => void submitResult()}
            onDone={() => router.push("/learn")}
          />
        ) : null}
      </ScrollView>
    </ScreenKeyboardView>
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
  submission: SpellingSubmissionState;
  onRetry(): void;
  onDone(): void;
}) {
  const result = submission.result as SpellingResultResponse | null;

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

async function playSpellingHaptic(kind: "correct" | "incorrect" | "idle") {
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
    "Leave Spelling Garden?",
    "This round is still in progress. Leaving now will lose this session.",
    [
      { text: "Keep spelling", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => router.push("/learn"),
      },
    ]
  );
}
