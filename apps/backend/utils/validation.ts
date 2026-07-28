import { Response, NextFunction } from "express";
import { body } from "express-validator";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const validateSpellingResult = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const { hintsUsed } = req.body || {};

  if (!req.body || hintsUsed === undefined) {
    res.status(400).send({ message: "Missing spelling result data" });
    return;
  }

  if (typeof hintsUsed !== "number") {
    res.status(400).send({ message: "Invalid spelling result data types" });
    return;
  }
  next();
};

export const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const loginValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Must be a valid email address"),
  body()
    .custom((body) => {
      return body.username || body.email;
    })
    .withMessage("Either username or email is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

export const refreshTokenValidation = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required"),
];

export const logoutValidation = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required"),
];

export const updateUserValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters long"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Must be a valid email address"),
  body("profile_img_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Must be a valid URL"),
  body("password")
    .optional()
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];
