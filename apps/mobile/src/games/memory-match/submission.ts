import type {
  MemoryResultResponse,
  MemoryResultSubmission,
} from "@skill-spark/contracts";

export type MemorySubmissionStatus =
  | "idle"
  | "submitting"
  | "submitted"
  | "failed";

export type MemorySubmissionState = {
  status: MemorySubmissionStatus;
  error: string | null;
  result: MemoryResultResponse | null;
  submittedSessionId: string | null;
};

export const initialMemorySubmissionState: MemorySubmissionState = {
  status: "idle",
  error: null,
  result: null,
  submittedSessionId: null,
};

export function canSubmitMemoryResult(
  state: MemorySubmissionState,
  sessionId: string
) {
  if (state.status === "submitting") return false;
  return state.submittedSessionId !== sessionId;
}

export function markMemorySubmitting(): MemorySubmissionState {
  return {
    status: "submitting",
    error: null,
    result: null,
    submittedSessionId: null,
  };
}

export function markMemorySubmitted(
  sessionId: string,
  result: MemoryResultResponse
): MemorySubmissionState {
  return {
    status: "submitted",
    error: null,
    result,
    submittedSessionId: sessionId,
  };
}

export function markMemoryFailed(error = "Progress could not be saved.") {
  return {
    status: "failed" as const,
    error,
    result: null,
    submittedSessionId: null,
  };
}

export function buildMemorySubmission(
  sessionId: string,
  result: Omit<MemoryResultSubmission, "sessionId">
): MemoryResultSubmission {
  return {
    ...result,
    sessionId,
  };
}
