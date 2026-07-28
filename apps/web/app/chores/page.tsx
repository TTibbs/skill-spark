"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { ChoreAssignment } from "@skill-spark/contracts";
import { useAuth } from "@/features/auth/use-auth";
import { useChildChores } from "@/features/children/hooks/use-child-chores";
import { useChildren } from "@/features/children/hooks/use-children";
import { useSelectedChild } from "@/features/children/hooks/use-selected-child";

const statusLabels = {
  assigned: "Mark as done",
  submitted: "Waiting for grown-up",
  approved: "Approved",
  rejected: "Try again",
} satisfies Record<ChoreAssignment["status"], string>;

export default function ChoresPage() {
  const router = useRouter();
  const { status, createChildrenApi } = useAuth();
  const { children } = useChildren();
  const { selectedChild, selectedChildId, selectChild } = useSelectedChild(children);
  const { assignments, isLoading, error, retry } = useChildChores(selectedChildId);
  const [submittingId, setSubmittingId] = React.useState<number | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const choreApi = React.useMemo(
    () => createChildrenApi().chores,
    [createChildrenApi]
  );

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  const submitChore = React.useCallback(
    async (assignmentId: number) => {
      if (selectedChildId === null || submittingId !== null) return;

      try {
        setSubmitError(null);
        setSubmittingId(assignmentId);
        await choreApi.submit(selectedChildId, assignmentId);
        retry();
      } catch {
        setSubmitError("That chore is done, but we could not save it yet.");
      } finally {
        setSubmittingId(null);
      }
    },
    [choreApi, retry, selectedChildId, submittingId]
  );

  if (status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f2] text-[#283b33]">
        <p className="rounded-2xl bg-white px-5 py-4 text-sm font-bold shadow-sm">
          Loading chores...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-6 text-[#283b33]">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#5f7b6b]">
              Skill Spark
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.03em]">
              Chores
            </h1>
          </div>

          <Link
            href="/parents"
            className="rounded-xl border border-[#dce5dd] bg-white px-4 py-2 text-sm font-black text-[#315f4c]"
          >
            Parent dashboard
          </Link>
        </div>

        {children.length > 1 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => selectChild(child.id)}
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  selectedChild?.id === child.id
                    ? "bg-[#315f4c] text-white"
                    : "bg-white text-[#53685d]"
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        ) : null}

        {submitError ? (
          <div className="mt-6 rounded-2xl border border-[#f2d0bd] bg-[#fff4ec] p-4 text-sm font-bold text-[#7a4b31]">
            {submitError}{" "}
            <button type="button" onClick={retry} className="underline">
              Try again
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-[#f2d0bd] bg-[#fff4ec] p-4 text-sm font-bold text-[#7a4b31]">
            Chores could not be loaded.{" "}
            <button type="button" onClick={retry} className="underline">
              Retry
            </button>
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {isLoading ? (
            <p className="rounded-2xl bg-white p-5 text-sm font-bold">
              Loading chores...
            </p>
          ) : assignments.length > 0 ? (
            assignments.map((assignment) => (
              <article
                key={assignment.id}
                className="rounded-[1.5rem] border border-[#dce5dd] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">
                      {assignment.chore.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#6c7c74]">
                      {assignment.chore.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fff0bd] px-3 py-1 text-xs font-black text-[#655a3d]">
                    {assignment.assigned_reward_points} stars
                  </span>
                </div>

                {assignment.rejection_reason ? (
                  <p className="mt-4 rounded-2xl bg-[#fff4df] p-3 text-sm font-bold text-[#735b2d]">
                    Try again note: {assignment.rejection_reason}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={
                    submittingId === assignment.id ||
                    !["assigned", "rejected"].includes(assignment.status)
                  }
                  onClick={() => submitChore(assignment.id)}
                  className="mt-5 min-h-11 w-full rounded-xl bg-[#41715a] px-4 text-sm font-black text-white disabled:bg-[#c7d1ca] disabled:text-[#607268]"
                >
                  {submittingId === assignment.id
                    ? "Saving..."
                    : statusLabels[assignment.status]}
                </button>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-[#cedbd1] bg-white p-8 text-center text-sm font-bold text-[#65766e] md:col-span-2">
              No chores are assigned yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
