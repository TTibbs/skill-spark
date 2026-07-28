import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import {
  archiveFamilyReward,
  approveRewardRedemption,
  insertFamilyReward,
  rejectOrCancelRewardRedemption,
  requestRewardRedemption,
  selectFamilyRewards,
  selectRewardRedemptions,
  updateFamilyReward,
} from "../models/family-rewards-model";
import { getNumericId } from "../utils/request-values";

const getUserId = (req: AuthenticatedRequest) => req.user?.id;

const parseRewardInput = (body: unknown, partial = false) => {
  if (typeof body !== "object" || body === null) return null;
  const input = body as Record<string, unknown>;
  const output: {
    title?: string;
    description?: string | null;
    star_cost?: number;
    image_url?: string | null;
    is_active?: boolean;
  } = {};

  if (typeof input.title === "string" && input.title.trim()) {
    output.title = input.title.trim();
  } else if (!partial) {
    return null;
  }

  if (input.description === null || typeof input.description === "string") {
    output.description =
      typeof input.description === "string" && input.description.trim()
        ? input.description.trim()
        : null;
  }

  if (input.star_cost !== undefined) {
    const starCost = Number(input.star_cost);
    if (!Number.isInteger(starCost) || starCost <= 0) return null;
    output.star_cost = starCost;
  } else if (!partial) {
    return null;
  }

  if (input.image_url === null || typeof input.image_url === "string") {
    output.image_url =
      typeof input.image_url === "string" && input.image_url.trim()
        ? input.image_url.trim()
        : null;
  }

  if (input.is_active !== undefined) {
    if (typeof input.is_active !== "boolean") return null;
    output.is_active = input.is_active;
  }

  return output;
};

export const getFamilyRewards = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).send({ message: "Please log in" });
    const rewards = await selectFamilyRewards(userId);
    res.status(200).send({ rewards });
  } catch (error) {
    next(error);
  }
};

export const createFamilyReward = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).send({ message: "Please log in" });
    const input = parseRewardInput(req.body);
    if (!input?.title || !input.star_cost) {
      return res.status(400).send({ message: "Invalid reward data" });
    }
    const reward = await insertFamilyReward(userId, {
      title: input.title,
      description: input.description,
      star_cost: input.star_cost,
      image_url: input.image_url,
      is_active: input.is_active,
    });
    res.status(201).send({ reward });
  } catch (error) {
    next(error);
  }
};

export const patchFamilyReward = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const rewardId = getNumericId(req.params, "rewardId");
    if (!userId) return res.status(401).send({ message: "Please log in" });
    if (rewardId === undefined) {
      return res.status(400).send({ message: "Invalid reward ID" });
    }
    const input = parseRewardInput(req.body, true);
    if (!input || Object.keys(input).length === 0) {
      return res.status(400).send({ message: "Invalid reward data" });
    }
    const reward = await updateFamilyReward(userId, rewardId, input);
    if (!reward) return res.status(404).send({ message: "Reward not found" });
    res.status(200).send({ reward });
  } catch (error) {
    next(error);
  }
};

export const deleteFamilyReward = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const rewardId = getNumericId(req.params, "rewardId");
    if (!userId) return res.status(401).send({ message: "Please log in" });
    if (rewardId === undefined) {
      return res.status(400).send({ message: "Invalid reward ID" });
    }
    const reward = await archiveFamilyReward(userId, rewardId);
    if (!reward) return res.status(404).send({ message: "Reward not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getRewardRedemptions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const childId = getNumericId(req.params, "childId");
    if (!userId) return res.status(401).send({ message: "Please log in" });
    if (childId === undefined) {
      return res.status(400).send({ message: "Invalid child ID" });
    }
    const redemptions = await selectRewardRedemptions(userId, childId);
    res.status(200).send({ redemptions });
  } catch (error) {
    next(error);
  }
};

export const createRewardRedemption = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const childId = getNumericId(req.params, "childId");
    const rewardIdValue =
      typeof req.body === "object" && req.body !== null
        ? (req.body as { rewardId?: unknown }).rewardId
        : undefined;
    const rewardId = Number(rewardIdValue);
    if (!userId) return res.status(401).send({ message: "Please log in" });
    if (childId === undefined || !Number.isInteger(rewardId) || rewardId <= 0) {
      return res.status(400).send({ message: "Invalid reward request" });
    }
    const result = await requestRewardRedemption(userId, childId, rewardId);
    if (!result) return res.status(404).send({ message: "Reward not found" });
    res.status(201).send(result);
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_STARS") {
      return res.status(400).send({ message: "Not enough stars" });
    }
    next(error);
  }
};

const getReason = (body: unknown) => {
  if (typeof body !== "object" || body === null) return null;
  const reason = (body as { reason?: unknown }).reason;
  if (reason === undefined || reason === null) return null;
  if (typeof reason !== "string" || reason.length > 240) return undefined;
  return reason.trim() || null;
};

export const approveRedemption = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const childId = getNumericId(req.params, "childId");
    const requestId = getNumericId(req.params, "requestId");
    if (!userId) return res.status(401).send({ message: "Please log in" });
    if (childId === undefined || requestId === undefined) {
      return res.status(400).send({ message: "Invalid redemption request" });
    }
    const result = await approveRewardRedemption(userId, childId, requestId);
    if (!result) {
      return res
        .status(409)
        .send({ message: "Reward request cannot be approved" });
    }
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const rejectRedemption = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const childId = getNumericId(req.params, "childId");
    const requestId = getNumericId(req.params, "requestId");
    const reason = getReason(req.body);
    if (!userId) return res.status(401).send({ message: "Please log in" });
    if (childId === undefined || requestId === undefined) {
      return res.status(400).send({ message: "Invalid redemption request" });
    }
    if (reason === undefined) {
      return res.status(400).send({ message: "Reason is too long" });
    }
    const result = await rejectOrCancelRewardRedemption(
      userId,
      childId,
      requestId,
      "rejected",
      reason
    );
    if (!result) {
      return res
        .status(409)
        .send({ message: "Reward request cannot be rejected" });
    }
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const cancelRedemption = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const childId = getNumericId(req.params, "childId");
    const requestId = getNumericId(req.params, "requestId");
    if (!userId) return res.status(401).send({ message: "Please log in" });
    if (childId === undefined || requestId === undefined) {
      return res.status(400).send({ message: "Invalid redemption request" });
    }
    const result = await rejectOrCancelRewardRedemption(
      userId,
      childId,
      requestId,
      "cancelled"
    );
    if (!result) {
      return res
        .status(409)
        .send({ message: "Reward request cannot be cancelled" });
    }
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
