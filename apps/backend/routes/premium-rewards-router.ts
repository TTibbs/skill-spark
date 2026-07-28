import { Router, RequestHandler } from "express";
import {
  getPremiumRewards,
  postPremiumReward,
  getPremiumRewardById,
  patchPremiumReward,
  deletePremiumReward,
  postChildPremiumPurchase,
  getActiveChildProfilePremiumRewards,
  getPurchasedChildProfilePremiumRewards,
  activateChildPremiumReward,
} from "../controllers/premium-rewards-controller";
import {
  authenticate,
  isParent,
  validatePostPremiumReward,
  validatePatchPremiumReward,
} from "../middlewares/authMiddleware";
import {
  validatePremiumRewardId,
  validateChildId,
  validatePurchaseForChild,
  validateNumberParam,
} from "../middlewares/validationMiddleware";

const premiumRewardsRouter = Router();

premiumRewardsRouter.use(authenticate);

premiumRewardsRouter.get("/", getPremiumRewards as RequestHandler);
premiumRewardsRouter.post(
  "/",
  validatePostPremiumReward,
  postPremiumReward as RequestHandler
);
premiumRewardsRouter.get(
  "/:id",
  validatePremiumRewardId(),
  getPremiumRewardById as RequestHandler
);
premiumRewardsRouter.patch(
  "/:id",
  validatePremiumRewardId(),
  validatePatchPremiumReward,
  patchPremiumReward as RequestHandler
);
premiumRewardsRouter.delete(
  "/:id",
  validatePremiumRewardId(),
  deletePremiumReward as RequestHandler
);
premiumRewardsRouter.post(
  "/:id/purchase/:childId",
  validatePremiumRewardId(),
  validateChildId(),
  isParent,
  postChildPremiumPurchase as RequestHandler
);
premiumRewardsRouter.get(
  "/active/:childId",
  validateChildId(),
  isParent,
  getActiveChildProfilePremiumRewards as RequestHandler
);
premiumRewardsRouter.get(
  "/purchased/:childId",
  validateChildId(),
  isParent,
  getPurchasedChildProfilePremiumRewards as RequestHandler
);
premiumRewardsRouter.post(
  "/activate/:childId/:purchaseId",
  validateNumberParam("childId"),
  validateNumberParam("purchaseId"),
  isParent,
  validatePurchaseForChild(),
  activateChildPremiumReward as RequestHandler
);

export default premiumRewardsRouter;
