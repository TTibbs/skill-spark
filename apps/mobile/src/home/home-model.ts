import type {
  ChildProfile,
  ChildStats,
  ChoreAssignment,
  FamilyReward,
  RewardRedemption,
} from "@skill-spark/contracts";
import { activeRewards } from "../rewards/reward-state";

export type HomeDashboardData = {
  stats: ChildStats | null;
  chores: ChoreAssignment[];
  rewards: FamilyReward[];
  redemptions: RewardRedemption[];
};

export type LearningCard = {
  title: string;
  subtitle: string;
  route:
    | "/games/maths-meadow"
    | "/games/memory-match"
    | "/games/spelling-garden"
    | "/games/colour-critter-catch";
  progressLabel: string;
};

export type SubjectSummary = {
  label: string;
  value: string;
  percent: number;
};

export type HomeViewModel = {
  child: ChildProfile;
  level: number;
  stars: number;
  streakDays: number;
  featured: LearningCard;
  learningCards: LearningCard[];
  chorePreview: ChoreAssignment[];
  rewardPreview: FamilyReward[];
  pendingRewards: RewardRedemption[];
  subjectSummaries: SubjectSummary[];
};

export function buildHomeViewModel(
  child: ChildProfile,
  data: HomeDashboardData
): HomeViewModel {
  const stats = data.stats;
  const math = stats?.mathStats.stats;
  const spelling = stats?.spellingStats.stats;
  const memory = stats?.memoryStats.stats;
  const shapes = stats?.shapeStats.stats;
  const learningCards: LearningCard[] = [
    {
      title: "Maths Meadow",
      subtitle: math ? `${math.correctAnswers} correct answers` : "Number practice",
      route: "/games/maths-meadow",
      progressLabel: math ? `${Math.round(math.overallAccuracy)}% accuracy` : "Ready",
    },
    {
      title: "Spelling Garden",
      subtitle: spelling
        ? `${spelling.total_learned_words} words learned`
        : "Word practice",
      route: "/games/spelling-garden",
      progressLabel: spelling ? `${Math.round(spelling.accuracy)}% accuracy` : "Ready",
    },
    {
      title: "Memory Match",
      subtitle: memory ? `${memory.totalGames} games played` : "Picture pairs",
      route: "/games/memory-match",
      progressLabel: memory ? `${memory.totalMoves} moves total` : "Ready",
    },
    {
      title: "Colour Critter Catch",
      subtitle: shapes ? `${shapes.totalCorrectShapes} shapes found` : "Shape spotting",
      route: "/games/colour-critter-catch",
      progressLabel: shapes
        ? `${Math.round(shapes.overallAccuracy)}% accuracy`
        : "Ready",
    },
  ];

  return {
    child,
    level: child.level,
    stars: child.reward_points,
    streakDays: stats?.choreStats.stats.streak_days ?? 0,
    featured: chooseFeaturedCard(learningCards, stats),
    learningCards,
    chorePreview: data.chores
      .filter((assignment) =>
        ["assigned", "rejected", "submitted"].includes(assignment.status)
      )
      .slice(0, 2),
    rewardPreview: activeRewards(data.rewards).slice(0, 2),
    pendingRewards: data.redemptions
      .filter((redemption) => redemption.status === "requested")
      .slice(0, 2),
    subjectSummaries: [
      {
        label: "Maths",
        value: math ? `${math.totalGames} games` : "No games yet",
        percent: clampPercent(math?.overallAccuracy ?? 0),
      },
      {
        label: "Spelling",
        value: spelling
          ? `${spelling.total_learned_words} words`
          : "No words yet",
        percent: clampPercent(spelling?.accuracy ?? 0),
      },
      {
        label: "Memory",
        value: memory ? `${memory.totalGames} games` : "No games yet",
        percent: clampPercent(memory ? memory.totalGames * 10 : 0),
      },
      {
        label: "Shapes",
        value: shapes ? `${shapes.totalCorrectShapes} found` : "No shapes yet",
        percent: clampPercent(shapes?.overallAccuracy ?? 0),
      },
    ],
  };
}

function chooseFeaturedCard(
  cards: LearningCard[],
  stats: ChildStats | null
): LearningCard {
  if (!stats) return cards[0];

  const totals = [
    stats.mathStats.stats.totalGames,
    stats.spellingStats.stats.totalGames,
    stats.memoryStats.stats.totalGames,
    stats.shapeStats.stats.totalGames,
  ];
  const lowestIndex = totals.reduce(
    (bestIndex, total, index) => (total < totals[bestIndex] ? index : bestIndex),
    0
  );
  return cards[lowestIndex];
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
