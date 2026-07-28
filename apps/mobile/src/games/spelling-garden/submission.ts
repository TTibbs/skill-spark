import type {
  SpellingResultResponse,
  SpellingResultSubmission,
} from "@skill-spark/contracts";

export type SpellingSubmissionStatus =
  | "idle"
  | "submitting"
  | "submitted"
  | "failed";

export type SpellingSubmissionState = {
  status: SpellingSubmissionStatus;
  error: string | null;
  result: SpellingResultResponse | null;
  submittedSessionId: string | null;
};

export const initialSpellingSubmissionState: SpellingSubmissionState = {
  status: "idle",
  error: null,
  result: null,
  submittedSessionId: null,
};

export function canSubmitSpellingResult(
  state: SpellingSubmissionState,
  sessionId: string
) {
  if (state.status === "submitting") return false;
  return state.submittedSessionId !== sessionId;
}

export function markSpellingSubmitting(): SpellingSubmissionState {
  return {
    status: "submitting",
    error: null,
    result: null,
    submittedSessionId: null,
  };
}

export function markSpellingSubmitted(
  sessionId: string,
  result: SpellingResultResponse
): SpellingSubmissionState {
  return {
    status: "submitted",
    error: null,
    result,
    submittedSessionId: sessionId,
  };
}

export function markSpellingFailed(error = "Progress could not be saved.") {
  return {
    status: "failed" as const,
    error,
    result: null,
    submittedSessionId: null,
  };
}

export function buildSpellingSubmission(
  sessionId: string,
  result: Omit<SpellingResultSubmission, "sessionId" | "hintsUsed"> & {
    hintsUsed?: number;
  }
): SpellingResultSubmission {
  return {
    ...result,
    hintsUsed: result.hintsUsed ?? 0,
    sessionId,
  };
}
