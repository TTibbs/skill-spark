import type {
  ChildStatsResponse,
  MathStatsResponse,
  MemoryStatsResponse,
  ShapeStatsResponse,
  SpellingStatsResponse,
} from "@skill-spark/contracts";
import type { ApiClient } from "./client";

export const createStatsApi = (client: ApiClient) => ({
  aggregate(childId: number, signal?: AbortSignal) {
    return client.get<ChildStatsResponse>(`/children/${childId}/stats`, {
      signal,
    });
  },

  math(childId: number, signal?: AbortSignal) {
    return client.get<MathStatsResponse>(`/children/${childId}/stats/math`, {
      signal,
    });
  },

  spelling(childId: number, signal?: AbortSignal) {
    return client.get<SpellingStatsResponse>(
      `/children/${childId}/stats/spelling`,
      { signal }
    );
  },

  memory(childId: number, signal?: AbortSignal) {
    return client.get<MemoryStatsResponse>(
      `/children/${childId}/stats/memory`,
      { signal }
    );
  },

  shapes(childId: number, signal?: AbortSignal) {
    return client.get<ShapeStatsResponse>(`/children/${childId}/stats/shapes`, {
      signal,
    });
  },
});

export type StatsApi = ReturnType<typeof createStatsApi>;
