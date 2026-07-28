import { Request, Response, NextFunction } from "express";
import db from "../db/connection";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { getNumericId } from "../utils/request-values";

const JWT_SECRET = process.env.JWT_SECRET;

type AccessTokenPayload = {
  id: number;
  username?: string;
  email?: string;
  is_parent?: boolean;
};

const isAccessTokenPayload = (value: unknown): value is AccessTokenPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return typeof payload.id === "number";
};

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    is_parent: boolean;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).send({ message: "Please log in" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret);

    if (!isAccessTokenPayload(decoded)) {
      res.status(401).send({ message: "Invalid token" });
      return;
    }

    req.user = {
      id: decoded.id,
      username: decoded.username || "",
      email: decoded.email || "",
      is_parent: Boolean(decoded.is_parent),
    };
    next();
  } catch (error) {
    res.status(401).send({ message: "Invalid token" });
  }
};

export const isParent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).send({ message: "Please log in" });
      return;
    }

    const userId = req.user.id;
    const hasTargetUserId = req.params.id !== undefined;
    const hasChildId = req.params.childId !== undefined;
    const targetUserId = getNumericId(req.params, "id") ?? null;
    const childId = getNumericId(req.params, "childId") ?? null;

    if (hasTargetUserId && targetUserId === null) {
      res.status(400).send({ message: "Invalid user ID" });
      return;
    }

    if (hasChildId && childId === null) {
      res.status(400).send({ message: "Invalid child ID" });
      return;
    }

    const { rows } = await db.query<{ is_parent: boolean }>(
      "SELECT is_parent FROM user_profiles WHERE id = $1",
      [userId]
    );

    if (rows.length === 0) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    // For child profile creation (POST requests without childId),
    // check that the user is creating a profile for themselves
    if (req.method === "POST" && !childId) {
      if (targetUserId !== userId) {
        res.status(403).send({
          message: "You are not authorized to access this child's profile",
        });
        return;
      }
      next();
      return;
    }

    // For GET requests to fetch children, allow users to access their own children
    if (req.method === "GET" && !childId) {
      if (targetUserId !== userId) {
        res.status(403).send({
          message: "You are not authorized to access this user's children",
        });
        return;
      }
      next();
      return;
    }

    // For all other operations (POST, PUT, DELETE, etc.), require is_parent to be true
    if (!rows[0].is_parent) {
      res
        .status(403)
        .send({ message: "You need to be a parent to access this resource" });
      return;
    }

    if (!childId) {
      next();
      return;
    }

    const { rows: childRows } = await db.query<{ user_id: number }>(
      "SELECT user_id FROM child_profiles WHERE id = $1",
      [childId]
    );

    if (childRows.length === 0) {
      res.status(404).send({ message: "Child profile not found" });
      return;
    }

    if (childRows[0].user_id !== userId) {
      res.status(403).send({
        message: "You are not authorized to access this child's profile",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error in isParent middleware:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

export const updateUserValidation = [
  body("username").isString().optional(),
  body("email").isEmail().optional(),
  body("profile_image_url").isString().optional(),
];

export const childProfileValidation = [
  body("name").isString().withMessage("Name must be a string"),
];

export const validatePostPremiumReward = [
  body("title").isString().withMessage("Title must be a string"),
  body("description").isString().withMessage("Description must be a string"),
  body("points_required")
    .isInt()
    .withMessage("Points required must be an integer"),
  body("is_active").isBoolean().withMessage("Is active must be a boolean"),
  body("category").isString().withMessage("Category must be a string"),
  body("does_expire").isBoolean().withMessage("Does expire must be a boolean"),
  body("duration_days").isInt().withMessage("Duration days must be an integer"),
];

export const validatePatchPremiumReward = [
  body("title").isString().withMessage("Title must be a string"),
  body("description").isString().withMessage("Description must be a string"),
  body("points_required")
    .isInt()
    .withMessage("Points required must be an integer"),
  body("is_active").isBoolean().withMessage("Is active must be a boolean"),
  body("category").isString().withMessage("Category must be a string"),
  body("does_expire").isBoolean().withMessage("Does expire must be a boolean"),
  body("duration_days").isInt().withMessage("Duration days must be an integer"),
];
