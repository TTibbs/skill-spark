import type {
  ChoreApprovalResponse,
  ChoreAssignmentResponse,
  ChoreListResponse,
  RejectChoreInput,
} from "@skill-spark/contracts";
import type { ApiClient } from "./client";

export const createChoresApi = (client: ApiClient) => ({
  listForChild(childId: number, signal?: AbortSignal) {
    return client.get<ChoreListResponse>(`/children/${childId}/chores`, {
      signal,
    });
  },

  assign(childId: number, choreId: number, signal?: AbortSignal) {
    return client.post<ChoreAssignmentResponse>(
      `/children/${childId}/chores/assign/${choreId}`,
      { signal }
    );
  },

  remove(childId: number, assignmentId: number, signal?: AbortSignal) {
    return client.delete<void>(`/children/${childId}/chores/${assignmentId}`, {
      signal,
    });
  },

  submit(childId: number, assignmentId: number, signal?: AbortSignal) {
    return client.post<ChoreAssignmentResponse>(
      `/children/${childId}/chores/${assignmentId}/submit`,
      { signal }
    );
  },

  approve(childId: number, assignmentId: number, signal?: AbortSignal) {
    return client.post<ChoreApprovalResponse>(
      `/children/${childId}/chores/${assignmentId}/approve`,
      { signal }
    );
  },

  reject(
    childId: number,
    assignmentId: number,
    input: RejectChoreInput = {},
    signal?: AbortSignal
  ) {
    return client.post<ChoreAssignmentResponse>(
      `/children/${childId}/chores/${assignmentId}/reject`,
      { body: input, signal }
    );
  },
});

export type ChoresApi = ReturnType<typeof createChoresApi>;
