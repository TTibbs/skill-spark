import { Response, NextFunction } from "express";
import {
  selectWords,
  selectWordsCount,
  insertWord,
  selectWordById,
  updateWordById,
  deleteWordById,
} from "../models/words-models";
import {
  selectWordCategory,
  insertWordCategory,
} from "../models/categories-model";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getStringValue } from "../utils/request-values";
import { toTitleCase } from "../utils";

export const getWords = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = getStringValue(req.query, "limit");
    const page = getStringValue(req.query, "page");
    const category = getStringValue(req.query, "category");

    // Convert string query params to numbers, with validation
    const parsedLimit = limit ? Math.max(1, Math.min(100, Number(limit))) : 10;
    const parsedPage = page ? Math.max(1, Number(page)) : 1;

    const words = await selectWords(parsedLimit, parsedPage, category);
    const total = await selectWordsCount(category);

    // Calculate if there are more pages
    const hasMore = parsedPage * parsedLimit < total;

    res.status(200).send({
      words,
      total,
      page: parsedPage,
      limit: parsedLimit,
      hasMore,
    });
  } catch (err) {
    next(err);
  }
};

export const createWord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { word, category, image } = req.body;
    if (!word || !category || !image) {
      return res.status(400).send({ message: "Missing word data" });
    }
    const normalizedCategory = toTitleCase(category);
    const wordCategory = await selectWordCategory(normalizedCategory);
    if (!wordCategory) await insertWordCategory(normalizedCategory);
    const newWord = await insertWord(word, normalizedCategory, image);
    res.status(201).send({ word: newWord });
  } catch (err) {
    next(err);
  }
};

export const getWordById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const wordId = getStringValue(req.params, "wordId");
    if (!wordId) {
      return res.status(400).send({ message: "Invalid word ID" });
    }

    const word = await selectWordById(wordId);
    if (!word) {
      return res.status(404).send({ message: "Word not found" });
    }
    res.status(200).send({ word });
  } catch (err) {
    next(err);
  }
};

export const updateWord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const wordId = getStringValue(req.params, "wordId");
    if (!wordId) {
      return res.status(400).send({ message: "Invalid word ID" });
    }
    const { word, category, image } = req.body || {};
    if (!word && !category && !image) {
      return res.status(400).send({ message: "Body can not be empty" });
    }

    // Only process category if it's provided
    let normalizedCategory: string | undefined;
    if (category) {
      normalizedCategory = toTitleCase(category);
      const wordCategory = await selectWordCategory(normalizedCategory);
      if (!wordCategory) await insertWordCategory(normalizedCategory);
    }

    const updatedWord = await updateWordById(
      wordId,
      word,
      normalizedCategory,
      image
    );
    res.status(200).send({ word: updatedWord });
  } catch (err) {
    next(err);
  }
};

export const deleteWord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const wordId = getStringValue(req.params, "wordId");
    if (!wordId) {
      return res.status(400).send({ message: "Invalid word ID" });
    }
    await deleteWordById(wordId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
