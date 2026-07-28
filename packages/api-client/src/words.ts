import type { WordListResponse } from "@skill-spark/contracts";
import type { ApiClient } from "./client";

export const createWordsApi = (client: ApiClient) => ({
  list(options: { limit?: number; page?: number; category?: string } = {}, signal?: AbortSignal) {
    const params = new URLSearchParams();
    if (options.limit !== undefined) params.set("limit", String(options.limit));
    if (options.page !== undefined) params.set("page", String(options.page));
    if (options.category) params.set("category", options.category);
    const query = params.toString();
    return client.get<WordListResponse>(`/words${query ? `?${query}` : ""}`, {
      signal,
    });
  },
});

export type WordsApi = ReturnType<typeof createWordsApi>;
