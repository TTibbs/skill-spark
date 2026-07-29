import type { ChildProfile, ChildStats } from "@skill-spark/contracts";

export type InsightSubject = {
  key: "maths" | "spelling" | "memory" | "shapes";
  label: string;
  games: number;
  accuracy: number;
  timeSecs: number;
  primaryMetric: string;
  secondaryMetric: string;
};

export type InsightsViewModel = {
  child: ChildProfile;
  level: number;
  xp: number;
  stars: number;
  totalGames: number;
  overallAccuracy: number;
  learningTimeSecs: number;
  hasActivity: boolean;
  strongestSubject: InsightSubject | null;
  practiceSubject: InsightSubject | null;
  subjects: InsightSubject[];
};

export function buildInsightsViewModel(
  child: ChildProfile,
  stats: ChildStats | null
): InsightsViewModel {
  const subjects = stats ? buildSubjects(stats) : emptySubjects();
  const totalGames = subjects.reduce((total, subject) => total + subject.games, 0);
  const learningTimeSecs = subjects.reduce(
    (total, subject) => total + subject.timeSecs,
    0
  );
  const activeSubjects = subjects.filter((subject) => subject.games > 0);
  const overallAccuracy =
    activeSubjects.length === 0
      ? 0
      : clampPercent(
          activeSubjects.reduce((total, subject) => total + subject.accuracy, 0) /
            activeSubjects.length
        );

  return {
    child,
    level: child.level,
    xp: child.xp,
    stars: child.reward_points,
    totalGames,
    overallAccuracy,
    learningTimeSecs,
    hasActivity: totalGames > 0,
    strongestSubject: chooseStrongest(activeSubjects),
    practiceSubject: choosePracticeSubject(activeSubjects),
    subjects,
  };
}

export function formatLearningTime(totalSecs: number) {
  if (totalSecs <= 0) return "0 min";
  if (totalSecs < 60) return `${Math.round(totalSecs)} sec`;
  const minutes = Math.round(totalSecs / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0
    ? `${hours} hr`
    : `${hours} hr ${remainingMinutes} min`;
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildSubjects(stats: ChildStats): InsightSubject[] {
  const math = stats.mathStats.stats;
  const spelling = stats.spellingStats.stats;
  const memory = stats.memoryStats.stats;
  const shapes = stats.shapeStats.stats;

  return [
    {
      key: "maths",
      label: "Maths",
      games: math.totalGames,
      accuracy: clampPercent(math.overallAccuracy),
      timeSecs: 0,
      primaryMetric: `${math.correctAnswers} correct`,
      secondaryMetric: `${math.totalProblems} problems`,
    },
    {
      key: "spelling",
      label: "Spelling",
      games: spelling.totalGames,
      accuracy: clampPercent(spelling.accuracy),
      timeSecs: 0,
      primaryMetric: `${spelling.total_learned_words} words`,
      secondaryMetric: `${spelling.total_hints_used} hints used`,
    },
    {
      key: "memory",
      label: "Memory",
      games: memory.totalGames,
      accuracy: memory.totalGames > 0 ? 100 : 0,
      timeSecs: memory.totalTimeSecs,
      primaryMetric: `${memory.totalMoves} moves`,
      secondaryMetric: memory.bestTimeSecs
        ? `Best ${formatLearningTime(memory.bestTimeSecs)}`
        : "No best time yet",
    },
    {
      key: "shapes",
      label: "Shapes",
      games: shapes.totalGames,
      accuracy: clampPercent(shapes.overallAccuracy),
      timeSecs: shapes.totalTimeSecs,
      primaryMetric: `${shapes.totalCorrectShapes} found`,
      secondaryMetric: `${shapes.totalShapes} shapes`,
    },
  ];
}

function emptySubjects(): InsightSubject[] {
  return [
    emptySubject("maths", "Maths"),
    emptySubject("spelling", "Spelling"),
    emptySubject("memory", "Memory"),
    emptySubject("shapes", "Shapes"),
  ];
}

function emptySubject(key: InsightSubject["key"], label: string): InsightSubject {
  return {
    key,
    label,
    games: 0,
    accuracy: 0,
    timeSecs: 0,
    primaryMetric: "No activity yet",
    secondaryMetric: "Ready to begin",
  };
}

function chooseStrongest(subjects: InsightSubject[]) {
  if (subjects.length === 0) return null;
  return [...subjects].sort((a, b) => b.accuracy - a.accuracy || b.games - a.games)[0];
}

function choosePracticeSubject(subjects: InsightSubject[]) {
  if (subjects.length === 0) return null;
  return [...subjects].sort((a, b) => a.accuracy - b.accuracy || a.games - b.games)[0];
}
