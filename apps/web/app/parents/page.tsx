"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import type {
  ChoreAssignment,
  ChildProfile as ApiChildProfile,
  ChildStats,
  FamilyReward,
  RewardRedemption,
} from "@skill-spark/contracts";
import { useAuth } from "@/features/auth/use-auth";
import { useChildChores } from "@/features/children/hooks/use-child-chores";
import { useChildStats } from "@/features/children/hooks/use-child-stats";
import { useChildren } from "@/features/children/hooks/use-children";
import { useFamilyRewards } from "@/features/children/hooks/use-family-rewards";
import { useRewardRedemptions } from "@/features/children/hooks/use-reward-redemptions";
import { useSelectedChild } from "@/features/children/hooks/use-selected-child";

type DashboardTab = "overview" | "chores" | "rewards" | "learning";

type ChildProfile = {
  id: number;
  name: string;
  initials: string;
  age: number;
  level: number;
  xp: number;
  stars: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streak: number;
  lastPlayed: string | null;
  accent: string;
  avatarBackground: string;
};

type ChoreStatus = "assigned" | "submitted" | "approved" | "rejected";

type Chore = {
  id: number;
  childId: number;
  title: string;
  description: string;
  stars: number;
  xp: number;
  status: ChoreStatus;
  category: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
};

type LearningGoal = {
  id: string;
  childId: number;
  title: string;
  category: "Maths" | "Spelling" | "Memory" | "General";
  target: number;
  progress: number;
  unit: string;
};

type ActivityItem = {
  id: string;
  childId: number;
  title: string;
  description: string;
  stars: number;
  timestamp: string;
  type: "game" | "chore" | "reward" | "milestone";
};

const TABS: Array<{
  id: DashboardTab;
  label: string;
  icon: React.ComponentType;
}> = [
  {
    id: "overview",
    label: "Overview",
    icon: OverviewIcon,
  },
  {
    id: "chores",
    label: "Chores",
    icon: ClipboardIcon,
  },
  {
    id: "rewards",
    label: "Rewards",
    icon: GiftIcon,
  },
  {
    id: "learning",
    label: "Learning",
    icon: LearningIcon,
  },
];

const CHILD_ACCENTS = ["#6f9f84", "#9b83c8", "#d99b70", "#5f92bd"];
const CHILD_AVATARS = ["#dcecff", "#eadfff", "#ffe3d4", "#dff1e5"];

function mapChildProfile(child: ApiChildProfile, index: number): ChildProfile {
  return {
    id: child.id,
    name: child.name,
    initials: child.name.trim().slice(0, 1).toUpperCase() || "?",
    age: child.age,
    level: child.level,
    xp: child.xp,
    stars: child.reward_points,
    weeklyGoal: 0,
    weeklyProgress: child.reward_points,
    streak: 0,
    lastPlayed: child.last_played,
    accent: CHILD_ACCENTS[index % CHILD_ACCENTS.length],
    avatarBackground: CHILD_AVATARS[index % CHILD_AVATARS.length],
  };
}

function mapChoreAssignment(assignment: ChoreAssignment): Chore {
  return {
    id: assignment.id,
    childId: assignment.child_id,
    title: assignment.chore.title,
    description: assignment.chore.description ?? "No description provided.",
    stars: assignment.assigned_reward_points,
    xp: assignment.assigned_xp_reward,
    status: assignment.status,
    category: assignment.chore.category,
    submittedAt: assignment.submitted_at,
    reviewedAt: assignment.reviewed_at,
    rejectionReason: assignment.rejection_reason,
  };
}

function formatDateTime(value: string | null) {
  if (!value) return "recently";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildLearningGoals(
  childId: number,
  stats: ChildStats | null
): LearningGoal[] {
  if (!stats) return [];

  return [
    {
      id: `math-${childId}`,
      childId,
      title: "Maths Meadow sessions",
      category: "Maths",
      target: Math.max(stats.mathStats.stats.totalGames, 1),
      progress: stats.mathStats.stats.totalGames,
      unit: "sessions",
    },
    {
      id: `spelling-${childId}`,
      childId,
      title: "Spelling Garden words",
      category: "Spelling",
      target: Math.max(stats.spellingStats.stats.total_learned_words, 1),
      progress: stats.spellingStats.stats.total_learned_words,
      unit: "words",
    },
    {
      id: `memory-${childId}`,
      childId,
      title: "Memory Match sessions",
      category: "Memory",
      target: Math.max(stats.memoryStats.stats.totalGames, 1),
      progress: stats.memoryStats.stats.totalGames,
      unit: "sessions",
    },
  ];
}

function buildLearningActivity(
  childId: number,
  child: ChildProfile,
  stats: ChildStats | null
): ActivityItem[] {
  if (!stats) return [];

  const items: ActivityItem[] = [];
  const timestamp = child.lastPlayed
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(child.lastPlayed))
    : "No activity yet";

  if (stats.mathStats.stats.totalGames > 0) {
    items.push({
      id: `math-${childId}`,
      childId,
      title: "Maths Meadow activity",
      description: `${stats.mathStats.stats.correctAnswers} correct and ${stats.mathStats.stats.incorrectAnswers} incorrect answers.`,
      stars: 0,
      timestamp,
      type: "game",
    });
  }

  if (stats.spellingStats.stats.totalGames > 0) {
    items.push({
      id: `spelling-${childId}`,
      childId,
      title: "Spelling Garden activity",
      description: `${stats.spellingStats.stats.total_correct_guesses} correct guesses across ${stats.spellingStats.stats.total_learned_words} learned words.`,
      stars: 0,
      timestamp,
      type: "game",
    });
  }

  if (stats.memoryStats.stats.totalGames > 0) {
    items.push({
      id: `memory-${childId}`,
      childId,
      title: "Memory Match activity",
      description: `${stats.memoryStats.stats.totalGames} sessions and ${stats.memoryStats.stats.totalMoves} total moves.`,
      stars: 0,
      timestamp,
      type: "game",
    });
  }

  if (stats.shapeStats.stats.totalGames > 0) {
    items.push({
      id: `shapes-${childId}`,
      childId,
      title: "Shape activity",
      description: `${stats.shapeStats.stats.totalCorrectShapes} correct shapes from ${stats.shapeStats.stats.totalShapes} attempts.`,
      stars: 0,
      timestamp,
      type: "game",
    });
  }

  return items;
}

export default function ParentsPage() {
  const router = useRouter();
  const { user, status, createChildrenApi } = useAuth();
  const {
    children: apiChildren,
    isLoading: childrenLoading,
    error: childrenError,
    retry: retryChildren,
  } = useChildren();

  const [activeTab, setActiveTab] = React.useState<DashboardTab>("overview");

  const children = React.useMemo(
    () => apiChildren.map(mapChildProfile),
    [apiChildren]
  );

  const { selectedChild, selectedChildId, selectChild } =
    useSelectedChild(apiChildren);

  const {
    stats: childStats,
    isLoading: statsLoading,
    error: statsError,
    retry: retryStats,
  } = useChildStats(selectedChildId);

  const {
    assignments: choreAssignments,
    isLoading: choresLoading,
    error: choresError,
    retry: retryChores,
  } = useChildChores(selectedChildId);

  const {
    rewards,
    isLoading: rewardsLoading,
    error: rewardsError,
    retry: retryRewards,
  } = useFamilyRewards();
  const {
    redemptions,
    isLoading: redemptionsLoading,
    error: redemptionsError,
    retry: retryRedemptions,
  } = useRewardRedemptions(selectedChildId);

  const [showAddReward, setShowAddReward] = React.useState(false);
  const [childModalMode, setChildModalMode] = React.useState<
    "create" | "edit" | null
  >(null);
  const [showArchiveChildConfirm, setShowArchiveChildConfirm] =
    React.useState(false);
  const [childActionError, setChildActionError] = React.useState<string | null>(
    null
  );
  const [isSavingChild, setIsSavingChild] = React.useState(false);
  const [processingChoreId, setProcessingChoreId] = React.useState<number | null>(
    null
  );
  const childApi = React.useMemo(
    () => createChildrenApi().children,
    [createChildrenApi]
  );
  const choreApi = React.useMemo(
    () => createChildrenApi().chores,
    [createChildrenApi]
  );
  const rewardsApi = React.useMemo(
    () => createChildrenApi().rewards,
    [createChildrenApi]
  );

  const activeChild =
    selectedChild === null
      ? null
      : (children.find((child) => child.id === selectedChild.id) ?? null);

  const activeChildId = activeChild?.id ?? null;

  const createChild = React.useCallback(
    async (input: { name: string; age: number }) => {
      try {
        setIsSavingChild(true);
        setChildActionError(null);
        const response = await childApi.create(input);
        selectChild(response.newChildProfile.id);
        retryChildren();
        setChildModalMode(null);
      } catch (error) {
        setChildActionError(
          error instanceof Error ? error.message : "Could not create child"
        );
      } finally {
        setIsSavingChild(false);
      }
    },
    [childApi, retryChildren, selectChild]
  );

  const updateChild = React.useCallback(
    async (input: { name: string; age: number }) => {
      if (activeChildId === null) return;
      try {
        setIsSavingChild(true);
        setChildActionError(null);
        await childApi.update(activeChildId, input);
        retryChildren();
        setChildModalMode(null);
      } catch (error) {
        setChildActionError(
          error instanceof Error ? error.message : "Could not update child"
        );
      } finally {
        setIsSavingChild(false);
      }
    },
    [activeChildId, childApi, retryChildren]
  );

  const archiveChild = React.useCallback(async () => {
    if (activeChildId === null || !activeChild) return;

    try {
      setIsSavingChild(true);
      setChildActionError(null);
      await childApi.archive(activeChildId);
      const nextChild = apiChildren.find((child) => child.id !== activeChildId);
      if (nextChild) selectChild(nextChild.id);
      window.localStorage.removeItem("skill-spark:selected-child-id");
      retryChildren();
      setShowArchiveChildConfirm(false);
    } catch (error) {
      setChildActionError(
        error instanceof Error ? error.message : "Could not archive child"
      );
    } finally {
      setIsSavingChild(false);
    }
  }, [activeChild, activeChildId, apiChildren, childApi, retryChildren, selectChild]);

  const childChores = React.useMemo(
    () => choreAssignments.map(mapChoreAssignment),
    [choreAssignments]
  );

  const childGoals = React.useMemo(
    () =>
      activeChildId === null ? [] : buildLearningGoals(activeChildId, childStats),
    [activeChildId, childStats]
  );

  const childActivity = React.useMemo(
    () =>
      activeChildId === null || !activeChild
        ? []
        : buildLearningActivity(activeChildId, activeChild, childStats),
    [activeChild, activeChildId, childStats]
  );

  const pendingChores = childChores.filter(
    (chore) => chore.status === "submitted"
  );

  const approveChore = React.useCallback(
    async (choreId: number) => {
      if (activeChildId === null || processingChoreId !== null) return;

      try {
        setProcessingChoreId(choreId);
        await choreApi.approve(activeChildId, choreId);
        retryChores();
        retryChildren();
        retryStats();
      } finally {
        setProcessingChoreId(null);
      }
    },
    [
      activeChildId,
      choreApi,
      processingChoreId,
      retryChildren,
      retryChores,
      retryStats,
    ]
  );

  const rejectChore = React.useCallback(
    async (choreId: number) => {
      if (activeChildId === null || processingChoreId !== null) return;

      const reason =
        window.prompt("Add a short reason, or leave blank to simply try again.") ??
        "";

      try {
        setProcessingChoreId(choreId);
        await choreApi.reject(activeChildId, choreId, {
          reason: reason.trim() || undefined,
        });
        retryChores();
      } finally {
        setProcessingChoreId(null);
      }
    },
    [activeChildId, choreApi, processingChoreId, retryChores]
  );

  const addReward = React.useCallback(
    async (input: {
      title: string;
      description: string;
      starCost: number;
      icon: string;
    }) => {
      await rewardsApi.create({
        title: input.title,
        description: input.description,
        star_cost: input.starCost,
      });
      setShowAddReward(false);
      retryRewards();
    },
    [retryRewards, rewardsApi]
  );

  const toggleReward = React.useCallback(
    async (reward: FamilyReward) => {
      await rewardsApi.update(reward.id, { is_active: !reward.is_active });
      retryRewards();
    },
    [retryRewards, rewardsApi]
  );

  const approveRedemptionRequest = React.useCallback(
    async (requestId: number) => {
      if (activeChildId === null) return;
      await rewardsApi.approve(activeChildId, requestId);
      retryRedemptions();
      retryChildren();
    },
    [activeChildId, retryChildren, retryRedemptions, rewardsApi]
  );

  const rejectRedemptionRequest = React.useCallback(
    async (requestId: number) => {
      if (activeChildId === null) return;
      const reason =
        window.prompt("Add a short reason, or leave blank to simply refund.") ??
        "";
      await rewardsApi.reject(activeChildId, requestId, {
        reason: reason.trim() || undefined,
      });
      retryRedemptions();
      retryChildren();
    },
    [activeChildId, retryChildren, retryRedemptions, rewardsApi]
  );

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f2] text-[#283b33]">
        <p className="rounded-2xl bg-white px-5 py-4 text-sm font-bold shadow-sm">
          Loading parent dashboard...
        </p>
      </div>
    );
  }

  if (childrenLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f2] text-[#283b33]">
        <p className="rounded-2xl bg-white px-5 py-4 text-sm font-bold shadow-sm">
          Loading child profiles...
        </p>
      </div>
    );
  }

  if (childrenError) {
    return (
      <DashboardShell activeTab={activeTab} onTabChange={setActiveTab}>
        <InlineError
          title="Could not load child profiles"
          description="The dashboard is still available, but child data could not be loaded."
          onRetry={retryChildren}
        />
      </DashboardShell>
    );
  }

  if (!activeChild) {
    return (
      <DashboardShell activeTab={activeTab} onTabChange={setActiveTab}>
        <EmptyState
          icon="+"
          title="No child profiles yet"
          description="Create a child profile to start seeing XP, levels, stars and learning progress here."
          actionLabel="Add child"
          onAction={() => setChildModalMode("create")}
        />
        {childModalMode === "create" && (
          <ChildProfileModal
            mode="create"
            error={childActionError}
            isSaving={isSavingChild}
            onClose={() => setChildModalMode(null)}
            onSubmit={createChild}
          />
        )}
      </DashboardShell>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f2] text-[#283b33]">
      <Header />

      <div className="mx-auto flex w-full max-w-[1500px]">
        <DesktopSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          <DashboardHeader
            activeChild={activeChild}
            childProfiles={children}
            activeChildId={activeChild.id}
            pendingCount={pendingChores.length}
            onChildChange={selectChild}
            parentName={user?.display_name || user?.username || "there"}
          />

          <ChildManagementPanel
            child={activeChild}
            error={childActionError}
            isBusy={isSavingChild}
            onAdd={() => setChildModalMode("create")}
            onEdit={() => setChildModalMode("edit")}
            onArchive={() => setShowArchiveChildConfirm(true)}
          />

          <MobileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "overview" && (
            <OverviewTab
              child={activeChild}
              pendingChores={pendingChores}
              rewards={rewards}
              goals={childGoals}
              activities={childActivity}
              stats={childStats}
              statsLoading={statsLoading}
              statsError={statsError}
              onRetryStats={retryStats}
              onApprove={approveChore}
              onReject={rejectChore}
              onViewChores={() => setActiveTab("chores")}
              onViewRewards={() => setActiveTab("rewards")}
            />
          )}

          {activeTab === "chores" && (
            <ChoresTab
              chores={childChores}
              isLoading={choresLoading}
              error={choresError}
              onRetry={retryChores}
              processingChoreId={processingChoreId}
              onApprove={approveChore}
              onReject={rejectChore}
            />
          )}

          {activeTab === "rewards" && (
            <RewardsTab
              child={activeChild}
              rewards={rewards}
              redemptions={redemptions}
              isLoading={rewardsLoading || redemptionsLoading}
              error={rewardsError || redemptionsError}
              onRetry={() => {
                retryRewards();
                retryRedemptions();
              }}
              onAdd={() => setShowAddReward(true)}
              onToggle={toggleReward}
              onApprove={approveRedemptionRequest}
              onReject={rejectRedemptionRequest}
            />
          )}

          {activeTab === "learning" && (
            <LearningTab
              child={activeChild}
              goals={childGoals}
              activities={childActivity}
              stats={childStats}
              statsLoading={statsLoading}
              statsError={statsError}
              onRetryStats={retryStats}
            />
          )}
        </main>
      </div>

      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {showAddReward && (
        <AddRewardModal
          childName={activeChild.name}
          onClose={() => setShowAddReward(false)}
          onSubmit={addReward}
        />
      )}

      {childModalMode && (
        <ChildProfileModal
          mode={childModalMode}
          child={childModalMode === "edit" ? activeChild : undefined}
          error={childActionError}
          isSaving={isSavingChild}
          onClose={() => setChildModalMode(null)}
          onSubmit={childModalMode === "create" ? createChild : updateChild}
        />
      )}

      {showArchiveChildConfirm && (
        <ArchiveChildModal
          childName={activeChild.name}
          isSaving={isSavingChild}
          error={childActionError}
          onClose={() => setShowArchiveChildConfirm(false)}
          onConfirm={archiveChild}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#dce5dd] bg-[#fbfcf8]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] w-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#a8c7b6]"
        >
          <BrandMark />

          <div>
            <span className="block text-lg font-black tracking-[-0.03em] text-[#263d33]">
              Questlings
            </span>
            <span className="hidden text-xs font-semibold text-[#7b8982] sm:block">
              Parent dashboard
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/games"
            className="hidden min-h-10 items-center justify-center rounded-xl border border-[#d6e0d8] bg-white px-4 text-sm font-bold text-[#52665d] transition hover:border-[#b5c8bb] hover:text-[#2d493c] sm:inline-flex"
          >
            View games
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d6e0d8] bg-white text-[#52665d] transition hover:border-[#b5c8bb] hover:text-[#2d493c]"
            aria-label="Open settings"
          >
            <SettingsIcon />
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dcecff] text-sm font-black text-[#385064]"
            aria-label="Open parent profile"
          >
            TW
          </button>
        </div>
      </div>
    </header>
  );
}

function DashboardShell({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f7f2] text-[#283b33]">
      <Header />
      <div className="mx-auto flex w-full max-w-[1500px]">
        <DesktopSidebar activeTab={activeTab} onTabChange={onTabChange} />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>
      <MobileNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

function InlineError({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[2rem] border border-[#f0c9c0] bg-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-[#6d3b31]">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#806960]">
        {description}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#29483b] px-5 text-sm font-black text-white"
      >
        Try again
      </button>
    </div>
  );
}

function DesktopSidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  return (
    <aside className="sticky top-[70px] hidden h-[calc(100dvh-70px)] w-64 shrink-0 border-r border-[#dce5dd] bg-[#fbfcf8] p-5 lg:flex lg:flex-col">
      <nav className="space-y-2" aria-label="Parent dashboard navigation">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-left text-sm font-bold transition ${
                active
                  ? "bg-[#29483b] text-white shadow-[0_5px_0_#183126]"
                  : "text-[#65776f] hover:bg-[#edf2ed] hover:text-[#304a3f]"
              }`}
            >
              <Icon />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.6rem] bg-[#fff0bd] p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffd86f] text-[#574a2c]">
          <ShieldIcon />
        </div>

        <h2 className="mt-5 font-black text-[#4d4939]">
          Parent-controlled rewards
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#756e56]">
          Stars cannot be redeemed or chores approved without access to this
          dashboard.
        </p>
      </div>
    </aside>
  );
}

function DashboardHeader({
  activeChild,
  childProfiles,
  activeChildId,
  pendingCount,
  onChildChange,
  parentName,
}: {
  activeChild: ChildProfile;
  childProfiles: ChildProfile[];
  activeChildId: number;
  pendingCount: number;
  onChildChange: (childId: number) => void;
  parentName: string;
}) {
  return (
    <section className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-sm font-bold text-[#78877f]">
          Welcome back, {parentName}
        </p>

        <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#263c33] sm:text-4xl">
          {activeChild.name}&apos;s progress
        </h1>

        <p className="mt-2 max-w-2xl text-[#6a7b73]">
          Review activity, approve completed chores and manage what{" "}
          {activeChild.name} can work towards.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {pendingCount > 0 && (
          <div className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#fff0bd] px-4 text-sm font-bold text-[#64583a]">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ffd86f] px-1 text-xs">
              {pendingCount}
            </span>
            chore{pendingCount === 1 ? "" : "s"} waiting
          </div>
        )}

        <div className="flex gap-2 rounded-2xl border border-[#d9e3db] bg-white p-1.5">
          {childProfiles.map((child) => {
            const active = child.id === activeChildId;

            return (
              <button
                key={child.id}
                type="button"
                onClick={() => onChildChange(child.id)}
                className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
                  active
                    ? "bg-[#e7efe9] text-[#2c493c]"
                    : "text-[#728178] hover:bg-[#f2f5f1]"
                }`}
                aria-pressed={active}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black"
                  style={{
                    backgroundColor: child.avatarBackground,
                  }}
                >
                  {child.initials}
                </span>
                {child.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MobileTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  return (
    <div className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:hidden">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold ${
              active
                ? "bg-[#29483b] text-white"
                : "border border-[#dce4dd] bg-white text-[#65766e]"
            }`}
          >
            <Icon />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function OverviewTab({
  child,
  pendingChores,
  rewards,
  goals,
  activities,
  stats,
  statsLoading,
  statsError,
  onRetryStats,
  onApprove,
  onReject,
  onViewChores,
  onViewRewards,
}: {
  child: ChildProfile;
  pendingChores: Chore[];
  rewards: FamilyReward[];
  goals: LearningGoal[];
  activities: ActivityItem[];
  stats: ChildStats | null;
  statsLoading: boolean;
  statsError: string | null;
  onRetryStats: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewChores: () => void;
  onViewRewards: () => void;
}) {
  const enabledRewards = rewards.filter((reward) => reward.is_active);
  const totalLearningSessions = stats
    ? stats.mathStats.stats.totalGames +
      stats.spellingStats.stats.totalGames +
      stats.memoryStats.stats.totalGames +
      stats.shapeStats.stats.totalGames
    : 0;

  const nearestReward = [...enabledRewards].sort(
    (first, second) =>
      Math.abs(first.star_cost - child.stars) -
      Math.abs(second.star_cost - child.stars),
  )[0];

  return (
    <div className="mt-8 space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Available stars"
          value={child.stars.toString()}
          supporting="From reward points"
          icon="⭐"
          background="bg-[#fff0bd]"
        />

        <MetricCard
          label="Total XP"
          value={child.xp.toString()}
          supporting="Earned through activities"
          icon="🎯"
          background="bg-[#dff1e5]"
        />

        <MetricCard
          label="Learning sessions"
          value={statsLoading ? "..." : totalLearningSessions.toString()}
          supporting="Maths, spelling, memory and shapes"
          icon="🔥"
          background="bg-[#ffe3d4]"
        />

        <MetricCard
          label="Current level"
          value={`Level ${child.level}`}
          supporting={`Age ${child.age} learning profile`}
          icon="🌱"
          background="bg-[#e5ddff]"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-[#dce5dd] bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-[-0.025em]">
                Chores waiting for review
              </h2>

              <p className="mt-1 text-sm text-[#718078]">
                Approving a chore adds its stars immediately.
              </p>
            </div>

            <button
              type="button"
              onClick={onViewChores}
              className="shrink-0 text-sm font-bold text-[#416b57] hover:text-[#29483b]"
            >
              View all
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {pendingChores.length > 0 ? (
              pendingChores
                .slice(0, 3)
                .map((chore) => (
                  <PendingChoreRow
                    key={chore.id}
                    chore={chore}
                    isProcessing={false}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                ))
            ) : (
              <EmptyState
                icon="✓"
                title="Nothing waiting"
                description="Completed chores will appear here for approval."
              />
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#29483b] p-6 text-white sm:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-[#bad3c7]">Closest reward</p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
                {nearestReward?.title ?? "Add a family reward"}
              </h2>
            </div>

            <span className="text-4xl" aria-hidden="true">
              🎁
            </span>
          </div>

          {nearestReward ? (
            <>
              <p className="mt-3 leading-7 text-[#c8ded3]">
                {nearestReward.description}
              </p>

              <RewardProgress
                current={child.stars}
                target={nearestReward.star_cost}
                dark
              />

              <button
                type="button"
                onClick={onViewRewards}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ffd86f] px-5 text-sm font-black text-[#35473f] transition hover:bg-[#ffe08b]"
              >
                Manage rewards
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onViewRewards}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ffd86f] px-5 text-sm font-black text-[#35473f]"
            >
              Create a reward
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-[#dce5dd] bg-white p-5 sm:p-7">
          <div>
            <h2 className="text-xl font-black tracking-[-0.025em]">
              Learning goals
            </h2>

            <p className="mt-1 text-sm text-[#718078]">
              Weekly targets for the current child.
            </p>
          </div>

          {statsError ? (
            <div className="mt-6">
              <InlineError
                title="Could not load learning stats"
                description="Child profile details loaded, but learning summaries are temporarily unavailable."
                onRetry={onRetryStats}
              />
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {statsLoading ? (
                <LoadingRows />
              ) : goals.length > 0 ? (
                goals.map((goal) => <GoalProgress key={goal.id} goal={goal} />)
              ) : (
                <EmptyState
                  icon="🌱"
                  title="No learning activity yet"
                  description="Once games are played, factual learning summaries will appear here."
                />
              )}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-[#dce5dd] bg-white p-5 sm:p-7">
          <div>
            <h2 className="text-xl font-black tracking-[-0.025em]">
              Recent activity
            </h2>

            <p className="mt-1 text-sm text-[#718078]">
              Learning, chores and milestone updates.
            </p>
          </div>

          <div className="mt-5 divide-y divide-[#e7ede8]">
            {statsLoading ? (
              <LoadingRows />
            ) : activities.length > 0 ? (
              activities
                .slice(0, 5)
                .map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))
            ) : (
              <EmptyState
                icon="🎮"
                title="No recent game activity"
                description="This area will show latest subject activity once games have been recorded."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ChoresTab({
  chores,
  isLoading,
  error,
  onRetry,
  processingChoreId,
  onApprove,
  onReject,
}: {
  chores: Chore[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  processingChoreId: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const pending = chores.filter((chore) => chore.status === "submitted");

  const assigned = chores.filter((chore) => chore.status === "assigned");

  const rejected = chores.filter((chore) => chore.status === "rejected");

  const approved = chores.filter((chore) => chore.status === "approved");

  return (
    <div className="mt-8 space-y-8">
      <PageSectionHeader
        title="Chores and routines"
        description="Review submitted chores and keep assigned routines visible without awarding stars until approval."
      />

      {error ? (
        <InlineError
          title="Could not load chores"
          description="Chore assignments could not be loaded for this child."
          onRetry={onRetry}
        />
      ) : null}

      {isLoading ? <LoadingRows /> : null}

      <section>
        <SectionTitle title="Waiting for approval" count={pending.length} />

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {pending.length > 0 ? (
            pending.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                isProcessing={processingChoreId === chore.id}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))
          ) : (
            <div className="xl:col-span-2">
              <EmptyState
                icon="✓"
                title="No chores waiting"
                description="When a child marks a chore as complete, it will appear here."
              />
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionTitle title="Assigned chores" count={assigned.length} />

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assigned.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              isProcessing={processingChoreId === chore.id}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="Try again" count={rejected.length} />

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rejected.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              isProcessing={processingChoreId === chore.id}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="Recently approved" count={approved.length} />

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {approved.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              isProcessing={processingChoreId === chore.id}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function RewardsTab({
  child,
  rewards,
  redemptions,
  isLoading,
  error,
  onRetry,
  onAdd,
  onToggle,
  onApprove,
  onReject,
}: {
  child: ChildProfile;
  rewards: FamilyReward[];
  redemptions: RewardRedemption[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onAdd: () => void;
  onToggle: (reward: FamilyReward) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const requestedRedemptions = redemptions.filter(
    (redemption) => redemption.status === "requested"
  );
  const recentRedemptions = redemptions.filter(
    (redemption) => redemption.status !== "requested"
  );

  return (
    <div className="mt-8 space-y-8">
      <PageSectionHeader
        title="Family rewards"
        description="Set rewards that are genuinely meaningful to your child and decide how many stars they require."
        actionLabel="Add reward"
        onAction={onAdd}
      />

      {error ? (
        <InlineError
          title="Could not load rewards"
          description="Family rewards or redemption requests are temporarily unavailable."
          onRetry={onRetry}
        />
      ) : null}

      {isLoading ? <LoadingRows /> : null}

      <div className="rounded-[2rem] bg-[#29483b] p-6 text-white sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold text-[#bdd6ca]">
              Available balance
            </p>

            <p className="mt-2 text-4xl font-black tracking-[-0.04em]">
              {child.stars} stars
            </p>

            <p className="mt-3 max-w-2xl leading-7 text-[#c9ded4]">
              Stars remain under parent control. A reward should only be marked
              as redeemed after you have agreed to provide it.
            </p>
          </div>

          <div className="flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-[#ffd86f] bg-white/10 text-4xl">
            ⭐
          </div>
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            stars={child.stars}
            onToggle={onToggle}
          />
        ))}
      </section>

      <section>
        <SectionTitle
          title="Reward requests"
          count={requestedRedemptions.length}
        />
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {requestedRedemptions.length > 0 ? (
            requestedRedemptions.map((redemption) => (
              <RedemptionCard
                key={redemption.id}
                redemption={redemption}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))
          ) : (
            <EmptyState
              icon="✓"
              title="No reward requests"
              description="When a child asks to redeem stars, it will appear here."
            />
          )}
        </div>
      </section>

      <section>
        <SectionTitle title="Recent reward history" count={recentRedemptions.length} />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentRedemptions.slice(0, 6).map((redemption) => (
            <article
              key={redemption.id}
              className="rounded-[1.5rem] border border-[#dce5dd] bg-white p-5"
            >
              <StatusBadge
                status={
                  redemption.status === "approved" ? "approved" : "rejected"
                }
              />
              <h3 className="mt-4 font-black">{redemption.reward_title}</h3>
              <p className="mt-1 text-sm font-bold text-[#6c7c74]">
                {redemption.star_cost} stars · {redemption.status}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function LearningTab({
  child,
  goals,
  activities,
  stats,
  statsLoading,
  statsError,
  onRetryStats,
}: {
  child: ChildProfile;
  goals: LearningGoal[];
  activities: ActivityItem[];
  stats: ChildStats | null;
  statsLoading: boolean;
  statsError: string | null;
  onRetryStats: () => void;
}) {
  const gameActivity = activities.filter(
    (activity) => activity.type === "game",
  );
  const totalCorrect = stats
    ? stats.mathStats.stats.correctAnswers +
      stats.spellingStats.stats.total_correct_guesses +
      stats.shapeStats.stats.totalCorrectShapes
    : 0;
  const totalAttempts = stats
    ? stats.mathStats.stats.totalProblems +
      stats.spellingStats.stats.total_correct_guesses +
      stats.spellingStats.stats.total_incorrect_guesses +
      stats.shapeStats.stats.totalShapes
    : 0;

  return (
    <div className="mt-8 space-y-8">
      <PageSectionHeader
        title="Learning progress"
        description={`Track how ${child.name} is progressing across maths, spelling, memory and general activity.`}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Learning sessions"
          value={
            statsLoading
              ? "..."
              : (
                  (stats?.mathStats.stats.totalGames ?? 0) +
                  (stats?.spellingStats.stats.totalGames ?? 0) +
                  (stats?.memoryStats.stats.totalGames ?? 0) +
                  (stats?.shapeStats.stats.totalGames ?? 0)
                ).toString()
          }
          supporting="Recorded subject sessions"
          icon="🎮"
          background="bg-[#dcecff]"
        />

        <MetricCard
          label="Correct answers"
          value={statsLoading ? "..." : totalCorrect.toString()}
          supporting={`${totalAttempts} recorded attempts`}
          icon="⭐"
          background="bg-[#fff0bd]"
        />

        <MetricCard
          label="Current level"
          value={`Level ${child.level}`}
          supporting={`${child.xp} total XP`}
          icon="🔥"
          background="bg-[#ffe3d4]"
        />
      </section>

      {statsError && (
        <InlineError
          title="Could not load subject stats"
          description="Try again to reload maths, spelling, memory and shape summaries."
          onRetry={onRetryStats}
        />
      )}

      <SubjectSummaryGrid stats={stats} isLoading={statsLoading} />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[#dce5dd] bg-white p-5 sm:p-7">
          <h2 className="text-xl font-black">Weekly learning goals</h2>

          <div className="mt-7 space-y-7">
            {statsLoading ? (
              <LoadingRows />
            ) : goals.length > 0 ? (
              goals.map((goal) => <GoalProgress key={goal.id} goal={goal} />)
            ) : (
              <EmptyState
                icon="🌱"
                title="No goals yet"
                description="Supported learning goals appear once subject activity exists."
              />
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#dce5dd] bg-white p-5 sm:p-7">
          <h2 className="text-xl font-black">Recent game activity</h2>

          <div className="mt-5 divide-y divide-[#e7ede8]">
            {statsLoading ? (
              <LoadingRows />
            ) : gameActivity.length > 0 ? (
              gameActivity.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))
            ) : (
              <EmptyState
                icon="🎮"
                title="No game activity yet"
                description="This child has no recorded maths, spelling, memory or shape sessions."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  supporting,
  icon,
  background,
}: {
  label: string;
  value: string;
  supporting: string;
  icon: string;
  background: string;
}) {
  return (
    <article
      className={`${background} rounded-[1.7rem] border border-black/5 p-5`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-[#69786f]">{label}</p>

        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>
      </div>

      <p className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#2f443a]">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#748178]">{supporting}</p>
    </article>
  );
}

function PendingChoreRow({
  chore,
  isProcessing,
  onApprove,
  onReject,
}: {
  chore: Chore;
  isProcessing: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-[#f4f7f3] p-4 sm:flex-row sm:items-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0bd] text-[#665a3b]">
        <ClipboardIcon />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-[#33483e]">{chore.title}</h3>

          <span className="rounded-full bg-[#fff0bd] px-2.5 py-1 text-xs font-black text-[#695e40]">
            {chore.xp} XP / {chore.stars} stars
          </span>
        </div>

        <p className="mt-1 text-sm text-[#76837c]">
          Submitted {formatDateTime(chore.submittedAt)}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onReject(chore.id)}
          disabled={isProcessing}
          className="min-h-10 rounded-xl border border-[#d9e1db] bg-white px-3 text-sm font-bold text-[#6d7b74] hover:border-[#bdcbc1]"
        >
          Try again
        </button>

        <button
          type="button"
          onClick={() => onApprove(chore.id)}
          disabled={isProcessing}
          className="min-h-10 rounded-xl bg-[#41715a] px-4 text-sm font-bold text-white hover:bg-[#345f4b]"
        >
          {isProcessing ? "Saving..." : "Approve"}
        </button>
      </div>
    </article>
  );
}

function ChoreCard({
  chore,
  isProcessing,
  onApprove,
  onReject,
}: {
  chore: Chore;
  isProcessing: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  return (
    <article className="flex min-h-64 flex-col rounded-[1.7rem] border border-[#dce5dd] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7f0e9] text-[#416451]">
          <ClipboardIcon />
        </div>

        <StatusBadge status={chore.status} />
      </div>

      <h3 className="mt-7 text-xl font-black tracking-[-0.025em]">
        {chore.title}
      </h3>

      <p className="mt-2 leading-7 text-[#6c7c74]">{chore.description}</p>

      {chore.rejectionReason ? (
        <p className="mt-4 rounded-2xl bg-[#fff4df] p-3 text-sm font-semibold text-[#735b2d]">
          Try again note: {chore.rejectionReason}
        </p>
      ) : null}

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-[#78867f]">{chore.category}</span>

          <span className="rounded-full bg-[#fff0bd] px-3 py-1.5 text-[#655a3d]">
            {chore.xp} XP / {chore.stars} stars
          </span>
        </div>

        {chore.status === "submitted" && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onReject(chore.id)}
              disabled={isProcessing}
              className="min-h-11 rounded-xl border border-[#d9e1db] text-sm font-bold text-[#6d7b74]"
            >
              Try again
            </button>

            <button
              type="button"
              onClick={() => onApprove(chore.id)}
              disabled={isProcessing}
              className="min-h-11 rounded-xl bg-[#41715a] text-sm font-bold text-white"
            >
              {isProcessing ? "Saving..." : "Approve"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function RewardCard({
  reward,
  stars,
  onToggle,
}: {
  reward: FamilyReward;
  stars: number;
  onToggle: (reward: FamilyReward) => void;
}) {
  const canAfford = stars >= reward.star_cost;

  return (
    <article
      className={`flex min-h-[22rem] flex-col rounded-[1.8rem] border p-5 transition ${
        reward.is_active
          ? "border-[#dce5dd] bg-white"
          : "border-[#e3e6e3] bg-[#eff1ee] opacity-65"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0bd] text-3xl">
          🎁
        </div>

        <button
          type="button"
          onClick={() => onToggle(reward)}
          aria-pressed={reward.is_active}
          className={`relative h-7 w-12 rounded-full transition ${
            reward.is_active ? "bg-[#5d9476]" : "bg-[#cbd2cd]"
          }`}
          aria-label={`${
            reward.is_active ? "Disable" : "Enable"
          } ${reward.title}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
              reward.is_active ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      <h3 className="mt-8 text-xl font-black tracking-[-0.025em]">
        {reward.title}
      </h3>

      <p className="mt-2 leading-7 text-[#6b7b73]">
        {reward.description ?? "A family reward chosen by a parent."}
      </p>

      <div className="mt-auto pt-7">
        <RewardProgress current={stars} target={reward.star_cost} />

        <button
          type="button"
          disabled={!canAfford || !reward.is_active}
          className="mt-5 min-h-11 w-full rounded-xl bg-[#29483b] px-4 text-sm font-black text-white transition enabled:hover:bg-[#365b4b] disabled:cursor-not-allowed disabled:bg-[#d7ded9] disabled:text-[#87938d]"
        >
          {canAfford ? "Redeem reward" : "Keep earning"}
        </button>
      </div>
    </article>
  );
}

function RedemptionCard({
  redemption,
  onApprove,
  onReject,
}: {
  redemption: RewardRedemption;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  return (
    <article className="rounded-[1.7rem] border border-[#dce5dd] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black">{redemption.reward_title}</h3>
          <p className="mt-2 text-sm font-bold text-[#6c7c74]">
            {redemption.star_cost} stars already reserved
          </p>
        </div>
        <span className="rounded-full bg-[#fff0bd] px-3 py-1.5 text-xs font-black text-[#655a3d]">
          Waiting
        </span>
      </div>

      {redemption.reward_description ? (
        <p className="mt-4 leading-7 text-[#6b7b73]">
          {redemption.reward_description}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onReject(redemption.id)}
          className="min-h-11 rounded-xl border border-[#d9e1db] text-sm font-bold text-[#6d7b74]"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => onApprove(redemption.id)}
          className="min-h-11 rounded-xl bg-[#41715a] text-sm font-bold text-white"
        >
          Approve
        </button>
      </div>
    </article>
  );
}

function RewardProgress({
  current,
  target,
  dark = false,
}: {
  current: number;
  target: number;
  dark?: boolean;
}) {
  const percentage = Math.min(100, (current / target) * 100);

  return (
    <div className="mt-6">
      <div
        className={`flex items-center justify-between text-sm font-bold ${
          dark ? "text-[#d1e4da]" : "text-[#66776e]"
        }`}
      >
        <span>{current} stars</span>
        <span>{target} required</span>
      </div>

      <div
        className={`mt-2 h-3 overflow-hidden rounded-full ${
          dark ? "bg-white/15" : "bg-[#e5ebe6]"
        }`}
      >
        <div
          className="h-full rounded-full bg-[#ffd86f] transition-[width]"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3" aria-label="Loading">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-14 animate-pulse rounded-2xl bg-[#edf2ee]"
        />
      ))}
    </div>
  );
}

function SubjectSummaryGrid({
  stats,
  isLoading,
}: {
  stats: ChildStats | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-[1.7rem] bg-[#edf2ee]"
          />
        ))}
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  const subjects = [
    {
      title: "Maths Meadow",
      icon: "➕",
      primary: `${stats.mathStats.stats.correctAnswers} correct`,
      secondary: `${stats.mathStats.stats.incorrectAnswers} incorrect`,
      tertiary: `${stats.mathStats.stats.totalGames} sessions`,
    },
    {
      title: "Spelling Garden",
      icon: "🌸",
      primary: `${stats.spellingStats.stats.total_correct_guesses} correct`,
      secondary: `${stats.spellingStats.stats.total_incorrect_guesses} incorrect`,
      tertiary: `${stats.spellingStats.stats.total_learned_words} words`,
    },
    {
      title: "Memory Match",
      icon: "🧠",
      primary: `${stats.memoryStats.stats.totalGames} sessions`,
      secondary: `${stats.memoryStats.stats.totalMoves} moves`,
      tertiary:
        stats.memoryStats.stats.bestTimeSecs === null
          ? "No best time yet"
          : `${stats.memoryStats.stats.bestTimeSecs}s best time`,
    },
    {
      title: "Shapes",
      icon: "🔷",
      primary: `${stats.shapeStats.stats.totalCorrectShapes} correct`,
      secondary: `${stats.shapeStats.stats.totalIncorrectShapes} incorrect`,
      tertiary: `${stats.shapeStats.stats.totalGames} sessions`,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {subjects.map((subject) => (
        <article
          key={subject.title}
          className="rounded-[1.7rem] border border-[#dce5dd] bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[#304a3f]">{subject.title}</h2>
            <span className="text-2xl" aria-hidden="true">
              {subject.icon}
            </span>
          </div>
          <p className="mt-5 text-2xl font-black tracking-[-0.03em] text-[#263c33]">
            {subject.primary}
          </p>
          <p className="mt-2 text-sm font-semibold text-[#65776f]">
            {subject.secondary}
          </p>
          <p className="mt-1 text-sm text-[#7c8b84]">{subject.tertiary}</p>
        </article>
      ))}
    </section>
  );
}

function GoalProgress({ goal }: { goal: LearningGoal }) {
  const percentage = Math.min(100, (goal.progress / goal.target) * 100);

  const categoryStyles = {
    Maths: "bg-[#fff0bd] text-[#675b3d]",
    Spelling: "bg-[#ffe0ea] text-[#754f5e]",
    Memory: "bg-[#e7dfff] text-[#5d5078]",
    General: "bg-[#dff1e5] text-[#446653]",
  };

  return (
    <article>
      <div className="flex items-start justify-between gap-5">
        <div>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${categoryStyles[goal.category]}`}
          >
            {goal.category}
          </span>

          <h3 className="mt-2 font-black">{goal.title}</h3>
        </div>

        <strong className="shrink-0 text-sm">
          {goal.progress}/{goal.target} {goal.unit}
        </strong>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e8ede9]">
        <div
          className="h-full rounded-full bg-[#72a78a]"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </article>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const icons: Record<ActivityItem["type"], string> = {
    game: "🎮",
    chore: "📋",
    reward: "🎁",
    milestone: "🏆",
  };

  return (
    <article className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2ee] text-xl">
        {icons[activity.type]}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-black text-[#34483f]">{activity.title}</h3>

          {activity.stars > 0 && (
            <span className="shrink-0 rounded-full bg-[#fff0bd] px-2.5 py-1 text-xs font-black text-[#675c3f]">
              +{activity.stars}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm leading-6 text-[#74827b]">
          {activity.description}
        </p>

        <p className="mt-1 text-xs font-semibold text-[#919b96]">
          {activity.timestamp}
        </p>
      </div>
    </article>
  );
}

function PageSectionHeader({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-2xl font-black tracking-[-0.035em] sm:text-3xl">
          {title}
        </h2>

        <p className="mt-2 max-w-2xl leading-7 text-[#6c7c74]">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#29483b] px-5 text-sm font-black text-white shadow-[0_4px_0_#183126] transition hover:-translate-y-0.5"
        >
          <PlusIcon />
          {actionLabel}
        </button>
      )}
    </section>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-black">{title}</h2>

      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#e2ebe4] px-2 text-xs font-black text-[#53685d]">
        {count}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: ChoreStatus }) {
  const styles = {
    assigned: "bg-[#e7edf7] text-[#50647b]",
    submitted: "bg-[#fff0bd] text-[#675a3d]",
    approved: "bg-[#dff1e5] text-[#436653]",
    rejected: "bg-[#fff4df] text-[#735b2d]",
  };

  const labels = {
    assigned: "Assigned",
    submitted: "Waiting",
    approved: "Approved",
    rejected: "Try again",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-black ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#cedbd1] bg-[#f7f9f6] p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dff1e5] text-xl font-black text-[#46705b]">
        {icon}
      </span>

      <h3 className="mt-4 font-black">{title}</h3>

      <p className="mt-1 max-w-sm text-sm leading-6 text-[#77847d]">
        {description}
      </p>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 min-h-11 rounded-xl bg-[#315f4c] px-5 text-sm font-black text-white"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function ChildManagementPanel({
  child,
  error,
  isBusy,
  onAdd,
  onEdit,
  onArchive,
}: {
  child: ChildProfile;
  error: string | null;
  isBusy: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onArchive: () => void;
}) {
  return (
    <section className="mt-5 rounded-[1.5rem] border border-[#dce5dd] bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7d8a82]">
            Child profile
          </p>
          <p className="mt-1 text-sm font-bold text-[#55685f]">
            {child.name}, age {child.age}. XP, level and stars are updated only
            by Skill Spark.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAdd}
            disabled={isBusy}
            className="min-h-10 rounded-xl bg-[#315f4c] px-4 text-sm font-black text-white disabled:opacity-60"
          >
            Add child
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={isBusy}
            className="min-h-10 rounded-xl border border-[#d6e0d8] px-4 text-sm font-black text-[#315f4c] disabled:opacity-60"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onArchive}
            disabled={isBusy}
            className="min-h-10 rounded-xl border border-[#efd0c8] px-4 text-sm font-black text-[#7b4638] disabled:opacity-60"
          >
            Archive
          </button>
        </div>
      </div>
      {error ? (
        <p className="mt-3 text-sm font-bold text-[#8a4a38]">{error}</p>
      ) : null}
    </section>
  );
}

function ChildProfileModal({
  mode,
  child,
  error,
  isSaving,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  child?: ChildProfile;
  error: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; age: number }) => Promise<void>;
}) {
  const [name, setName] = React.useState(child?.name ?? "");
  const [age, setAge] = React.useState(child?.age ?? 6);
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  );

  const submit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedName = name.trim().replace(/\s+/g, " ");
      if (!trimmedName) {
        setValidationError("Add a name for this child.");
        return;
      }
      if (!Number.isInteger(age) || age < 1 || age > 18) {
        setValidationError("Age must be between 1 and 18.");
        return;
      }
      setValidationError(null);
      await onSubmit({ name: trimmedName, age });
    },
    [age, name, onSubmit]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d332a]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="child-profile-title"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-[1.5rem] bg-white p-6 text-[#283b33] shadow-2xl"
      >
        <h2 id="child-profile-title" className="text-2xl font-black">
          {mode === "create" ? "Add child" : "Edit child"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#65766e]">
          Parents can edit name and age. Progression and stars stay managed by
          the backend.
        </p>

        <label className="mt-5 block text-sm font-black" htmlFor="child-name">
          Name
        </label>
        <input
          id="child-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 min-h-12 w-full rounded-xl border border-[#d6e0d8] px-4 font-bold outline-none focus:border-[#315f4c]"
        />

        <label className="mt-4 block text-sm font-black" htmlFor="child-age">
          Age
        </label>
        <input
          id="child-age"
          type="number"
          min={1}
          max={18}
          value={age}
          onChange={(event) => setAge(Number(event.target.value))}
          className="mt-2 min-h-12 w-full rounded-xl border border-[#d6e0d8] px-4 font-bold outline-none focus:border-[#315f4c]"
        />

        {validationError || error ? (
          <p className="mt-4 text-sm font-bold text-[#8a4a38]">
            {validationError || error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-[#d6e0d8] px-5 text-sm font-black text-[#52665d]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-11 rounded-xl bg-[#315f4c] px-5 text-sm font-black text-white disabled:opacity-60"
          >
            {isSaving ? "Saving..." : mode === "create" ? "Add child" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ArchiveChildModal({
  childName,
  isSaving,
  error,
  onClose,
  onConfirm,
}: {
  childName: string;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d332a]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-child-title"
    >
      <div className="w-full max-w-md rounded-[1.5rem] bg-white p-6 text-[#283b33] shadow-2xl">
        <h2 id="archive-child-title" className="text-2xl font-black">
          Archive {childName}?
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#65766e]">
          Their history will be kept, but they will no longer appear in active
          child lists for games, chores, rewards or the dashboard.
        </p>
        {error ? (
          <p className="mt-4 text-sm font-bold text-[#8a4a38]">{error}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-[#d6e0d8] px-5 text-sm font-black text-[#52665d]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void onConfirm()}
            className="min-h-11 rounded-xl bg-[#8a4a38] px-5 text-sm font-black text-white disabled:opacity-60"
          >
            {isSaving ? "Archiving..." : "Archive child"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddRewardModal({
  childName,
  onClose,
  onSubmit,
}: {
  childName: string;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    description: string;
    starCost: number;
    icon: string;
  }) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [starCost, setStarCost] = React.useState(80);
  const [icon, setIcon] = React.useState("🎁");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description:
        description.trim() || `A family reward chosen for ${childName}.`,
      starCost,
      icon,
    });
  }

  return (
    <ModalShell
      title={`Add a reward for ${childName}`}
      description="Use a reward they will care about, with a target that requires consistent effort."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Reward name">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="For example, choose the family film"
            className="input"
            autoFocus
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain exactly what the reward includes"
            rows={3}
            className="input resize-none"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
          <Field label="Required stars">
            <input
              type="number"
              min={10}
              max={5000}
              step={5}
              value={starCost}
              onChange={(event) =>
                setStarCost(Math.max(10, Number(event.target.value)))
              }
              className="input"
            />
          </Field>

          <Field label="Icon">
            <input
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              maxLength={4}
              className="input text-center text-2xl"
            />
          </Field>
        </div>

        <ModalActions onCancel={onClose} submitLabel="Add reward" />
      </form>
    </ModalShell>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#20332a]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] bg-[#fbfcf8] p-5 shadow-2xl sm:max-w-xl sm:rounded-[2rem] sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2
              id="modal-title"
              className="text-2xl font-black tracking-[-0.035em]"
            >
              {title}
            </h2>

            <p className="mt-2 leading-7 text-[#6d7d75]">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9eeea] text-[#5d7066]"
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-7">{children}</div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          min-height: 46px;
          border: 1px solid #d5dfd7;
          border-radius: 12px;
          background: white;
          padding: 10px 12px;
          color: #2f443a;
          font: inherit;
          outline: none;
        }

        .input:focus {
          border-color: #6f9f84;
          box-shadow: 0 0 0 4px rgba(111, 159, 132, 0.18);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-[#50645a]">
        {label}
      </span>
      {children}
    </label>
  );
}

function ModalActions({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="min-h-11 rounded-xl border border-[#d6dfd8] bg-white px-5 text-sm font-black text-[#66776e]"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="min-h-11 rounded-xl bg-[#29483b] px-5 text-sm font-black text-white shadow-[0_4px_0_#183126]"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function MobileNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#d5dfd7] bg-[#fbfcf8]/95 px-2 pb-[max(7px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
      aria-label="Mobile parent navigation"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-black ${
              active ? "bg-[#e5ede7] text-[#29483b]" : "text-[#74827b]"
            }`}
          >
            <Icon />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function BrandMark() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#ffd86f] text-[#2f463d] shadow-[0_4px_0_#d7b657]">
      <StarIcon />
    </span>
  );
}

function OverviewIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="4" width="14" height="17" rx="3" />
      <path d="M9 3h6v4H9z" />
      <path d="m8 12 2 2 5-5" />
      <path d="M8 17h7" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13M3 12h18" />
      <path d="M12 8H8.5A2.5 2.5 0 1 1 11 5.5L12 8Z" />
      <path d="M12 8h3.5A2.5 2.5 0 1 0 13 5.5L12 8Z" />
    </svg>
  );
}

function LearningIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 7 9-4 9 4-9 4-9-4Z" />
      <path d="M7 9.5V15c3 2 7 2 10 0V9.5" />
      <path d="M21 7v7" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
