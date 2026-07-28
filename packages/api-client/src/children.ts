import type {
  ChildDetailResponse,
  ChildListResponse,
  CreateChildInput,
  CreateChildResponse,
  UpdateChildInput,
  UpdateChildResponse,
} from "@skill-spark/contracts";
import type { ApiClient } from "./client";

export const createChildrenApi = (client: ApiClient) => ({
  listForUser(userId: number, signal?: AbortSignal) {
    return client.get<ChildListResponse>(`/users/${userId}/children`, {
      signal,
    });
  },

  getForUser(userId: number, childId: number, signal?: AbortSignal) {
    return client.get<ChildDetailResponse>(
      `/users/${userId}/children/${childId}`,
      { signal }
    );
  },

  create(input: CreateChildInput, signal?: AbortSignal) {
    return client.post<CreateChildResponse>("/users/me/children", {
      body: input,
      signal,
    });
  },

  update(childId: number, input: UpdateChildInput, signal?: AbortSignal) {
    return client.patch<UpdateChildResponse>(`/children/${childId}`, {
      body: input,
      signal,
    });
  },

  archive(childId: number, signal?: AbortSignal) {
    return client.delete<void>(`/children/${childId}`, { signal });
  },
});

export type ChildrenApi = ReturnType<typeof createChildrenApi>;
