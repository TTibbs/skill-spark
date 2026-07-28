"use client";

import * as React from "react";
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
import { useAuth } from "@/features/auth/use-auth";
import { useChildren } from "@/features/children/hooks/use-children";
import { useSelectedChild } from "@/features/children/hooks/use-selected-child";
import { dispatchGameResultSaved } from "./events";
import { createGameSessionId } from "./session-id";

export type SubmissionStatus = "idle" | "submitting" | "submitted" | "failed";

type GameKind = "math" | "memory" | "spelling" | "shapes";

type SubmitInput =
  | { kind: "math"; result: Omit<MathResultSubmission, "sessionId"> }
  | { kind: "memory"; result: Omit<MemoryResultSubmission, "sessionId"> }
  | { kind: "shapes"; result: Omit<ShapeResultSubmission, "sessionId"> }
  | {
      kind: "spelling";
      wordId: number;
      result: Omit<SpellingResultSubmission, "sessionId">;
    };

type SubmitResponse =
  | MathResultResponse
  | MemoryResultResponse
  | SpellingResultResponse
  | ShapeResultResponse;

type CapturedSession = {
  childId: number;
  sessionId: string;
  startedAt: number;
  kind: GameKind;
};

export function useSubmitGameResult() {
  const { status: authStatus, createChildrenApi, refreshSession } = useAuth();
  const { children, isLoading: childrenLoading } = useChildren();
  const { selectedChild } = useSelectedChild(children);
  const api = React.useMemo(() => createChildrenApi(), [createChildrenApi]);
  const sessionRef = React.useRef<CapturedSession | null>(null);
  const lastInputRef = React.useRef<SubmitInput | null>(null);
  const inFlightRef = React.useRef<Promise<SubmitResponse> | null>(null);
  const [status, setStatus] = React.useState<SubmissionStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [response, setResponse] = React.useState<SubmitResponse | null>(null);
  const [capturedSession, setCapturedSession] =
    React.useState<CapturedSession | null>(null);

  const beginSession = React.useCallback(
    (kind: GameKind) => {
      if (!selectedChild) return null;
      const current = sessionRef.current;
      if (current?.kind === kind) return current;
      const next = {
        childId: selectedChild.id,
        sessionId: createGameSessionId(),
        startedAt: Date.now(),
        kind,
      };
      sessionRef.current = next;
      setCapturedSession(next);
      return next;
    },
    [selectedChild]
  );

  const resetSession = React.useCallback(() => {
    sessionRef.current = null;
    lastInputRef.current = null;
    inFlightRef.current = null;
    setCapturedSession(null);
    setStatus("idle");
    setError(null);
    setResponse(null);
  }, []);

  const submit = React.useCallback(
    async (input: SubmitInput) => {
      lastInputRef.current = input;
      const session = sessionRef.current ?? beginSession(input.kind);
      if (!session || authStatus !== "authenticated") {
        setStatus("failed");
        setError("Choose a child profile before saving progress.");
        throw new Error("No selected child");
      }

      if (inFlightRef.current) return inFlightRef.current;
      if (status === "submitted" && response) return response;

      setStatus("submitting");
      setError(null);

      inFlightRef.current = (async () => {
        try {
          const refreshed = await refreshSession();
          if (!refreshed) throw new Error("Session expired");

          let result: SubmitResponse;
          if (input.kind === "math") {
            result = await api.gameResults.submitMath(session.childId, {
              ...input.result,
              sessionId: session.sessionId,
            });
          } else if (input.kind === "memory") {
            result = await api.gameResults.submitMemory(session.childId, {
              ...input.result,
              sessionId: session.sessionId,
            });
          } else if (input.kind === "shapes") {
            result = await api.gameResults.submitShapes(session.childId, {
              ...input.result,
              sessionId: session.sessionId,
            });
          } else {
            result = await api.gameResults.submitSpelling(
              session.childId,
              input.wordId,
              {
                ...input.result,
                sessionId: session.sessionId,
              }
            );
          }

          setResponse(result);
          setStatus("submitted");
          dispatchGameResultSaved({
            childId: session.childId,
            kind: input.kind,
          });
          return result;
        } catch (submissionError) {
          setStatus("failed");
          setError("Your game is complete, but progress could not be saved.");
          throw submissionError;
        } finally {
          inFlightRef.current = null;
        }
      })();

      return inFlightRef.current;
    },
    [
      api.gameResults,
      authStatus,
      beginSession,
      refreshSession,
      response,
      status,
    ]
  );

  const retry = React.useCallback(async () => {
    if (!lastInputRef.current) return null;
    return submit(lastInputRef.current);
  }, [submit]);

  return {
    beginSession,
    resetSession,
    selectedChild,
    status,
    error,
    response,
    submit,
    retry,
    hasCapturedSession: !!capturedSession,
    canSubmit: authStatus === "authenticated" && !childrenLoading && !!selectedChild,
  };
}
