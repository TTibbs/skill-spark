import { Router, RequestHandler } from "express";
import {
  createFamilyReward,
  deleteFamilyReward,
  getFamilyRewards,
  patchFamilyReward,
} from "../controllers/family-rewards-controller";
import { authenticate } from "../middlewares/authMiddleware";
import { validateNumberParam } from "../middlewares/validationMiddleware";

const familyRewardsRouter = Router();

familyRewardsRouter.use(authenticate);

familyRewardsRouter.get("/", getFamilyRewards as RequestHandler);
familyRewardsRouter.post("/", createFamilyReward as RequestHandler);
familyRewardsRouter.patch(
  "/:rewardId",
  validateNumberParam("rewardId"),
  patchFamilyReward as RequestHandler
);
familyRewardsRouter.delete(
  "/:rewardId",
  validateNumberParam("rewardId"),
  deleteFamilyReward as RequestHandler
);

export default familyRewardsRouter;
