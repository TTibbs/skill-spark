"use client";

export const GAME_RESULT_SAVED_EVENT = "skill-spark:game-result-saved";

export type GameResultSavedDetail = {
  childId: number;
  kind: "math" | "memory" | "spelling" | "shapes";
};

export function dispatchGameResultSaved(detail: GameResultSavedDetail) {
  window.dispatchEvent(
    new CustomEvent<GameResultSavedDetail>(GAME_RESULT_SAVED_EVENT, {
      detail,
    }),
  );
}
