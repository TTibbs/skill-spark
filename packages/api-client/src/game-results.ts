import type {
  MathResultResponse,
  MathResultSubmission,
  MemoryResultResponse,
  MemoryResultSubmission,
  ShapeResultResponse,
  ShapeResultSubmission,
  SpellingResultResponse,
  SpellingResultSubmission,
} from "@skill-spark/contracts";
import type { ApiClient } from "./client";

export const createGameResultsApi = (client: ApiClient) => ({
  submitMath(
    childId: number,
    input: MathResultSubmission,
    signal?: AbortSignal
  ) {
    return client.post<MathResultResponse>(`/children/${childId}/stats/math`, {
      body: input,
      signal,
    });
  },

  submitMemory(
    childId: number,
    input: MemoryResultSubmission,
    signal?: AbortSignal
  ) {
    return client.post<MemoryResultResponse>(
      `/children/${childId}/stats/memory`,
      {
        body: input,
        signal,
      }
    );
  },

  submitSpelling(
    childId: number,
    wordId: number,
    input: SpellingResultSubmission,
    signal?: AbortSignal
  ) {
    return client.post<SpellingResultResponse>(
      `/children/${childId}/stats/spelling/${wordId}`,
      {
        body: input,
        signal,
      }
    );
  },

  submitShapes(
    childId: number,
    input: ShapeResultSubmission,
    signal?: AbortSignal
  ) {
    return client.post<ShapeResultResponse>(
      `/children/${childId}/stats/shapes`,
      {
        body: input,
        signal,
      }
    );
  },
});

export type GameResultsApi = ReturnType<typeof createGameResultsApi>;
