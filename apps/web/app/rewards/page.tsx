"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useAuth } from "@/features/auth/use-auth";
import { useChildren } from "@/features/children/hooks/use-children";
import { useFamilyRewards } from "@/features/children/hooks/use-family-rewards";
import { useRewardRedemptions } from "@/features/children/hooks/use-reward-redemptions";
import { useSelectedChild } from "@/features/children/hooks/use-selected-child";

export default function RewardsPage() {
  const router = useRouter();
  const { status, createChildrenApi } = useAuth();
  const { children, retry: retryChildren } = useChildren();
  const { selectedChild, selectedChildId, selectChild } = useSelectedChild(children);
  const { rewards, isLoading: rewardsLoading, error: rewardsError, retry: retryRewards } =
    useFamilyRewards();
  const {
    redemptions,
    isLoading: redemptionsLoading,
    error: redemptionsError,
    retry: retryRedemptions,
  } = useRewardRedemptions(selectedChildId);
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const rewardsApi = React.useMemo(
    () => createChildrenApi().rewards,
    [createChildrenApi]
  );

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [router, status]);

  const refreshAll = React.useCallback(() => {
    retryChildren();
    retryRewards();
    retryRedemptions();
  }, [retryChildren, retryRedemptions, retryRewards]);

  const requestReward = React.useCallback(
    async (rewardId: number) => {
      if (selectedChildId === null || savingId !== null) return;
      try {
        setMessage(null);
        setSavingId(rewardId);
        await rewardsApi.request(selectedChildId, { rewardId });
        refreshAll();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not request reward"
        );
      } finally {
        setSavingId(null);
      }
    },
    [refreshAll, rewardsApi, savingId, selectedChildId]
  );

  const cancelRequest = React.useCallback(
    async (requestId: number) => {
      if (selectedChildId === null || savingId !== null) return;
      try {
        setSavingId(requestId);
        await rewardsApi.cancel(selectedChildId, requestId);
        refreshAll();
      } finally {
        setSavingId(null);
      }
    },
    [refreshAll, rewardsApi, savingId, selectedChildId]
  );

  if (status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f2] text-[#283b33]">
        <p className="rounded-2xl bg-white px-5 py-4 text-sm font-bold shadow-sm">
          Loading rewards...
        </p>
      </main>
    );
  }

  const activeRewards = rewards.filter((reward) => reward.is_active);
  const pending = redemptions.filter((item) => item.status === "requested");
  const history = redemptions.filter((item) => item.status !== "requested");
  const isLoading = rewardsLoading || redemptionsLoading;
  const error = rewardsError || redemptionsError;

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-6 text-[#283b33]">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#5f7b6b]">
              Skill Spark
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.03em]">
              Rewards
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

        <section className="mt-6 rounded-[2rem] bg-[#29483b] p-6 text-white">
          <p className="text-sm font-bold text-[#bdd6ca]">Available stars</p>
          <p className="mt-2 text-4xl font-black">
            {selectedChild?.reward_points ?? 0}
          </p>
        </section>

        {message || error ? (
          <div className="mt-6 rounded-2xl border border-[#f2d0bd] bg-[#fff4ec] p-4 text-sm font-bold text-[#7a4b31]">
            {message || "Rewards could not be loaded."}{" "}
            <button type="button" onClick={refreshAll} className="underline">
              Retry
            </button>
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <p className="rounded-2xl bg-white p-5 text-sm font-bold">
              Loading rewards...
            </p>
          ) : activeRewards.length > 0 ? (
            activeRewards.map((reward) => {
              const canAfford =
                (selectedChild?.reward_points ?? 0) >= reward.star_cost;
              return (
                <article
                  key={reward.id}
                  className="rounded-[1.5rem] border border-[#dce5dd] bg-white p-5"
                >
                  <h2 className="text-xl font-black">{reward.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#6c7c74]">
                    {reward.description ?? "A parent-created family reward."}
                  </p>
                  <p className="mt-4 text-sm font-black text-[#655a3d]">
                    {reward.star_cost} stars
                  </p>
                  <button
                    type="button"
                    disabled={!canAfford || savingId !== null}
                    onClick={() => requestReward(reward.id)}
                    className="mt-5 min-h-11 w-full rounded-xl bg-[#41715a] px-4 text-sm font-black text-white disabled:bg-[#c7d1ca] disabled:text-[#607268]"
                  >
                    {savingId === reward.id
                      ? "Requesting..."
                      : canAfford
                        ? "Request reward"
                        : "Keep earning"}
                  </button>
                </article>
              );
            })
          ) : (
            <p className="rounded-2xl border border-dashed border-[#cedbd1] bg-white p-8 text-center text-sm font-bold text-[#65766e] md:col-span-2">
              No family rewards are available yet.
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-black">My requests</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[...pending, ...history].map((redemption) => (
              <article
                key={redemption.id}
                className="rounded-[1.5rem] border border-[#dce5dd] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black">{redemption.reward_title}</h3>
                  <span className="rounded-full bg-[#fff0bd] px-3 py-1 text-xs font-black text-[#655a3d]">
                    {redemption.status}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-[#6c7c74]">
                  {redemption.star_cost} stars
                </p>
                {redemption.status === "requested" ? (
                  <button
                    type="button"
                    disabled={savingId !== null}
                    onClick={() => cancelRequest(redemption.id)}
                    className="mt-4 min-h-10 rounded-xl border border-[#d9e1db] px-4 text-sm font-bold text-[#6d7b74]"
                  >
                    Cancel request
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
