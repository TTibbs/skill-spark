import { NextFunction, Response } from "express";
import {
  selectAchievements,
  selectAchievementById,
  insertAchievement,
  updateAchievementById,
  deleteAchievementById,
} from "../models/achievements-model";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getAchievements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const achievements = await selectAchievements();
    res.status(200).send({ achievements });
  } catch (error) {
    next(error);
  }
};

export const getAchievementById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { achievementId } = req.params;
    const achievement = await selectAchievementById(Number(achievementId));
    res.status(200).send({ achievement });
  } catch (error) {
    next(error);
  }
};

export const createAchievement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newAchievement = req.body;

    if (Object.keys(newAchievement).length === 0) {
      res.status(400).send({ message: "Request body cannot be empty" });
      return;
    }

    // Define expected types for each field
    const expectedTypes = {
      title: "string",
      description: "string",
      criteria: "string",
      required_value: "number",
      xp_reward: "number",
      points_reward: "number",
      category: "string",
      image_url: "string",
      is_special: "boolean",
    };

    // Check for invalid types
    const invalidFields = Object.entries(expectedTypes)
      .filter(([key, expectedType]) => {
        const actualType = typeof newAchievement[key];
        return (
          newAchievement.hasOwnProperty(key) && actualType !== expectedType
        );
      })
      .map(([key]) => key);

    if (invalidFields.length > 0) {
      res.status(400).send({
        message: `Invalid data type for ${invalidFields.join(", ")}`,
      });
      return;
    }

    // Check for missing required fields
    const requiredFields = Object.keys(expectedTypes);
    const missingFields = requiredFields.filter(
      (field) => !newAchievement.hasOwnProperty(field)
    );

    if (missingFields.length > 0) {
      res.status(400).send({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    const createdAchievement = await insertAchievement(newAchievement);
    res.status(201).send({ createdAchievement });
  } catch (error) {
    next(error);
  }
};

export const updateAchievement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { achievementId } = req.params;
    const updatedAchievement = req.body;

    if (Object.keys(updatedAchievement).length === 0) {
      res.status(400).send({ message: "Request body cannot be empty" });
      return;
    }

    const expectedTypes = {
      title: "string",
      description: "string",
      criteria: "string",
      required_value: "number",
      xp_reward: "number",
      points_reward: "number",
      category: "string",
      image_url: "string",
      is_special: "boolean",
    };

    // Only validate types for fields that are actually provided (PATCH allows partial updates)
    const invalidFields = Object.entries(expectedTypes)
      .filter(([key, expectedType]) => {
        const actualType = typeof updatedAchievement[key];
        return (
          updatedAchievement.hasOwnProperty(key) && actualType !== expectedType
        );
      })
      .map(([key]) => key);

    if (invalidFields.length > 0) {
      res.status(400).send({
        message: `Invalid data type for ${invalidFields.join(", ")}`,
      });
      return;
    }

    const achievement = await updateAchievementById(
      Number(achievementId),
      updatedAchievement
    );
    res.status(200).send({ achievement });
  } catch (error) {
    next(error);
  }
};

export const deleteAchievement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { achievementId } = req.params;

    await deleteAchievementById(Number(achievementId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
