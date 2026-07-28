import type { MathResultResponse, MathResultSubmission } from "@skill-spark/contracts";

export type MathsSubmissionStatus =
  | "idle"
  | "submitting"
  | "submitted"
  | "failed";

export type MathsSubmissionState = {
  status: MathsSubmissionStatus;
  error: string | null;
  result: MathResultResponse | null;
  submittedSessionId: string | null;
};

export const initialMathsSubmissionState: MathsSubmissionState = {
  status: "idle",
  error: null,
  result: null,
  submittedSessionId: null,
};

export function canSubmitMathsResult(
  state: MathsSubmissionState,
  sessionId: string
) {
  if (state.status === "submitting") return false;
  return state.submittedSessionId !== sessionId;
}

export function markMathsSubmitting(): MathsSubmissionState {
  return {
    status: "submitting",
    error: null,
    result: null,
    submittedSessionId: null,
  };
}

export function markMathsSubmitted(
  sessionId: string,
  result: MathResultResponse
): MathsSubmissionState {
  return {
    status: "submitted",
    error: null,
    result,
    submittedSessionId: sessionId,
  };
}

export function markMathsFailed(error = "Progress could not be saved.") {
  return {
    status: "failed" as const,
    error,
    result: null,
    submittedSessionId: null,
  };
}

export function buildMathsSubmission(
  sessionId: string,
  result: Omit<MathResultSubmission, "sessionId">
): MathResultSubmission {
  return {
    ...result,
    sessionId,
  };
}
