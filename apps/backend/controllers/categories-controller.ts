import { Response, NextFunction } from "express";
import {
  selectWordCategories,
  selectWordCategory,
  insertWordCategory,
  selectChoreCategories,
  selectChoreCategory,
  insertChoreCategory,
  updateChoreCategory,
  removeChoreCategory,
} from "../models/categories-model";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getStringValue } from "../utils/request-values";
import { toTitleCase } from "../utils";

export const getWordCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const wordCategories = await selectWordCategories();
    res.status(200).send({ wordCategories });
  } catch (error) {
    next(error);
  }
};

export const getWordCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const name = getStringValue(req.params, "name");
    if (!name) {
      return res.status(400).send({ message: "Category name is required" });
    }
    const wordCategory = await selectWordCategory(name);
    if (!wordCategory) {
      return res.status(404).send({ message: "Word category not found" });
    }
    res.status(200).send({ wordCategory });
  } catch (error) {
    next(error);
  }
};

export const createWordCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ message: "Missing word category data" });
    }
    const existingCategory = await selectWordCategory(name);
    if (existingCategory) {
      return res.status(400).send({ message: "Word category already exists" });
    }
    const newWordCategory = await insertWordCategory(name);
    res.status(201).send({ wordCategory: newWordCategory });
  } catch (error) {
    next(error);
  }
};

export const getChoreCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const choreCategories = await selectChoreCategories(Number(userId));
    res.status(200).send({ choreCategories });
  } catch (error) {
    next(error);
  }
};

export const getChoreCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const name = getStringValue(req.params, "name");
    const userId = req.user?.id;
    if (!name) {
      return res.status(400).send({ message: "Category name is required" });
    }
    const normalisedName = toTitleCase(name);

    const choreCategory = await selectChoreCategory(
      normalisedName,
      Number(userId)
    );
    if (!choreCategory) {
      return res.status(404).send({ message: "Chore category not found" });
    }
    res.status(200).send({ choreCategory });
  } catch (error) {
    next(error);
  }
};

export const createChoreCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .send({ message: "Chore category name cannot be empty" });
    }

    if (!name) {
      return res.status(400).send({ message: "Missing chore category data" });
    }
    const normalisedName = toTitleCase(name);
    const existingCategory = await selectChoreCategory(
      normalisedName,
      Number(userId)
    );
    if (existingCategory) {
      return res.status(400).send({ message: "Chore category already exists" });
    }
    const newChoreCategory = await insertChoreCategory(
      normalisedName,
      Number(userId)
    );
    res.status(201).send({ newChoreCategory });
  } catch (error) {
    next(error);
  }
};

export const patchChoreCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user?.id;

    if (!name) {
      return res.status(400).send({ message: "Missing chore category data" });
    }

    const existingCategory = await selectChoreCategory(
      toTitleCase(name),
      Number(userId)
    );
    if (existingCategory) {
      return res.status(400).send({ message: "Chore category already exists" });
    }

    const updatedChoreCategory = await updateChoreCategory(
      Number(id),
      toTitleCase(name),
      Number(userId)
    );

    if (!updatedChoreCategory) {
      return res.status(404).send({ message: "Chore category not found" });
    }

    res.status(200).send({ updatedChoreCategory });
  } catch (error) {
    next(error);
  }
};

export const deleteChoreCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const deletedChoreCategory = await removeChoreCategory(
      Number(id),
      Number(userId)
    );
    res.status(200).send({ deletedChoreCategory });
  } catch (error) {
    next(error);
  }
};
