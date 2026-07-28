import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import {
  selectChores,
  createNewChore,
  selectChoreById,
  updateChoreById,
  deleteChoreById,
} from "../models/chores-model";
import {
  selectChoreCategory,
  insertChoreCategory,
} from "../models/categories-model";
import { toTitleCase } from "../utils";

export const getChores = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sort_by, order, category } = req.query;
    const userId = req.user?.id;

    const normalizedCategory = category
      ? toTitleCase(category as string)
      : undefined;

    // If a specific category is requested, check if it exists for this user
    if (normalizedCategory && normalizedCategory !== "All") {
      const categoryCheck = await selectChoreCategory(
        normalizedCategory,
        Number(userId)
      );
      if (!categoryCheck) {
        return res.status(404).send({
          message: `No chores found for ${normalizedCategory}. Do you have any chores added?`,
        });
      }
    }

    const chores = await selectChores(
      Number(userId),
      normalizedCategory,
      sort_by as string,
      order as string
    );
    res.status(200).send({ chores });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).send({ message: error.message });
    }
    next(error);
  }
};

export const getChoreById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { choreId } = req.params;
    const chore = await selectChoreById(Number(choreId));

    res.status(200).send(chore);
  } catch (error) {
    next(error);
  }
};

export const createChore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, category, xp, reward_points } = req.body;
    const userId = req.user?.id;

    if (!title || !category || !xp) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    const rewardPoints =
      reward_points === undefined ? 0 : Number(reward_points);

    if (!Number.isInteger(rewardPoints) || rewardPoints < 0) {
      return res
        .status(400)
        .send({ message: "reward_points must be a non-negative integer" });
    }

    const normalizedCategory = toTitleCase(category);

    const choreCategory = await selectChoreCategory(
      normalizedCategory,
      Number(userId)
    );
    if (!choreCategory)
      await insertChoreCategory(normalizedCategory, Number(userId));

    const chore = await createNewChore(
      title,
      description,
      normalizedCategory,
      xp,
      Number(userId),
      rewardPoints
    );
    res.status(201).send({ chore });
  } catch (error: any) {
    if (error.status === 400) {
      return res.status(400).send({ message: error.message });
    }
    next(error);
  }
};

export const updateChore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { choreId } = req.params;
    const { title, description, category, xp } = req.body || {};
    const userId = req.user?.id;

    if (!title && !description && !category && !xp) {
      return res.status(400).send({ message: "Body can not be empty" });
    }
    let normalizedCategory: string | undefined;
    if (category) {
      normalizedCategory = toTitleCase(category);
      const choreCategory = await selectChoreCategory(
        normalizedCategory,
        Number(userId)
      );
      if (!choreCategory)
        await insertChoreCategory(normalizedCategory, Number(userId));
    }
    const chore = await updateChoreById(
      Number(choreId),
      title,
      description,
      normalizedCategory,
      xp
    );
    res.status(200).send({ chore });
  } catch (error) {
    next(error);
  }
};

export const deleteChore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { choreId } = req.params;
    await deleteChoreById(Number(choreId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
