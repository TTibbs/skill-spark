import { Router, RequestHandler } from "express";
import {
  getAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "../controllers/achievements-controller";
import { authenticate } from "../middlewares/authMiddleware";
import { validateAchievementId } from "../middlewares/validationMiddleware";

const achievementsRouter = Router();

achievementsRouter.use(authenticate);

achievementsRouter.get("/", getAchievements as RequestHandler);
achievementsRouter.post("/", createAchievement as RequestHandler);
achievementsRouter.get(
  "/:achievementId",
  validateAchievementId(),
  getAchievementById as RequestHandler
);
achievementsRouter.patch(
  "/:achievementId",
  validateAchievementId(),
  updateAchievement as RequestHandler
);
achievementsRouter.delete(
  "/:achievementId",
  validateAchievementId(),
  deleteAchievement as RequestHandler
);

export default achievementsRouter;
