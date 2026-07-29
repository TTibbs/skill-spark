import type { ChildStats } from "@skill-spark/contracts";
import { clampPercent } from "../insights/insights-model";

export type PracticeRoute =
  | "/games/maths-meadow"
  | "/games/memory-match"
  | "/games/spelling-garden"
  | "/games/colour-critter-catch";

export type PracticeActivity = {
  key: "maths" | "memory" | "spelling" | "shapes";
  title: string;
  icon: string;
  description: string;
  ageContext: string;
  route: PracticeRoute;
  games: number;
  accuracy: number;
  statLabel: string;
};

export const FALLBACK_PRACTICE_ORDER: PracticeActivity["key"][] = [
  "maths",
  "memory",
  "spelling",
  "shapes",
];

export function buildPracticeActivities(
  stats: ChildStats | null
): PracticeActivity[] {
  const math = stats?.mathStats.stats;
  const memory = stats?.memoryStats.stats;
  const spelling = stats?.spellingStats.stats;
  const shapes = stats?.shapeStats.stats;

  return [
    {
      key: "maths",
      title: "Maths Meadow",
      icon: "＋",
      description: "Answer friendly number questions.",
      ageContext: "Addition, subtraction and early multiplication",
      route: "/games/maths-meadow",
      games: math?.totalGames ?? 0,
      accuracy: clampPercent(math?.overallAccuracy ?? 0),
      statLabel: math ? `${math.correctAnswers} correct` : "Ready to play",
    },
    {
      key: "memory",
      title: "Memory Match",
      icon: "◇",
      description: "Find matching cards and build focus.",
      ageContext: "Picture-pair memory practice",
      route: "/games/memory-match",
      games: memory?.totalGames ?? 0,
      accuracy: memory && memory.totalGames > 0 ? 100 : 0,
      statLabel: memory ? `${memory.totalMoves} moves` : "Ready to play",
    },
    {
      key: "spelling",
      title: "Spelling Garden",
      icon: "ABC",
      description: "Type words from simple clues.",
      ageContext: "Vocabulary and spelling confidence",
      route: "/games/spelling-garden",
      games: spelling?.totalGames ?? 0,
      accuracy: clampPercent(spelling?.accuracy ?? 0),
      statLabel: spelling
        ? `${spelling.total_learned_words} words learned`
        : "Ready to play",
    },
    {
      key: "shapes",
      title: "Colour Critter Catch",
      icon: "▣",
      description: "Spot the critter matching colour and shape.",
      ageContext: "Colour and shape recognition",
      route: "/games/colour-critter-catch",
      games: shapes?.totalGames ?? 0,
      accuracy: clampPercent(shapes?.overallAccuracy ?? 0),
      statLabel: shapes
        ? `${shapes.totalCorrectShapes} shapes found`
        : "Ready to play",
    },
  ];
}

export function recommendPracticeActivities(
  activities: PracticeActivity[],
  limit = 2
) {
  const active = activities.filter((activity) => activity.games > 0);
  if (active.length > 0) {
    return [...active]
      .sort(
        (a, b) =>
          a.accuracy - b.accuracy ||
          b.games - a.games ||
          fallbackIndex(a.key) - fallbackIndex(b.key)
      )
      .slice(0, limit);
  }

  return [...activities]
    .sort((a, b) => fallbackIndex(a.key) - fallbackIndex(b.key))
    .slice(0, limit);
}

function fallbackIndex(key: PracticeActivity["key"]) {
  return FALLBACK_PRACTICE_ORDER.indexOf(key);
}
