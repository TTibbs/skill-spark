import { Response, NextFunction } from "express";
import {
  selectShapes,
  selectShapeById,
  insertShape,
  updateShapeById,
  deleteShapeById,
} from "../models/shapes-model";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getStringValue } from "../utils/request-values";

export const getShapes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const shapes = await selectShapes();

    res.status(200).send({ shapes });
  } catch (error) {
    next(error);
  }
};

export const getShapeById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const shapeId = getStringValue(req.params, "shapeId");
    if (!shapeId) {
      return res.status(400).send({ message: "Invalid shape ID" });
    }
    const shape = await selectShapeById(shapeId);
    res.status(200).send({ shape });
  } catch (error) {
    next(error);
  }
};

export const createShape = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const addedShape = req.body;
  try {
    if (!Object.keys(addedShape).length) {
      res.status(400).send({ message: "Body can not be empty" });
      return;
    }
    const newShape = await insertShape(addedShape);
    res.status(201).send({ newShape });
  } catch (error) {
    next(error);
  }
};

export const updateShape = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const updatedShape = req.body;
  try {
    const shapeId = getStringValue(req.params, "shapeId");
    if (!shapeId) {
      return res.status(400).send({ message: "Invalid shape ID" });
    }
    if (!Object.keys(updatedShape).length) {
      res.status(400).send({ message: "Body can not be empty" });
      return;
    }
    const shape = await updateShapeById(shapeId, updatedShape);
    res.status(200).send({ shape });
  } catch (error) {
    next(error);
  }
};

export const deleteShape = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const shapeId = getStringValue(req.params, "shapeId");
    if (!shapeId) {
      return res.status(400).send({ message: "Invalid shape ID" });
    }
    await deleteShapeById(shapeId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
