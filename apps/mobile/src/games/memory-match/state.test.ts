import { describe, expect, it } from "vitest";
import {
  createMemoryDeck,
  createMemorySession,
  difficultyForAge,
  isCardVisible,
  memorySessionSummary,
  resetMismatchedSelection,
  selectMemoryCard,
} from "./state";

describe("memory match state", () => {
  it("chooses age-appropriate difficulty", () => {
    expect(difficultyForAge(5)).toBe("easy");
    expect(difficultyForAge(7)).toBe("medium");
    expect(difficultyForAge(10)).toBe("hard");
  });

  it("creates shuffled pairs for a difficulty", () => {
    const deck = createMemoryDeck("medium", () => 0.42);
    const pairCounts = deck.reduce<Record<string, number>>((counts, card) => {
      counts[card.id] = (counts[card.id] ?? 0) + 1;
      return counts;
    }, {});

    expect(deck).toHaveLength(12);
    expect(Object.values(pairCounts)).toEqual([2, 2, 2, 2, 2, 2]);
  });

  it("uses the random source when shuffling", () => {
    const steady = createMemoryDeck("easy", () => 0);
    const shifted = createMemoryDeck("easy", () => 0.9);

    expect(steady.map((card) => card.cardId)).not.toEqual(
      shifted.map((card) => card.cardId)
    );
  });

  it("reveals two mismatched cards, locks input, then resets", () => {
    const state = createMemorySession(5, () => 0);
    const first = state.cards[0];
    const second = state.cards.find((card) => card.id !== first.id);
    expect(second).toBeDefined();

    const oneSelected = selectMemoryCard(state, first.cardId);
    const mismatch = selectMemoryCard(oneSelected, second!.cardId);
    const ignored = selectMemoryCard(mismatch, state.cards[2].cardId);
    const reset = resetMismatchedSelection(mismatch);

    expect(mismatch.locked).toBe(true);
    expect(mismatch.moves).toBe(1);
    expect(isCardVisible(mismatch, first)).toBe(true);
    expect(isCardVisible(mismatch, second!)).toBe(true);
    expect(ignored).toBe(mismatch);
    expect(reset.locked).toBe(false);
    expect(reset.selectedCardIds).toEqual([]);
  });

  it("keeps matched cards revealed and counts matches", () => {
    const state = createMemorySession(5, () => 0);
    const first = state.cards[0];
    const second = state.cards.find(
      (card) => card.id === first.id && card.cardId !== first.cardId
    );
    expect(second).toBeDefined();

    const oneSelected = selectMemoryCard(state, first.cardId);
    const matched = selectMemoryCard(oneSelected, second!.cardId);

    expect(matched.locked).toBe(false);
    expect(matched.moves).toBe(1);
    expect(matched.matches).toBe(1);
    expect(matched.cards.filter((card) => card.id === first.id)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ matched: true }),
        expect.objectContaining({ matched: true }),
      ])
    );
    expect(memorySessionSummary(matched)).toEqual({
      totalMoves: 1,
      type: "picture",
    });
  });

  it("completes when every pair is matched", () => {
    let state = createMemorySession(5, () => 0);
    const pairIds = [...new Set(state.cards.map((card) => card.id))];

    for (const pairId of pairIds) {
      const pair = state.cards.filter((card) => card.id === pairId);
      state = selectMemoryCard(state, pair[0].cardId);
      state = selectMemoryCard(state, pair[1].cardId);
    }

    expect(state.isComplete).toBe(true);
    expect(state.matches).toBe(4);
    expect(state.moves).toBe(4);
  });
});
