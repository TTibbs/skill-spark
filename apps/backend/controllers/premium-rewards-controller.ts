import { Response, NextFunction } from "express";
import {
  selectPremiumRewards,
  createPremiumReward,
  selectPremiumRewardById,
  updatePremiumReward,
  deletePremiumRewardById,
  createChildPremiumPurchase,
  checkChildHasEnoughRewardPoints,
  selectActiveChildProfilePremiumRewards,
  activatePremiumReward,
  selectPurchasedChildProfilePremiumRewards,
} from "../models/premium-rewards-model";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getPremiumRewards = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const premiumRewards = await selectPremiumRewards();
    res.status(200).send(premiumRewards);
  } catch (error) {
    next(error);
  }
};

export const postPremiumReward = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const newReward = req.body;
    if (Object.keys(newReward).length === 0) {
      res.status(400).send({
        message: "No reward data provided",
      });
      return;
    }
    const premiumReward = await createPremiumReward(newReward);
    res.status(201).send(premiumReward);
  } catch (error) {
    next(error);
  }
};

export const getPremiumRewardById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const premiumReward = await selectPremiumRewardById(Number(id));
    res.status(200).send(premiumReward);
  } catch (error) {
    next(error);
  }
};

export const patchPremiumReward = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updatedReward = req.body;
    if (Object.keys(updatedReward).length === 0) {
      res.status(400).send({
        message: "No reward data provided",
      });
      return;
    }
    const premiumReward = await updatePremiumReward(Number(id), updatedReward);
    res.status(200).send(premiumReward);
  } catch (error) {
    next(error);
  }
};

export const deletePremiumReward = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await deletePremiumRewardById(Number(id));
    res.status(204).send({
      message: "Premium reward deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const postChildPremiumPurchase = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, childId } = req.params;

    const hasEnoughPoints = await checkChildHasEnoughRewardPoints(
      Number(id),
      Number(childId)
    );
    if (!hasEnoughPoints) {
      res.status(400).send({
        message: "You do not have enough reward points to purchase this reward",
      });
      return;
    }

    const purchase = await createChildPremiumPurchase(
      Number(id),
      Number(childId)
    );

    res.status(201).send(purchase);
  } catch (error) {
    next(error);
  }
};

export const getActiveChildProfilePremiumRewards = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;

    const activeRewards = await selectActiveChildProfilePremiumRewards(
      Number(childId)
    );

    res.status(200).send(activeRewards);
  } catch (error) {
    next(error);
  }
};

export const getPurchasedChildProfilePremiumRewards = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.params;

    const purchasedRewards = await selectPurchasedChildProfilePremiumRewards(
      Number(childId)
    );

    res.status(200).send(purchasedRewards);
  } catch (error) {
    next(error);
  }
};

export const activateChildPremiumReward = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { purchaseId, childId } = req.params;

    const activatedReward = await activatePremiumReward(
      Number(purchaseId),
      Number(childId)
    );

    res.status(200).send(activatedReward);
  } catch (error) {
    next(error);
  }
};
