"use client";

import * as React from "react";
import { useSubmitGameResult } from "@/features/game-results/use-submit-game-result";

type Operation = "add" | "subtract";

type Question = {
  first: number;
  second: number;
  operation: Operation;
  answer: number;
  options: number[];
};

type CelebrationParticle = {
  id: number;
  left: number;
  delay: number;
  rotation: number;
  symbol: string;
};

type WebkitAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const CORRECT_NOTES = [392, 523.25, 659.25];
const STREAK_NOTES = [523.25, 659.25, 783.99, 1046.5];

const CELEBRATION_SYMBOLS = ["⭐", "✨", "🌟", "💫"];

const INITIAL_QUESTION: Question = {
  first: 2,
  second: 3,
  operation: "add",
  answer: 5,
  options: [4, 5, 6, 7],
};

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function getMaximumNumber(level: number) {
  if (level <= 2) return 10;
  if (level <= 4) return 15;
  if (level <= 6) return 20;

  return 30;
}

function createQuestion(level: number): Question {
  const maximum = getMaximumNumber(level);
  const allowSubtraction = level >= 2;

  const operation: Operation =
    allowSubtraction && Math.random() < 0.45 ? "subtract" : "add";

  let first = randomBetween(1, maximum);
  let second = randomBetween(1, maximum);
  let answer = 0;

  if (operation === "add") {
    while (first + second > maximum) {
      first = randomBetween(1, maximum);
      second = randomBetween(1, maximum);
    }

    answer = first + second;
  } else {
    if (second > first) {
      [first, second] = [second, first];
    }

    answer = first - second;
  }

  const optionSet = new Set<number>([answer]);

  while (optionSet.size < 4) {
    const offset = randomBetween(-4, 4);

    if (offset === 0) continue;

    const option = Math.max(0, answer + offset);

    optionSet.add(option);
  }

  return {
    first,
    second,
    operation,
    answer,
    options: shuffle([...optionSet]),
  };
}

function createCelebrationParticles(): CelebrationParticle[] {
  return Array.from({ length: 16 }, (_, index) => ({
    id: index,
    left: randomBetween(4, 96),
    delay: Math.random() * 0.35,
    rotation: randomBetween(-160, 160),
    symbol:
      CELEBRATION_SYMBOLS[
        Math.floor(Math.random() * CELEBRATION_SYMBOLS.length)
      ],
  }));
}

export function MathsMeadow() {
  const progressSave = useSubmitGameResult();
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioTimeoutsRef = React.useRef<number[]>([]);
  const nextQuestionTimeoutRef = React.useRef<number | null>(null);
  const timerRef = React.useRef<number | null>(null);

  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [level, setLevel] = React.useState(1);
  const [questionNumber, setQuestionNumber] = React.useState(1);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [incorrectCount, setIncorrectCount] = React.useState(0);
  const [seconds, setSeconds] = React.useState(0);
  const [gameComplete, setGameComplete] = React.useState(false);

  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(
    null,
  );

  const [incorrectAnswers, setIncorrectAnswers] = React.useState<number[]>([]);

  const [message, setMessage] = React.useState("Choose the correct answer");

  const [isAnswering, setIsAnswering] = React.useState(false);
  const [celebrating, setCelebrating] = React.useState(false);

  const [celebrationParticles, setCelebrationParticles] = React.useState<
    CelebrationParticle[]
  >([]);

  const [question, setQuestion] = React.useState<Question>(INITIAL_QUESTION);

  const stopTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startSession = React.useCallback(() => {
    progressSave.beginSession("math");
    if (timerRef.current === null) {
      timerRef.current = window.setInterval(() => {
        setSeconds((current) => current + 1);
      }, 1000);
    }
  }, [progressSave]);

  const ensureAudio = React.useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!audioContextRef.current) {
      const AudioContextConstructor =
        window.AudioContext || (window as WebkitAudioWindow).webkitAudioContext;

      if (!AudioContextConstructor) return null;

      audioContextRef.current = new AudioContextConstructor();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const playTone = React.useCallback(
    (
      frequency: number,
      duration: number,
      type: OscillatorType = "sine",
      volume = 0.18,
    ) => {
      const audioContext = ensureAudio();

      if (!audioContext) return;

      const startTime = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.05);

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
    ) => {
      const timeoutId = window.setTimeout(() => {
        playTone(frequency, duration, type);

        audioTimeoutsRef.current = audioTimeoutsRef.current.filter(
          (item) => item !== timeoutId,
        );
      }, delay);

      audioTimeoutsRef.current.push(timeoutId);
    },
    [playTone],
  );

  const playCorrectSound = React.useCallback(
    (isStreakReward: boolean) => {
      const notes = isStreakReward ? STREAK_NOTES : CORRECT_NOTES;

      notes.forEach((frequency, index) => {
        scheduleTone(frequency, index * 65, 0.22, "triangle");
      });
    },
    [scheduleTone],
  );

  const playIncorrectSound = React.useCallback(() => {
    playTone(180, 0.16, "sine", 0.1);
  }, [playTone]);

  const moveToNextQuestion = React.useCallback((nextLevel: number) => {
    setQuestion(createQuestion(nextLevel));
    setSelectedAnswer(null);
    setIncorrectAnswers([]);
    setMessage("Choose the correct answer");
    setIsAnswering(false);
    setCelebrating(false);
    setCelebrationParticles([]);
    setQuestionNumber((current) => current + 1);
  }, []);

  const handleAnswer = React.useCallback(
    (answer: number) => {
      if (gameComplete || isAnswering || incorrectAnswers.includes(answer)) {
        return;
      }

      startSession();
      ensureAudio();
      setSelectedAnswer(answer);

      if (answer === question.answer) {
        setIsAnswering(true);

        const nextStreak = streak + 1;
        const isStreakReward = nextStreak > 0 && nextStreak % 5 === 0;
        const earnedPoints = isStreakReward ? 3 : 1;

        const nextScore = score + earnedPoints;
        const nextLevel = Math.floor(nextScore / 5) + 1;
        const nextCorrectCount = correctCount + 1;

        setScore(nextScore);
        setStreak(nextStreak);
        setLevel(nextLevel);
        setCorrectCount(nextCorrectCount);

        setMessage(
          isStreakReward
            ? `Amazing! ${nextStreak} in a row!`
            : "Correct! Well done!",
        );

        setCelebrating(true);
        setCelebrationParticles(createCelebrationParticles());

        playCorrectSound(isStreakReward);

        if (nextCorrectCount >= 10) {
          stopTimer();
          setGameComplete(true);
        } else {
          nextQuestionTimeoutRef.current = window.setTimeout(
            () => {
              moveToNextQuestion(nextLevel);
            },
            isStreakReward ? 1400 : 950,
          );
        }

        return;
      }

      setIncorrectAnswers((current) => [...current, answer]);
      setIncorrectCount((current) => current + 1);
      setStreak(0);
      setMessage("Nearly! Try another answer");
      playIncorrectSound();
    },
    [
      ensureAudio,
      correctCount,
      gameComplete,
      incorrectAnswers,
      isAnswering,
      moveToNextQuestion,
      playCorrectSound,
      playIncorrectSound,
      question.answer,
      score,
      startSession,
      streak,
      stopTimer,
    ],
  );

  React.useEffect(() => {
    if (!gameComplete) return;
    void progressSave
      .submit({
        kind: "math",
        result: {
          correct: correctCount,
          incorrect: incorrectCount,
          timeSpent: seconds,
          type: question.operation === "add" ? "addition" : "subtraction",
        },
      })
      .catch(() => undefined);
  }, [
    correctCount,
    gameComplete,
    incorrectCount,
    progressSave,
    question.operation,
    seconds,
  ]);

  const restartGame = React.useCallback(() => {
    stopTimer();
    progressSave.resetSession();
    setScore(0);
    setStreak(0);
    setLevel(1);
    setQuestionNumber(1);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSeconds(0);
    setSelectedAnswer(null);
    setIncorrectAnswers([]);
    setMessage("Choose the correct answer");
    setIsAnswering(false);
    setCelebrating(false);
    setCelebrationParticles([]);
    setQuestion(INITIAL_QUESTION);
    setGameComplete(false);
  }, [progressSave, stopTimer]);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const numericKey = Number(event.key);

      if (
        Number.isNaN(numericKey) ||
        isAnswering ||
        !question.options.includes(numericKey)
      ) {
        return;
      }

      handleAnswer(numericKey);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleAnswer, isAnswering, question.options]);

  React.useEffect(() => {
    return () => {
      if (nextQuestionTimeoutRef.current !== null) {
        window.clearTimeout(nextQuestionTimeoutRef.current);
      }
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
  }, [stopTimer]);

  const operator = question.operation === "add" ? "+" : "−";

  return (
    <main className="maths-meadow">
      <div
        className="maths-meadow__cloud maths-meadow__cloud--one"
        aria-hidden="true"
      />

      <div
        className="maths-meadow__cloud maths-meadow__cloud--two"
        aria-hidden="true"
      />

      <header className="maths-meadow__header">
        <div className="maths-meadow__stat" aria-label={`Level ${level}`}>
          <span aria-hidden="true">🌱</span>
          <span>Level {level}</span>
        </div>

        <div className="maths-meadow__stat" aria-label={`Score ${score}`}>
          <span aria-hidden="true">⭐</span>
          <span>{score}</span>
        </div>
      </header>

      <section className="maths-meadow__game" aria-label="Maths question">
        <div className="maths-meadow__round">Question {questionNumber}</div>

        <div
          className={[
            "maths-meadow__character",
            celebrating ? "maths-meadow__character--happy" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          <div className="maths-meadow__character-ear maths-meadow__character-ear--left" />
          <div className="maths-meadow__character-ear maths-meadow__character-ear--right" />

          <div className="maths-meadow__character-face">
            <div className="maths-meadow__eye maths-meadow__eye--left" />
            <div className="maths-meadow__eye maths-meadow__eye--right" />
            <div className="maths-meadow__mouth" />
          </div>
        </div>

        <div
          className="maths-meadow__question"
          aria-label={`${question.first} ${
            question.operation === "add" ? "plus" : "minus"
          } ${question.second}`}
        >
          <span>{question.first}</span>
          <span className="maths-meadow__operator">{operator}</span>
          <span>{question.second}</span>
          <span className="maths-meadow__equals">=</span>
          <span className="maths-meadow__unknown">?</span>
        </div>

        <p className="maths-meadow__message" aria-live="polite">
          {message}
        </p>

        <div className="maths-meadow__answers">
          {question.options.map((answer) => {
            const isCorrect = isAnswering && answer === question.answer;

            const isIncorrect = incorrectAnswers.includes(answer);

            const isSelected = selectedAnswer === answer;

            return (
              <button
                key={answer}
                type="button"
                className={[
                  "maths-meadow__answer",
                  isCorrect ? "maths-meadow__answer--correct" : "",
                  isIncorrect ? "maths-meadow__answer--incorrect" : "",
                  isSelected && !isCorrect && !isIncorrect
                    ? "maths-meadow__answer--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={isAnswering || isIncorrect}
                onClick={() => handleAnswer(answer)}
                aria-label={`Answer ${answer}`}
              >
                {answer}
              </button>
            );
          })}
        </div>

        <div
          className="maths-meadow__streak"
          aria-label={`${streak} correct answers in a row`}
        >
          <span aria-hidden="true">🔥</span>
          <span>{streak} in a row</span>
        </div>
      </section>

      {gameComplete && (
        <div
          className="maths-meadow__complete"
          role="dialog"
          aria-modal="true"
          aria-labelledby="maths-complete-title"
        >
          <h2 id="maths-complete-title">Maths Meadow complete!</h2>
          <p>
            You answered <strong>{correctCount}</strong> correctly with{" "}
            <strong>{incorrectCount}</strong> misses.
          </p>
          <p aria-live="polite">
            {progressSave.status === "submitting" && "Saving progress..."}
            {progressSave.status === "failed" && progressSave.error}
            {progressSave.status === "submitted" &&
              progressSave.response &&
              `Saved ${progressSave.response.xpEarned} XP. Level ${progressSave.response.child.level}, ${progressSave.response.child.reward_points} stars.`}
          </p>
          <div className="maths-meadow__complete-actions">
            {progressSave.status === "failed" && (
              <button
                type="button"
                onClick={() => void progressSave.retry().catch(() => undefined)}
              >
                Retry saving
              </button>
            )}
            <button type="button" onClick={restartGame}>
              Play again
            </button>
          </div>
        </div>
      )}

      <div className="maths-meadow__ground" aria-hidden="true">
        <span>🌼</span>
        <span>🌷</span>
        <span>🌻</span>
        <span>🌸</span>
        <span>🌼</span>
      </div>

      {celebrationParticles.map((particle) => (
        <span
          key={particle.id}
          className="maths-meadow__celebration"
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
        .maths-meadow {
          position: fixed;
          inset: 0;
          display: flex;
          min-height: 100dvh;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: max(92px, calc(env(safe-area-inset-top) + 74px)) 18px
            max(92px, calc(env(safe-area-inset-bottom) + 70px));
          background:
            radial-gradient(
              circle at 18% 20%,
              rgba(255, 255, 255, 0.72),
              transparent 22%
            ),
            linear-gradient(180deg, #cfeaff 0%, #e5f6ff 57%, #c9f1d1 100%);
          box-sizing: border-box;
          color: #5f4778;
          font-family:
            "Baloo 2", ui-rounded, "Arial Rounded MT Bold", system-ui,
            sans-serif;
          touch-action: manipulation;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .maths-meadow__header {
          position: fixed;
          top: max(16px, env(safe-area-inset-top));
          right: max(16px, env(safe-area-inset-right));
          left: max(16px, env(safe-area-inset-left));
          z-index: 20;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          pointer-events: none;
        }

        .maths-meadow__stat {
          display: flex;
          min-height: 44px;
          align-items: center;
          gap: 7px;
          padding: 8px 15px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.52);
          box-shadow: 0 8px 22px rgba(76, 59, 112, 0.12);
          font-size: 18px;
          font-weight: 700;
          line-height: 1;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .maths-meadow__game {
          position: relative;
          z-index: 5;
          display: flex;
          width: min(560px, 100%);
          flex-direction: column;
          align-items: center;
        }

        .maths-meadow__round {
          margin-bottom: 12px;
          padding: 5px 13px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.42);
          font-size: 14px;
          font-weight: 700;
        }

        .maths-meadow__character {
          position: relative;
          width: 104px;
          height: 92px;
          margin-bottom: -8px;
          transform-origin: bottom center;
          animation: character-float 2.3s ease-in-out infinite;
        }

        .maths-meadow__character--happy {
          animation:
            character-celebrate 0.42s ease-in-out infinite alternate,
            character-float 2.3s ease-in-out infinite;
        }

        .maths-meadow__character-face {
          position: absolute;
          inset: 12px 7px 0;
          z-index: 2;
          border: 3px solid rgba(255, 255, 255, 0.66);
          border-radius: 48% 48% 44% 44%;
          background: linear-gradient(145deg, #ffe38f, #f7bd58);
          box-shadow: 0 10px 24px rgba(116, 76, 98, 0.18);
        }

        .maths-meadow__character-ear {
          position: absolute;
          top: 4px;
          z-index: 1;
          width: 35px;
          height: 43px;
          border: 3px solid rgba(255, 255, 255, 0.54);
          background: #f5bd62;
        }

        .maths-meadow__character-ear--left {
          left: 4px;
          border-radius: 80% 25% 60% 35%;
          transform: rotate(-27deg);
        }

        .maths-meadow__character-ear--right {
          right: 4px;
          border-radius: 25% 80% 35% 60%;
          transform: rotate(27deg);
        }

        .maths-meadow__eye {
          position: absolute;
          top: 33px;
          width: 9px;
          height: 13px;
          border-radius: 999px;
          background: #55425f;
          box-shadow: inset 2px 2px rgba(255, 255, 255, 0.45);
        }

        .maths-meadow__eye--left {
          left: 24px;
        }

        .maths-meadow__eye--right {
          right: 24px;
        }

        .maths-meadow__mouth {
          position: absolute;
          bottom: 18px;
          left: 50%;
          width: 23px;
          height: 12px;
          border-bottom: 4px solid #765064;
          border-radius: 0 0 999px 999px;
          transform: translateX(-50%);
        }

        .maths-meadow__question {
          display: grid;
          grid-template-columns:
            minmax(48px, auto)
            auto
            minmax(48px, auto)
            auto
            minmax(62px, auto);
          align-items: center;
          justify-content: center;
          gap: clamp(7px, 2vw, 14px);
          width: 100%;
          padding: clamp(20px, 5vw, 32px);
          border: 2px solid rgba(255, 255, 255, 0.74);
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.58);
          box-shadow: 0 16px 42px rgba(76, 59, 112, 0.14);
          box-sizing: border-box;
          font-size: clamp(38px, 11vw, 70px);
          font-weight: 700;
          line-height: 1;
          text-align: center;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .maths-meadow__operator,
        .maths-meadow__equals {
          color: #9978b4;
          font-size: 0.72em;
        }

        .maths-meadow__unknown {
          display: flex;
          width: 1.05em;
          height: 1.05em;
          align-items: center;
          justify-content: center;
          border-radius: 28%;
          background: #b495dc;
          color: #ffffff;
          box-shadow: 0 6px 0 #896cad;
        }

        .maths-meadow__message {
          min-height: 30px;
          margin: 18px 0 14px;
          font-size: clamp(17px, 4vw, 21px);
          font-weight: 700;
          text-align: center;
        }

        .maths-meadow__answers {
          display: grid;
          width: 100%;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .maths-meadow__answer {
          min-height: clamp(70px, 13vh, 94px);
          border: 2px solid rgba(255, 255, 255, 0.75);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.68);
          box-shadow:
            0 7px 0 rgba(139, 111, 171, 0.28),
            0 14px 26px rgba(69, 59, 106, 0.1);
          color: #634a7a;
          cursor: pointer;
          font: inherit;
          font-size: clamp(30px, 8vw, 46px);
          font-weight: 700;
          transition:
            transform 120ms ease,
            box-shadow 120ms ease,
            background 180ms ease;
          touch-action: manipulation;
        }

        .maths-meadow__answer:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.86);
          transform: translateY(-2px);
        }

        .maths-meadow__answer:active:not(:disabled) {
          box-shadow:
            0 2px 0 rgba(139, 111, 171, 0.28),
            0 8px 16px rgba(69, 59, 106, 0.1);
          transform: translateY(5px);
        }

        .maths-meadow__answer:focus-visible {
          outline: 4px solid rgba(114, 87, 161, 0.38);
          outline-offset: 3px;
        }

        .maths-meadow__answer--correct {
          border-color: rgba(93, 197, 132, 0.8);
          background: #bff1cf;
          box-shadow:
            0 7px 0 #76bd91,
            0 14px 26px rgba(61, 132, 91, 0.16);
          color: #286d44;
          animation: correct-pop 0.42s ease;
        }

        .maths-meadow__answer--incorrect {
          border-color: rgba(235, 126, 142, 0.7);
          background: #ffd2d8;
          box-shadow: 0 3px 0 #d9949e;
          color: #9b4f5b;
          cursor: default;
          opacity: 0.62;
          transform: translateY(4px);
          animation: incorrect-shake 0.34s ease;
        }

        .maths-meadow__answer:disabled {
          cursor: default;
        }

        .maths-meadow__streak {
          display: flex;
          min-height: 34px;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.4);
          font-size: 15px;
          font-weight: 700;
        }

        .maths-meadow__complete {
          position: fixed;
          z-index: 10;
          left: 50%;
          bottom: max(26px, env(safe-area-inset-bottom));
          width: min(92vw, 460px);
          transform: translateX(-50%);
          border: 3px solid #315d42;
          border-radius: 28px;
          background: #fffdf2;
          padding: 22px;
          text-align: center;
          box-shadow: 0 12px 0 #315d42;
        }

        .maths-meadow__complete h2 {
          margin: 0;
          color: #315d42;
          font-size: clamp(1.4rem, 4vw, 2rem);
        }

        .maths-meadow__complete p {
          margin: 10px 0 0;
          color: #526b5b;
          font-weight: 800;
        }

        .maths-meadow__complete-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: 16px;
        }

        .maths-meadow__complete-actions button {
          min-height: 44px;
          border: 0;
          border-radius: 16px;
          background: #315d42;
          color: white;
          padding: 0 18px;
          font-weight: 900;
          cursor: pointer;
        }

        .maths-meadow__ground {
          position: fixed;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 2;
          display: flex;
          height: max(56px, calc(env(safe-area-inset-bottom) + 46px));
          align-items: flex-start;
          justify-content: space-around;
          padding-top: 8px;
          background: linear-gradient(180deg, #83d293, #5db77a);
          border-radius: 50% 50% 0 0 / 20% 20% 0 0;
          font-size: 24px;
          pointer-events: none;
        }

        .maths-meadow__ground span:nth-child(even) {
          margin-top: 7px;
        }

        .maths-meadow__cloud {
          position: fixed;
          z-index: 1;
          width: 130px;
          height: 42px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.55);
          pointer-events: none;
          animation: cloud-drift 11s ease-in-out infinite alternate;
        }

        .maths-meadow__cloud::before,
        .maths-meadow__cloud::after {
          position: absolute;
          content: "";
          border-radius: 999px;
          background: inherit;
        }

        .maths-meadow__cloud::before {
          top: -24px;
          left: 25px;
          width: 62px;
          height: 56px;
        }

        .maths-meadow__cloud::after {
          top: -13px;
          right: 18px;
          width: 50px;
          height: 43px;
        }

        .maths-meadow__cloud--one {
          top: 18%;
          left: 5%;
          transform: scale(0.75);
        }

        .maths-meadow__cloud--two {
          top: 30%;
          right: 4%;
          transform: scale(0.55);
          animation-delay: -4s;
        }

        .maths-meadow__celebration {
          position: fixed;
          bottom: 42%;
          left: var(--particle-left);
          z-index: 30;
          font-size: clamp(18px, 5vw, 32px);
          pointer-events: none;
          animation: celebration-rise 1.2s ease-out var(--particle-delay) both;
        }

        @keyframes character-float {
          0%,
          100% {
            transform: translateY(0) rotate(-1deg);
          }

          50% {
            transform: translateY(-7px) rotate(1deg);
          }
        }

        @keyframes character-celebrate {
          from {
            transform: translateY(-2px) rotate(-5deg) scale(1);
          }

          to {
            transform: translateY(-13px) rotate(5deg) scale(1.06);
          }
        }

        @keyframes correct-pop {
          0% {
            transform: scale(1);
          }

          55% {
            transform: scale(1.1);
          }

          100% {
            transform: scale(1);
          }
        }

        @keyframes incorrect-shake {
          0%,
          100% {
            transform: translateX(0) translateY(4px);
          }

          25% {
            transform: translateX(-8px) translateY(4px);
          }

          50% {
            transform: translateX(8px) translateY(4px);
          }

          75% {
            transform: translateX(-5px) translateY(4px);
          }
        }

        @keyframes celebration-rise {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.4) rotate(0deg);
          }

          18% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translateY(-280px) scale(1.25)
              rotate(var(--particle-rotation));
          }
        }

        @keyframes cloud-drift {
          from {
            margin-left: -8px;
          }

          to {
            margin-left: 22px;
          }
        }

        @media (max-height: 680px) {
          .maths-meadow {
            padding-top: 70px;
            padding-bottom: 65px;
          }

          .maths-meadow__character {
            width: 82px;
            height: 72px;
            margin-bottom: -6px;
          }

          .maths-meadow__character-face {
            inset: 9px 6px 0;
          }

          .maths-meadow__character-ear {
            width: 28px;
            height: 34px;
          }

          .maths-meadow__eye {
            top: 25px;
            width: 7px;
            height: 10px;
          }

          .maths-meadow__eye--left {
            left: 19px;
          }

          .maths-meadow__eye--right {
            right: 19px;
          }

          .maths-meadow__mouth {
            bottom: 13px;
            width: 18px;
          }

          .maths-meadow__question {
            padding: 16px;
          }

          .maths-meadow__message {
            margin: 11px 0 9px;
          }

          .maths-meadow__answer {
            min-height: 62px;
          }

          .maths-meadow__streak {
            margin-top: 10px;
          }
        }

        @media (max-width: 420px) {
          .maths-meadow__stat {
            min-height: 40px;
            padding: 7px 11px;
            font-size: 16px;
          }

          .maths-meadow__question {
            border-radius: 25px;
          }

          .maths-meadow__answers {
            gap: 10px;
          }

          .maths-meadow__answer {
            border-radius: 20px;
          }

          .maths-meadow__cloud {
            opacity: 0.6;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .maths-meadow__character,
          .maths-meadow__character--happy,
          .maths-meadow__cloud,
          .maths-meadow__answer,
          .maths-meadow__celebration {
            animation-duration: 0.01ms;
            animation-iteration-count: 1;
          }

          .maths-meadow__answer {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
