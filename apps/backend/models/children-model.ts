import { PoolClient } from "pg";
import db from "../db/connection";
import {
  MathStats,
  ShapeStats,
  ChoreAssignment,
  ChoreStats,
  WordAndStats,
  SpellingStatsUpdate,
  SpellingStatsData,
  SpellingStats,
  MemoryStats,
  ChildProfile,
} from "../types";
import { selectWordById } from "./words-models";
import { checkLastUpdated } from "../utils/databaseHelpers";
import { getLevel } from "../utils/levels";

const createDefaultMathStats = (childId: number): MathStats => ({
  child_id: childId,
  stats: {
    totalGames: 0,
    totalProblems: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    overallAccuracy: 0,
    addition: { correct: 0, incorrect: 0, accuracy: 0 },
    subtraction: { correct: 0, incorrect: 0, accuracy: 0 },
    multiplication: { correct: 0, incorrect: 0, accuracy: 0 },
    division: { correct: 0, incorrect: 0, accuracy: 0 },
    counting: { correct: 0, incorrect: 0, accuracy: 0 },
  },
});

const createDefaultSpellingStats = (childId: number): SpellingStats => ({
  child_id: childId,
  stats: {
    totalGames: 0,
    total_learned_words: 0,
    total_hints_used: 0,
    total_correct_guesses: 0,
    total_incorrect_guesses: 0,
    accuracy: 0,
  },
  learned_words: [],
});

const createDefaultMemoryStats = (childId: number): MemoryStats => ({
  child_id: childId,
  stats: {
    totalGames: 0,
    totalMoves: 0,
    totalTimeSecs: 0,
    bestTimeSecs: null,
    fewestMoves: null,
    picture: {
      gamesPlayed: 0,
      totalMoves: 0,
      totalTimeSecs: 0,
      bestTimeSecs: null,
      fewestMoves: null,
    },
    sound: {
      gamesPlayed: 0,
      totalMoves: 0,
      totalTimeSecs: 0,
      bestTimeSecs: null,
      fewestMoves: null,
    },
  },
});

export const selectChildProfiles = async () => {
  const { rows } = await db.query<ChildProfile>(`SELECT * FROM child_profiles`);
  return rows;
};

export const selectStats = async (childId: number) => {
  try {
    const choreStats = await selectChoreStats(childId);
    const mathStats = await selectMathStats(childId);
    const spellingStats = await selectSpellingStats(childId);
    const shapeStats = await selectShapeStats(childId);
    const memoryStats = await selectMemoryStats(childId);

    // If no shape stats exist, create a default structure
    const defaultShapeStats = {
      child_id: childId,
      stats: {
        totalGames: 0,
        totalShapes: 0,
        totalCorrectShapes: 0,
        totalIncorrectShapes: 0,
        overallAccuracy: 0,
        totalTimeSecs: 0,
        bestTimeSecs: 0,
      },
      updated_at: new Date().toISOString(),
    };

    return {
      choreStats,
      mathStats,
      spellingStats,
      shapeStats: shapeStats || defaultShapeStats,
      memoryStats,
    };
  } catch (err) {
    throw err;
  }
};

export const selectChoreStats = async (
  childId: number
): Promise<ChoreStats> => {
  const { rows } = await db.query<{
    child_id: number;
    stats: any;
    updated_at: string;
  }>(
    `SELECT child_id, stats, updated_at FROM chore_stats WHERE child_id = $1`,
    [childId]
  );

  if (rows.length === 0) {
    // Return default stats if no entry exists
    return {
      child_id: childId,
      stats: {
        total_completed: 0,
        total_xp_earned: 0,
        daily_completed: 0,
        weekly_completed: 0,
        monthly_completed: 0,
        streak_days: 0,
        longest_streak: 0,
      },
    };
  }

  return {
    child_id: rows[0].child_id,
    stats: rows[0].stats,
    updated_at: rows[0].updated_at,
  };
};

export const updateChoreStats = async (
  childId: number,
  choreResult: {
    completed: number;
    xpEarned: number;
    category?: string;
  }
): Promise<ChoreStats> => {
  const { completed, xpEarned } = choreResult;

  // Get existing stats or create default structure
  const existingStats = await selectChoreStats(childId);

  // Create default stats structure if none exists
  const defaultStats = {
    total_completed: 0,
    total_xp_earned: 0,
    daily_completed: 0,
    weekly_completed: 0,
    monthly_completed: 0,
    streak_days: 0,
    longest_streak: 0,
  };

  const currentStats = existingStats?.stats || defaultStats;

  // Get the last updated time to calculate streak properly
  const lastUpdated = await checkLastUpdated(childId);
  const now = new Date();
  const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : null;

  // Calculate if this is a consecutive day
  let newStreakDays = currentStats.streak_days;
  if (completed > 0) {
    if (!lastUpdatedDate) {
      // First time completing chores
      newStreakDays = 1;
    } else {
      const daysDifference = Math.floor(
        (now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDifference === 0) {
        // Same day, maintain current streak
        newStreakDays = currentStats.streak_days;
      } else if (daysDifference === 1) {
        // Consecutive day, increment streak
        newStreakDays = currentStats.streak_days + 1;
      } else {
        // Gap in days, reset streak to 1
        newStreakDays = 1;
      }
    }
  }

  // Update the stats in TypeScript
  const updatedStats = {
    ...currentStats,
    total_completed: currentStats.total_completed + completed,
    total_xp_earned: currentStats.total_xp_earned + xpEarned,
    daily_completed: currentStats.daily_completed + completed,
    weekly_completed: currentStats.weekly_completed + completed,
    monthly_completed: currentStats.monthly_completed + completed,
    streak_days: newStreakDays,
    longest_streak: Math.max(currentStats.longest_streak, newStreakDays),
  };

  // Use upsert to insert or update
  const upsertQuery = `
    INSERT INTO chore_stats (child_id, stats)
    VALUES ($1, $2)
    ON CONFLICT (child_id) DO UPDATE
    SET stats = $2, updated_at = NOW()
    RETURNING *;
  `;

  const { rows } = await db.query<ChoreStats>(upsertQuery, [
    childId,
    updatedStats,
  ]);

  // Return the updated stats in the expected format
  return {
    child_id: rows[0].child_id,
    stats: updatedStats,
  };
};

export const selectMathStats = async (childId: number) => {
  const { rows } = await db.query<MathStats>(
    `SELECT 
      jsonb_build_object(
        'totalGames', (stats->>'totalGames')::int,
        'totalProblems', (stats->>'totalProblems')::int,
        'correctAnswers', (stats->>'correctAnswers')::int,
        'incorrectAnswers', (stats->>'incorrectAnswers')::int,
        'overallAccuracy', (stats->>'overallAccuracy')::int,
        'addition', jsonb_build_object(
          'correct', (stats->'addition'->>'correct')::int,
          'incorrect', (stats->'addition'->>'incorrect')::int,
          'accuracy', CASE 
            WHEN (stats->'addition'->>'correct')::int + (stats->'addition'->>'incorrect')::int > 0
            THEN ROUND(((stats->'addition'->>'correct')::float / ((stats->'addition'->>'correct')::int + (stats->'addition'->>'incorrect')::int)) * 100)
            ELSE 0
          END
        ),
        'subtraction', jsonb_build_object(
          'correct', (stats->'subtraction'->>'correct')::int,
          'incorrect', (stats->'subtraction'->>'incorrect')::int,
          'accuracy', CASE 
            WHEN (stats->'subtraction'->>'correct')::int + (stats->'subtraction'->>'incorrect')::int > 0
            THEN ROUND(((stats->'subtraction'->>'correct')::float / ((stats->'subtraction'->>'correct')::int + (stats->'subtraction'->>'incorrect')::int)) * 100)
            ELSE 0
          END
        ),
        'multiplication', jsonb_build_object(
          'correct', (stats->'multiplication'->>'correct')::int,
          'incorrect', (stats->'multiplication'->>'incorrect')::int,
          'accuracy', CASE 
            WHEN (stats->'multiplication'->>'correct')::int + (stats->'multiplication'->>'incorrect')::int > 0
            THEN ROUND(((stats->'multiplication'->>'correct')::float / ((stats->'multiplication'->>'correct')::int + (stats->'multiplication'->>'incorrect')::int)) * 100)
            ELSE 0
          END
        ),
        'division', jsonb_build_object(
          'correct', (stats->'division'->>'correct')::int,
          'incorrect', (stats->'division'->>'incorrect')::int,
          'accuracy', CASE 
            WHEN (stats->'division'->>'correct')::int + (stats->'division'->>'incorrect')::int > 0
            THEN ROUND(((stats->'division'->>'correct')::float / ((stats->'division'->>'correct')::int + (stats->'division'->>'incorrect')::int)) * 100)
            ELSE 0
          END
        ),
        'counting', jsonb_build_object(
          'correct', (stats->'counting'->>'correct')::int,
          'incorrect', (stats->'counting'->>'incorrect')::int,
          'accuracy', CASE 
            WHEN (stats->'counting'->>'correct')::int + (stats->'counting'->>'incorrect')::int > 0
            THEN ROUND(((stats->'counting'->>'correct')::float / ((stats->'counting'->>'correct')::int + (stats->'counting'->>'incorrect')::int)) * 100)
            ELSE 0
          END
        )
      ) as stats,
      child_id,
      created_at,
      updated_at
      FROM math_stats WHERE child_id = $1`,
    [childId]
  );
  return (rows[0] as MathStats | undefined) || createDefaultMathStats(childId);
};

export const updateMathStats = async (
  childId: number,
  mathResult: {
    correct: number;
    incorrect: number;
    type:
      | "addition"
      | "subtraction"
      | "multiplication"
      | "division"
      | "counting";
  }
): Promise<MathStats> => {
  const { correct, incorrect, type } = mathResult;

  // Get existing stats or create default structure
  const existingStats = await selectMathStats(childId);

  // Create default stats structure if none exists
  const defaultStats = {
    totalGames: 0,
    totalProblems: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    overallAccuracy: 0,
    addition: { correct: 0, incorrect: 0, accuracy: 0 },
    subtraction: { correct: 0, incorrect: 0, accuracy: 0 },
    multiplication: { correct: 0, incorrect: 0, accuracy: 0 },
    division: { correct: 0, incorrect: 0, accuracy: 0 },
    counting: { correct: 0, incorrect: 0, accuracy: 0 },
  };

  let currentStats = existingStats?.stats || defaultStats;

  // Handle migration from old structure to new structure
  if (
    currentStats.totalGames === null ||
    currentStats.totalGames === undefined
  ) {
    // Calculate totalGames from individual activity totalGames if they exist
    let totalGames = 0;
    if ((currentStats.addition as any)?.totalGames)
      totalGames += (currentStats.addition as any).totalGames;
    if ((currentStats.subtraction as any)?.totalGames)
      totalGames += (currentStats.subtraction as any).totalGames;
    if ((currentStats.multiplication as any)?.totalGames)
      totalGames += (currentStats.multiplication as any).totalGames;
    if ((currentStats.division as any)?.totalGames)
      totalGames += (currentStats.division as any).totalGames;
    if ((currentStats.counting as any)?.totalGames)
      totalGames += (currentStats.counting as any).totalGames;

    // Clean up old structure and create new structure
    currentStats = {
      totalGames: totalGames,
      totalProblems: currentStats.totalProblems || 0,
      correctAnswers: currentStats.correctAnswers || 0,
      incorrectAnswers: currentStats.incorrectAnswers || 0,
      overallAccuracy: currentStats.overallAccuracy || 0,
      addition: {
        correct: currentStats.addition?.correct || 0,
        incorrect: currentStats.addition?.incorrect || 0,
        accuracy: currentStats.addition?.accuracy || 0,
      },
      subtraction: {
        correct: currentStats.subtraction?.correct || 0,
        incorrect: currentStats.subtraction?.incorrect || 0,
        accuracy: currentStats.subtraction?.accuracy || 0,
      },
      multiplication: {
        correct: currentStats.multiplication?.correct || 0,
        incorrect: currentStats.multiplication?.incorrect || 0,
        accuracy: currentStats.multiplication?.accuracy || 0,
      },
      division: {
        correct: currentStats.division?.correct || 0,
        incorrect: currentStats.division?.incorrect || 0,
        accuracy: currentStats.division?.accuracy || 0,
      },
      counting: {
        correct: currentStats.counting?.correct || 0,
        incorrect: currentStats.counting?.incorrect || 0,
        accuracy: currentStats.counting?.accuracy || 0,
      },
    };
  }

  // Update the stats in TypeScript
  const updatedStats = {
    ...currentStats,
    totalGames: currentStats.totalGames + 1,
    totalProblems: currentStats.totalProblems + correct + incorrect,
    correctAnswers: currentStats.correctAnswers + correct,
    incorrectAnswers: currentStats.incorrectAnswers + incorrect,
    overallAccuracy: Math.round(
      ((currentStats.correctAnswers + correct) /
        (currentStats.correctAnswers +
          correct +
          currentStats.incorrectAnswers +
          incorrect)) *
        100
    ),
    [type]: {
      correct: currentStats[type].correct + correct,
      incorrect: currentStats[type].incorrect + incorrect,
      accuracy: Math.round(
        ((currentStats[type].correct + correct) /
          (currentStats[type].correct +
            correct +
            currentStats[type].incorrect +
            incorrect)) *
          100
      ),
    },
  };

  // Handle division by zero
  if (updatedStats.totalProblems === 0) {
    updatedStats.overallAccuracy = 0;
  }
  if (updatedStats[type].correct + updatedStats[type].incorrect === 0) {
    updatedStats[type].accuracy = 0;
  }

  // Use upsert to insert or update
  const upsertQuery = `
    INSERT INTO math_stats (child_id, stats)
    VALUES ($1, $2)
    ON CONFLICT (child_id) DO UPDATE
    SET stats = $2, updated_at = NOW()
    RETURNING *;
  `;

  const { rows } = await db.query<MathStats>(upsertQuery, [
    childId,
    updatedStats,
  ]);

  // Return the raw database result
  return rows[0];
};

export const selectShapeStats = async (childId: number) => {
  const { rows } = await db.query<ShapeStats>(
    `SELECT 
      stats,
      child_id,
      updated_at
      FROM shape_stats WHERE child_id = $1`,
    [childId]
  );
  return rows[0] as ShapeStats;
};

export const updateShapeStats = async (
  childId: number,
  shapeResult: {
    correct: number;
    incorrect: number;
    timeSpent?: number;
  }
): Promise<ShapeStats> => {
  const { correct, incorrect, timeSpent } = shapeResult;
  const totalShapes = correct + incorrect;

  // Get existing stats or create default structure
  const existingStats = await selectShapeStats(childId);

  // Create default stats structure if none exists
  const defaultStats = {
    totalGames: 0,
    totalShapes: 0,
    totalCorrectShapes: 0,
    totalIncorrectShapes: 0,
    overallAccuracy: 0,
    totalTimeSecs: 0,
    bestTimeSecs: 0,
  };

  const currentStats = existingStats?.stats || defaultStats;

  // Update the stats in TypeScript
  const updatedStats = {
    ...currentStats,
    totalGames: currentStats.totalGames + 1,
    totalShapes: currentStats.totalShapes + totalShapes,
    totalCorrectShapes: currentStats.totalCorrectShapes + correct,
    totalIncorrectShapes: currentStats.totalIncorrectShapes + incorrect,
    overallAccuracy: Math.round(
      ((currentStats.totalCorrectShapes + correct) /
        (currentStats.totalCorrectShapes +
          correct +
          currentStats.totalIncorrectShapes +
          incorrect)) *
        100
    ),
    totalTimeSecs: timeSpent
      ? currentStats.totalTimeSecs + timeSpent
      : currentStats.totalTimeSecs,
    bestTimeSecs: timeSpent
      ? Math.min(currentStats.bestTimeSecs || timeSpent, timeSpent)
      : currentStats.bestTimeSecs,
  };

  // Handle division by zero
  if (updatedStats.totalShapes === 0) {
    updatedStats.overallAccuracy = 0;
  }

  // Use upsert to insert or update
  const upsertQuery = `
    INSERT INTO shape_stats (child_id, stats)
    VALUES ($1, $2)
    ON CONFLICT (child_id) DO UPDATE
    SET stats = $2, updated_at = NOW()
    RETURNING *;
  `;

  const { rows } = await db.query<ShapeStats>(upsertQuery, [
    childId,
    updatedStats,
  ]);

  // Return the updated stats in the expected format
  return {
    child_id: rows[0].child_id,
    stats: updatedStats,
  };
};

export const selectMemoryStats = async (childId: number) => {
  const { rows } = await db.query<MemoryStats>(
    `SELECT 
      stats,
      child_id,
      updated_at
      FROM memory_stats WHERE child_id = $1`,
    [childId]
  );
  return (
    (rows[0] as MemoryStats | undefined) || createDefaultMemoryStats(childId)
  );
};

export const updateMemoryStats = async (
  childId: number,
  memoryResult: {
    totalMoves: number;
    timeSpent?: number;
    type: "picture" | "sound";
  }
): Promise<MemoryStats> => {
  const { totalMoves, type, timeSpent } = memoryResult;

  const upsertQuery = `
INSERT INTO memory_stats AS ms(child_id, stats)
VALUES (
  $1,
  jsonb_build_object(
    'totalGames', 1,
    'totalMoves', $2::int,
    'totalTimeSecs', COALESCE($3::int, 0),
    'bestTimeSecs', COALESCE($3::int, NULL),
    'fewestMoves', $2::int,
    'picture', jsonb_build_object(
      'gamesPlayed', CASE WHEN $4 = 'picture' THEN 1 ELSE 0 END,
      'totalMoves', CASE WHEN $4 = 'picture' THEN $2::int ELSE 0 END,
      'totalTimeSecs', CASE WHEN $4 = 'picture' THEN COALESCE($3::int, 0) ELSE 0 END,
      'bestTimeSecs', CASE WHEN $4 = 'picture' THEN COALESCE($3::int, NULL) ELSE NULL END,
      'fewestMoves', CASE WHEN $4 = 'picture' THEN $2::int ELSE 0 END
    ),
    'sound', jsonb_build_object(
      'gamesPlayed', CASE WHEN $4 = 'sound' THEN 1 ELSE 0 END,
      'totalMoves', CASE WHEN $4 = 'sound' THEN $2::int ELSE 0 END,
      'totalTimeSecs', CASE WHEN $4 = 'sound' THEN COALESCE($3::int, 0) ELSE 0 END,
      'bestTimeSecs', CASE WHEN $4 = 'sound' THEN COALESCE($3::int, NULL) ELSE NULL END,
      'fewestMoves', CASE WHEN $4 = 'sound' THEN $2::int ELSE 0 END
    )
  )
)
ON CONFLICT (child_id) DO UPDATE
SET
  stats = jsonb_build_object(
    'totalGames',
      (COALESCE((ms.stats->>'totalGames')::int, 0) + 1),
    'totalMoves',
      (COALESCE((ms.stats->>'totalMoves')::int, 0) + $2::int),
    'totalTimeSecs',
      CASE 
        WHEN $3 IS NULL THEN COALESCE((ms.stats->>'totalTimeSecs')::int, 0)
        ELSE (COALESCE((ms.stats->>'totalTimeSecs')::int, 0) + $3::int)
      END,
    'bestTimeSecs',
      CASE 
        WHEN $3 IS NULL THEN COALESCE((ms.stats->>'bestTimeSecs')::int, NULL)
        ELSE LEAST(COALESCE((ms.stats->>'bestTimeSecs')::int, $3::int), $3::int)
      END,
    'fewestMoves',
      LEAST(COALESCE((ms.stats->>'fewestMoves')::int, $2::int), $2::int),
    'picture',
      jsonb_build_object(
        'gamesPlayed',
          COALESCE((ms.stats->'picture'->>'gamesPlayed')::int, 0)
          + CASE WHEN $4 = 'picture' THEN 1 ELSE 0 END,
        'totalMoves',
          COALESCE((ms.stats->'picture'->>'totalMoves')::int, 0)
          + CASE WHEN $4 = 'picture' THEN $2::int ELSE 0 END,
        'totalTimeSecs',
          CASE 
            WHEN $3 IS NULL THEN COALESCE((ms.stats->'picture'->>'totalTimeSecs')::int, 0)
            WHEN $4 = 'picture' THEN COALESCE((ms.stats->'picture'->>'totalTimeSecs')::int, 0) + $3::int
            ELSE COALESCE((ms.stats->'picture'->>'totalTimeSecs')::int, 0)
          END,
        'bestTimeSecs',
          CASE 
            WHEN $3 IS NULL THEN COALESCE((ms.stats->'picture'->>'bestTimeSecs')::int, NULL)
            WHEN $4 = 'picture' THEN LEAST(COALESCE((ms.stats->'picture'->>'bestTimeSecs')::int, $3::int), $3::int)
            ELSE COALESCE((ms.stats->'picture'->>'bestTimeSecs')::int, NULL)
          END,
        'fewestMoves',
          CASE 
            WHEN $4 = 'picture' THEN LEAST(COALESCE((ms.stats->'picture'->>'fewestMoves')::int, $2::int), $2::int)
            ELSE COALESCE((ms.stats->'picture'->>'fewestMoves')::int, NULL)
          END
      ),
    'sound',
      jsonb_build_object(
        'gamesPlayed',
          COALESCE((ms.stats->'sound'->>'gamesPlayed')::int, 0)
          + CASE WHEN $4 = 'sound' THEN 1 ELSE 0 END,
        'totalMoves',
          COALESCE((ms.stats->'sound'->>'totalMoves')::int, 0)
          + CASE WHEN $4 = 'sound' THEN $2::int ELSE 0 END,
        'totalTimeSecs',
          CASE 
            WHEN $3 IS NULL THEN COALESCE((ms.stats->'sound'->>'totalTimeSecs')::int, 0)
            WHEN $4 = 'sound' THEN COALESCE((ms.stats->'sound'->>'totalTimeSecs')::int, 0) + $3::int
            ELSE COALESCE((ms.stats->'sound'->>'totalTimeSecs')::int, 0)
          END,
        'bestTimeSecs',
          CASE 
            WHEN $3 IS NULL THEN COALESCE((ms.stats->'sound'->>'bestTimeSecs')::int, NULL)
            WHEN $4 = 'sound' THEN LEAST(COALESCE((ms.stats->'sound'->>'bestTimeSecs')::int, $3::int), $3::int)
            ELSE COALESCE((ms.stats->'sound'->>'bestTimeSecs')::int, NULL)
          END,
        'fewestMoves',
          CASE 
            WHEN $4 = 'sound' THEN LEAST(COALESCE((ms.stats->'sound'->>'fewestMoves')::int, $2::int), $2::int)
            ELSE COALESCE((ms.stats->'sound'->>'fewestMoves')::int, NULL)
          END
      )
  ),
  updated_at = NOW()
RETURNING *;
`;

  const values = [childId, totalMoves, timeSpent, type];
  const { rows } = await db.query<MemoryStats>(upsertQuery, values);

  return rows[0];
};

export const selectSpellingStats = async (childId: number) => {
  const { rows } = await db.query(
    `SELECT 
      ss.stats,
      ss.child_id,
      COALESCE(json_agg(
        json_build_object(
          'word_id', lw.word_id,
          'word', lw.word,
          'image', lw.image,
          'category', lw.category,
          'learned_at', lw.learned_at,
          'times_learned', lw.times_learned
        )
      ) FILTER (WHERE lw.word_id IS NOT NULL), '[]') AS learned_words
    FROM spelling_stats ss
    LEFT JOIN learned_words lw ON lw.child_id = ss.child_id
    WHERE ss.child_id = $1
    GROUP BY ss.stats, ss.child_id`,
    [childId]
  );
  return (rows[0] as SpellingStats | undefined) || createDefaultSpellingStats(childId);
};

export const updateSpellingStats = async (
  childId: number,
  wordId: number,
  spellingResult: SpellingStatsUpdate
): Promise<{ stats: SpellingStatsData }> => {
  // 1. Get word details and check if word is already learned
  await selectWordById(wordId.toString());
  const existingLearnedWord = await checkIfWordIsLearned(wordId, childId);

  // 2. Update learned words (this handles both new and existing words)
  await insertLearnedWord(wordId, childId);

  // 3. Determine if this is a new word being learned
  const isNewWord = !existingLearnedWord;

  // 4. Check if spelling stats exist for this child
  const { rows: existingStats } = await db.query(
    `SELECT child_id FROM spelling_stats WHERE child_id = $1`,
    [childId]
  );

  let updatedResult: WordAndStats;

  if (existingStats.length === 0) {
    // No stats exist, create new ones
    const insertParams = [
      childId,
      isNewWord ? 1 : 0,
      spellingResult.hintsUsed,
      spellingResult.totalCorrectGuesses,
      spellingResult.totalIncorrectGuesses,
    ];

    const {
      rows: [newResult],
    } = await db.query<WordAndStats>(
      `
      INSERT INTO spelling_stats (child_id, stats)
      VALUES ($1, jsonb_build_object(
        'totalGames', 1,
        'total_learned_words', ($2::int),
        'total_hints_used', ($3::int),
        'total_correct_guesses', ($4::int),
        'total_incorrect_guesses', ($5::int),
        'accuracy', (
          ($4::float / GREATEST($4::float + $5::float, 1)) * 100
        )
      ))
      RETURNING *;
      `,
      insertParams
    );
    updatedResult = newResult;
  } else {
    // Stats exist, update them
    const updateParams = [
      childId,
      isNewWord ? 1 : 0,
      spellingResult.hintsUsed,
      spellingResult.totalCorrectGuesses,
      spellingResult.totalIncorrectGuesses,
    ];

    const {
      rows: [updateResult],
    } = await db.query<WordAndStats>(
      `
      UPDATE spelling_stats
      SET stats = jsonb_build_object(
        'totalGames', ((stats->>'totalGames')::int + 1),
        'total_learned_words', ((stats->>'total_learned_words')::int + $2),
        'total_hints_used', ((stats->>'total_hints_used')::int + $3),
        'total_correct_guesses', ((stats->>'total_correct_guesses')::int + $4),
        'total_incorrect_guesses', ((stats->>'total_incorrect_guesses')::int + $5),
        'accuracy', (
          (
            ((stats->>'total_correct_guesses')::int + $4)::float /
            GREATEST(
              ((stats->>'total_correct_guesses')::int + $4)::float +
              ((stats->>'total_incorrect_guesses')::int + $5)::float,
              1
            )
          ) * 100
        )
      )
      WHERE child_id = $1
      RETURNING *;
      `,
      updateParams
    );
    updatedResult = updateResult;
  }

  return { stats: updatedResult.stats };
};

export const assignChoreToChild = async (
  choreId: number,
  childId: number
): Promise<ChoreAssignment> => {
  const { rows } = await db.query<ChoreAssignment>(
    `WITH inserted AS (
      INSERT INTO assigned_chores (
        chore_id,
        child_id,
        status,
        assigned_xp_reward,
        assigned_reward_points
      )
      SELECT c.id, $2, 'assigned', c.xp, c.reward_points
      FROM chores c
      WHERE c.id = $1
      RETURNING *
    )
    SELECT i.*, row_to_json(c.*) AS chore
    FROM inserted i
    JOIN chores c ON c.id = $1`,
    [choreId, childId]
  );

  return rows[0];
};

export const checkDuplicateAssignment = async (
  choreId: number,
  childId: number
): Promise<boolean> => {
  interface CountResult {
    count: string;
  }
  const { rows } = await db.query<CountResult>(
    `SELECT COUNT(*) as count
     FROM assigned_chores
     WHERE chore_id = $1
       AND child_id = $2
       AND status IN ('assigned', 'submitted', 'rejected')`,
    [choreId, childId]
  );
  return parseInt(rows[0].count) > 0;
};

export const selectAssignedChores = async (
  childId: number
): Promise<ChoreAssignment[]> => {
  const { rows } = await db.query<ChoreAssignment>(
    `SELECT ac.*, row_to_json(c.*) AS chore
     FROM assigned_chores ac
     JOIN chores c ON c.id = ac.chore_id
     WHERE ac.child_id = $1
     ORDER BY ac.updated_at DESC, ac.assigned_at DESC`,
    [childId]
  );
  return rows;
};

export const selectChoreAssignment = async (
  childId: number,
  assignmentId: number
): Promise<ChoreAssignment | null> => {
  const { rows } = await db.query<ChoreAssignment>(
    `SELECT ac.*, row_to_json(c.*) AS chore
     FROM assigned_chores ac
     JOIN chores c ON c.id = ac.chore_id
     WHERE ac.id = $1 AND ac.child_id = $2`,
    [assignmentId, childId]
  );
  return rows[0] ?? null;
};

export const submitChoreAssignment = async (
  childId: number,
  assignmentId: number
): Promise<ChoreAssignment | null> => {
  const { rows } = await db.query<ChoreAssignment>(
    `WITH updated AS (
      UPDATE assigned_chores
      SET status = 'submitted',
          submitted_at = NOW(),
          rejection_reason = NULL,
          updated_at = NOW()
      WHERE id = $1
        AND child_id = $2
        AND status IN ('assigned', 'rejected')
      RETURNING *
    )
    SELECT updated.*, row_to_json(c.*) AS chore
    FROM updated
    JOIN chores c ON c.id = updated.chore_id`,
    [assignmentId, childId]
  );
  return rows[0] ?? null;
};

export const rejectChoreAssignment = async (
  childId: number,
  assignmentId: number,
  reviewerId: number,
  reason: string | null
): Promise<ChoreAssignment | null> => {
  const { rows } = await db.query<ChoreAssignment>(
    `WITH updated AS (
      UPDATE assigned_chores
      SET status = 'rejected',
          reviewed_at = NOW(),
          reviewed_by = $3,
          rejection_reason = $4,
          updated_at = NOW()
      WHERE id = $1
        AND child_id = $2
        AND status = 'submitted'
      RETURNING *
    )
    SELECT updated.*, row_to_json(c.*) AS chore
    FROM updated
    JOIN chores c ON c.id = updated.chore_id`,
    [assignmentId, childId, reviewerId, reason]
  );
  return rows[0] ?? null;
};

export const removeChoreAssignment = async (
  childId: number,
  assignmentId: number
): Promise<ChoreAssignment | null> => {
  const { rows } = await db.query<ChoreAssignment>(
    `WITH deleted AS (
      DELETE FROM assigned_chores
      WHERE id = $1
        AND child_id = $2
        AND status IN ('assigned', 'rejected')
      RETURNING *
    )
    SELECT deleted.*, row_to_json(c.*) AS chore
    FROM deleted
    JOIN chores c ON c.id = deleted.chore_id`,
    [assignmentId, childId]
  );
  return rows[0] ?? null;
};

type ApprovalResult = {
  assignment: ChoreAssignment;
  progression: {
    xp: number;
    level: number;
    reward_points: number;
  };
  awarded: {
    xp: number;
    reward_points: number;
  };
};

const selectAssignmentWithClient = async (
  client: PoolClient,
  childId: number,
  assignmentId: number
) => {
  const { rows } = await client.query<ChoreAssignment>(
    `SELECT ac.*, row_to_json(c.*) AS chore
     FROM assigned_chores ac
     JOIN chores c ON c.id = ac.chore_id
     WHERE ac.id = $1 AND ac.child_id = $2
     FOR UPDATE OF ac`,
    [assignmentId, childId]
  );
  return rows[0] ?? null;
};

export const approveChoreAssignment = async (
  childId: number,
  assignmentId: number,
  reviewerId: number
): Promise<ApprovalResult | null> => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const lockedAssignment = await selectAssignmentWithClient(
      client,
      childId,
      assignmentId
    );

    if (!lockedAssignment) {
      await client.query("ROLLBACK");
      return null;
    }

    if (lockedAssignment.status === "approved") {
      const { rows: childRows } = await client.query<{
        xp: number;
        level: number;
        reward_points: number;
      }>(
        `SELECT xp, level, reward_points
         FROM child_profiles
         WHERE id = $1`,
        [childId]
      );
      await client.query("COMMIT");
      return {
        assignment: lockedAssignment,
        progression: childRows[0],
        awarded: {
          xp: lockedAssignment.awarded_xp,
          reward_points: lockedAssignment.awarded_reward_points,
        },
      };
    }

    if (lockedAssignment.status !== "submitted") {
      await client.query("ROLLBACK");
      return null;
    }

    const awardedXp = lockedAssignment.assigned_xp_reward;
    const awardedRewardPoints = lockedAssignment.assigned_reward_points;

    const { rows: childRows } = await client.query<{
      xp: number;
      level: number;
      reward_points: number;
    }>(
      `UPDATE child_profiles
       SET xp = xp + $1,
           reward_points = reward_points + $2,
           last_played = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING xp, level, reward_points`,
      [awardedXp, awardedRewardPoints, childId]
    );

    const nextLevel = getLevel(childRows[0].xp);
    const { rows: updatedChildRows } = await client.query<{
      xp: number;
      level: number;
      reward_points: number;
    }>(
      `UPDATE child_profiles
       SET level = $1
       WHERE id = $2
       RETURNING xp, level, reward_points`,
      [nextLevel, childId]
    );

    await client.query(
      `INSERT INTO chore_completion_history (assigned_chore_id, xp_earned)
       VALUES ($1, $2)`,
      [assignmentId, awardedXp]
    );

    await client.query(
      `INSERT INTO chore_stats (child_id, stats)
       VALUES (
         $1,
         jsonb_build_object(
           'total_completed', 1,
           'total_xp_earned', $2::integer,
           'daily_completed', 1,
           'weekly_completed', 1,
           'monthly_completed', 1,
           'streak_days', 1,
           'longest_streak', 1
         )
       )
       ON CONFLICT (child_id) DO UPDATE
       SET stats = jsonb_set(
             jsonb_set(
               jsonb_set(
                 jsonb_set(
                   jsonb_set(
                     chore_stats.stats,
                     '{total_completed}',
                     to_jsonb(COALESCE((chore_stats.stats->>'total_completed')::int, 0) + 1)
                   ),
                   '{total_xp_earned}',
                     to_jsonb(COALESCE((chore_stats.stats->>'total_xp_earned')::int, 0) + $2::integer)
                 ),
                 '{daily_completed}',
                 to_jsonb(COALESCE((chore_stats.stats->>'daily_completed')::int, 0) + 1)
               ),
               '{weekly_completed}',
               to_jsonb(COALESCE((chore_stats.stats->>'weekly_completed')::int, 0) + 1)
             ),
             '{monthly_completed}',
             to_jsonb(COALESCE((chore_stats.stats->>'monthly_completed')::int, 0) + 1)
           ),
           updated_at = NOW()`,
      [childId, awardedXp]
    );

    const { rows: assignmentRows } = await client.query<ChoreAssignment>(
      `WITH updated AS (
        UPDATE assigned_chores
        SET status = 'approved',
            reviewed_at = NOW(),
            reviewed_by = $3,
            awarded_xp = $4,
            awarded_reward_points = $5,
            is_completed = true,
            completed_at = NOW(),
            last_completed_at = NOW(),
            total_xp_earned = $4,
            updated_at = NOW()
        WHERE id = $1 AND child_id = $2
        RETURNING *
      )
      SELECT updated.*, row_to_json(c.*) AS chore
      FROM updated
      JOIN chores c ON c.id = updated.chore_id`,
      [assignmentId, childId, reviewerId, awardedXp, awardedRewardPoints]
    );

    await client.query("COMMIT");

    return {
      assignment: assignmentRows[0],
      progression: updatedChildRows[0],
      awarded: {
        xp: awardedXp,
        reward_points: awardedRewardPoints,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const selectLearnedWords = async (childId: number) => {
  try {
    const result = await db.query(
      "SELECT * FROM learned_words WHERE child_id = $1",
      [childId]
    );
    return result.rows;
  } catch (err) {
    throw err;
  }
};

export const selectLearnedWord = async (childId: number, wordId: number) => {
  const { rows } = await db.query(
    "SELECT * FROM learned_words WHERE word_id = $1 AND child_id = $2",
    [wordId, childId]
  );
  return rows[0];
};

export const checkIfWordIsLearned = async (wordId: number, childId: number) => {
  try {
    const result = await db.query(
      "SELECT * FROM learned_words WHERE word_id = $1 AND child_id = $2",
      [wordId, childId]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

export const insertLearnedWord = async (wordId: number, childId: number) => {
  try {
    const wordIsLearned = await checkIfWordIsLearned(wordId, childId);
    if (wordIsLearned) {
      const result = await db.query(
        "UPDATE learned_words SET times_learned = times_learned + 1 WHERE word_id = $1 AND child_id = $2 RETURNING *",
        [wordId, childId]
      );
      return result.rows[0];
    } else {
      // Get the word string from the words table
      const word = await selectWordById(wordId.toString());
      const result = await db.query(
        "INSERT INTO learned_words (word_id, word, image, category, child_id, times_learned) VALUES ($1, $2, $3, $4, $5, 1) RETURNING *",
        [wordId, word.word, word.image, word.category, childId]
      );
      return result.rows[0];
    }
  } catch (err) {
    throw err;
  }
};

export const selectAchievements = async (childId: number) => {
  const { rows } = await db.query(
    `WITH child_stats AS (
        SELECT
          COALESCE((s.stats->>'total_learned_words')::int, 0)   AS spelling_total,
          COALESCE((m.stats->>'totalProblems')::int, 0)         AS math_total,
          COALESCE((sh.stats->>'totalCorrectShapes')::int, 0)   AS shapes_total,
          COALESCE((mem.stats->>'totalGames')::int, 0)          AS memory_total,
          COALESCE((c.stats->>'total_completed')::int, 0)       AS chores_total
        FROM (VALUES ($1::int)) AS v(child_id)
        LEFT JOIN spelling_stats s  ON s.child_id  = v.child_id
        LEFT JOIN math_stats     m  ON m.child_id  = v.child_id
        LEFT JOIN shape_stats    sh ON sh.child_id = v.child_id
        LEFT JOIN memory_stats   mem ON mem.child_id= v.child_id
        LEFT JOIN chore_stats    c  ON c.child_id  = v.child_id
      )
      SELECT
        r.id,
        r.title,
        r.description,
        r.criteria,
        r.required_value,
        r.xp_reward,
        r.points_reward,
        r.image_url,
        r.category,
        (cs.spelling_total >= r.required_value AND r.category = 'spelling')
         OR (cs.math_total     >= r.required_value AND r.category = 'math')
         OR (cs.shapes_total   >= r.required_value AND r.category = 'shapes')
         OR (cs.memory_total   >= r.required_value AND r.category = 'memory')
         OR (cs.chores_total   >= r.required_value AND r.category = 'chores')
          AS is_achieved,
        r.created_at,
        r.updated_at
      FROM achievements r
      CROSS JOIN child_stats cs
      WHERE r.is_active
        AND (
          (r.category = 'spelling' AND cs.spelling_total >= r.required_value) OR
          (r.category = 'math'     AND cs.math_total     >= r.required_value) OR
          (r.category = 'shapes'   AND cs.shapes_total   >= r.required_value) OR
          (r.category = 'memory'   AND cs.memory_total   >= r.required_value) OR
          (r.category = 'chores'   AND cs.chores_total   >= r.required_value)
        )
      ORDER BY r.category, r.id`,
    [childId]
  );
  return rows;
};

export const selectCompletedAchievements = async (childId: number) => {
  const { rows } = await db.query(
    `SELECT * FROM achievements WHERE child_id = $1 AND is_achieved = true`,
    [childId]
  );
  return rows;
};

export const getWordDetailsAndUpdateStats = async (
  childId: number,
  wordId: number,
  hintsUsed: number
): Promise<WordAndStats> => {
  // Get word details first
  const { rows: wordRows } = await db.query<{ word_id: number; word: string }>(
    `SELECT word_id, word FROM words WHERE word_id = $1`,
    [wordId]
  );

  if (!wordRows[0]) {
    throw new Error("Word not found");
  }

  const word = wordRows[0];

  // Try to update existing stats first
  const { rows: updateRows } = await db.query<{
    stats: {
      total_learned_words: number;
      totalGames: number;
    };
    child_id: number;
  }>(
    `UPDATE spelling_stats 
     SET stats = stats || jsonb_build_object('total_learned_words', stats->>'total_learned_words' + 1, 'totalGames', stats->>'totalGames' + 1)
     WHERE child_id = $1
     RETURNING stats, child_id`,
    [childId]
  );

  // If no rows were updated, insert a new row
  if (updateRows.length === 0) {
    const { rows: insertRows } = await db.query<{
      total_learned_words: number;
      child_id: number;
    }>(
      `INSERT INTO spelling_stats (child_id, total_learned_words)
       VALUES ($1, 1)
       RETURNING total_learned_words, child_id`,
      [childId]
    );

    return {
      word_id: word.word_id,
      word: word.word,
      times_learned: 1,
      child_id: insertRows[0].child_id,
      stats: {
        totalGames: 1,
        total_learned_words: insertRows[0].total_learned_words,
        total_hints_used: 0,
        total_correct_guesses: 0,
        total_incorrect_guesses: 0,
        accuracy: 0,
      },
    };
  }

  return {
    word_id: word.word_id,
    word: word.word,
    times_learned: 1,
    child_id: updateRows[0].child_id,
    stats: {
      totalGames: updateRows[0].stats.totalGames + 1,
      total_learned_words: updateRows[0].stats.total_learned_words,
      total_hints_used: 0,
      total_correct_guesses: 0,
      total_incorrect_guesses: 0,
      accuracy: 0,
    },
  };
};
