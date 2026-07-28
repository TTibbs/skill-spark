import type {
  ShapeResultResponse,
  ShapeResultSubmission,
} from "@skill-spark/contracts";

export type ColourCritterSubmissionStatus =
  | "idle"
  | "submitting"
  | "submitted"
  | "failed";

export type ColourCritterSubmissionState = {
  status: ColourCritterSubmissionStatus;
  error: string | null;
  result: ShapeResultResponse | null;
  submittedSessionId: string | null;
};

export const initialColourCritterSubmissionState: ColourCritterSubmissionState = {
  status: "idle",
  error: null,
  result: null,
  submittedSessionId: null,
};

export function canSubmitColourCritterResult(
  state: ColourCritterSubmissionState,
  sessionId: string
) {
  if (state.status === "submitting") return false;
  return state.submittedSessionId !== sessionId;
}

export function markColourCritterSubmitting(): ColourCritterSubmissionState {
  return {
    status: "submitting",
    error: null,
    result: null,
    submittedSessionId: null,
  };
}

export function markColourCritterSubmitted(
  sessionId: string,
  result: ShapeResultResponse
): ColourCritterSubmissionState {
  return {
    status: "submitted",
    error: null,
    result,
    submittedSessionId: sessionId,
  };
}

export function markColourCritterFailed(
  error = "Progress could not be saved."
) {
  return {
    status: "failed" as const,
    error,
    result: null,
    submittedSessionId: null,
  };
}

export function buildColourCritterSubmission(
  sessionId: string,
  result: Omit<ShapeResultSubmission, "sessionId">
): ShapeResultSubmission {
  return {
    ...result,
    sessionId,
  };
}
