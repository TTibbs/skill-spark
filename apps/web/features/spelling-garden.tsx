"use client";

import * as React from "react";
import type { Word } from "@skill-spark/contracts";
import { useAuth } from "@/features/auth/use-auth";
import { createGameSessionId } from "@/features/game-results/session-id";
import { useChildren } from "@/features/children/hooks/use-children";
import { useSelectedChild } from "@/features/children/hooks/use-selected-child";

type Difficulty = "easy" | "medium" | "hard";

type WordChallenge = {
  word_id?: number;
  word: string;
  clue: string;
  emoji: string;
  category: string;
};

type LetterTile = {
  id: string;
  letter: string;
};

type PlacedLetter = LetterTile & {
  sourceIndex: number;
};

type CelebrationParticle = {
  id: number;
  symbol: string;
  left: number;
  delay: number;
  rotation: number;
};

type WebkitAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const WORDS: Record<Difficulty, WordChallenge[]> = {
  easy: [
    {
      word: "cat",
      clue: "A small animal that says meow",
      emoji: "🐱",
      category: "Animals",
    },
    {
      word: "dog",
      clue: "A friendly animal that can bark",
      emoji: "🐶",
      category: "Animals",
    },
    {
      word: "sun",
      clue: "It shines brightly in the sky",
      emoji: "☀️",
      category: "Nature",
    },
    {
      word: "bee",
      clue: "A small insect that makes honey",
      emoji: "🐝",
      category: "Nature",
    },
    {
      word: "fox",
      clue: "A clever animal with a bushy tail",
      emoji: "🦊",
      category: "Animals",
    },
    {
      word: "pig",
      clue: "A pink farm animal",
      emoji: "🐷",
      category: "Animals",
    },
    {
      word: "hat",
      clue: "You can wear this on your head",
      emoji: "🎩",
      category: "Clothes",
    },
    {
      word: "bed",
      clue: "You sleep in this at night",
      emoji: "🛏️",
      category: "Home",
    },
    {
      word: "cup",
      clue: "You can drink from this",
      emoji: "🥤",
      category: "Home",
    },
    {
      word: "bus",
      clue: "A large vehicle that carries people",
      emoji: "🚌",
      category: "Transport",
    },
  ],
  medium: [
    {
      word: "frog",
      clue: "A green animal that can jump",
      emoji: "🐸",
      category: "Animals",
    },
    {
      word: "fish",
      clue: "An animal that swims underwater",
      emoji: "🐟",
      category: "Animals",
    },
    {
      word: "moon",
      clue: "You can see it in the night sky",
      emoji: "🌙",
      category: "Space",
    },
    {
      word: "tree",
      clue: "A tall plant with branches and leaves",
      emoji: "🌳",
      category: "Nature",
    },
    {
      word: "star",
      clue: "A bright light in the night sky",
      emoji: "⭐",
      category: "Space",
    },
    {
      word: "book",
      clue: "It has pages and stories inside",
      emoji: "📖",
      category: "School",
    },
    {
      word: "cake",
      clue: "A sweet treat often eaten at birthdays",
      emoji: "🎂",
      category: "Food",
    },
    {
      word: "duck",
      clue: "A bird that swims and says quack",
      emoji: "🦆",
      category: "Animals",
    },
    {
      word: "rain",
      clue: "Water that falls from clouds",
      emoji: "🌧️",
      category: "Weather",
    },
    {
      word: "ship",
      clue: "A large boat that travels across the sea",
      emoji: "🚢",
      category: "Transport",
    },
  ],
  hard: [
    {
      word: "apple",
      clue: "A crunchy fruit that can be red or green",
      emoji: "🍎",
      category: "Food",
    },
    {
      word: "tiger",
      clue: "A large striped wild cat",
      emoji: "🐯",
      category: "Animals",
    },
    {
      word: "cloud",
      clue: "A white or grey shape floating in the sky",
      emoji: "☁️",
      category: "Weather",
    },
    {
      word: "plant",
      clue: "A living thing that grows in soil",
      emoji: "🪴",
      category: "Nature",
    },
    {
      word: "train",
      clue: "A vehicle that travels along railway tracks",
      emoji: "🚆",
      category: "Transport",
    },
    {
      word: "house",
      clue: "A building where people live",
      emoji: "🏠",
      category: "Home",
    },
    {
      word: "mouse",
      clue: "A small animal with a long tail",
      emoji: "🐭",
      category: "Animals",
    },
    {
      word: "grape",
      clue: "A small round fruit that grows in bunches",
      emoji: "🍇",
      category: "Food",
    },
    {
      word: "chair",
      clue: "A piece of furniture that you sit on",
      emoji: "🪑",
      category: "Home",
    },
    {
      word: "sheep",
      clue: "A farm animal covered in wool",
      emoji: "🐑",
      category: "Animals",
    },
  ],
};

const DIFFICULTY_CONFIG = {
  easy: {
    label: "Easy",
    flowerReward: 1,
    requiredCorrect: 5,
  },
  medium: {
    label: "Medium",
    flowerReward: 2,
    requiredCorrect: 6,
  },
  hard: {
    label: "Hard",
    flowerReward: 3,
    requiredCorrect: 7,
  },
} as const;

const INITIAL_CHALLENGE = WORDS.easy[0];

const INITIAL_LETTERS: LetterTile[] = [
  { id: "initial-c", letter: "c" },
  { id: "initial-a", letter: "a" },
  { id: "initial-t", letter: "t" },
];

const CELEBRATION_SYMBOLS = ["🌸", "🌼", "✨", "🌟", "🌷"];
const WORD_EMOJI_BY_CATEGORY: Record<string, string> = {
  animals: "🐾",
  food: "🍎",
  nature: "🌿",
  space: "⭐",
  transport: "🚌",
  weather: "☀️",
};

function shuffle<T>(items: readonly T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function createLetterTiles(word: string): LetterTile[] {
  return shuffle(
    word.split("").map((letter, index) => ({
      id: `${word}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      letter,
    })),
  );
}

function getRandomChallenge(
  difficulty: Difficulty,
  previousWord?: string,
  challenges: readonly WordChallenge[] = WORDS[difficulty],
) {
  const availableWords = challenges.filter(
    (challenge) => challenge.word !== previousWord,
  );

  const pool = availableWords.length > 0 ? availableWords : challenges;

  return pool[Math.floor(Math.random() * pool.length)];
}

function getDifficultyForWord(word: string): Difficulty {
  if (word.length <= 3) return "easy";
  if (word.length <= 4) return "medium";
  return "hard";
}

function toWordChallenge(word: Word): WordChallenge {
  return {
    word_id: word.word_id,
    word: word.word.toLowerCase(),
    clue: `Spell the ${word.category.toLowerCase()} word`,
    emoji: WORD_EMOJI_BY_CATEGORY[word.category.toLowerCase()] || "🌱",
    category: word.category,
  };
}

function createCelebrationParticles(): CelebrationParticle[] {
  return Array.from({ length: 20 }, (_, index) => ({
    id: index,
    symbol:
      CELEBRATION_SYMBOLS[
        Math.floor(Math.random() * CELEBRATION_SYMBOLS.length)
      ],
    left: 3 + Math.random() * 94,
    delay: Math.random() * 0.4,
    rotation: -180 + Math.random() * 360,
  }));
}

function getWordFromPlacedLetters(letters: PlacedLetter[]) {
  return letters.map((tile) => tile.letter).join("");
}

export function SpellingGarden() {
  const { status: authStatus, createChildrenApi, refreshSession } = useAuth();
  const { children, isLoading: childrenLoading } = useChildren();
  const { selectedChild } = useSelectedChild(children);
  const api = React.useMemo(() => createChildrenApi(), [createChildrenApi]);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioTimeoutsRef = React.useRef<number[]>([]);
  const nextWordTimeoutRef = React.useRef<number | null>(null);

  const answerLockedRef = React.useRef(false);
  const currentChallengeRef = React.useRef<WordChallenge>(INITIAL_CHALLENGE);
  const wordSessionRef = React.useRef("initial-spelling-session");
  const wordStartedAtRef = React.useRef<number>(0);
  const submittedWordSessionsRef = React.useRef(new Set<string>());
  const failedSpellingSubmissionRef = React.useRef<{
    challenge: WordChallenge;
    attempts: number;
    sessionId: string;
    startedAt: number;
  } | null>(null);

  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [backendWords, setBackendWords] = React.useState<
    Record<Difficulty, WordChallenge[]>
  >({
    easy: [],
    medium: [],
    hard: [],
  });
  const [wordsLoading, setWordsLoading] = React.useState(false);
  const [wordsError, setWordsError] = React.useState<string | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<
    "idle" | "submitting" | "submitted" | "failed"
  >("idle");
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveResponse, setSaveResponse] = React.useState<{
    xpEarned: number;
    level: number;
    reward_points: number;
  } | null>(null);
  const [currentWordAttempts, setCurrentWordAttempts] = React.useState(0);
  const [currentWordHintsUsed, setCurrentWordHintsUsed] = React.useState(0);

  const [challenge, setChallenge] =
    React.useState<WordChallenge>(INITIAL_CHALLENGE);

  const [letterTiles, setLetterTiles] =
    React.useState<LetterTile[]>(INITIAL_LETTERS);

  const [placedLetters, setPlacedLetters] = React.useState<PlacedLetter[]>([]);

  const [correctAnswers, setCorrectAnswers] = React.useState(0);
  const [attempts, setAttempts] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [flowers, setFlowers] = React.useState(0);

  const [message, setMessage] = React.useState(
    "Tap the letters in the correct order.",
  );

  const [answerState, setAnswerState] = React.useState<
    "idle" | "correct" | "incorrect"
  >("idle");

  const [answerLocked, setAnswerLockedState] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [roundComplete, setRoundComplete] = React.useState(false);

  const [celebrationParticles, setCelebrationParticles] = React.useState<
    CelebrationParticle[]
  >([]);

  const ensureAudio = React.useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!audioContextRef.current) {
      const AudioContextConstructor =
        window.AudioContext || (window as WebkitAudioWindow).webkitAudioContext;

      if (!AudioContextConstructor) return null;

      audioContextRef.current = new AudioContextConstructor();
    }

    const audioContext = audioContextRef.current;

    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }

    return audioContext;
  }, []);

  const playTone = React.useCallback(
    (
      frequency: number,
      duration: number,
      type: OscillatorType = "sine",
      volume = 0.15,
    ) => {
      const audioContext = ensureAudio();

      if (!audioContext) return;

      const startedAt = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startedAt);

      gain.gain.setValueAtTime(0.0001, startedAt);
      gain.gain.exponentialRampToValueAtTime(volume, startedAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + duration);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(startedAt);
      oscillator.stop(startedAt + duration + 0.05);

      oscillator.addEventListener(
        "ended",
        () => {
          oscillator.disconnect();
          gain.disconnect();
        },
        { once: true },
      );
    },
    [ensureAudio],
  );

  const scheduleTone = React.useCallback(
    (
      frequency: number,
      delay: number,
      duration: number,
      type: OscillatorType,
      volume = 0.15,
    ) => {
      const timeoutId = window.setTimeout(() => {
        playTone(frequency, duration, type, volume);

        audioTimeoutsRef.current = audioTimeoutsRef.current.filter(
          (item) => item !== timeoutId,
        );
      }, delay);

      audioTimeoutsRef.current.push(timeoutId);
    },
    [playTone],
  );

  const playLetterSound = React.useCallback(
    (index: number) => {
      const frequencies = [330, 370, 415, 440, 494, 523];
      const frequency = frequencies[index % frequencies.length];

      playTone(frequency, 0.1, "sine", 0.08);
    },
    [playTone],
  );

  const playCorrectSound = React.useCallback(
    (isStreakReward: boolean) => {
      const notes = isStreakReward
        ? [392, 523.25, 659.25, 783.99, 1046.5]
        : [392, 523.25, 659.25];

      notes.forEach((frequency, index) => {
        scheduleTone(frequency, index * 60, 0.22, "triangle", 0.16);
      });
    },
    [scheduleTone],
  );

  const playIncorrectSound = React.useCallback(() => {
    playTone(190, 0.16, "sine", 0.08);
  }, [playTone]);

  const clearNextWordTimeout = React.useCallback(() => {
    if (nextWordTimeoutRef.current !== null) {
      window.clearTimeout(nextWordTimeoutRef.current);
      nextWordTimeoutRef.current = null;
    }
  }, []);

  const setAnswerLocked = React.useCallback((locked: boolean) => {
    answerLockedRef.current = locked;
    setAnswerLockedState(locked);
  }, []);

  const canSaveProgress =
    authStatus === "authenticated" &&
    !childrenLoading &&
    !!selectedChild &&
    challenge.word_id !== undefined;

  React.useEffect(() => {
    if (authStatus !== "authenticated") return;

    const controller = new AbortController();
    let cancelled = false;

    const loadWords = async () => {
      setWordsLoading(true);
      setWordsError(null);

      try {
        const refreshed = await refreshSession();
        if (!refreshed || cancelled) return;

        const response = await api.words.list({ limit: 100 }, controller.signal);
        if (cancelled) return;

        const grouped: Record<Difficulty, WordChallenge[]> = {
          easy: [],
          medium: [],
          hard: [],
        };

        for (const word of response.words) {
          grouped[getDifficultyForWord(word.word)].push(toWordChallenge(word));
        }

        setBackendWords(grouped);
        if (
          currentChallengeRef.current.word_id === undefined &&
          grouped[difficulty].length > 0
        ) {
          const nextChallenge = getRandomChallenge(
            difficulty,
            currentChallengeRef.current.word,
            grouped[difficulty],
          );

          currentChallengeRef.current = nextChallenge;
          wordSessionRef.current = createGameSessionId();
          wordStartedAtRef.current = Date.now();
          setChallenge(nextChallenge);
          setLetterTiles(createLetterTiles(nextChallenge.word));
          setPlacedLetters([]);
          setAnswerState("idle");
          setMessage("Tap the letters in the correct order.");
          setShowHint(false);
          setCurrentWordAttempts(0);
          setCurrentWordHintsUsed(0);
          setAnswerLocked(false);
        }
        setWordsLoading(false);
      } catch {
        if (!cancelled && !controller.signal.aborted) {
          setWordsError("Words could not be loaded for progress saving.");
          setWordsLoading(false);
        }
      }
    };

    void loadWords();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [api.words, authStatus, difficulty, refreshSession, setAnswerLocked]);

  const loadChallenge = React.useCallback(
    (nextDifficulty: Difficulty, previousWord?: string) => {
      const wordsForDifficulty = backendWords[nextDifficulty];
      const challengePool =
        wordsForDifficulty.length > 0
          ? wordsForDifficulty
          : WORDS[nextDifficulty];
      const nextChallenge = getRandomChallenge(
        nextDifficulty,
        previousWord,
        challengePool,
      );

      currentChallengeRef.current = nextChallenge;
      wordSessionRef.current = createGameSessionId();
      wordStartedAtRef.current = Date.now();

      setChallenge(nextChallenge);
      setLetterTiles(createLetterTiles(nextChallenge.word));
      setPlacedLetters([]);
      setAnswerState("idle");
      setMessage("Tap the letters in the correct order.");
      setShowHint(false);
      setCurrentWordAttempts(0);
      setCurrentWordHintsUsed(0);

      setAnswerLocked(false);
    },
    [backendWords, setAnswerLocked],
  );

  const resetGame = React.useCallback(
    (nextDifficulty: Difficulty, useInitialChallenge = false) => {
      clearNextWordTimeout();

      setAnswerLocked(false);

      setDifficulty(nextDifficulty);
      setCorrectAnswers(0);
      setAttempts(0);
      setStreak(0);
      setFlowers(0);
      setAnswerState("idle");
      setShowHint(false);
      setRoundComplete(false);
      setCelebrationParticles([]);
      setSaveStatus("idle");
      setSaveError(null);
      setSaveResponse(null);
      submittedWordSessionsRef.current = new Set<string>();

      if (useInitialChallenge && nextDifficulty === "easy") {
        currentChallengeRef.current = INITIAL_CHALLENGE;
        wordSessionRef.current = createGameSessionId();
        wordStartedAtRef.current = Date.now();

        setChallenge(INITIAL_CHALLENGE);
        setLetterTiles(INITIAL_LETTERS);
        setPlacedLetters([]);
        setMessage("Tap the letters in the correct order.");

        return;
      }

      loadChallenge(nextDifficulty);
    },
    [clearNextWordTimeout, loadChallenge, setAnswerLocked],
  );

  const submitSpellingProgress = React.useCallback(
    async (
      completedChallenge: WordChallenge,
      finalAttempts: number,
      sessionId = wordSessionRef.current,
      startedAt = wordStartedAtRef.current,
    ) => {
      if (!selectedChild || completedChallenge.word_id === undefined) return;

      if (submittedWordSessionsRef.current.has(sessionId)) return;

      submittedWordSessionsRef.current.add(sessionId);
      setSaveStatus("submitting");
      setSaveError(null);
      failedSpellingSubmissionRef.current = null;

      try {
        const refreshed = await refreshSession();
        if (!refreshed) throw new Error("Session expired");

        const response = await api.gameResults.submitSpelling(
          selectedChild.id,
          completedChallenge.word_id,
          {
            sessionId,
            correct_attempts: 1,
            total_attempts: finalAttempts,
            timeSpent: Math.max(
              0,
              Math.round((Date.now() - startedAt) / 1000),
            ),
            hintsUsed: currentWordHintsUsed,
          },
        );

        setSaveResponse({
          xpEarned: response.xpEarned,
          level: response.child.level,
          reward_points: response.child.reward_points,
        });
        setSaveStatus("submitted");
      } catch {
        submittedWordSessionsRef.current.delete(sessionId);
        failedSpellingSubmissionRef.current = {
          challenge: completedChallenge,
          attempts: finalAttempts,
          sessionId,
          startedAt,
        };
        setSaveStatus("failed");
        setSaveError("Your word is complete, but progress could not be saved.");
      }
    },
    [
      api.gameResults,
      currentWordHintsUsed,
      refreshSession,
      selectedChild,
    ],
  );

  const retrySpellingProgress = React.useCallback(() => {
    const failedSubmission = failedSpellingSubmissionRef.current;
    if (!failedSubmission) return;

    void submitSpellingProgress(
      failedSubmission.challenge,
      failedSubmission.attempts,
      failedSubmission.sessionId,
      failedSubmission.startedAt,
    );
  }, [submitSpellingProgress]);

  const completeRound = React.useCallback(
    (finalFlowers: number, finalCorrectAnswers: number) => {
      setAnswerLocked(true);

      setRoundComplete(true);
      setCelebrationParticles(createCelebrationParticles());
      setMessage(
        `Your garden grew ${finalFlowers} flowers from ${finalCorrectAnswers} correct words!`,
      );

      [392, 523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        scheduleTone(frequency, index * 75, 0.3, "triangle", 0.17);
      });
    },
    [scheduleTone, setAnswerLocked],
  );

  const submitAnswer = React.useCallback(
    (letters: PlacedLetter[]) => {
      if (answerLockedRef.current) return;

      const answer = getWordFromPlacedLetters(letters);

      if (answer.length !== challenge.word.length) {
        return;
      }

      setAnswerLocked(true);
      const nextAttempts = currentWordAttempts + 1;
      setAttempts((current) => current + 1);
      setCurrentWordAttempts(nextAttempts);

      if (answer === challenge.word) {
        const nextStreak = streak + 1;
        const nextCorrectAnswers = correctAnswers + 1;

        const streakBonus = nextStreak > 0 && nextStreak % 3 === 0;

        const flowerReward =
          DIFFICULTY_CONFIG[difficulty].flowerReward + (streakBonus ? 1 : 0);

        const nextFlowers = flowers + flowerReward;

        setStreak(nextStreak);
        setCorrectAnswers(nextCorrectAnswers);
        setFlowers(nextFlowers);
        setAnswerState("correct");
        setMessage(
          streakBonus
            ? `Brilliant! ${nextStreak} correct in a row — bonus flower!`
            : `Correct! You spelled ${challenge.word}.`,
        );

      playCorrectSound(streakBonus);
      void submitSpellingProgress(challenge, nextAttempts);

        if (
          nextCorrectAnswers >= DIFFICULTY_CONFIG[difficulty].requiredCorrect
        ) {
          nextWordTimeoutRef.current = window.setTimeout(() => {
            completeRound(nextFlowers, nextCorrectAnswers);
          }, 950);

          return;
        }

        nextWordTimeoutRef.current = window.setTimeout(
          () => {
            loadChallenge(difficulty, challenge.word);
          },
          streakBonus ? 1350 : 950,
        );

        return;
      }

      setStreak(0);
      setAnswerState("incorrect");
      setMessage("Nearly — try moving the letters around.");
      playIncorrectSound();

      nextWordTimeoutRef.current = window.setTimeout(() => {
        setPlacedLetters([]);
        setAnswerState("idle");
        setMessage("Try again. Look carefully at the clue.");
        setAnswerLocked(false);
      }, 850);
    },
    [
      challenge,
      completeRound,
      correctAnswers,
      currentWordAttempts,
      difficulty,
      flowers,
      loadChallenge,
      playCorrectSound,
      playIncorrectSound,
      submitSpellingProgress,
      setAnswerLocked,
      streak,
    ],
  );

  const handleLetterSelect = React.useCallback(
    (tile: LetterTile, sourceIndex: number) => {
      if (
        answerLockedRef.current ||
        placedLetters.length >= challenge.word.length
      ) {
        return;
      }

      ensureAudio();
      playLetterSound(placedLetters.length);

      const nextPlacedLetters = [
        ...placedLetters,
        {
          ...tile,
          sourceIndex,
        },
      ];

      setPlacedLetters(nextPlacedLetters);

      if (nextPlacedLetters.length === challenge.word.length) {
        submitAnswer(nextPlacedLetters);
      }
    },
    [
      challenge.word.length,
      ensureAudio,
      placedLetters,
      playLetterSound,
      submitAnswer,
    ],
  );

  const handlePlacedLetterSelect = React.useCallback(
    (placedIndex: number) => {
      if (answerLockedRef.current) return;

      setPlacedLetters((current) =>
        current.filter((_, index) => index !== placedIndex),
      );

      setAnswerState("idle");
      setMessage("Tap a letter to fill the empty space.");
      playTone(270, 0.08, "sine", 0.06);
    },
    [playTone],
  );

  const handleClear = React.useCallback(() => {
    if (answerLockedRef.current || placedLetters.length === 0) {
      return;
    }

    setPlacedLetters([]);
    setAnswerState("idle");
    setMessage("The letters have been cleared.");
    playTone(240, 0.1, "sine", 0.06);
  }, [placedLetters.length, playTone]);

  const handleDifficultyChange = React.useCallback(
    (nextDifficulty: Difficulty) => {
      if (nextDifficulty === difficulty) return;

      resetGame(nextDifficulty);
    },
    [difficulty, resetGame],
  );

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (answerLockedRef.current) return;

      if (event.key === "Backspace") {
        event.preventDefault();

        setPlacedLetters((current) => current.slice(0, -1));

        return;
      }

      const letter = event.key.toLowerCase();

      if (!/^[a-z]$/.test(letter)) return;

      const usedIds = new Set(placedLetters.map((tile) => tile.id));

      const availableTileIndex = letterTiles.findIndex(
        (tile) => tile.letter === letter && !usedIds.has(tile.id),
      );

      if (availableTileIndex === -1) return;

      handleLetterSelect(letterTiles[availableTileIndex], availableTileIndex);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleLetterSelect, letterTiles, placedLetters]);

  React.useEffect(() => {
    return () => {
      clearNextWordTimeout();

      for (const timeoutId of audioTimeoutsRef.current) {
        window.clearTimeout(timeoutId);
      }

      audioTimeoutsRef.current = [];

      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [clearNextWordTimeout]);

  const usedTileIds = new Set(placedLetters.map((tile) => tile.id));

  const requiredCorrect = DIFFICULTY_CONFIG[difficulty].requiredCorrect;

  const progress = Math.min(100, (correctAnswers / requiredCorrect) * 100);

  const hintLetters = challenge.word
    .split("")
    .map((letter, index) => (showHint && index === 0 ? letter : "_"))
    .join(" ");

  return (
    <main className="spelling-garden">
      <div
        className="spelling-garden__cloud spelling-garden__cloud--one"
        aria-hidden="true"
      />
      <div
        className="spelling-garden__cloud spelling-garden__cloud--two"
        aria-hidden="true"
      />

      <header className="spelling-garden__header">
        <div
          className="spelling-garden__stat"
          aria-label={`${correctAnswers} correct words`}
        >
          <span aria-hidden="true">✅</span>
          <span>
            {correctAnswers}/{requiredCorrect}
          </span>
        </div>

        <div
          className="spelling-garden__stat"
          aria-label={`${streak} correct answers in a row`}
        >
          <span aria-hidden="true">🔥</span>
          <span>{streak}</span>
        </div>

        <div
          className="spelling-garden__stat"
          aria-label={`${flowers} flowers grown`}
        >
          <span aria-hidden="true">🌸</span>
          <span>{flowers}</span>
        </div>
      </header>

      <section className="spelling-garden__game">
        <div className="spelling-garden__top-row">
          <div>
            <h1>Spelling Garden</h1>
            <p aria-live="polite">{message}</p>
          </div>

          <button
            type="button"
            className="spelling-garden__restart"
            onClick={() => resetGame(difficulty)}
          >
            <RestartIcon />
            <span>New game</span>
          </button>
        </div>

        <div
          className="spelling-garden__difficulty"
          aria-label="Choose difficulty"
        >
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((option) => (
            <button
              key={option}
              type="button"
              className={
                difficulty === option
                  ? "spelling-garden__difficulty-button spelling-garden__difficulty-button--active"
                  : "spelling-garden__difficulty-button"
              }
              aria-pressed={difficulty === option}
              onClick={() => handleDifficultyChange(option)}
            >
              {DIFFICULTY_CONFIG[option].label}
            </button>
          ))}
        </div>

        <div className="spelling-garden__progress">
          <div className="spelling-garden__progress-copy">
            <span>Garden progress</span>
            <strong>
              {correctAnswers} of {requiredCorrect} words
            </strong>
          </div>

          <div className="spelling-garden__progress-track">
            <div
              className="spelling-garden__progress-value"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="spelling-garden__challenge">
          <div className="spelling-garden__picture" aria-hidden="true">
            {challenge.emoji}
          </div>

          <div className="spelling-garden__clue">
            <span>{challenge.category}</span>
            <h2>{challenge.clue}</h2>

            <div className="spelling-garden__hint-row">
              <button
                type="button"
                className="spelling-garden__hint-button"
                aria-pressed={showHint}
                onClick={() => {
                  setShowHint((current) => {
                    if (!current) {
                      setCurrentWordHintsUsed((count) => count + 1);
                    }

                    return !current;
                  });
                }}
              >
                <HintIcon />
                {showHint ? "Hide hint" : "Show hint"}
              </button>

              {showHint && (
                <strong
                  className="spelling-garden__hint-text"
                  aria-label={`The word begins with ${challenge.word[0]}`}
                >
                  {hintLetters}
                </strong>
              )}
            </div>
          </div>
        </div>

        <div
          className={[
            "spelling-garden__answer",
            answerState === "correct" ? "spelling-garden__answer--correct" : "",
            answerState === "incorrect"
              ? "spelling-garden__answer--incorrect"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="Your spelling answer"
        >
          {challenge.word.split("").map((_, index) => {
            const placedTile = placedLetters[index];

            return (
              <button
                key={`${challenge.word}-${index}`}
                type="button"
                className={
                  placedTile
                    ? "spelling-garden__answer-slot spelling-garden__answer-slot--filled"
                    : "spelling-garden__answer-slot"
                }
                disabled={!placedTile || answerLocked}
                onClick={() => handlePlacedLetterSelect(index)}
                aria-label={
                  placedTile
                    ? `Remove letter ${placedTile.letter}`
                    : `Empty letter space ${index + 1}`
                }
              >
                {placedTile ? placedTile.letter.toUpperCase() : ""}
              </button>
            );
          })}
        </div>

        <div className="spelling-garden__letter-section">
          <div className="spelling-garden__letter-heading">
            <span>Choose the letters</span>

            <button
              type="button"
              className="spelling-garden__clear"
              disabled={placedLetters.length === 0 || answerLocked}
              onClick={handleClear}
            >
              Clear
            </button>
          </div>

          <div className="spelling-garden__letters">
            {letterTiles.map((tile, index) => {
              const isUsed = usedTileIds.has(tile.id);

              return (
                <button
                  key={tile.id}
                  type="button"
                  className={
                    isUsed
                      ? "spelling-garden__letter spelling-garden__letter--used"
                      : "spelling-garden__letter"
                  }
                  disabled={isUsed || answerLocked}
                  onClick={() => handleLetterSelect(tile, index)}
                  aria-label={
                    isUsed
                      ? `Letter ${tile.letter}, already used`
                      : `Choose letter ${tile.letter}`
                  }
                >
                  {tile.letter.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="spelling-garden__flower-bed"
          aria-label={`${flowers} flowers growing in the garden`}
        >
          <div className="spelling-garden__soil" />

          <div className="spelling-garden__flowers">
            {Array.from({
              length: Math.min(flowers, 18),
            }).map((_, index) => (
              <span
                key={index}
                className="spelling-garden__flower"
                style={
                  {
                    "--flower-delay": `${index * 45}ms`,
                    "--flower-lean": index % 2 === 0 ? "-3deg" : "3deg",
                  } as React.CSSProperties
                }
                aria-hidden="true"
              >
                {["🌸", "🌼", "🌷", "🌻"][index % 4]}
              </span>
            ))}

            {flowers === 0 && (
              <span className="spelling-garden__empty-garden">
                Spell words to grow your garden
              </span>
            )}
          </div>
        </div>

        {(wordsLoading || wordsError || !canSaveProgress) && (
          <p className="spelling-garden__save-note" aria-live="polite">
            {wordsLoading
              ? "Loading garden words..."
              : wordsError ||
                "Progress will save once your child profile and word list are ready."}
          </p>
        )}
      </section>

      {roundComplete && (
        <div
          className="spelling-garden__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="spelling-complete-title"
        >
          <div className="spelling-garden__complete">
            <div className="spelling-garden__complete-icon" aria-hidden="true">
              🌻
            </div>

            <h2 id="spelling-complete-title">Your garden is blooming!</h2>

            <p>
              You spelled <strong>{correctAnswers} words</strong> and grew{" "}
              <strong>{flowers} flowers</strong>.
            </p>

            <div className="spelling-garden__complete-stats">
              <div>
                <span>Correct</span>
                <strong>{correctAnswers}</strong>
              </div>

              <div>
                <span>Attempts</span>
                <strong>{attempts}</strong>
              </div>

              <div>
                <span>Flowers</span>
                <strong>{flowers}</strong>
              </div>
            </div>

            <div className="spelling-garden__reward">
              <span aria-hidden="true">⭐</span>
              <span>
                {saveStatus === "submitted" && saveResponse
                  ? `Saved ${saveResponse.xpEarned} XP for ${selectedChild?.name ?? "your child"}.`
                  : `You earned ${DIFFICULTY_CONFIG[difficulty].flowerReward + 1} stars`}
              </span>
            </div>

            <p className="spelling-garden__save-status" aria-live="polite">
              {saveStatus === "submitting" && "Saving progress..."}
              {saveStatus === "failed" &&
                (saveError ||
                  "Your game is complete, but progress could not be saved.")}
              {saveStatus === "submitted" &&
                saveResponse &&
                `Level ${saveResponse.level}, ${saveResponse.reward_points} stars`}
            </p>

            <div className="spelling-garden__complete-actions">
              {saveStatus === "failed" && (
                <button
                  type="button"
                  className="spelling-garden__retry-save"
                  onClick={retrySpellingProgress}
                >
                  Retry saving
                </button>
              )}

              <button
                type="button"
                className="spelling-garden__play-again"
                onClick={() => resetGame(difficulty)}
              >
                Grow another garden
              </button>

              {difficulty !== "hard" && (
                <button
                  type="button"
                  className="spelling-garden__next-level"
                  onClick={() => {
                    const nextDifficulty =
                      difficulty === "easy" ? "medium" : "hard";

                    resetGame(nextDifficulty);
                  }}
                >
                  Try the next level
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {celebrationParticles.map((particle) => (
        <span
          key={particle.id}
          className="spelling-garden__celebration"
          aria-hidden="true"
          style={
            {
              "--particle-left": `${particle.left}%`,
              "--particle-delay": `${particle.delay}s`,
              "--particle-rotation": `${particle.rotation}deg`,
            } as React.CSSProperties
          }
        >
          {particle.symbol}
        </span>
      ))}

      <style jsx>{`
        .spelling-garden {
          position: fixed;
          inset: 0;
          min-height: 100dvh;
          overflow-x: hidden;
          overflow-y: auto;
          padding: max(86px, calc(env(safe-area-inset-top) + 70px)) 15px
            max(30px, calc(env(safe-area-inset-bottom) + 20px));
          box-sizing: border-box;
          background:
            radial-gradient(
              circle at 14% 12%,
              rgba(255, 255, 255, 0.76),
              transparent 22%
            ),
            radial-gradient(
              circle at 88% 75%,
              rgba(255, 233, 188, 0.55),
              transparent 25%
            ),
            linear-gradient(180deg, #d8efff 0%, #ecf8ff 48%, #daf1df 100%);
          color: #405b4d;
          font-family:
            "Baloo 2", ui-rounded, "Arial Rounded MT Bold", system-ui,
            sans-serif;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .spelling-garden__header {
          position: fixed;
          top: max(13px, env(safe-area-inset-top));
          right: max(13px, env(safe-area-inset-right));
          left: max(13px, env(safe-area-inset-left));
          z-index: 30;
          display: flex;
          justify-content: center;
          gap: 8px;
          pointer-events: none;
        }

        .spelling-garden__stat {
          display: flex;
          min-width: 77px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 13px;
          border: 1px solid rgba(255, 255, 255, 0.78);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.58);
          box-shadow: 0 8px 22px rgba(58, 88, 71, 0.11);
          font-size: 16px;
          font-weight: 800;
          line-height: 1;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .spelling-garden__game {
          position: relative;
          z-index: 5;
          width: min(780px, 100%);
          margin: 0 auto;
        }

        .spelling-garden__top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .spelling-garden__top-row h1 {
          margin: 0;
          color: #315343;
          font-size: clamp(34px, 8vw, 52px);
          font-weight: 900;
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .spelling-garden__top-row p {
          min-height: 25px;
          margin: 11px 0 0;
          color: #687d72;
          font-size: 17px;
          font-weight: 700;
        }

        .spelling-garden__restart {
          display: inline-flex;
          min-height: 44px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 14px;
          border: 1px solid rgba(255, 255, 255, 0.82);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.58);
          color: #526d60;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          transition:
            transform 140ms ease,
            background 140ms ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .spelling-garden__restart:hover {
          background: rgba(255, 255, 255, 0.84);
          transform: translateY(-2px);
        }

        .spelling-garden__restart:focus-visible,
        .spelling-garden__difficulty-button:focus-visible,
        .spelling-garden__hint-button:focus-visible,
        .spelling-garden__answer-slot:focus-visible,
        .spelling-garden__letter:focus-visible,
        .spelling-garden__clear:focus-visible,
        .spelling-garden__retry-save:focus-visible,
        .spelling-garden__play-again:focus-visible,
        .spelling-garden__next-level:focus-visible {
          outline: 4px solid rgba(75, 139, 102, 0.34);
          outline-offset: 3px;
        }

        .spelling-garden__difficulty {
          display: flex;
          width: fit-content;
          gap: 5px;
          margin-top: 22px;
          padding: 5px;
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.42);
        }

        .spelling-garden__difficulty-button {
          min-height: 38px;
          padding: 7px 15px;
          border: 0;
          border-radius: 11px;
          background: transparent;
          color: #65786e;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          transition:
            color 140ms ease,
            background 140ms ease,
            transform 140ms ease;
        }

        .spelling-garden__difficulty-button--active {
          background: #46745d;
          box-shadow: 0 4px 0 #305541;
          color: white;
        }

        .spelling-garden__progress {
          margin-top: 18px;
        }

        .spelling-garden__progress-copy {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #65796f;
          font-size: 14px;
          font-weight: 800;
        }

        .spelling-garden__progress-copy strong {
          color: #415e50;
        }

        .spelling-garden__progress-track {
          height: 11px;
          margin-top: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.68);
          box-shadow: inset 0 2px 4px rgba(58, 89, 71, 0.08);
        }

        .spelling-garden__progress-value {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #77bf92, #f0ca59);
          transition: width 420ms ease;
        }

        .spelling-garden__challenge {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: clamp(16px, 4vw, 28px);
          margin-top: 22px;
          padding: clamp(18px, 4vw, 27px);
          border: 2px solid rgba(255, 255, 255, 0.75);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.57);
          box-shadow: 0 16px 38px rgba(56, 89, 70, 0.11);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .spelling-garden__picture {
          display: flex;
          width: clamp(82px, 18vw, 120px);
          aspect-ratio: 1;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255, 255, 255, 0.82);
          border-radius: 29%;
          background: #fff0bd;
          box-shadow: 0 7px 0 #d6b95b;
          font-size: clamp(45px, 11vw, 72px);
          line-height: 1;
        }

        .spelling-garden__clue > span {
          display: inline-flex;
          padding: 5px 10px;
          border-radius: 999px;
          background: #dff1e5;
          color: #4b705d;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .spelling-garden__clue h2 {
          margin: 9px 0 0;
          color: #385446;
          font-size: clamp(20px, 4.8vw, 29px);
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .spelling-garden__hint-row {
          display: flex;
          min-height: 34px;
          align-items: center;
          gap: 13px;
          margin-top: 14px;
        }

        .spelling-garden__hint-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          border: 1px solid #c9dfd1;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.66);
          color: #557064;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
        }

        .spelling-garden__hint-text {
          color: #587165;
          font-size: 18px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .spelling-garden__answer {
          display: flex;
          min-height: 84px;
          align-items: center;
          justify-content: center;
          gap: clamp(7px, 2vw, 12px);
          margin-top: 20px;
          padding: 13px;
          border: 2px solid rgba(255, 255, 255, 0.72);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.42);
          transition:
            background 180ms ease,
            border-color 180ms ease;
        }

        .spelling-garden__answer--correct {
          border-color: #82c99b;
          background: rgba(205, 243, 217, 0.78);
          animation: correct-pop 430ms ease;
        }

        .spelling-garden__answer--incorrect {
          border-color: #ec9a9f;
          background: rgba(255, 218, 221, 0.78);
          animation: incorrect-shake 360ms ease;
        }

        .spelling-garden__answer-slot {
          display: flex;
          width: clamp(48px, 12vw, 68px);
          aspect-ratio: 0.9;
          align-items: center;
          justify-content: center;
          border: 3px dashed #a8c6b5;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.52);
          color: #365747;
          font: inherit;
          font-size: clamp(25px, 7vw, 39px);
          font-weight: 900;
          transition:
            transform 150ms ease,
            background 150ms ease,
            box-shadow 150ms ease;
        }

        .spelling-garden__answer-slot--filled {
          border-style: solid;
          border-color: rgba(255, 255, 255, 0.8);
          background: #e6f4e9;
          box-shadow:
            0 5px 0 #8fbea0,
            0 10px 18px rgba(55, 88, 70, 0.1);
          cursor: pointer;
          animation: letter-drop 260ms ease;
        }

        .spelling-garden__answer-slot--filled:not(:disabled):hover {
          transform: translateY(-2px);
        }

        .spelling-garden__letter-section {
          margin-top: 18px;
        }

        .spelling-garden__letter-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #61756b;
          font-size: 14px;
          font-weight: 800;
        }

        .spelling-garden__clear {
          min-height: 34px;
          padding: 5px 12px;
          border: 1px solid rgba(103, 131, 116, 0.22);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.54);
          color: #587064;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
        }

        .spelling-garden__clear:disabled {
          cursor: default;
          opacity: 0.42;
        }

        .spelling-garden__letters {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: clamp(8px, 2vw, 12px);
          margin-top: 10px;
        }

        .spelling-garden__letter {
          display: flex;
          width: clamp(52px, 13vw, 72px);
          aspect-ratio: 1;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255, 255, 255, 0.76);
          border-radius: 18px;
          background: #fff0bd;
          box-shadow:
            0 6px 0 #d2b354,
            0 12px 20px rgba(84, 77, 44, 0.12);
          color: #554b32;
          cursor: pointer;
          font: inherit;
          font-size: clamp(27px, 7vw, 40px);
          font-weight: 900;
          transition:
            transform 130ms ease,
            box-shadow 130ms ease,
            opacity 160ms ease;
          touch-action: manipulation;
        }

        .spelling-garden__letter:hover:not(:disabled) {
          transform: translateY(-3px) rotate(-1deg);
        }

        .spelling-garden__letter:active:not(:disabled) {
          box-shadow:
            0 2px 0 #d2b354,
            0 6px 12px rgba(84, 77, 44, 0.1);
          transform: translateY(4px);
        }

        .spelling-garden__letter--used {
          box-shadow: none;
          cursor: default;
          opacity: 0.2;
          transform: scale(0.88);
        }

        .spelling-garden__flower-bed {
          position: relative;
          min-height: 91px;
          margin-top: 25px;
          overflow: hidden;
          border-radius: 22px;
          background: linear-gradient(
            180deg,
            rgba(151, 216, 168, 0.18),
            rgba(105, 183, 128, 0.3)
          );
        }

        .spelling-garden__soil {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          height: 37px;
          border-radius: 45% 45% 0 0 / 22% 22% 0 0;
          background: linear-gradient(180deg, #8acb94, #66ae78);
        }

        .spelling-garden__flowers {
          position: absolute;
          inset: 8px 10px 20px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: clamp(1px, 1.1vw, 7px);
        }

        .spelling-garden__flower {
          display: block;
          font-size: clamp(20px, 5vw, 31px);
          line-height: 1;
          transform-origin: bottom center;
          animation: flower-grow 480ms cubic-bezier(0.2, 0.8, 0.2, 1.2)
            var(--flower-delay) both;
        }

        .spelling-garden__empty-garden {
          align-self: center;
          color: #668171;
          font-size: 14px;
          font-weight: 800;
        }

        .spelling-garden__overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(42, 72, 55, 0.42);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .spelling-garden__complete {
          width: min(450px, 100%);
          padding: 30px 24px 25px;
          border: 3px solid rgba(255, 255, 255, 0.82);
          border-radius: 32px;
          background: #effaf1;
          box-shadow: 0 30px 80px rgba(34, 66, 47, 0.3);
          text-align: center;
          animation: modal-pop 440ms cubic-bezier(0.2, 0.8, 0.2, 1.15);
        }

        .spelling-garden__complete-icon {
          font-size: 64px;
          line-height: 1;
          animation: flower-sway 700ms ease-in-out infinite alternate;
        }

        .spelling-garden__complete h2 {
          margin: 17px 0 0;
          color: #365444;
          font-size: clamp(30px, 8vw, 42px);
          font-weight: 900;
          letter-spacing: -0.035em;
        }

        .spelling-garden__complete > p {
          margin: 13px auto 0;
          max-width: 350px;
          color: #667a6f;
          font-size: 17px;
          line-height: 1.6;
        }

        .spelling-garden__complete > p strong {
          color: #405b4d;
        }

        .spelling-garden__complete-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 21px;
        }

        .spelling-garden__complete-stats div {
          padding: 13px 8px;
          border-radius: 15px;
          background: #dff1e4;
        }

        .spelling-garden__complete-stats span,
        .spelling-garden__complete-stats strong {
          display: block;
        }

        .spelling-garden__complete-stats span {
          color: #6a7d72;
          font-size: 12px;
          font-weight: 800;
        }

        .spelling-garden__complete-stats strong {
          margin-top: 4px;
          color: #3d594b;
          font-size: 23px;
          font-weight: 900;
        }

        .spelling-garden__reward {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          padding: 9px 15px;
          border-radius: 999px;
          background: #fff0bd;
          color: #675a3c;
          font-weight: 900;
        }

        .spelling-garden__save-note,
        .spelling-garden__save-status {
          margin: 14px 0 0;
          color: #5c7268;
          font-size: 14px;
          font-weight: 800;
          text-align: center;
        }

        .spelling-garden__complete-actions {
          display: grid;
          gap: 10px;
          margin-top: 22px;
        }

        .spelling-garden__retry-save,
        .spelling-garden__play-again,
        .spelling-garden__next-level {
          min-height: 52px;
          border-radius: 16px;
          cursor: pointer;
          font: inherit;
          font-size: 16px;
          font-weight: 900;
          transition:
            transform 140ms ease,
            box-shadow 140ms ease;
        }

        .spelling-garden__retry-save {
          border: 2px solid #e0b654;
          background: #fff5cf;
          color: #6c5a24;
        }

        .spelling-garden__play-again {
          border: 0;
          background: #46745d;
          box-shadow: 0 6px 0 #305541;
          color: white;
        }

        .spelling-garden__next-level {
          border: 2px solid #bcd9c7;
          background: white;
          color: #466453;
        }

        .spelling-garden__retry-save:hover,
        .spelling-garden__play-again:hover,
        .spelling-garden__next-level:hover {
          transform: translateY(-2px);
        }

        .spelling-garden__celebration {
          position: fixed;
          bottom: 29%;
          left: var(--particle-left);
          z-index: 60;
          font-size: clamp(18px, 5vw, 33px);
          pointer-events: none;
          animation: celebration-rise 1.45s ease-out var(--particle-delay) both;
        }

        .spelling-garden__cloud {
          position: fixed;
          z-index: 1;
          width: 140px;
          height: 42px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.48);
          pointer-events: none;
          animation: cloud-drift 10s ease-in-out infinite alternate;
        }

        .spelling-garden__cloud::before,
        .spelling-garden__cloud::after {
          position: absolute;
          content: "";
          border-radius: 999px;
          background: inherit;
        }

        .spelling-garden__cloud::before {
          top: -23px;
          left: 28px;
          width: 61px;
          height: 54px;
        }

        .spelling-garden__cloud::after {
          top: -13px;
          right: 17px;
          width: 50px;
          height: 42px;
        }

        .spelling-garden__cloud--one {
          top: 20%;
          left: -37px;
          transform: scale(0.72);
        }

        .spelling-garden__cloud--two {
          top: 38%;
          right: -46px;
          transform: scale(0.56);
          animation-delay: -4s;
        }

        @keyframes letter-drop {
          0% {
            opacity: 0;
            transform: translateY(-15px) scale(0.8);
          }

          70% {
            transform: translateY(3px) scale(1.06);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes correct-pop {
          0%,
          100% {
            transform: scale(1);
          }

          55% {
            transform: scale(1.025);
          }
        }

        @keyframes incorrect-shake {
          0%,
          100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-8px);
          }

          50% {
            transform: translateX(8px);
          }

          75% {
            transform: translateX(-5px);
          }
        }

        @keyframes flower-grow {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(0.2) rotate(var(--flower-lean));
          }

          70% {
            transform: translateY(-3px) scale(1.1) rotate(var(--flower-lean));
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(var(--flower-lean));
          }
        }

        @keyframes modal-pop {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.88);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes flower-sway {
          from {
            transform: rotate(-5deg) translateY(0);
          }

          to {
            transform: rotate(5deg) translateY(-7px);
          }
        }

        @keyframes celebration-rise {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.4) rotate(0);
          }

          17% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translateY(-350px) scale(1.25)
              rotate(var(--particle-rotation));
          }
        }

        @keyframes cloud-drift {
          from {
            margin-left: -9px;
          }

          to {
            margin-left: 24px;
          }
        }

        @media (max-width: 580px) {
          .spelling-garden {
            padding-right: 10px;
            padding-left: 10px;
          }

          .spelling-garden__restart {
            width: 44px;
            padding: 0;
          }

          .spelling-garden__restart span {
            display: none;
          }

          .spelling-garden__stat {
            min-width: 0;
            max-width: 108px;
            flex: 1;
            padding-right: 8px;
            padding-left: 8px;
            font-size: 15px;
          }

          .spelling-garden__difficulty {
            width: 100%;
          }

          .spelling-garden__difficulty-button {
            flex: 1;
            padding-right: 8px;
            padding-left: 8px;
          }

          .spelling-garden__challenge {
            grid-template-columns: 78px 1fr;
            gap: 14px;
            border-radius: 23px;
          }

          .spelling-garden__picture {
            width: 78px;
            font-size: 44px;
          }

          .spelling-garden__clue h2 {
            font-size: 18px;
          }

          .spelling-garden__hint-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }

          .spelling-garden__answer {
            gap: 6px;
            min-height: 76px;
            padding-right: 7px;
            padding-left: 7px;
          }

          .spelling-garden__answer-slot {
            border-width: 2px;
            border-radius: 13px;
          }

          .spelling-garden__letter {
            border-width: 2px;
            border-radius: 15px;
          }
        }

        @media (max-width: 370px) {
          .spelling-garden__challenge {
            grid-template-columns: 65px 1fr;
            padding: 14px;
          }

          .spelling-garden__picture {
            width: 65px;
            font-size: 37px;
          }

          .spelling-garden__clue h2 {
            font-size: 16px;
          }

          .spelling-garden__answer-slot {
            width: clamp(41px, 11.5vw, 50px);
          }

          .spelling-garden__letter {
            width: clamp(46px, 12vw, 54px);
          }
        }

        @media (max-height: 700px) and (min-width: 600px) {
          .spelling-garden {
            padding-top: 76px;
          }

          .spelling-garden__top-row h1 {
            font-size: 36px;
          }

          .spelling-garden__difficulty {
            margin-top: 12px;
          }

          .spelling-garden__progress {
            margin-top: 11px;
          }

          .spelling-garden__challenge {
            margin-top: 13px;
            padding: 14px 18px;
          }

          .spelling-garden__picture {
            width: 78px;
            font-size: 44px;
          }

          .spelling-garden__answer {
            min-height: 68px;
            margin-top: 12px;
          }

          .spelling-garden__answer-slot {
            width: 50px;
          }

          .spelling-garden__letter-section {
            margin-top: 10px;
          }

          .spelling-garden__letter {
            width: 53px;
          }

          .spelling-garden__flower-bed {
            min-height: 72px;
            margin-top: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .spelling-garden__restart,
          .spelling-garden__difficulty-button,
          .spelling-garden__progress-value,
          .spelling-garden__answer-slot,
          .spelling-garden__letter,
          .spelling-garden__play-again,
          .spelling-garden__retry-save,
          .spelling-garden__next-level {
            transition: none;
          }

          .spelling-garden__answer,
          .spelling-garden__answer-slot--filled,
          .spelling-garden__flower,
          .spelling-garden__complete,
          .spelling-garden__complete-icon,
          .spelling-garden__celebration,
          .spelling-garden__cloud {
            animation-duration: 0.01ms;
            animation-iteration-count: 1;
          }
        }
      `}</style>
    </main>
  );
}

function RestartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4v6h6" />
      <path d="M5.5 15a8 8 0 1 0 .5-7l-2 2" />
    </svg>
  );
}

function HintIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.5 14.5A6 6 0 1 1 16 14c-.9.7-1 1.4-1 2h-6c0-.6-.1-1.1-.5-1.5Z" />
    </svg>
  );
}
