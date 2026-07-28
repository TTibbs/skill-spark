"use client";

import * as React from "react";
import { useSubmitGameResult } from "@/features/game-results/use-submit-game-result";

type CritterColour = {
  name: string;
  value: string;
  light: string;
};

type Critter = {
  id: number;
  x: number;
  y: number;
  radius: number;
  colour: CritterColour;
  vx: number;
  vy: number;
  phase: number;
  bouncePhase: number;
  eyeOffset: number;
  antennae: boolean;
  ears: boolean;
  target: boolean;
  found: boolean;
  shakeUntil: number;
  popScale: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colour: string;
  life: number;
};

type StarParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  life: number;
};

type WebkitAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const COLOURS: CritterColour[] = [
  {
    name: "pink",
    value: "#ff8fb3",
    light: "#ffd4e2",
  },
  {
    name: "blue",
    value: "#66bdf2",
    light: "#ccecff",
  },
  {
    name: "purple",
    value: "#a98af5",
    light: "#e2d8ff",
  },
  {
    name: "green",
    value: "#69d29a",
    light: "#d2f7e3",
  },
  {
    name: "orange",
    value: "#ffad61",
    light: "#ffe1bd",
  },
];

const HAPPY_NOTES = [392, 523.25, 659.25];
const WRONG_NOTE = 180;

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function drawRoundedBlob(context: CanvasRenderingContext2D, radius: number) {
  context.beginPath();

  const points = 16;

  for (let index = 0; index <= points; index++) {
    const angle = (Math.PI * 2 * index) / points;
    const wobble =
      radius * (1 + Math.sin(angle * 3) * 0.035 + Math.cos(angle * 5) * 0.025);

    const x = Math.cos(angle) * wobble;
    const y = Math.sin(angle) * wobble;

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.closePath();
}

function drawStar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  points = 5,
) {
  context.beginPath();

  for (let index = 0; index < points * 2; index++) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (index * Math.PI) / points;

    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;

    if (index === 0) {
      context.moveTo(pointX, pointY);
    } else {
      context.lineTo(pointX, pointY);
    }
  }

  context.closePath();
}

export function ColourCritterCatch() {
  const progressSave = useSubmitGameResult();
  const { beginSession, resetSession, retry, submit } = progressSave;
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const animationFrameRef = React.useRef<number | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioTimeoutsRef = React.useRef<number[]>([]);

  const crittersRef = React.useRef<Critter[]>([]);
  const particlesRef = React.useRef<Particle[]>([]);
  const starParticlesRef = React.useRef<StarParticle[]>([]);

  const targetColourRef = React.useRef<CritterColour>(COLOURS[0]);
  const roundRef = React.useRef(1);
  const scoreRef = React.useRef(0);
  const incorrectRef = React.useRef(0);
  const nextCritterIdRef = React.useRef(1);
  const roundTimeoutRef = React.useRef<number | null>(null);
  const firstRoundRef = React.useRef(true);
  const sessionStartedAtRef = React.useRef(0);
  const submittedCompletionRef = React.useRef(false);
  const gameCompleteRef = React.useRef(false);

  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(1);
  const [incorrect, setIncorrect] = React.useState(0);
  const [gameComplete, setGameComplete] = React.useState(false);
  const [gameResetKey, setGameResetKey] = React.useState(0);
  const [targetColour, setTargetColour] = React.useState<CritterColour>(
    COLOURS[0],
  );
  const [message, setMessage] = React.useState("Tap the matching critters");
  const roundCompleteRef = React.useRef(false);

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
      volume = 0.2,
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

  const playCorrectSound = React.useCallback(() => {
    HAPPY_NOTES.forEach((frequency, index) => {
      scheduleTone(frequency, index * 55, 0.2, "triangle");
    });
  }, [scheduleTone]);

  const playWrongSound = React.useCallback(() => {
    playTone(WRONG_NOTE, 0.18, "sine", 0.12);
  }, [playTone]);

  React.useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    sessionStartedAtRef.current = Date.now();

    const context = canvas.getContext("2d");

    if (!context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let devicePixelRatio = 1;

    const critters = crittersRef.current;
    const particles = particlesRef.current;
    const starParticles = starParticlesRef.current;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      if (!canvas) return;
      if (!context) return;

      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function createCritter(
      colour: CritterColour,
      target: boolean,
      index: number,
      total: number,
    ): Critter {
      const radius =
        Math.min(width, height) < 600
          ? 34 + Math.random() * 9
          : 40 + Math.random() * 12;

      const columns = width < 600 ? 2 : Math.min(3, total);

      const rows = Math.ceil(total / columns);
      const column = index % columns;
      const row = Math.floor(index / columns);

      const availableTop = Math.max(135, height * 0.19);
      const availableBottom = height - 70;
      const usableHeight = availableBottom - availableTop;
      const usableWidth = width - 80;

      const cellWidth = usableWidth / columns;
      const cellHeight = usableHeight / rows;

      const x =
        40 +
        cellWidth * column +
        cellWidth / 2 +
        (Math.random() - 0.5) * Math.min(35, cellWidth * 0.2);

      const y =
        availableTop +
        cellHeight * row +
        cellHeight / 2 +
        (Math.random() - 0.5) * Math.min(30, cellHeight * 0.18);

      return {
        id: nextCritterIdRef.current++,
        x,
        y,
        radius,
        colour,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2,
        bouncePhase: Math.random() * Math.PI * 2,
        eyeOffset: (Math.random() - 0.5) * 1.5,
        antennae: Math.random() < 0.5,
        ears: Math.random() < 0.5,
        target,
        found: false,
        shakeUntil: 0,
        popScale: 1,
      };
    }

    function startRound() {
      if (gameCompleteRef.current) return;
      roundCompleteRef.current = false;
      setMessage("Tap the matching critters");

      const previousColour = targetColourRef.current.name;

      const availableColours = COLOURS.filter(
        (colour) => firstRoundRef.current || colour.name !== previousColour,
      );

      const nextTargetColour = randomItem(
        availableColours.length > 0 ? availableColours : COLOURS,
      );

      firstRoundRef.current = false;
      targetColourRef.current = nextTargetColour;
      setTargetColour(nextTargetColour);

      const totalCritters = Math.min(
        8,
        5 + Math.floor((roundRef.current - 1) / 3),
      );

      const targetCount = roundRef.current >= 5 && Math.random() < 0.45 ? 2 : 1;

      const roundColours: Array<{
        colour: CritterColour;
        target: boolean;
      }> = [];

      for (let index = 0; index < targetCount; index++) {
        roundColours.push({
          colour: nextTargetColour,
          target: true,
        });
      }

      const nonTargetColours = COLOURS.filter(
        (colour) => colour.name !== nextTargetColour.name,
      );

      while (roundColours.length < totalCritters) {
        roundColours.push({
          colour: randomItem(nonTargetColours),
          target: false,
        });
      }

      const shuffled = shuffle(roundColours);

      critters.length = 0;

      shuffled.forEach((item, index) => {
        critters.push(
          createCritter(item.colour, item.target, index, shuffled.length),
        );
      });
    }

    function spawnParticles(critter: Critter) {
      for (let index = 0; index < 18; index++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3;

        particles.push({
          x: critter.x,
          y: critter.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          radius: 2 + Math.random() * 4,
          colour: Math.random() < 0.65 ? critter.colour.value : "#ffffff",
          life: 1,
        });
      }

      for (let index = 0; index < 8; index++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.3 + Math.random() * 2.5;

        starParticles.push({
          x: critter.x,
          y: critter.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          size: 5 + Math.random() * 5,
          life: 1,
        });
      }
    }

    function completeRound() {
      roundCompleteRef.current = true;
      setMessage("Great job! ✨");
      playCorrectSound();

      if (roundRef.current >= 5) {
        gameCompleteRef.current = true;
        setGameComplete(true);
        setMessage("Amazing shape spotting!");
        return;
      }

      roundTimeoutRef.current = window.setTimeout(() => {
        roundRef.current += 1;
        setRound(roundRef.current);
        startRound();
      }, 1000);
    }

    function selectCritter(pointerX: number, pointerY: number) {
      ensureAudio();
      beginSession("shapes");

      if (roundCompleteRef.current || gameCompleteRef.current) return;

      for (let index = critters.length - 1; index >= 0; index--) {
        const critter = critters[index];

        if (critter.found) continue;

        const deltaX = pointerX - critter.x;
        const deltaY = pointerY - critter.y;
        const tolerance = critter.radius + 16;

        if (deltaX * deltaX + deltaY * deltaY > tolerance * tolerance) {
          continue;
        }

        if (critter.target) {
          critter.found = true;
          critter.popScale = 1.25;

          scoreRef.current += 1;
          setScore(scoreRef.current);

          spawnParticles(critter);
          playTone(523.25, 0.18, "triangle", 0.18);

          const remainingTargets = critters.filter(
            (item) => item.target && !item.found,
          );

          if (remainingTargets.length === 0) {
            completeRound();
          } else {
            setMessage(`${remainingTargets.length} more to find`);
          }
        } else {
          incorrectRef.current += 1;
          setIncorrect(incorrectRef.current);
          critter.shakeUntil = performance.now() + 420;
          playWrongSound();
          setMessage(`Look for ${targetColourRef.current.name}`);
        }

        return;
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      selectCritter(event.clientX - rect.left, event.clientY - rect.top);
    }

    function drawBackground(time: number) {
      if (!context) return;
      const gradient = context.createLinearGradient(0, 0, 0, height);

      const shift = Math.sin(time * 0.0002) * 3;

      gradient.addColorStop(0, `hsl(${205 + shift}, 85%, 91%)`);
      gradient.addColorStop(0.55, `hsl(${190 + shift}, 76%, 92%)`);
      gradient.addColorStop(1, `hsl(${165 + shift}, 64%, 91%)`);

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.save();
      context.globalAlpha = 0.22;
      context.fillStyle = "#ffffff";

      for (let index = 0; index < 18; index++) {
        const x = ((index * 173 + time * 0.008) % (width + 120)) - 60;
        const y = 90 + ((index * 97) % Math.max(140, height - 180));
        const radius = 14 + (index % 4) * 7;

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.restore();
    }

    function drawAntennae(critter: Critter, radius: number) {
      if (!critter.antennae) return;
      if (!context) return;

      context.save();
      context.strokeStyle = critter.colour.value;
      context.lineWidth = 4;
      context.lineCap = "round";

      for (const side of [-1, 1]) {
        context.beginPath();
        context.moveTo(side * radius * 0.28, -radius * 0.72);
        context.quadraticCurveTo(
          side * radius * 0.42,
          -radius * 1.12,
          side * radius * 0.62,
          -radius * 1.2,
        );
        context.stroke();

        context.beginPath();
        context.arc(
          side * radius * 0.62,
          -radius * 1.2,
          radius * 0.09,
          0,
          Math.PI * 2,
        );
        context.fillStyle = critter.colour.value;
        context.fill();
      }

      context.restore();
    }

    function drawEars(critter: Critter, radius: number) {
      if (!critter.ears) return;
      if (!context) return;

      context.save();

      for (const side of [-1, 1]) {
        context.beginPath();
        context.ellipse(
          side * radius * 0.62,
          -radius * 0.62,
          radius * 0.28,
          radius * 0.42,
          side * 0.55,
          0,
          Math.PI * 2,
        );
        context.fillStyle = critter.colour.value;
        context.fill();

        context.beginPath();
        context.ellipse(
          side * radius * 0.62,
          -radius * 0.62,
          radius * 0.13,
          radius * 0.24,
          side * 0.55,
          0,
          Math.PI * 2,
        );
        context.fillStyle = critter.colour.light;
        context.fill();
      }

      context.restore();
    }

    function drawCritter(critter: Critter, time: number) {
      if (critter.found && critter.popScale < 0.05) {
        return;
      }
      if (!context) return;

      if (critter.found) {
        critter.popScale *= 0.87;
      } else {
        critter.popScale += (1 - critter.popScale) * 0.15;
      }

      const bounce = Math.sin(time * 0.003 + critter.bouncePhase) * 6;

      let shakeX = 0;

      if (time < critter.shakeUntil) {
        shakeX = Math.sin(time * 0.08) * 9;
      }

      const squash = 1 + Math.sin(time * 0.004 + critter.phase) * 0.035;

      const radius = critter.radius;

      context.save();
      context.translate(critter.x + shakeX, critter.y + bounce);
      context.scale(critter.popScale * squash, critter.popScale * (2 - squash));

      context.save();
      context.globalAlpha = 0.18;
      context.fillStyle = "#315e6f";
      context.beginPath();
      context.ellipse(
        0,
        radius * 0.98,
        radius * 0.67,
        radius * 0.19,
        0,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.restore();

      drawAntennae(critter, radius);
      drawEars(critter, radius);

      context.save();
      context.shadowColor = "rgba(70, 75, 120, 0.16)";
      context.shadowBlur = 18;
      context.shadowOffsetY = 8;

      const bodyGradient = context.createRadialGradient(
        -radius * 0.35,
        -radius * 0.38,
        radius * 0.08,
        0,
        0,
        radius,
      );

      bodyGradient.addColorStop(0, critter.colour.light);
      bodyGradient.addColorStop(0.46, critter.colour.value);
      bodyGradient.addColorStop(1, critter.colour.value);

      drawRoundedBlob(context, radius);
      context.fillStyle = bodyGradient;
      context.fill();

      context.lineWidth = 3;
      context.strokeStyle = "rgba(255,255,255,0.58)";
      context.stroke();
      context.restore();

      context.save();
      context.globalAlpha = 0.5;
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.ellipse(
        -radius * 0.32,
        -radius * 0.38,
        radius * 0.2,
        radius * 0.11,
        -0.55,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.restore();

      const eyeY = -radius * 0.12;
      const eyeDistance = radius * 0.27;
      const eyeRadius = radius * 0.18;

      for (const side of [-1, 1]) {
        const eyeX = side * eyeDistance;

        context.beginPath();
        context.ellipse(
          eyeX,
          eyeY,
          eyeRadius,
          eyeRadius * 1.12,
          0,
          0,
          Math.PI * 2,
        );
        context.fillStyle = "#ffffff";
        context.fill();

        context.beginPath();
        context.arc(
          eyeX + critter.eyeOffset + side * radius * 0.015,
          eyeY + radius * 0.03,
          eyeRadius * 0.48,
          0,
          Math.PI * 2,
        );
        context.fillStyle = "#3f3553";
        context.fill();

        context.beginPath();
        context.arc(
          eyeX + critter.eyeOffset + side * radius * 0.015 - eyeRadius * 0.14,
          eyeY - eyeRadius * 0.07,
          eyeRadius * 0.13,
          0,
          Math.PI * 2,
        );
        context.fillStyle = "#ffffff";
        context.fill();
      }

      context.strokeStyle = "#70445f";
      context.lineWidth = 3;
      context.lineCap = "round";
      context.beginPath();
      context.arc(0, radius * 0.19, radius * 0.18, 0.15, Math.PI - 0.15);
      context.stroke();

      for (const side of [-1, 1]) {
        context.save();
        context.translate(side * radius * 0.38, radius * 0.17);
        context.globalAlpha = 0.34;
        context.fillStyle = "#ffedf5";
        context.beginPath();
        context.ellipse(0, 0, radius * 0.13, radius * 0.07, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      for (const side of [-1, 1]) {
        context.save();
        context.translate(side * radius * 0.34, radius * 0.78);
        context.rotate(side * Math.sin(time * 0.004 + critter.phase) * 0.15);

        context.fillStyle = critter.colour.value;
        context.beginPath();
        context.ellipse(0, 0, radius * 0.22, radius * 0.13, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      context.restore();
    }

    function drawParticles() {
      if (!context) return;

      for (let index = particles.length - 1; index >= 0; index--) {
        const particle = particles[index];

        particle.vy += 0.11;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.028;

        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }

        context.save();
        context.globalAlpha = particle.life;
        context.fillStyle = particle.colour;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    function drawStarParticles() {
      if (!context) return;

      for (let index = starParticles.length - 1; index >= 0; index--) {
        const star = starParticles[index];

        star.vy += 0.08;
        star.x += star.vx;
        star.y += star.vy;
        star.rotation += star.rotationSpeed;
        star.life -= 0.022;

        if (star.life <= 0) {
          starParticles.splice(index, 1);
          continue;
        }

        context.save();
        context.translate(star.x, star.y);
        context.rotate(star.rotation);
        context.globalAlpha = star.life;

        drawStar(context, 0, 0, star.size, star.size * 0.45);

        context.fillStyle = "#ffe57b";
        context.fill();

        context.restore();
      }
    }

    function animate(time: number) {
      drawBackground(time);

      for (const critter of critters) {
        if (!critter.found) {
          critter.x += critter.vx;
          critter.y += critter.vy;

          const horizontalLimit = critter.radius + 18;
          const topLimit = Math.max(125, height * 0.16) + critter.radius;
          const bottomLimit = height - critter.radius - 35;

          if (
            critter.x < horizontalLimit ||
            critter.x > width - horizontalLimit
          ) {
            critter.vx *= -1;
            critter.x = Math.max(
              horizontalLimit,
              Math.min(width - horizontalLimit, critter.x),
            );
          }

          if (critter.y < topLimit || critter.y > bottomLimit) {
            critter.vy *= -1;
            critter.y = Math.max(topLimit, Math.min(bottomLimit, critter.y));
          }
        }

        drawCritter(critter, time);
      }

      drawParticles();
      drawStarParticles();

      animationFrameRef.current = window.requestAnimationFrame(animate);
    }

    resize();
    startRound();

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", handlePointerDown);

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", handlePointerDown);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      if (roundTimeoutRef.current !== null) {
        window.clearTimeout(roundTimeoutRef.current);
      }

      for (const timeoutId of audioTimeoutsRef.current) {
        window.clearTimeout(timeoutId);
      }

      audioTimeoutsRef.current = [];

      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }

      critters.length = 0;
      particles.length = 0;
      starParticles.length = 0;
    };
  }, [
    ensureAudio,
    playCorrectSound,
    playTone,
    playWrongSound,
    beginSession,
    gameResetKey,
  ]);

  React.useEffect(() => {
    if (!gameComplete || submittedCompletionRef.current) return;

    submittedCompletionRef.current = true;
    const elapsedSeconds = Math.max(
      0,
      Math.round((Date.now() - sessionStartedAtRef.current) / 1000),
    );

    void submit({
        kind: "shapes",
        result: {
          correct: scoreRef.current,
          incorrect: incorrectRef.current,
          timeSpent: elapsedSeconds,
        },
    }).catch(() => undefined);
  }, [gameComplete, submit]);

  const restartGame = React.useCallback(() => {
    if (roundTimeoutRef.current !== null) {
      window.clearTimeout(roundTimeoutRef.current);
      roundTimeoutRef.current = null;
    }

    roundRef.current = 1;
    scoreRef.current = 0;
    incorrectRef.current = 0;
    firstRoundRef.current = true;
    sessionStartedAtRef.current = Date.now();
    submittedCompletionRef.current = false;
    gameCompleteRef.current = false;
    roundCompleteRef.current = false;

    setRound(1);
    setScore(0);
    setIncorrect(0);
    setGameComplete(false);
    setGameResetKey((value) => value + 1);
    setMessage("Tap the matching critters");
    resetSession();
  }, [resetSession]);

  return (
    <main className="colour-critter-catch">
      <canvas
        ref={canvasRef}
        className="colour-critter-catch__canvas"
        aria-label={`Find the ${targetColour.name} critters`}
      />

      <section className="colour-critter-catch__hud">
        <div className="colour-critter-catch__target">
          <span className="colour-critter-catch__label">Find the</span>

          <span
            className="colour-critter-catch__colour"
            style={{
              backgroundColor: targetColour.value,
            }}
          />

          <strong>{targetColour.name} critters</strong>
        </div>

        <div className="colour-critter-catch__message" aria-live="polite">
          {message}
        </div>
      </section>

      <div className="colour-critter-catch__stats">
        <div
          className="colour-critter-catch__pill"
          aria-label={`Round ${round}`}
        >
          <span aria-hidden="true">🎯</span>
          <span>{round}</span>
        </div>

        <div
          className="colour-critter-catch__pill"
          aria-label={`Score ${score}`}
        >
          <span aria-hidden="true">⭐</span>
          <span>{score}</span>
        </div>

        <div
          className="colour-critter-catch__pill"
          aria-label={`${incorrect} misses`}
        >
          <span aria-hidden="true">↻</span>
          <span>{incorrect}</span>
        </div>
      </div>

      {gameComplete && (
        <section
          className="colour-critter-catch__complete"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shapes-complete-title"
        >
          <h1 id="shapes-complete-title">Shapes complete!</h1>
          <p>
            You found <strong>{score}</strong> matching critters with{" "}
            <strong>{incorrect}</strong> misses.
          </p>
          <p className="colour-critter-catch__save-status" aria-live="polite">
            {progressSave.status === "submitting" && "Saving progress..."}
            {progressSave.status === "failed" && progressSave.error}
            {progressSave.status === "submitted" &&
              progressSave.response &&
              `Saved ${progressSave.response.xpEarned} XP. Level ${progressSave.response.child.level}, ${progressSave.response.child.reward_points} stars.`}
          </p>
          <div className="colour-critter-catch__complete-actions">
            {progressSave.status === "failed" && (
              <button
                type="button"
                onClick={() => void retry().catch(() => undefined)}
              >
                Retry saving
              </button>
            )}
            <button type="button" onClick={restartGame}>
              Play again
            </button>
          </div>
        </section>
      )}

      <style jsx>{`
        .colour-critter-catch {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          min-height: 100dvh;
          overflow: hidden;
          background: #d8efff;
          font-family:
            "Baloo 2", ui-rounded, "Arial Rounded MT Bold", system-ui,
            sans-serif;
          user-select: none;
          touch-action: none;
          overscroll-behavior: none;
          -webkit-tap-highlight-color: transparent;
        }

        .colour-critter-catch__canvas {
          display: block;
          width: 100%;
          height: 100%;
          cursor: pointer;
          touch-action: none;
        }

        .colour-critter-catch__hud {
          position: fixed;
          top: max(18px, env(safe-area-inset-top));
          left: 50%;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: min(520px, calc(100vw - 190px));
          pointer-events: none;
          transform: translateX(-50%);
        }

        .colour-critter-catch__target {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 8px 18px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.52);
          box-shadow: 0 8px 24px rgba(73, 67, 120, 0.13);
          color: #674c82;
          font-size: 19px;
          line-height: 1.1;
          text-align: center;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .colour-critter-catch__target strong {
          font-weight: 700;
          text-transform: capitalize;
        }

        .colour-critter-catch__label {
          font-weight: 500;
        }

        .colour-critter-catch__colour {
          width: 22px;
          height: 22px;
          flex: 0 0 auto;
          border: 3px solid rgba(255, 255, 255, 0.86);
          border-radius: 999px;
          box-shadow: 0 2px 7px rgba(80, 50, 110, 0.18);
        }

        .colour-critter-catch__message {
          min-height: 24px;
          padding: 5px 13px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.3);
          color: #71578d;
          font-size: 15px;
          font-weight: 600;
          text-align: center;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .colour-critter-catch__stats {
          position: fixed;
          top: max(18px, env(safe-area-inset-top));
          right: max(18px, env(safe-area-inset-right));
          z-index: 10;
          display: flex;
          gap: 8px;
          pointer-events: none;
        }

        .colour-critter-catch__complete {
          position: fixed;
          left: 50%;
          top: 50%;
          z-index: 4;
          width: min(92vw, 460px);
          transform: translate(-50%, -50%);
          border: 2px solid rgba(255, 255, 255, 0.86);
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.93);
          box-shadow: 0 24px 60px rgba(42, 76, 88, 0.22);
          padding: 28px;
          text-align: center;
          color: #274c5a;
          pointer-events: auto;
        }

        .colour-critter-catch__complete h1 {
          margin: 0;
          font-size: clamp(2rem, 7vw, 3.2rem);
          line-height: 0.95;
        }

        .colour-critter-catch__complete p {
          margin: 14px 0 0;
          color: #4d6870;
          font-weight: 800;
          line-height: 1.6;
        }

        .colour-critter-catch__save-status {
          min-height: 28px;
        }

        .colour-critter-catch__complete-actions {
          margin-top: 22px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }

        .colour-critter-catch__complete-actions button {
          min-height: 44px;
          border: 0;
          border-radius: 999px;
          background: #357063;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-weight: 900;
          padding: 0 20px;
        }

        .colour-critter-catch__pill {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 66px;
          padding: 9px 14px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.48);
          box-shadow: 0 8px 22px rgba(73, 67, 120, 0.12);
          color: #674c82;
          font-size: 19px;
          font-weight: 700;
          line-height: 1;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        @media (max-width: 720px) {
          .colour-critter-catch__hud {
            top: max(70px, calc(env(safe-area-inset-top) + 62px));
            width: calc(100vw - 28px);
          }

          .colour-critter-catch__target {
            min-height: 42px;
            padding: 7px 14px;
            font-size: 17px;
          }

          .colour-critter-catch__stats {
            top: max(12px, env(safe-area-inset-top));
            right: max(12px, env(safe-area-inset-right));
          }

          .colour-critter-catch__pill {
            min-width: 58px;
            padding: 8px 11px;
            font-size: 17px;
          }
        }

        @media (max-width: 420px) {
          .colour-critter-catch__target {
            gap: 6px;
            font-size: 16px;
          }

          .colour-critter-catch__colour {
            width: 19px;
            height: 19px;
          }

          .colour-critter-catch__message {
            font-size: 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .colour-critter-catch__canvas {
            cursor: default;
          }
        }
      `}</style>
    </main>
  );
}
