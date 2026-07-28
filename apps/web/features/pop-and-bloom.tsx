"use client";

import * as React from "react";

const BUBBLE_COLORS = ["#FFC1D6", "#AEE2FF", "#D6C6FF", "#B7F3D0", "#FFD8A8"];

const FLOWER_COLORS = [
  "#FF8FB3",
  "#FFB74D",
  "#B48BFF",
  "#7FD8A6",
  "#FF7A7A",
  "#FFD966",
];

const BUTTERFLY_COLORS = [
  ["#FF8FB3", "#FFD6E5"],
  ["#7FD8A6", "#D6FFEA"],
  ["#B48BFF", "#E6D6FF"],
  ["#FFC15E", "#FFEBC2"],
] as const;

const PENTATONIC = [
  261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99,
];

type Bubble = {
  x: number;
  y: number;
  r: number;
  color: string;
  vy: number;
  phase: number;
  special: boolean;
};

type Flower = {
  x: number;
  y: number;
  scale: number;
  vel: number;
  color: string;
  phase: number;
  stemLen: number;
  size: number;
  petals: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  life: number;
};

type Confetti = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  color: string;
  life: number;
};

type Butterfly = {
  x: number;
  y: number;
  vx: number;
  baseY: number;
  phase: number;
  wingPhase: number;
  colorMain: string;
  colorLight: string;
};

type Cloud = {
  x: number;
  y: number;
  scale: number;
  speed: number;
};

const INITIAL_CLOUDS: Cloud[] = [
  { x: 0.08, y: 0.12, scale: 0.8, speed: 0.000026 },
  { x: 0.27, y: 0.2, scale: 1.15, speed: 0.000018 },
  { x: 0.48, y: 0.1, scale: 0.68, speed: 0.000034 },
  { x: 0.69, y: 0.25, scale: 1.02, speed: 0.000023 },
  { x: 0.88, y: 0.16, scale: 0.92, speed: 0.000031 },
];

type WebkitAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function PopAndBloom() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [score, setScore] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);

  const scoreRef = React.useRef(0);
  const hasStartedRef = React.useRef(false);

  const animationFrameRef = React.useRef<number | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioTimeoutsRef = React.useRef<number[]>([]);

  const bubblesRef = React.useRef<Bubble[]>([]);
  const flowersRef = React.useRef<Flower[]>([]);
  const particlesRef = React.useRef<Particle[]>([]);
  const confettiRef = React.useRef<Confetti[]>([]);
  const butterflyRef = React.useRef<Butterfly | null>(null);

  const lastSpawnRef = React.useRef(0);
  const nextButterflyAtRef = React.useRef(6000);

  const cloudsRef = React.useRef<Cloud[]>(INITIAL_CLOUDS);

  const updateScore = React.useCallback((amount: number) => {
    scoreRef.current += amount;
    setScore(scoreRef.current);
  }, []);

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
    (frequency: number, duration: number, type: OscillatorType = "sine") => {
      const audioContext = ensureAudio();

      if (!audioContext) return;

      const startedAt = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startedAt);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 1.4,
        startedAt + duration * 0.4,
      );

      gain.gain.setValueAtTime(0.0001, startedAt);
      gain.gain.exponentialRampToValueAtTime(0.28, startedAt + 0.01);
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
    ) => {
      const timeout = window.setTimeout(() => {
        playTone(frequency, duration, type);

        audioTimeoutsRef.current = audioTimeoutsRef.current.filter(
          (timeoutId) => timeoutId !== timeout,
        );
      }, delay);

      audioTimeoutsRef.current.push(timeout);
    },
    [playTone],
  );

  const playPop = React.useCallback(
    (radius: number) => {
      const index = Math.max(
        0,
        Math.min(PENTATONIC.length - 1, Math.floor((60 - radius) / 5)),
      );

      playTone(PENTATONIC[index], 0.3, "sine");
    },
    [playTone],
  );

  const playSpecial = React.useCallback(() => {
    const notes = [PENTATONIC[2], PENTATONIC[4], PENTATONIC[6], PENTATONIC[8]];

    notes.forEach((frequency, index) => {
      scheduleTone(frequency, index * 70, 0.35, "triangle");
    });
  }, [scheduleTone]);

  React.useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const bubbles = bubblesRef.current;
    const flowers = flowersRef.current;
    const particles = particlesRef.current;
    const confetti = confettiRef.current;
    const clouds = cloudsRef.current;

    const spawnInterval = 850;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let devicePixelRatio = 1;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      if (!canvas) return;

      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;

      if (!context) return;

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function groundTop(x: number) {
      const base = height - height * 0.14;
      return base + Math.sin(x * 0.015) * 5;
    }

    function spawnBubble() {
      const radius = 26 + Math.random() * 24;

      bubbles.push({
        x: Math.random() * (width - radius * 2) + radius,
        y: height + radius + Math.random() * 40,
        r: radius,
        color: randomItem(BUBBLE_COLORS),
        vy: -(0.5 + Math.random() * 0.7),
        phase: Math.random() * Math.PI * 2,
        special: Math.random() < 0.09,
      });
    }

    function spawnButterfly() {
      const fromLeft = Math.random() < 0.5;
      const [colorMain, colorLight] = randomItem(BUTTERFLY_COLORS);

      const butterfly: Butterfly = {
        x: fromLeft ? -30 : width + 30,
        y: height * (0.25 + Math.random() * 0.35),
        vx: (fromLeft ? 1 : -1) * (1.1 + Math.random() * 0.6),
        baseY: 0,
        phase: Math.random() * Math.PI * 2,
        wingPhase: 0,
        colorMain,
        colorLight,
      };

      butterfly.baseY = butterfly.y;
      butterflyRef.current = butterfly;
    }

    function drawButterfly(butterfly: Butterfly) {
      const flap = Math.sin(butterfly.wingPhase) * 0.9 + 0.1;

      if (!context) return;

      context.save();
      context.translate(butterfly.x, butterfly.y);
      context.rotate(Math.sin(butterfly.phase) * 0.15);

      for (const side of [-1, 1]) {
        context.save();
        context.scale(side, 1);
        context.transform(flap, 0, 0, 1, 0, 0);

        context.beginPath();
        context.ellipse(9, -6, 9, 12, 0.3, 0, Math.PI * 2);
        context.fillStyle = butterfly.colorMain;
        context.globalAlpha = 0.92;
        context.fill();

        context.beginPath();
        context.ellipse(7, 6, 6, 8, 0.2, 0, Math.PI * 2);
        context.fillStyle = butterfly.colorLight;
        context.fill();

        context.restore();
      }

      context.globalAlpha = 1;
      context.fillStyle = "#6b4b3a";
      context.beginPath();
      context.ellipse(0, 0, 2.2, 9, 0, 0, Math.PI * 2);
      context.fill();

      context.restore();
    }

    function createConfetti(amount: number, maxStartOffset: number) {
      for (let index = 0; index < amount; index++) {
        confetti.push({
          x: Math.random() * width,
          y: -20 - Math.random() * maxStartOffset,
          vx: (Math.random() - 0.5) * 2,
          vy: 1 + Math.random() * 2,
          size: 4 + Math.random() * 6,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.2,
          color: randomItem(FLOWER_COLORS),
          life: 1,
        });
      }
    }

    function popBubble(bubble: Bubble, index: number) {
      bubbles.splice(index, 1);
      updateScore(1);

      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        setHasStarted(true);
      }

      const particleCount = bubble.special ? 26 : 12;

      for (
        let particleIndex = 0;
        particleIndex < particleCount;
        particleIndex++
      ) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3.5;

        particles.push({
          x: bubble.x,
          y: bubble.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          r: 2 + Math.random() * 4,
          color: bubble.special ? randomItem(FLOWER_COLORS) : bubble.color,
          life: 1,
        });
      }

      const groundX = Math.max(20, Math.min(width - 20, bubble.x));

      const petalRoll = Math.random();
      const petals = petalRoll < 0.5 ? 5 : petalRoll < 0.85 ? 6 : 4;

      flowers.push({
        x: groundX,
        y: groundTop(groundX),
        scale: 0,
        vel: 0.12,
        color: randomItem(FLOWER_COLORS),
        phase: Math.random() * Math.PI * 2,
        stemLen: 14 + Math.random() * 22,
        size: 0.75 + Math.random() * 0.55,
        petals,
      });

      if (flowers.length > 45) {
        flowers.shift();
      }

      playPop(bubble.r);

      if (bubble.special) {
        playSpecial();
        createConfetti(60, 200);
      }
    }

    function popButterfly() {
      const butterfly = butterflyRef.current;

      if (!butterfly) return;

      updateScore(3);

      for (let index = 0; index < 22; index++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3;

        particles.push({
          x: butterfly.x,
          y: butterfly.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          r: 2 + Math.random() * 3.5,
          color: butterfly.colorMain,
          life: 1,
        });
      }

      const notes = [PENTATONIC[3], PENTATONIC[5], PENTATONIC[7]];

      notes.forEach((frequency, index) => {
        scheduleTone(frequency, index * 60, 0.25, "triangle");
      });

      butterflyRef.current = null;
      nextButterflyAtRef.current =
        performance.now() + 9000 + Math.random() * 9000;
    }

    function pointerPop(pointerX: number, pointerY: number) {
      ensureAudio();

      const butterfly = butterflyRef.current;

      if (butterfly) {
        const deltaX = pointerX - butterfly.x;
        const deltaY = pointerY - butterfly.y;

        if (deltaX * deltaX + deltaY * deltaY <= 26 * 26) {
          popButterfly();
          return;
        }
      }

      for (let index = bubbles.length - 1; index >= 0; index--) {
        const bubble = bubbles[index];
        const deltaX = pointerX - bubble.x;
        const deltaY = pointerY - bubble.y;
        const tolerance = bubble.r + 16;

        if (deltaX * deltaX + deltaY * deltaY <= tolerance * tolerance) {
          popBubble(bubble, index);
          return;
        }
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      pointerPop(event.clientX - rect.left, event.clientY - rect.top);
    }

    function drawCloud(centreX: number, centreY: number, scale: number) {
      if (!context) return;

      context.save();
      context.globalAlpha = 0.7;
      context.fillStyle = "#ffffff";

      context.beginPath();
      context.ellipse(
        centreX,
        centreY,
        40 * scale,
        18 * scale,
        0,
        0,
        Math.PI * 2,
      );
      context.ellipse(
        centreX + 30 * scale,
        centreY + 4 * scale,
        30 * scale,
        15 * scale,
        0,
        0,
        Math.PI * 2,
      );
      context.ellipse(
        centreX - 32 * scale,
        centreY + 6 * scale,
        26 * scale,
        13 * scale,
        0,
        0,
        Math.PI * 2,
      );
      context.fill();

      context.restore();
    }

    function drawSky(time: number) {
      const hueShift = Math.sin(time * 0.00004) * 6;
      if (!context) return;

      const gradient = context.createLinearGradient(0, 0, 0, height);

      gradient.addColorStop(0, `hsl(${205 + hueShift}, 85%, 88%)`);
      gradient.addColorStop(0.6, `hsl(${195 + hueShift}, 80%, 90%)`);
      gradient.addColorStop(1, `hsl(${170 + hueShift}, 60%, 92%)`);

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }

    function drawGround() {
      const top = height - height * 0.14;

      if (!context) return;

      context.beginPath();
      context.moveTo(0, height);

      for (let x = 0; x <= width; x += 24) {
        context.lineTo(x, groundTop(x));
      }

      context.lineTo(width, height);
      context.closePath();

      const gradient = context.createLinearGradient(0, top, 0, height);

      gradient.addColorStop(0, "#8FDBA8");
      gradient.addColorStop(1, "#5FBE85");

      context.fillStyle = gradient;
      context.fill();
    }

    function drawBubble(bubble: Bubble, time: number) {
      const wobble = Math.sin(time * 0.004 + bubble.phase) * 2;
      const radius = bubble.r + wobble;

      if (!context) return;

      context.save();

      const gradient = context.createRadialGradient(
        bubble.x - radius * 0.3,
        bubble.y - radius * 0.3,
        radius * 0.1,
        bubble.x,
        bubble.y,
        radius,
      );

      if (bubble.special) {
        context.shadowColor = "rgba(255, 217, 102, 0.9)";
        context.shadowBlur = 22;

        gradient.addColorStop(0, "#FFF6D6");
        gradient.addColorStop(1, "rgba(255, 217, 102, 0.55)");
      } else {
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(1, `${bubble.color}aa`);
      }

      context.beginPath();
      context.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      context.fillStyle = gradient;
      context.fill();

      context.lineWidth = 2;
      context.strokeStyle = "rgba(255,255,255,0.7)";
      context.stroke();

      context.shadowBlur = 0;

      context.beginPath();
      context.ellipse(
        bubble.x - radius * 0.35,
        bubble.y - radius * 0.4,
        radius * 0.22,
        radius * 0.13,
        -0.5,
        0,
        Math.PI * 2,
      );
      context.fillStyle = "rgba(255,255,255,0.8)";
      context.fill();

      context.restore();
    }

    function drawFlower(flower: Flower) {
      if (!context) return;

      context.save();
      context.translate(flower.x, flower.y);

      const stemLength = flower.stemLen * flower.scale;

      context.strokeStyle = "#3f8f5e";
      context.lineWidth = 2.5;
      context.beginPath();
      context.moveTo(0, 0);
      context.quadraticCurveTo(
        Math.sin(flower.phase) * 4,
        -stemLength * 0.5,
        Math.sin(flower.phase) * 2,
        -stemLength,
      );
      context.stroke();

      context.save();
      context.translate(0, -stemLength * 0.45);
      context.rotate(-0.6 + Math.sin(flower.phase) * 0.1);
      context.beginPath();
      context.ellipse(
        6 * flower.scale,
        0,
        6 * flower.scale,
        3 * flower.scale,
        0,
        0,
        Math.PI * 2,
      );
      context.fillStyle = "#4CA36B";
      context.fill();
      context.restore();

      context.translate(Math.sin(flower.phase) * 2, -stemLength);
      context.rotate(Math.sin(flower.phase) * 0.12);

      const scale = flower.scale * flower.size;
      context.scale(scale, scale);

      const petalLength = flower.petals <= 4 ? 11 : 9;
      const petalWidth = flower.petals <= 4 ? 7 : 5.5;

      for (let petalIndex = 0; petalIndex < flower.petals; petalIndex++) {
        context.save();
        context.rotate(((Math.PI * 2) / flower.petals) * petalIndex);
        context.beginPath();
        context.ellipse(
          0,
          -petalLength * 0.75,
          petalWidth,
          petalLength,
          0,
          0,
          Math.PI * 2,
        );
        context.fillStyle = flower.color;
        context.fill();
        context.restore();
      }

      context.beginPath();
      context.arc(0, 0, 4.5, 0, Math.PI * 2);
      context.fillStyle = "#FFE08A";
      context.fill();

      context.restore();
    }

    function animate(time: number) {
      if (!context) return;

      context.clearRect(0, 0, width, height);
      drawSky(time);

      for (const cloud of clouds) {
        cloud.x += cloud.speed;

        if (cloud.x > 1.3) {
          cloud.x = -0.3;
        }

        drawCloud(cloud.x * width, cloud.y * height, cloud.scale);
      }

      drawGround();

      for (const flower of flowers) {
        flower.vel += (1 - flower.scale) * 0.35;
        flower.vel *= 0.72;
        flower.scale += flower.vel;
        flower.phase += 0.02;

        drawFlower(flower);
      }

      if (!butterflyRef.current && time > nextButterflyAtRef.current) {
        spawnButterfly();
      }

      const butterfly = butterflyRef.current;

      if (butterfly) {
        butterfly.x += butterfly.vx;
        butterfly.phase += 0.05;
        butterfly.wingPhase += 0.35;
        butterfly.y = butterfly.baseY + Math.sin(butterfly.phase) * 22;

        drawButterfly(butterfly);

        if (butterfly.x < -50 || butterfly.x > width + 50) {
          butterflyRef.current = null;
          nextButterflyAtRef.current = time + 7000 + Math.random() * 8000;
        }
      }

      if (time - lastSpawnRef.current > spawnInterval && bubbles.length < 11) {
        spawnBubble();
        lastSpawnRef.current = time;
      }

      for (let index = bubbles.length - 1; index >= 0; index--) {
        const bubble = bubbles[index];

        bubble.y += bubble.vy;
        bubble.x += Math.sin(time * 0.0015 + bubble.phase) * 0.4;

        if (bubble.y < -bubble.r - 30) {
          bubbles.splice(index, 1);
        } else {
          drawBubble(bubble, time);
        }
      }

      for (let index = particles.length - 1; index >= 0; index--) {
        const particle = particles[index];

        particle.vy += 0.14;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.025;

        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }

        context.save();
        context.globalAlpha = Math.max(0, particle.life);
        context.beginPath();
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        context.fillStyle = particle.color;
        context.fill();
        context.restore();
      }

      for (let index = confetti.length - 1; index >= 0; index--) {
        const piece = confetti[index];

        piece.vy += 0.05;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rot += piece.vrot;
        piece.life -= 0.006;

        if (piece.life <= 0 || piece.y > height + 20) {
          confetti.splice(index, 1);
          continue;
        }

        context.save();
        context.globalAlpha = Math.max(0, piece.life);
        context.translate(piece.x, piece.y);
        context.rotate(piece.rot);
        context.fillStyle = piece.color;
        context.fillRect(
          -piece.size / 2,
          -piece.size / 4,
          piece.size,
          piece.size / 2,
        );
        context.restore();
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    }

    resize();

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", handlePointerDown);

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", handlePointerDown);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      for (const timeout of audioTimeoutsRef.current) {
        window.clearTimeout(timeout);
      }

      audioTimeoutsRef.current = [];

      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }

      bubbles.length = 0;
      flowers.length = 0;
      particles.length = 0;
      confetti.length = 0;
      butterflyRef.current = null;
    };
  }, [ensureAudio, playPop, playSpecial, scheduleTone, updateScore]);

  return (
    <main className="pop-and-bloom">
      <canvas
        ref={canvasRef}
        className="pop-and-bloom__canvas"
        aria-label="Pop and Bloom interactive bubble game"
      />

      <div
        className="pop-and-bloom__score"
        aria-live="polite"
        aria-label={`Score: ${score}`}
      >
        <span aria-hidden="true">🌸</span>
        <span>{score}</span>
      </div>

      <div
        className={[
          "pop-and-bloom__hint",
          hasStarted ? "pop-and-bloom__hint--hidden" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Tap the bubbles ✨
      </div>

      <style jsx>{`
        .pop-and-bloom {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          min-height: 100dvh;
          overflow: hidden;
          background: #cfe9ff;
          font-family:
            "Baloo 2", ui-rounded, "Arial Rounded MT Bold", system-ui,
            sans-serif;
          touch-action: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          overscroll-behavior: none;
        }

        .pop-and-bloom__canvas {
          display: block;
          width: 100%;
          height: 100%;
          cursor: pointer;
          touch-action: none;
        }

        .pop-and-bloom__score {
          position: fixed;
          top: max(18px, env(safe-area-inset-top));
          right: max(18px, env(safe-area-inset-right));
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 72px;
          padding: 8px 20px 8px 14px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.4);
          box-shadow: 0 6px 18px rgba(80, 50, 120, 0.15);
          color: #6b4b8a;
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
          pointer-events: none;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .pop-and-bloom__score > span:first-child {
          font-size: 24px;
        }

        .pop-and-bloom__hint {
          position: fixed;
          top: max(22px, env(safe-area-inset-top));
          left: 50%;
          z-index: 10;
          max-width: calc(100vw - 220px);
          padding: 8px 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.45);
          box-shadow: 0 6px 18px rgba(80, 50, 120, 0.12);
          color: #6b4b8a;
          font-size: 18px;
          font-weight: 500;
          line-height: 1.25;
          text-overflow: ellipsis;
          white-space: nowrap;
          pointer-events: none;
          transform: translateX(-50%);
          transition:
            opacity 0.8s ease,
            transform 0.8s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .pop-and-bloom__hint--hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(-14px);
        }

        @media (max-width: 640px) {
          .pop-and-bloom__score {
            top: max(12px, env(safe-area-inset-top));
            right: max(12px, env(safe-area-inset-right));
            padding: 7px 15px 7px 11px;
            font-size: 19px;
          }

          .pop-and-bloom__score > span:first-child {
            font-size: 21px;
          }

          .pop-and-bloom__hint {
            top: max(68px, calc(env(safe-area-inset-top) + 56px));
            max-width: calc(100vw - 32px);
            padding: 7px 16px;
            font-size: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pop-and-bloom__hint {
            transition-duration: 0.01ms;
          }
        }
      `}</style>
    </main>
  );
}
