import { Router, RequestHandler } from "express";
import {
  getChildProfiles,
  getStats,
  getChoreStats,
  getChoreStatsUpdate,
  getMathStats,
  getMathStatsUpdate,
  getShapeStats,
  getShapeStatsUpdate,
  getMemoryStats,
  getMemoryStatsUpdate,
  getSpellingStats,
  getSpellingStatsUpdate,
  assignChore,
  removeChore,
  submitChore,
  approveChore,
  rejectChore,
  getAssignedChores,
  getLearnedWords,
  getLearnedWord,
  addLearnedWord,
  getDailyChallenges,
  getCompletedAchievements,
  getAchievementDetails,
  getWeeklyProgressReport,
} from "../controllers/children-controller";
import {
  updateChildProfile,
  deleteChildProfile,
} from "../controllers/users-controller";
import {
  approveRedemption,
  cancelRedemption,
  createRewardRedemption,
  getRewardRedemptions,
  rejectRedemption,
} from "../controllers/family-rewards-controller";
import { authenticate, isParent } from "../middlewares/authMiddleware";
import {
  validateAchievementId,
  validateChildId,
  validateChoreId,
  validateWordId,
  validateNumberParam,
} from "../middlewares/validationMiddleware";
import { validateSpellingResult } from "../utils/validation";

const childrenRouter = Router();

childrenRouter.use(authenticate);

// Add number validation for childId parameter to all routes
childrenRouter.use("/:childId", validateNumberParam("childId"));

childrenRouter.get("/", getChildProfiles as RequestHandler);
childrenRouter.patch(
  "/:childId",
  isParent,
  validateChildId(),
  updateChildProfile as RequestHandler
);
childrenRouter.delete(
  "/:childId",
  isParent,
  validateChildId(),
  deleteChildProfile as RequestHandler
);
childrenRouter.get(
  "/:childId/stats",
  isParent,
  validateChildId(),
  getStats as RequestHandler
);
childrenRouter.get(
  "/:childId/stats/chores",
  isParent,
  validateChildId(),
  getChoreStats as RequestHandler
);
childrenRouter.post(
  "/:childId/stats/chores",
  isParent,
  validateChildId(),
  getChoreStatsUpdate as RequestHandler
);
childrenRouter.get(
  "/:childId/stats/math",
  isParent,
  validateChildId(),
  getMathStats as RequestHandler
);
childrenRouter.post(
  "/:childId/stats/math",
  isParent,
  validateChildId(),
  getMathStatsUpdate as RequestHandler
);
childrenRouter.get(
  "/:childId/stats/shapes",
  isParent,
  validateChildId(),
  getShapeStats as RequestHandler
);
childrenRouter.post(
  "/:childId/stats/shapes",
  isParent,
  validateChildId(),
  getShapeStatsUpdate as RequestHandler
);
childrenRouter.get(
  "/:childId/stats/memory",
  isParent,
  validateChildId(),
  getMemoryStats as RequestHandler
);
childrenRouter.post(
  "/:childId/stats/memory",
  isParent,
  validateChildId(),
  getMemoryStatsUpdate as RequestHandler
);
childrenRouter.get(
  "/:childId/stats/spelling",
  isParent,
  validateChildId(),
  getSpellingStats as RequestHandler
);
childrenRouter.post(
  "/:childId/stats/spelling/:wordId",
  isParent,
  validateChildId(),
  validateWordId(),
  validateSpellingResult as RequestHandler,
  getSpellingStatsUpdate as RequestHandler
);
childrenRouter.get(
  "/:childId/chores",
  isParent,
  validateChildId(),
  getAssignedChores as RequestHandler
);
childrenRouter.post(
  "/:childId/chores/assign/:choreId",
  isParent,
  validateChildId(),
  validateChoreId(),
  assignChore as RequestHandler
);
childrenRouter.post(
  "/:childId/chores/:assignmentId/submit",
  isParent,
  validateChildId(),
  submitChore as RequestHandler
);
childrenRouter.post(
  "/:childId/chores/:assignmentId/approve",
  isParent,
  validateChildId(),
  approveChore as RequestHandler
);
childrenRouter.post(
  "/:childId/chores/:assignmentId/reject",
  isParent,
  validateChildId(),
  rejectChore as RequestHandler
);
childrenRouter.delete(
  "/:childId/chores/:assignmentId",
  isParent,
  validateChildId(),
  removeChore as RequestHandler
);
childrenRouter.get(
  "/:childId/reward-redemptions",
  isParent,
  validateChildId(),
  getRewardRedemptions as RequestHandler
);
childrenRouter.post(
  "/:childId/reward-redemptions",
  isParent,
  validateChildId(),
  createRewardRedemption as RequestHandler
);
childrenRouter.post(
  "/:childId/reward-redemptions/:requestId/approve",
  isParent,
  validateChildId(),
  approveRedemption as RequestHandler
);
childrenRouter.post(
  "/:childId/reward-redemptions/:requestId/reject",
  isParent,
  validateChildId(),
  rejectRedemption as RequestHandler
);
childrenRouter.post(
  "/:childId/reward-redemptions/:requestId/cancel",
  isParent,
  validateChildId(),
  cancelRedemption as RequestHandler
);
childrenRouter.get(
  "/:childId/learned-words",
  isParent,
  validateChildId(),
  getLearnedWords as RequestHandler
);
childrenRouter.get(
  "/:childId/learned-words/:wordId",
  isParent,
  validateChildId(),
  validateWordId(),
  getLearnedWord as RequestHandler
);
childrenRouter.post(
  "/:childId/learned-words/:wordId",
  isParent,
  validateChildId(),
  validateWordId(),
  addLearnedWord as RequestHandler
);
childrenRouter.get(
  "/:childId/challenges/daily",
  isParent,
  validateChildId(),
  getDailyChallenges as RequestHandler
);
childrenRouter.get(
  "/:childId/achievements/completed",
  isParent,
  validateChildId(),
  getCompletedAchievements as RequestHandler
);

childrenRouter.get(
  "/:childId/achievements/:achievementId",
  isParent,
  validateChildId(),
  validateAchievementId(),
  getAchievementDetails as RequestHandler
);
childrenRouter.get(
  "/:childId/reports/weekly",
  isParent,
  validateChildId(),
  getWeeklyProgressReport as RequestHandler
);

export default childrenRouter;
