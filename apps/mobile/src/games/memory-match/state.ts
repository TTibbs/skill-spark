import type { MemoryResultSubmission } from "@skill-spark/contracts";

export type MemoryDifficulty = "easy" | "medium" | "hard";

export type MemorySymbol = {
  id: string;
  symbol: string;
  label: string;
  colour: string;
  lightColour: string;
};

export type MemoryCard = MemorySymbol & {
  cardId: string;
  matched: boolean;
};

export type MemorySessionState = {
  difficulty: MemoryDifficulty;
  cards: MemoryCard[];
  selectedCardIds: string[];
  locked: boolean;
  moves: number;
  matches: number;
  isComplete: boolean;
  message: string;
};

export type MemorySessionSummary = Pick<
  MemoryResultSubmission,
  "totalMoves" | "type"
>;

export const MEMORY_SYMBOLS: MemorySymbol[] = [
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
    id: "star",
    symbol: "⭐",
    label: "star",
    colour: "#e7b942",
    lightColour: "#fff0b8",
  },
];

export const MEMORY_DIFFICULTY_CONFIG = {
  easy: { pairs: 4, columns: 4, label: "Easy" },
  medium: { pairs: 6, columns: 4, label: "Medium" },
  hard: { pairs: 8, columns: 4, label: "Hard" },
} as const;

export function difficultyForAge(age: number): MemoryDifficulty {
  if (age >= 9) return "hard";
  if (age >= 7) return "medium";
  return "easy";
}

export function createMemoryDeck(
  difficulty: MemoryDifficulty,
  random: () => number = Math.random
): MemoryCard[] {
  const pairCount = MEMORY_DIFFICULTY_CONFIG[difficulty].pairs;
  const symbols = shuffle(MEMORY_SYMBOLS, random).slice(0, pairCount);
  return shuffle(
    symbols.flatMap((symbol) => [
      { ...symbol, cardId: `${symbol.id}-a`, matched: false },
      { ...symbol, cardId: `${symbol.id}-b`, matched: false },
    ]),
    random
  );
}

export function createMemorySession(
  age: number,
  random: () => number = Math.random
): MemorySessionState {
  const difficulty = difficultyForAge(age);
  return {
    difficulty,
    cards: createMemoryDeck(difficulty, random),
    selectedCardIds: [],
    locked: false,
    moves: 0,
    matches: 0,
    isComplete: false,
    message: "Turn over two cards to find a pair.",
  };
}

export function selectMemoryCard(
  state: MemorySessionState,
  cardId: string
): MemorySessionState {
  if (state.locked || state.isComplete) return state;

  const card = state.cards.find((item) => item.cardId === cardId);
  if (!card || card.matched || state.selectedCardIds.includes(cardId)) {
    return state;
  }

  if (state.selectedCardIds.length === 0) {
    return {
      ...state,
      selectedCardIds: [cardId],
      message: "Now find its matching card.",
    };
  }

  const firstCardId = state.selectedCardIds[0];
  const firstCard = state.cards.find((item) => item.cardId === firstCardId);
  if (!firstCard) {
    return {
      ...state,
      selectedCardIds: [cardId],
      message: "Now find its matching card.",
    };
  }

  const moves = state.moves + 1;
  const matched = firstCard.id === card.id;
  if (!matched) {
    return {
      ...state,
      selectedCardIds: [firstCardId, cardId],
      locked: true,
      moves,
      message: "Not a match. Remember where they are.",
    };
  }

  const cards = state.cards.map((item) =>
    item.id === card.id ? { ...item, matched: true } : item
  );
  const matches = state.matches + 1;
  const isComplete = matches === MEMORY_DIFFICULTY_CONFIG[state.difficulty].pairs;

  return {
    ...state,
    cards,
    selectedCardIds: [],
    locked: false,
    moves,
    matches,
    isComplete,
    message: isComplete
      ? "You found every pair!"
      : `You found the ${card.label} pair!`,
  };
}

export function resetMismatchedSelection(
  state: MemorySessionState
): MemorySessionState {
  if (!state.locked) return state;

  return {
    ...state,
    selectedCardIds: [],
    locked: false,
    message: "Try another pair.",
  };
}

export function isCardVisible(state: MemorySessionState, card: MemoryCard) {
  return card.matched || state.selectedCardIds.includes(card.cardId);
}

export function memorySessionSummary(
  state: MemorySessionState
): MemorySessionSummary {
  return {
    totalMoves: state.moves,
    type: "picture",
  };
}

function shuffle<T>(items: readonly T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
