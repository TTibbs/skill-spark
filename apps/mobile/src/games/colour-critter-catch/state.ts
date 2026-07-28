export type CritterColourId = "pink" | "blue" | "purple" | "green" | "orange";
export type CritterShapeId = "circle" | "star" | "triangle" | "diamond" | "square";
export type CritterDifficulty = "easy" | "medium" | "hard";

export type CritterColour = {
  id: CritterColourId;
  label: string;
  value: string;
  light: string;
};

export type CritterShape = {
  id: CritterShapeId;
  label: string;
  symbol: string;
};

export type CritterOption = {
  id: string;
  colour: CritterColour;
  shape: CritterShape;
  isTarget: boolean;
};

export type CritterRound = {
  targetColour: CritterColour;
  targetShape: CritterShape;
  options: CritterOption[];
};

export type CritterSessionState = {
  difficulty: CritterDifficulty;
  rounds: CritterRound[];
  currentIndex: number;
  correct: number;
  incorrect: number;
  locked: boolean;
  feedback: "idle" | "correct" | "incorrect";
  selectedOptionId: string | null;
  isComplete: boolean;
};

export const COLOUR_CRITTER_SESSION_LENGTH = 8;

export const CRITTER_COLOURS: CritterColour[] = [
  { id: "pink", label: "pink", value: "#ff8fb3", light: "#ffd4e2" },
  { id: "blue", label: "blue", value: "#3b82c4", light: "#ccecff" },
  { id: "purple", label: "purple", value: "#8467d7", light: "#e2d8ff" },
  { id: "green", label: "green", value: "#23875b", light: "#d2f7e3" },
  { id: "orange", label: "orange", value: "#c76516", light: "#ffe1bd" },
];

export const CRITTER_SHAPES: CritterShape[] = [
  { id: "circle", label: "circle", symbol: "●" },
  { id: "star", label: "star", symbol: "★" },
  { id: "triangle", label: "triangle", symbol: "▲" },
  { id: "diamond", label: "diamond", symbol: "◆" },
  { id: "square", label: "square", symbol: "■" },
];

export const CRITTER_DIFFICULTY_CONFIG = {
  easy: { options: 3, colours: 3, shapes: 3 },
  medium: { options: 4, colours: 4, shapes: 4 },
  hard: { options: 6, colours: 5, shapes: 5 },
} as const;

export function difficultyForAge(age: number): CritterDifficulty {
  if (age >= 9) return "hard";
  if (age >= 7) return "medium";
  return "easy";
}

export function createCritterSession(
  age: number,
  random: () => number = Math.random
): CritterSessionState {
  const difficulty = difficultyForAge(age);

  return {
    difficulty,
    rounds: Array.from({ length: COLOUR_CRITTER_SESSION_LENGTH }, (_, index) =>
      createCritterRound(difficulty, index + 1, random)
    ),
    currentIndex: 0,
    correct: 0,
    incorrect: 0,
    locked: false,
    feedback: "idle",
    selectedOptionId: null,
    isComplete: false,
  };
}

export function createCritterRound(
  difficulty: CritterDifficulty,
  roundNumber: number,
  random: () => number = Math.random
): CritterRound {
  const config = CRITTER_DIFFICULTY_CONFIG[difficulty];
  const colours = CRITTER_COLOURS.slice(0, config.colours);
  const shapes = CRITTER_SHAPES.slice(0, config.shapes);
  const targetColour = randomItem(colours, random);
  const targetShape = randomItem(shapes, random);
  const distractors = createDistractors({
    colours,
    shapes,
    targetColour,
    targetShape,
    count: config.options - 1,
    hardMode: difficulty === "hard",
    random,
  });
  const options = shuffle(
    [
      {
        id: `round-${roundNumber}-target`,
        colour: targetColour,
        shape: targetShape,
        isTarget: true,
      },
      ...distractors.map((distractor, index) => ({
        id: `round-${roundNumber}-distractor-${index + 1}`,
        ...distractor,
        isTarget: false,
      })),
    ],
    random
  );

  return {
    targetColour,
    targetShape,
    options,
  };
}

export function selectCritterOption(
  state: CritterSessionState,
  optionId: string
): CritterSessionState {
  if (state.locked || state.isComplete) return state;

  const round = state.rounds[state.currentIndex];
  const option = round?.options.find((item) => item.id === optionId);
  if (!option) return state;

  return {
    ...state,
    correct: state.correct + (option.isTarget ? 1 : 0),
    incorrect: state.incorrect + (option.isTarget ? 0 : 1),
    locked: true,
    feedback: option.isTarget ? "correct" : "incorrect",
    selectedOptionId: optionId,
  };
}

export function advanceCritterRound(
  state: CritterSessionState
): CritterSessionState {
  if (!state.locked) return state;

  const nextIndex = state.currentIndex + 1;
  const isComplete = nextIndex >= state.rounds.length;

  return {
    ...state,
    currentIndex: isComplete ? state.currentIndex : nextIndex,
    locked: false,
    feedback: "idle",
    selectedOptionId: null,
    isComplete,
  };
}

function createDistractors({
  colours,
  shapes,
  targetColour,
  targetShape,
  count,
  hardMode,
  random,
}: {
  colours: CritterColour[];
  shapes: CritterShape[];
  targetColour: CritterColour;
  targetShape: CritterShape;
  count: number;
  hardMode: boolean;
  random: () => number;
}) {
  const distractors: Array<{ colour: CritterColour; shape: CritterShape }> = [];
  const seen = new Set<string>([`${targetColour.id}:${targetShape.id}`]);

  const add = (colour: CritterColour, shape: CritterShape) => {
    const key = `${colour.id}:${shape.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    distractors.push({ colour, shape });
    return true;
  };

  if (hardMode) {
    add(
      randomItem(colours.filter((colour) => colour.id !== targetColour.id), random),
      targetShape
    );
    add(
      targetColour,
      randomItem(shapes.filter((shape) => shape.id !== targetShape.id), random)
    );
  }

  let attempts = 0;
  while (distractors.length < count) {
    const colour = randomItem(colours, random);
    const shape = randomItem(shapes, random);
    add(colour, shape);
    attempts += 1;

    if (seen.size > colours.length * shapes.length - 1) break;
    if (distractors.length < count && attempts > 20) {
      for (const candidateColour of colours) {
        for (const candidateShape of shapes) {
          if (distractors.length >= count) break;
          add(candidateColour, candidateShape);
        }
      }
    }
  }

  return distractors;
}

function randomItem<T>(items: readonly T[], random: () => number) {
  return items[Math.floor(random() * items.length)];
}

function shuffle<T>(items: readonly T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
