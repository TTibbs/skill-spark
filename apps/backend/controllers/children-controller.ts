import { Response, NextFunction } from "express";
import {
  selectChildProfiles,
  selectStats,
  selectChoreStats,
  updateChoreStats,
  selectMathStats,
  updateMathStats,
  selectShapeStats,
  updateShapeStats,
  selectMemoryStats,
  updateMemoryStats,
  selectSpellingStats,
  updateSpellingStats,
  assignChoreToChild,
  selectAssignedChores,
  selectChoreAssignment,
  submitChoreAssignment,
  approveChoreAssignment,
  rejectChoreAssignment,
  removeChoreAssignment,
  selectLearnedWords,
  selectLearnedWord,
  insertLearnedWord,
  checkDuplicateAssignment,
} from "../models/children-model";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { AchievementService } from "../services/reward-service";
import { Achievement, SpellingStatsData } from "../types";
import {
  calculateMathXP,
  calculateMemoryXP,
  calculateShapeXP,
  calculateWordXP,
} from "../utils/xp";
import { selectChildProfile } from "../models/users-models";
import { selectWordById } from "../models/words-models";
import { getNumericId, getStringValue } from "../utils/request-values";
import {
  completeGameResultSubmission,
  reserveGameResultSubmission,
  GameResultType,
} from "../models/game-results-model";

const MAX_GAME_TIME_SECONDS = 60 * 60 * 3;

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  Number.isFinite(value) &&
  value >= 0;

const isValidTimeSpent = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= MAX_GAME_TIME_SECONDS;

const getSessionId = (body: unknown) => {
  if (typeof body !== "object" || body === null) return null;
  const value = (body as { sessionId?: unknown }).sessionId;
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
};

const normalizeSpellingResult = (body: unknown) => {
  if (typeof body !== "object" || body === null) return null;
  const value = body as Record<string, unknown>;
  const hintsUsed = value.hintsUsed;
  const timeSpent = value.timeSpent;
  const existingCorrect = value.totalCorrectGuesses;
  const existingIncorrect = value.totalIncorrectGuesses;
  const correctAttempts = value.correct_attempts;
  const totalAttempts = value.total_attempts;

  if (
    isNonNegativeInteger(existingCorrect) &&
    isNonNegativeInteger(existingIncorrect) &&
    isNonNegativeInteger(hintsUsed) &&
    (timeSpent === undefined || isValidTimeSpent(timeSpent))
  ) {
    return {
      totalCorrectGuesses: existingCorrect,
      totalIncorrectGuesses: existingIncorrect,
      hintsUsed,
      timeSpent,
    };
  }

  if (
    isNonNegativeInteger(correctAttempts) &&
    isNonNegativeInteger(totalAttempts) &&
    totalAttempts >= correctAttempts &&
    isNonNegativeInteger(hintsUsed) &&
    (timeSpent === undefined || isValidTimeSpent(timeSpent))
  ) {
    return {
      totalCorrectGuesses: correctAttempts,
      totalIncorrectGuesses: totalAttempts - correctAttempts,
      hintsUsed,
      timeSpent,
    };
  }

  return null;
};

const reserveSubmission = async (
  childId: number,
  gameType: GameResultType,
  sessionId: string
) => {
  const submission = await reserveGameResultSubmission(
    childId,
    gameType,
    sessionId
  );

  if (submission.completed_at && submission.response) {
    return {
      isDuplicate: true,
      isInProgress: false,
      response: submission.response,
      id: submission.id,
    };
  }

  return {
    isDuplicate: false,
    isInProgress: !submission.inserted,
    response: null,
    id: submission.id,
  };
};

export const getChildProfiles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const childProfiles = await selectChildProfiles();
    res.status(200).send({ childProfiles });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;
    const childStats = await selectStats(Number(childId));
    res.status(200).send({ childStats });
  } catch (error) {
    next(error);
  }
};

export const getChoreStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;
    const choreStats = await selectChoreStats(Number(childId));
    res.status(200).send({ choreStats });
  } catch (error) {
    next(error);
  }
};

export const getChoreStatsUpdate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;
    const choreResult = req.body;

    // Validate required fields
    if (
      typeof choreResult.completed !== "number" ||
      typeof choreResult.xpEarned !== "number"
    ) {
      return res.status(400).send({
        message:
          "Invalid chore result data - missing required fields or invalid type",
      });
    }

    // Get previous stats BEFORE updating
    const previousStats = await selectStats(Number(childId));

    const updatedChoreStats = await updateChoreStats(
      Number(childId),
      choreResult
    );

    if (!updatedChoreStats) {
      return res.status(500).send({
        message:
          "Failed to update chore stats - no record was created or updated",
      });
    }

    const completedAchievements =
      await AchievementService.checkAndAwardAchievements(
        Number(childId),
        "chores",
        updatedChoreStats.stats,
        previousStats
      );

    // Apply premium reward multipliers
    const { achievementXp } =
      await AchievementService.calculateXpWithMultipliers(
        Number(childId),
        choreResult.xpEarned
      );

    const child = await AchievementService.updateChildProfile(
      Number(childId),
      achievementXp
    );

    res.status(201).send({
      child,
      stats: updatedChoreStats.stats,
      xpEarned: achievementXp,
      message: "Chore stats updated and achievements checked",
      completedAchievements,
    });
  } catch (error) {
    next(error);
  }
};

export const getMathStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;

    const mathStats = await selectMathStats(Number(childId));

    res.status(200).send({ mathStats });
  } catch (error) {
    next(error);
  }
};

export const getMathStatsUpdate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;
    const mathResult = req.body;
    const sessionId = getSessionId(mathResult);

    // Validate required fields
    if (
      !isNonNegativeInteger(mathResult.correct) ||
      !isNonNegativeInteger(mathResult.incorrect) ||
      (mathResult.timeSpent !== undefined &&
        !isValidTimeSpent(mathResult.timeSpent)) ||
      ![
        "addition",
        "subtraction",
        "multiplication",
        "division",
        "counting",
      ].includes(mathResult.type)
    ) {
      return res.status(400).send({
        message:
          "Invalid math result data - missing required fields or invalid type",
      });
    }

    const submission = sessionId
      ? await reserveSubmission(Number(childId), "math", sessionId)
      : null;
    if (submission?.isDuplicate) return res.status(200).send(submission.response);
    if (submission?.isInProgress) {
      return res
        .status(409)
        .send({ message: "Game result submission is already in progress" });
    }

    // Get previous stats BEFORE updating
    const previousStats = await selectStats(Number(childId));

    const updatedMathStats = await updateMathStats(Number(childId), mathResult);

    if (!updatedMathStats) {
      return res.status(500).send({
        message:
          "Failed to update math stats - no record was created or updated",
      });
    }

    const completedAchievements =
      await AchievementService.checkAndAwardAchievements(
        Number(childId),
        "math",
        updatedMathStats,
        previousStats
      );

    const baseXpEarned = calculateMathXP(
      mathResult.correct,
      mathResult.incorrect
    );

    // Apply premium reward multipliers
    const { achievementXp } =
      await AchievementService.calculateXpWithMultipliers(
        Number(childId),
        baseXpEarned
      );

    const child = await AchievementService.updateChildProfile(
      Number(childId),
      achievementXp
    );

    const response = {
      child,
      stats: updatedMathStats.stats,
      xpEarned: achievementXp,
      message: "Math stats updated and achievements checked",
      completedAchievements,
    };

    if (submission) await completeGameResultSubmission(submission.id, response);
    res.status(201).send(response);
  } catch (error) {
    next(error);
  }
};

export const getShapeStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;
    const shapeStats = await selectShapeStats(Number(childId));

    // If no shape stats exist, return a default structure
    if (!shapeStats) {
      const defaultShapeStats = {
        child_id: Number(childId),
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
      return res.status(200).send({ shapeStats: defaultShapeStats });
    }

    res.status(200).send({ shapeStats });
  } catch (error) {
    next(error);
  }
};

export const getShapeStatsUpdate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;
    const shapeResult = req.body;
    const sessionId = getSessionId(shapeResult);

    // Validate required fields
    if (
      !isNonNegativeInteger(shapeResult.correct) ||
      !isNonNegativeInteger(shapeResult.incorrect) ||
      (shapeResult.timeSpent !== undefined &&
        !isValidTimeSpent(shapeResult.timeSpent))
    ) {
      return res.status(400).send({
        message:
          "Invalid shape result data - missing required fields or invalid type",
      });
    }

    const submission = sessionId
      ? await reserveSubmission(Number(childId), "shapes", sessionId)
      : null;
    if (submission?.isDuplicate) return res.status(200).send(submission.response);
    if (submission?.isInProgress) {
      return res
        .status(409)
        .send({ message: "Game result submission is already in progress" });
    }

    // Get previous stats BEFORE updating
    const previousStats = await selectStats(Number(childId));

    const result = await updateShapeStats(Number(childId), shapeResult);

    if (!result) {
      return res.status(404).send({ message: "Shape stats not found" });
    }

    // Check and award achievements
    const completedAchievements =
      await AchievementService.checkAndAwardAchievements(
        Number(childId),
        "shapes",
        result,
        previousStats
      );

    const baseXpEarned = calculateShapeXP(
      shapeResult.correct,
      shapeResult.incorrect,
      shapeResult.timeSpent
    );

    // Apply premium reward multipliers
    const { achievementXp } =
      await AchievementService.calculateXpWithMultipliers(
        Number(childId),
        baseXpEarned
      );

    await AchievementService.updateChildProfile(Number(childId), achievementXp);

    const finalChild = await selectChildProfile(Number(childId));

    const response = {
      child: finalChild,
      stats: result.stats,
      xpEarned: achievementXp,
      message: "Shape stats updated and achievements checked",
      completedAchievements,
    };

    if (submission) {
      await completeGameResultSubmission(submission.id, response);
    }

    res.status(201).send(response);
  } catch (error) {
    next(error);
  }
};

export const getMemoryStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;

    const memoryStats = await selectMemoryStats(Number(childId));

    res.status(200).send({ memoryStats });
  } catch (error) {
    next(error);
  }
};

export const getMemoryStatsUpdate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;
    const memoryResult = req.body;
    const sessionId = getSessionId(memoryResult);

    if (
      !isNonNegativeInteger(memoryResult.totalMoves) ||
      (memoryResult.timeSpent !== undefined &&
        !isValidTimeSpent(memoryResult.timeSpent)) ||
      !["picture", "sound"].includes(memoryResult.type)
    ) {
      return res.status(400).send({
        message:
          "Invalid memory result data - missing required fields or invalid type",
      });
    }

    const submission = sessionId
      ? await reserveSubmission(Number(childId), "memory", sessionId)
      : null;
    if (submission?.isDuplicate) return res.status(200).send(submission.response);
    if (submission?.isInProgress) {
      return res
        .status(409)
        .send({ message: "Game result submission is already in progress" });
    }

    // Get previous stats BEFORE updating
    const previousStats = await selectStats(Number(childId));

    const baseXpEarned = calculateMemoryXP(
      memoryResult.totalMoves,
      memoryResult.timeSpent
    );

    const stats = await updateMemoryStats(Number(childId), memoryResult);

    const completedAchievements =
      await AchievementService.checkAndAwardAchievements(
        Number(childId),
        "memory",
        stats,
        previousStats
      );

    // Apply premium reward multipliers
    const { achievementXp } =
      await AchievementService.calculateXpWithMultipliers(
        Number(childId),
        baseXpEarned
      );

    await AchievementService.updateChildProfile(Number(childId), achievementXp);

    const finalChild = await selectChildProfile(Number(childId));

    const response = {
      child: finalChild,
      stats: stats.stats,
      xpEarned: achievementXp,
      message: "Memory stats updated and achievements checked",
      completedAchievements,
    };

    if (submission) await completeGameResultSubmission(submission.id, response);
    res.status(201).send(response);
  } catch (error) {
    next(error);
  }
};

export const getSpellingStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;

    const spellingStats = await selectSpellingStats(Number(childId));

    res.status(200).send({ spellingStats });
  } catch (error) {
    next(error);
  }
};

export const getSpellingStatsUpdate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = getNumericId(req.params, "childId");
    const wordId = getStringValue(req.params, "wordId");
    if (childId === undefined) {
      return res.status(400).send({ message: "Invalid child ID" });
    }
    if (!wordId) {
      return res.status(400).send({ message: "Invalid word ID" });
    }
    const sessionId = getSessionId(req.body);
    const spellingResult = normalizeSpellingResult(req.body);

    if (!spellingResult) {
      return res
        .status(400)
        .send({ message: "Invalid spelling result data types" });
    }

    const submission = sessionId
      ? await reserveSubmission(childId, "spelling", sessionId)
      : null;
    if (submission?.isDuplicate) return res.status(200).send(submission.response);
    if (submission?.isInProgress) {
      return res
        .status(409)
        .send({ message: "Game result submission is already in progress" });
    }

    // Get previous stats BEFORE updating
    const previousStats = await selectStats(childId);

    const word = await selectWordById(wordId);
    if (!word) {
      return res.status(404).send({ message: "Word not found" });
    }

    const result = await updateSpellingStats(
      childId,
      Number(wordId),
      spellingResult
    );

    const completedAchievements =
      await AchievementService.checkAndAwardAchievements(
        childId,
        "spelling",
        result.stats as SpellingStatsData,
        previousStats
      );

    const baseXpEarned = calculateWordXP(
      word.word,
      spellingResult.hintsUsed,
      spellingResult.totalCorrectGuesses,
      spellingResult.totalIncorrectGuesses
    );

    // Apply premium reward multipliers
    const { achievementXp } =
      await AchievementService.calculateXpWithMultipliers(
        childId,
        baseXpEarned
      );

    await AchievementService.updateChildProfile(Number(childId), achievementXp);

    const finalChild = await selectChildProfile(Number(childId));

    const response = {
      child: finalChild,
      spelling_stats: result.stats,
      xpEarned: achievementXp,
      message: "Spelling stats updated and achievements checked",
      completedAchievements,
    };

    if (submission) await completeGameResultSubmission(submission.id, response);
    res.status(201).send(response);
  } catch (error) {
    next(error);
  }
};

export const assignChore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { choreId, childId } = req.params;

    const existingChore = await checkDuplicateAssignment(
      Number(choreId),
      Number(childId)
    );

    if (existingChore) {
      return res.status(400).send({
        message: "This chore is already assigned to the child",
      });
    }

    const assignment = await assignChoreToChild(
      Number(choreId),
      Number(childId)
    );

    res.status(201).send({ assignment });
  } catch (error) {
    next(error);
  }
};

export const getAssignedChores = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;
    const assignments = await selectAssignedChores(Number(childId));
    res.status(200).send({ assignments });
  } catch (error) {
    next(error);
  }
};

export const submitChore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = getNumericId(req.params, "childId");
    const assignmentId = getNumericId(req.params, "assignmentId");

    if (childId === undefined || assignmentId === undefined) {
      return res.status(400).send({ message: "Invalid assignment ID" });
    }

    const existingAssignment = await selectChoreAssignment(childId, assignmentId);
    if (!existingAssignment) {
      return res.status(404).send({ message: "Assigned chore not found" });
    }

    const assignment = await submitChoreAssignment(childId, assignmentId);
    if (!assignment) {
      return res
        .status(409)
        .send({ message: "This chore cannot be submitted from its current state" });
    }

    res.status(200).send({ assignment });
  } catch (error) {
    next(error);
  }
};

export const approveChore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = getNumericId(req.params, "childId");
    const assignmentId = getNumericId(req.params, "assignmentId");
    const reviewerId = req.user?.id;

    if (childId === undefined || assignmentId === undefined || !reviewerId) {
      return res.status(400).send({ message: "Invalid assignment ID" });
    }

    const existingAssignment = await selectChoreAssignment(childId, assignmentId);
    if (!existingAssignment) {
      return res.status(404).send({ message: "Assigned chore not found" });
    }

    const result = await approveChoreAssignment(
      childId,
      assignmentId,
      reviewerId
    );

    if (!result) {
      return res
        .status(409)
        .send({ message: "This chore cannot be approved from its current state" });
    }

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const rejectChore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = getNumericId(req.params, "childId");
    const assignmentId = getNumericId(req.params, "assignmentId");
    const reviewerId = req.user?.id;
    const reasonValue = req.body?.reason;

    if (childId === undefined || assignmentId === undefined || !reviewerId) {
      return res.status(400).send({ message: "Invalid assignment ID" });
    }

    if (
      reasonValue !== undefined &&
      (typeof reasonValue !== "string" || reasonValue.length > 240)
    ) {
      return res
        .status(400)
        .send({ message: "Rejection reason must be 240 characters or fewer" });
    }

    const existingAssignment = await selectChoreAssignment(childId, assignmentId);
    if (!existingAssignment) {
      return res.status(404).send({ message: "Assigned chore not found" });
    }

    const assignment = await rejectChoreAssignment(
      childId,
      assignmentId,
      reviewerId,
      typeof reasonValue === "string" && reasonValue.trim()
        ? reasonValue.trim()
        : null
    );

    if (!assignment) {
      return res
        .status(409)
        .send({ message: "This chore cannot be rejected from its current state" });
    }

    res.status(200).send({ assignment });
  } catch (error) {
    next(error);
  }
};

export const removeChore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = getNumericId(req.params, "childId");
    const assignmentId = getNumericId(req.params, "assignmentId");

    if (childId === undefined || assignmentId === undefined) {
      return res.status(400).send({ message: "Invalid assignment ID" });
    }

    const existingAssignment = await selectChoreAssignment(childId, assignmentId);
    if (!existingAssignment) {
      return res.status(404).send({ message: "Assigned chore not found" });
    }

    if (
      existingAssignment.status === "submitted" ||
      existingAssignment.status === "approved"
    ) {
      return res
        .status(409)
        .send({ message: "This chore cannot be removed from its current state" });
    }

    const assignment = await removeChoreAssignment(childId, assignmentId);
    if (!assignment) {
      return res.status(404).send({ message: "Assigned chore not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getLearnedWords = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;
    const learnedWords = await selectLearnedWords(Number(childId));
    res.status(200).send({ learnedWords });
  } catch (err) {
    next(err);
  }
};

export const getLearnedWord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId, wordId } = req.params;
    const learnedWord = await selectLearnedWord(
      Number(childId),
      Number(wordId)
    );
    res.status(200).send({ learnedWord });
  } catch (err) {
    next(err);
  }
};

export const addLearnedWord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId, wordId } = req.params;

    const learnedWord = await insertLearnedWord(
      Number(wordId),
      Number(childId)
    );

    res.status(201).send({ learnedWord });
  } catch (err) {
    next(err);
  }
};

export const getCompletedAchievements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { childId } = req.params;
    const completedAchievements =
      await AchievementService.getCompletedAchievements(Number(childId));
    res.status(200).send(completedAchievements);
  } catch (error) {
    next(error);
  }
};

export const getAchievementDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { childId, achievementId } = req.params;

    const achievementProgress =
      await AchievementService.getSingleChildAchievementProgress(
        Number(childId),
        Number(achievementId)
      );

    res.status(200).send({ achievement: achievementProgress });
  } catch (error) {
    next(error);
  }
};

export const getDailyChallenges = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { childId } = req.params;

    const achievements = await AchievementService.getChildAchievements(
      Number(childId)
    );

    res.status(200).send({
      dailyChallenges: achievements,
      totalChallenges: achievements.length,
      completedToday: achievements.filter((a: Achievement) => a.is_achieved)
        .length,
    });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyProgressReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { childId } = req.params;

    const achievements = await AchievementService.getChildAchievements(
      Number(childId)
    );

    const report = {
      totalWeeklyGoals: achievements.length,
      completed: achievements.filter((a: Achievement) => a.is_achieved).length,
      inProgress: achievements.filter((a: Achievement) => !a.is_achieved)
        .length,
      notStarted: 0,
      achievements: achievements,
    };

    res.status(200).send({ weeklyReport: report });
  } catch (error) {
    next(error);
  }
};
