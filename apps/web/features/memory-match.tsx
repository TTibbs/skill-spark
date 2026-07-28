"use client";

import { redirect } from "next/navigation";
import * as React from "react";
import { useSubmitGameResult } from "@/features/game-results/use-submit-game-result";

type Difficulty = "easy" | "medium" | "hard";

type CardSymbol = {
  id: string;
  symbol: string;
  label: string;
  colour: string;
  lightColour: string;
};

type MemoryCard = CardSymbol & {
  cardId: string;
  matched: boolean;
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

const SYMBOLS: CardSymbol[] = [
  {
    id: "fox",
    symbol: "🦊",
    label: "fox",
    colour: "#f5a05c",
    lightColour: "#ffe3c8",
  },
  {
    id: "frog",
    symbol: "🐸",
    label: "frog",
    colour: "#78c98a",
    lightColour: "#dff5e4",
  },
  {
    id: "bee",
    symbol: "🐝",
    label: "bee",
    colour: "#f3c74f",
    lightColour: "#fff1b9",
  },
  {
    id: "whale",
    symbol: "🐳",
    label: "whale",
    colour: "#6aaee8",
    lightColour: "#dceeff",
  },
  {
    id: "butterfly",
    symbol: "🦋",
    label: "butterfly",
    colour: "#a98ae8",
    lightColour: "#e8ddff",
  },
  {
    id: "ladybird",
    symbol: "🐞",
    label: "ladybird",
    colour: "#eb7373",
    lightColour: "#ffdada",
  },
  {
    id: "sunflower",
    symbol: "🌻",
    label: "sunflower",
    colour: "#e9b93d",
    lightColour: "#fff0bd",
  },
  {
    id: "strawberry",
    symbol: "🍓",
    label: "strawberry",
    colour: "#ea6a7e",
    lightColour: "#ffdce2",
  },
  {
    id: "rainbow",
    symbol: "🌈",
    label: "rainbow",
    colour: "#8d82e7",
    lightColour: "#e5e1ff",
  },
  {
    id: "rocket",
    symbol: "🚀",
    label: "rocket",
    colour: "#7195d8",
    lightColour: "#dce7ff",
  },
  {
    id: "dinosaur",
    symbol: "🦕",
    label: "dinosaur",
    colour: "#69b98c",
    lightColour: "#dff3e7",
  },
  {
    id: "star",
    symbol: "⭐",
    label: "star",
    colour: "#e7b942",
    lightColour: "#fff0b8",
  },
];

const DIFFICULTY_CONFIG = {
  easy: {
    pairs: 4,
    columns: 4,
    label: "Easy",
    reward: 2,
  },
  medium: {
    pairs: 6,
    columns: 4,
    label: "Medium",
    reward: 3,
  },
  hard: {
    pairs: 8,
    columns: 4,
    label: "Hard",
    reward: 4,
  },
} as const;

const INITIAL_DECK: MemoryCard[] = [
  {
    ...SYMBOLS[0],
    cardId: "fox-a",
    matched: false,
  },
  {
    ...SYMBOLS[1],
    cardId: "frog-a",
    matched: false,
  },
  {
    ...SYMBOLS[2],
    cardId: "bee-a",
    matched: false,
  },
  {
    ...SYMBOLS[3],
    cardId: "whale-a",
    matched: false,
  },
  {
    ...SYMBOLS[0],
    cardId: "fox-b",
    matched: false,
  },
  {
    ...SYMBOLS[1],
    cardId: "frog-b",
    matched: false,
  },
  {
    ...SYMBOLS[2],
    cardId: "bee-b",
    matched: false,
  },
  {
    ...SYMBOLS[3],
    cardId: "whale-b",
    matched: false,
  },
];

const CELEBRATION_SYMBOLS = ["⭐", "✨", "🌟", "💫"];

function shuffle<T>(items: readonly T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function createDeck(difficulty: Difficulty): MemoryCard[] {
  const pairCount = DIFFICULTY_CONFIG[difficulty].pairs;
  const chosenSymbols = shuffle(SYMBOLS).slice(0, pairCount);

  const cards = chosenSymbols.flatMap((item) => [
    {
      ...item,
      cardId: `${item.id}-a`,
      matched: false,
    },
    {
      ...item,
      cardId: `${item.id}-b`,
      matched: false,
    },
  ]);

  return shuffle(cards);
}

function createCelebrationParticles(): CelebrationParticle[] {
  return Array.from({ length: 22 }, (_, index) => ({
    id: index,
    symbol:
      CELEBRATION_SYMBOLS[
        Math.floor(Math.random() * CELEBRATION_SYMBOLS.length)
      ],
    left: 3 + Math.random() * 94,
    delay: Math.random() * 0.45,
    rotation: -180 + Math.random() * 360,
  }));
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function MemoryMatch() {
  const progressSave = useSubmitGameResult();
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioTimeoutsRef = React.useRef<number[]>([]);
  const comparisonTimeoutRef = React.useRef<number | null>(null);
  const timerRef = React.useRef<number | null>(null);

  const firstSelectedRef = React.useRef<string | null>(null);
  const secondSelectedRef = React.useRef<string | null>(null);
  const lockedRef = React.useRef(false);
  const gameStartedRef = React.useRef(false);
  const gameCompleteRef = React.useRef(false);

  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");

  const [cards, setCards] = React.useState<MemoryCard[]>(INITIAL_DECK);

  const [firstSelected, setFirstSelected] = React.useState<string | null>(null);

  const [secondSelected, setSecondSelected] = React.useState<string | null>(
    null,
  );

  const [moves, setMoves] = React.useState(0);
  const [matches, setMatches] = React.useState(0);
  const [seconds, setSeconds] = React.useState(0);
  const [message, setMessage] = React.useState(
    "Turn over two cards to find a pair.",
  );
  const [gameComplete, setGameComplete] = React.useState(false);
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
      volume = 0.16,
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
      volume = 0.16,
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

  const playFlipSound = React.useCallback(() => {
    playTone(340, 0.09, "sine", 0.08);
  }, [playTone]);

  const playMatchSound = React.useCallback(() => {
    [440, 554.37, 659.25].forEach((frequency, index) => {
      scheduleTone(frequency, index * 55, 0.2, "triangle", 0.15);
    });
  }, [scheduleTone]);

  const playNoMatchSound = React.useCallback(() => {
    playTone(210, 0.14, "sine", 0.07);
  }, [playTone]);

  const playCompleteSound = React.useCallback(() => {
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      scheduleTone(frequency, index * 75, 0.28, "triangle", 0.17);
    });
  }, [scheduleTone]);

  const clearComparisonTimeout = React.useCallback(() => {
    if (comparisonTimeoutRef.current !== null) {
      window.clearTimeout(comparisonTimeoutRef.current);
      comparisonTimeoutRef.current = null;
    }
  }, []);

  const stopTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = React.useCallback(() => {
    if (timerRef.current !== null || gameCompleteRef.current) {
      return;
    }

    gameStartedRef.current = true;

    timerRef.current = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);
  }, []);

  const resetSelection = React.useCallback(() => {
    firstSelectedRef.current = null;
    secondSelectedRef.current = null;
    lockedRef.current = false;

    setFirstSelected(null);
    setSecondSelected(null);
  }, []);

  const startNewGame = React.useCallback(
    (nextDifficulty: Difficulty, shouldShuffle = true) => {
      progressSave.resetSession();
      clearComparisonTimeout();
      stopTimer();

      firstSelectedRef.current = null;
      secondSelectedRef.current = null;
      lockedRef.current = false;
      gameStartedRef.current = false;
      gameCompleteRef.current = false;

      setDifficulty(nextDifficulty);
      setCards(shouldShuffle ? createDeck(nextDifficulty) : INITIAL_DECK);
      setFirstSelected(null);
      setSecondSelected(null);
      setMoves(0);
      setMatches(0);
      setSeconds(0);
      setMessage("Turn over two cards to find a pair.");
      setGameComplete(false);
      setCelebrationParticles([]);
    },
    [clearComparisonTimeout, progressSave, stopTimer],
  );

  const completeGame = React.useCallback(() => {
    gameCompleteRef.current = true;
    lockedRef.current = true;

    stopTimer();
    setGameComplete(true);
    setMessage("You found every pair!");
    setCelebrationParticles(createCelebrationParticles());

    playCompleteSound();
  }, [playCompleteSound, stopTimer]);

  const compareCards = React.useCallback(
    (firstCardId: string, secondCardId: string) => {
      const firstCard = cards.find((card) => card.cardId === firstCardId);
      const secondCard = cards.find((card) => card.cardId === secondCardId);

      if (!firstCard || !secondCard) {
        resetSelection();
        return;
      }

      setMoves((current) => current + 1);

      if (firstCard.id === secondCard.id) {
        const nextMatches = matches + 1;

        setCards((currentCards) =>
          currentCards.map((card) =>
            card.id === firstCard.id ? { ...card, matched: true } : card,
          ),
        );

        setMatches(nextMatches);
        setMessage(`You found the ${firstCard.label} pair!`);
        playMatchSound();

        comparisonTimeoutRef.current = window.setTimeout(() => {
          resetSelection();

          if (nextMatches === DIFFICULTY_CONFIG[difficulty].pairs) {
            completeGame();
          } else {
            setMessage("Great match! Find another pair.");
          }
        }, 650);

        return;
      }

      setMessage("Not a match — remember where they are.");
      playNoMatchSound();

      comparisonTimeoutRef.current = window.setTimeout(() => {
        resetSelection();
        setMessage("Try another pair.");
      }, 900);
    },
    [
      cards,
      completeGame,
      difficulty,
      matches,
      playMatchSound,
      playNoMatchSound,
      resetSelection,
    ],
  );

  const handleCardSelect = React.useCallback(
    (cardId: string) => {
      if (lockedRef.current || gameCompleteRef.current) {
        return;
      }

      progressSave.beginSession("memory");
      const selectedCard = cards.find((card) => card.cardId === cardId);

      if (
        !selectedCard ||
        selectedCard.matched ||
        firstSelectedRef.current === cardId
      ) {
        return;
      }

      ensureAudio();
      startTimer();
      playFlipSound();

      if (!firstSelectedRef.current) {
        firstSelectedRef.current = cardId;
        setFirstSelected(cardId);
        setMessage("Now find its matching card.");
        return;
      }

      secondSelectedRef.current = cardId;
      lockedRef.current = true;

      setSecondSelected(cardId);

      compareCards(firstSelectedRef.current, cardId);
    },
    [cards, compareCards, ensureAudio, playFlipSound, progressSave, startTimer],
  );

  React.useEffect(() => {
    if (!gameComplete) return;
    void progressSave
      .submit({
        kind: "memory",
        result: {
          totalMoves: moves,
          timeSpent: seconds,
          type: "picture",
        },
      })
      .catch(() => undefined);
  }, [gameComplete, moves, progressSave, seconds]);

  const handleDifficultyChange = React.useCallback(
    (nextDifficulty: Difficulty) => {
      if (nextDifficulty === difficulty) return;

      startNewGame(nextDifficulty);
    },
    [difficulty, startNewGame],
  );

  React.useEffect(() => {
    return () => {
      clearComparisonTimeout();
      stopTimer();

      for (const timeoutId of audioTimeoutsRef.current) {
        window.clearTimeout(timeoutId);
      }

      audioTimeoutsRef.current = [];

      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [clearComparisonTimeout, stopTimer]);

  const pairCount = DIFFICULTY_CONFIG[difficulty].pairs;
  const progress = (matches / pairCount) * 100;
  const earnedStars = gameComplete ? DIFFICULTY_CONFIG[difficulty].reward : 0;

  return (
    <main className="memory-match">
      <div
        className="memory-match__decoration memory-match__decoration--one"
        aria-hidden="true"
      />
      <div
        className="memory-match__decoration memory-match__decoration--two"
        aria-hidden="true"
      />

      {/* Back Button */}
      <button
        type="button"
        className="memory-match__back-button"
        onClick={() => redirect("/games")}
      >
        Back
      </button>

      <header className="memory-match__header">
        <div
          className="memory-match__stat"
          aria-label={`${matches} of ${pairCount} pairs found`}
        >
          <span aria-hidden="true">🧩</span>
          <span>
            {matches}/{pairCount}
          </span>
        </div>

        <div className="memory-match__stat" aria-label={`${moves} moves`}>
          <span aria-hidden="true">👆</span>
          <span>{moves}</span>
        </div>

        <div className="memory-match__stat" aria-label={`${seconds} seconds`}>
          <span aria-hidden="true">⏱️</span>
          <span>{formatTime(seconds)}</span>
        </div>
      </header>

      <section className="memory-match__game">
        <div className="memory-match__title-row">
          <div>
            <h1>Memory Match</h1>
            <p aria-live="polite">{message}</p>
          </div>

          <button
            type="button"
            className="memory-match__restart"
            onClick={() => startNewGame(difficulty)}
          >
            <RestartIcon />
            <span>New game</span>
          </button>
        </div>

        <div
          className="memory-match__difficulty"
          aria-label="Choose difficulty"
        >
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((option) => (
            <button
              key={option}
              type="button"
              className={
                difficulty === option
                  ? "memory-match__difficulty-button memory-match__difficulty-button--active"
                  : "memory-match__difficulty-button"
              }
              aria-pressed={difficulty === option}
              onClick={() => handleDifficultyChange(option)}
            >
              {DIFFICULTY_CONFIG[option].label}
            </button>
          ))}
        </div>

        <div className="memory-match__progress">
          <div className="memory-match__progress-copy">
            <span>Pairs found</span>
            <strong>
              {matches} of {pairCount}
            </strong>
          </div>

          <div className="memory-match__progress-track">
            <div
              className="memory-match__progress-value"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div
          className={[
            "memory-match__grid",
            `memory-match__grid--${difficulty}`,
          ].join(" ")}
          aria-label="Memory cards"
        >
          {cards.map((card) => {
            const isSelected =
              firstSelected === card.cardId || secondSelected === card.cardId;

            const isVisible = isSelected || card.matched;

            return (
              <button
                key={card.cardId}
                type="button"
                className={[
                  "memory-card",
                  isVisible ? "memory-card--flipped" : "",
                  card.matched ? "memory-card--matched" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={
                  card.matched
                    ? `${card.label}, matched`
                    : isVisible
                      ? card.label
                      : "Hidden memory card"
                }
                aria-pressed={isVisible}
                disabled={card.matched || gameComplete}
                onClick={() => handleCardSelect(card.cardId)}
              >
                <span className="memory-card__inner">
                  <span className="memory-card__back">
                    <span className="memory-card__back-shape">
                      <QuestionMarkIcon />
                    </span>
                  </span>

                  <span
                    className="memory-card__front"
                    style={
                      {
                        "--card-colour": card.colour,
                        "--card-light-colour": card.lightColour,
                      } as React.CSSProperties
                    }
                  >
                    <span className="memory-card__symbol" aria-hidden="true">
                      {card.symbol}
                    </span>

                    <span className="memory-card__label">{card.label}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {gameComplete && (
        <div
          className="memory-match__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="memory-complete-title"
        >
          <div className="memory-match__complete">
            <div className="memory-match__complete-icon" aria-hidden="true">
              🏆
            </div>

            <h2 id="memory-complete-title">Every pair found!</h2>

            <p>
              You completed the board in <strong>{moves} moves</strong> and{" "}
              <strong>{formatTime(seconds)}</strong>.
            </p>

            <div className="memory-match__reward">
              <span aria-hidden="true">⭐</span>
              <span>
                {progressSave.status === "submitted" && progressSave.response
                  ? `Saved ${progressSave.response.xpEarned} XP for ${progressSave.response.child.name}.`
                  : `You earned ${earnedStars} ${
                      earnedStars === DIFFICULTY_CONFIG[difficulty].reward
                        ? "star"
                        : "stars"
                    }.`}
              </span>
            </div>

            <p className="memory-match__save-status" aria-live="polite">
              {progressSave.status === "submitting" && "Saving progress..."}
              {progressSave.status === "failed" && progressSave.error}
              {progressSave.status === "submitted" &&
                progressSave.response &&
                `Level ${progressSave.response.child.level}, ${progressSave.response.child.reward_points} stars`}
            </p>

            <div className="memory-match__complete-actions">
              {progressSave.status === "failed" && (
                <button
                  type="button"
                  className="memory-match__play-again"
                  onClick={() =>
                    void progressSave.retry().catch(() => undefined)
                  }
                >
                  Retry saving
                </button>
              )}

              <button
                type="button"
                className="memory-match__play-again"
                onClick={() => startNewGame(difficulty)}
              >
                Play again
              </button>

              {difficulty !== "hard" && (
                <button
                  type="button"
                  className="memory-match__next-level"
                  onClick={() => {
                    const nextDifficulty =
                      difficulty === "easy" ? "medium" : "hard";

                    startNewGame(nextDifficulty);
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
          className="memory-match__celebration"
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
        .memory-match {
          position: fixed;
          inset: 0;
          min-height: 100dvh;
          overflow-x: hidden;
          overflow-y: auto;
          padding: max(88px, calc(env(safe-area-inset-top) + 72px)) 16px
            max(32px, calc(env(safe-area-inset-bottom) + 22px));
          box-sizing: border-box;
          background:
            radial-gradient(
              circle at 15% 12%,
              rgba(255, 255, 255, 0.72),
              transparent 23%
            ),
            radial-gradient(
              circle at 88% 76%,
              rgba(239, 219, 255, 0.64),
              transparent 26%
            ),
            linear-gradient(180deg, #dcecff 0%, #edf5ff 48%, #e6f3ec 100%);
          color: #4b4261;
          font-family:
            "Baloo 2", ui-rounded, "Arial Rounded MT Bold", system-ui,
            sans-serif;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .memory-match__header {
          position: fixed;
          top: max(14px, env(safe-area-inset-top));
          right: max(14px, env(safe-area-inset-right));
          left: max(14px, env(safe-area-inset-left));
          z-index: 30;
          display: flex;
          justify-content: center;
          gap: 8px;
          pointer-events: none;
        }

        .memory-match__stat {
          display: flex;
          min-width: 76px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 13px;
          border: 1px solid rgba(255, 255, 255, 0.78);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.58);
          box-shadow: 0 8px 22px rgba(69, 62, 105, 0.11);
          font-size: 17px;
          font-weight: 800;
          line-height: 1;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .memory-match__game {
          position: relative;
          z-index: 5;
          width: min(780px, 100%);
          margin: 0 auto;
        }

        .memory-match__title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .memory-match__title-row h1 {
          margin: 0;
          color: #463d5b;
          font-size: clamp(34px, 8vw, 52px);
          font-weight: 900;
          line-height: 0.98;
          letter-spacing: -0.04em;
        }

        .memory-match__title-row p {
          min-height: 26px;
          margin: 11px 0 0;
          color: #736b84;
          font-size: 17px;
          font-weight: 700;
        }

        .memory-match__restart {
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
          color: #625877;
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

        .memory-match__restart:hover {
          background: rgba(255, 255, 255, 0.84);
          transform: translateY(-2px);
        }

        .memory-match__restart:focus-visible,
        .memory-match__difficulty-button:focus-visible,
        .memory-card:focus-visible,
        .memory-match__play-again:focus-visible,
        .memory-match__next-level:focus-visible {
          outline: 4px solid rgba(108, 91, 156, 0.35);
          outline-offset: 3px;
        }

        .memory-match__difficulty {
          display: flex;
          width: fit-content;
          gap: 5px;
          margin-top: 22px;
          padding: 5px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.42);
        }

        .memory-match__difficulty-button {
          min-height: 38px;
          padding: 7px 15px;
          border: 0;
          border-radius: 11px;
          background: transparent;
          color: #766d87;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          transition:
            color 140ms ease,
            background 140ms ease,
            transform 140ms ease;
        }

        .memory-match__difficulty-button:hover {
          color: #514661;
        }

        .memory-match__difficulty-button--active {
          background: #62527d;
          color: white;
          box-shadow: 0 4px 0 #46395f;
        }

        .memory-match__difficulty-button--active:hover {
          color: white;
          transform: translateY(-1px);
        }

        .memory-match__progress {
          margin-top: 18px;
        }

        .memory-match__progress-copy {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #70677f;
          font-size: 14px;
          font-weight: 800;
        }

        .memory-match__progress-copy strong {
          color: #51485f;
        }

        .memory-match__progress-track {
          height: 11px;
          margin-top: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.66);
          box-shadow: inset 0 2px 4px rgba(75, 65, 103, 0.08);
        }

        .memory-match__progress-value {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #a98ae8, #7cc5a1);
          transition: width 420ms ease;
        }

        .memory-match__grid {
          display: grid;
          gap: clamp(8px, 2.2vw, 15px);
          margin-top: 20px;
        }

        .memory-match__grid--easy,
        .memory-match__grid--medium,
        .memory-match__grid--hard {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .memory-card {
          position: relative;
          display: block;
          aspect-ratio: 0.86;
          min-width: 0;
          padding: 0;
          border: 0;
          border-radius: clamp(14px, 3vw, 23px);
          background: transparent;
          cursor: pointer;
          perspective: 900px;
          touch-action: manipulation;
        }

        .memory-card:disabled {
          cursor: default;
        }

        .memory-card__inner {
          position: absolute;
          inset: 0;
          display: block;
          transform-style: preserve-3d;
          transition: transform 480ms cubic-bezier(0.2, 0.7, 0.2, 1.1);
        }

        .memory-card--flipped .memory-card__inner {
          transform: rotateY(180deg);
        }

        .memory-card__back,
        .memory-card__front {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.72);
          border-radius: inherit;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .memory-card__back {
          background:
            radial-gradient(
              circle at 28% 24%,
              rgba(255, 255, 255, 0.35),
              transparent 23%
            ),
            linear-gradient(145deg, #7762a3, #584875);
          box-shadow:
            0 7px 0 #423653,
            0 13px 24px rgba(67, 55, 91, 0.18);
        }

        .memory-card__back::before,
        .memory-card__back::after {
          position: absolute;
          content: "";
          border: 2px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
        }

        .memory-card__back::before {
          width: 72%;
          height: 72%;
        }

        .memory-card__back::after {
          width: 48%;
          height: 48%;
        }

        .memory-card__back-shape {
          position: relative;
          z-index: 2;
          display: flex;
          width: 42%;
          aspect-ratio: 1;
          align-items: center;
          justify-content: center;
          border-radius: 38%;
          background: rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.9);
          transform: rotate(8deg);
        }

        .memory-card__front {
          flex-direction: column;
          gap: clamp(3px, 1.4vw, 9px);
          background:
            radial-gradient(
              circle at 28% 20%,
              rgba(255, 255, 255, 0.72),
              transparent 28%
            ),
            var(--card-light-colour);
          box-shadow:
            0 7px 0 var(--card-colour),
            0 13px 24px rgba(67, 55, 91, 0.14);
          transform: rotateY(180deg);
        }

        .memory-card__symbol {
          display: block;
          font-size: clamp(30px, 8vw, 60px);
          line-height: 1;
          filter: drop-shadow(0 5px 4px rgba(69, 59, 95, 0.12));
          transform: translateY(2px);
        }

        .memory-card__label {
          max-width: 90%;
          overflow: hidden;
          color: #50475e;
          font-size: clamp(10px, 2.6vw, 16px);
          font-weight: 900;
          line-height: 1.15;
          text-overflow: ellipsis;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .memory-card:not(:disabled):hover .memory-card__inner {
          transform: translateY(-3px);
        }

        .memory-card--flipped:not(:disabled):hover .memory-card__inner {
          transform: translateY(-3px) rotateY(180deg);
        }

        .memory-card--matched .memory-card__front {
          animation: matched-pulse 600ms ease;
        }

        .memory-card--matched {
          opacity: 0.82;
        }

        .memory-card--matched::after {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 5;
          display: flex;
          width: clamp(22px, 5vw, 31px);
          aspect-ratio: 1;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          border-radius: 999px;
          background: #67bd87;
          color: white;
          content: "✓";
          font-size: clamp(12px, 3vw, 18px);
          font-weight: 900;
          box-shadow: 0 3px 0 #438d60;
          animation: check-pop 380ms ease;
        }

        .memory-match__overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(53, 45, 72, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .memory-match__complete {
          width: min(440px, 100%);
          padding: 30px 24px 25px;
          border: 3px solid rgba(255, 255, 255, 0.8);
          border-radius: 32px;
          background: #f5f2ff;
          box-shadow: 0 30px 80px rgba(42, 34, 60, 0.3);
          text-align: center;
          animation: modal-pop 440ms cubic-bezier(0.2, 0.8, 0.2, 1.15);
        }

        .memory-match__complete-icon {
          font-size: 62px;
          line-height: 1;
          animation: trophy-bounce 850ms ease infinite alternate;
        }

        .memory-match__complete h2 {
          margin: 17px 0 0;
          color: #473c5c;
          font-size: clamp(30px, 8vw, 42px);
          font-weight: 900;
          letter-spacing: -0.035em;
        }

        .memory-match__complete p {
          margin: 13px auto 0;
          max-width: 330px;
          color: #70677f;
          font-size: 17px;
          line-height: 1.6;
        }

        .memory-match__complete p strong {
          color: #51465f;
        }

        .memory-match__reward {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding: 9px 15px;
          border-radius: 999px;
          background: #fff0bd;
          color: #675a3c;
          font-weight: 900;
        }

        .memory-match__complete-actions {
          display: grid;
          gap: 10px;
          margin-top: 24px;
        }

        .memory-match__play-again,
        .memory-match__next-level {
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

        .memory-match__play-again {
          border: 0;
          background: #62527d;
          box-shadow: 0 6px 0 #45385b;
          color: white;
        }

        .memory-match__next-level {
          border: 2px solid #c9bedf;
          background: white;
          color: #5a4d70;
        }

        .memory-match__play-again:hover,
        .memory-match__next-level:hover {
          transform: translateY(-2px);
        }

        .memory-match__celebration {
          position: fixed;
          bottom: 32%;
          left: var(--particle-left);
          z-index: 60;
          font-size: clamp(18px, 5vw, 32px);
          pointer-events: none;
          animation: celebration-rise 1.45s ease-out var(--particle-delay) both;
        }

        .memory-match__decoration {
          position: fixed;
          z-index: 1;
          border: 18px solid rgba(255, 255, 255, 0.28);
          border-radius: 999px;
          pointer-events: none;
        }

        .memory-match__decoration--one {
          top: 17%;
          left: -70px;
          width: 190px;
          height: 190px;
        }

        .memory-match__decoration--two {
          right: -80px;
          bottom: 10%;
          width: 230px;
          height: 230px;
        }

        @keyframes matched-pulse {
          0%,
          100% {
            transform: rotateY(180deg) scale(1);
          }

          50% {
            transform: rotateY(180deg) scale(1.08);
          }
        }

        @keyframes check-pop {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(-25deg);
          }

          70% {
            transform: scale(1.16) rotate(5deg);
          }

          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
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

        @keyframes trophy-bounce {
          from {
            transform: translateY(0) rotate(-4deg);
          }

          to {
            transform: translateY(-8px) rotate(4deg);
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
            transform: translateY(-360px) scale(1.25)
              rotate(var(--particle-rotation));
          }
        }

        @media (max-width: 580px) {
          .memory-match {
            padding-right: 11px;
            padding-left: 11px;
          }

          .memory-match__title-row {
            align-items: center;
          }

          .memory-match__restart span {
            display: none;
          }

          .memory-match__restart {
            width: 44px;
            padding: 0;
          }

          .memory-match__difficulty {
            width: 100%;
          }

          .memory-match__difficulty-button {
            flex: 1;
            padding-right: 8px;
            padding-left: 8px;
          }

          .memory-match__stat {
            min-width: 0;
            flex: 1;
            max-width: 108px;
            padding-right: 8px;
            padding-left: 8px;
            font-size: 15px;
          }

          .memory-match__grid {
            gap: 8px;
          }

          .memory-card__back,
          .memory-card__front {
            border-width: 2px;
          }

          .memory-card__back {
            box-shadow:
              0 5px 0 #423653,
              0 9px 17px rgba(67, 55, 91, 0.16);
          }

          .memory-card__front {
            box-shadow:
              0 5px 0 var(--card-colour),
              0 9px 17px rgba(67, 55, 91, 0.12);
          }
        }

        @media (max-height: 690px) and (min-width: 600px) {
          .memory-match {
            padding-top: 76px;
          }

          .memory-match__title-row h1 {
            font-size: 36px;
          }

          .memory-match__title-row p {
            margin-top: 6px;
          }

          .memory-match__difficulty {
            margin-top: 12px;
          }

          .memory-match__progress {
            margin-top: 11px;
          }

          .memory-match__grid {
            width: min(560px, 100%);
            margin: 13px auto 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .memory-card__inner,
          .memory-match__progress-value,
          .memory-match__restart,
          .memory-match__difficulty-button,
          .memory-match__play-again,
          .memory-match__next-level {
            transition: none;
          }

          .memory-card--matched .memory-card__front,
          .memory-card--matched::after,
          .memory-match__complete,
          .memory-match__complete-icon,
          .memory-match__celebration {
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

function QuestionMarkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="62%"
      height="62%"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.8 9a3.4 3.4 0 0 1 6.7.8c0 2.4-3.5 2.7-3.5 5" />
      <path d="M12 19h.01" />
    </svg>
  );
}
