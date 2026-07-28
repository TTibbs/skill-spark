import { Response, NextFunction } from "express";
import db from "../db/connection";
import { AuthenticatedRequest } from "./authMiddleware";

interface IdValidationConfig {
  paramName: string;
  errorMessage?: string;
  validateExistence?: boolean;
  tableName?: string;
  idColumn?: string;
  isString?: boolean;
}

const RESOURCE_NAMES: Record<string, string> = {
  user_profiles: "User account",
  child_profiles: "Child profile",
  chores: "Chore",
  assigned_chores: "Assigned chore",
  words: "Word",
  math_stats: "Math stats",
  spelling_stats: "Spelling stats",
  shape_stats: "Shape stats",
  achievements: "Achievement",
  premium_rewards: "Premium reward",
  premium_reward_purchases: "Purchased reward",
  user_chore_categories: "Chore category",
  chore_completion_history: "Chore completion history",
  learned_words: "Learned word",
  user_sessions: "User session",
  shapes: "Shape",
};

export const validateIds = (configs: IdValidationConfig[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      for (const config of configs) {
        const value = req.params[config.paramName] || req.params.id;

        if (!value) {
          res.status(400).send({
            message: `${config.paramName} is required`,
          });
          return;
        }

        // Always validate that numeric IDs are valid numbers
        if (!config.isString && isNaN(Number(value))) {
          res.status(400).send({
            message: `Invalid number format for ${config.paramName}`,
          });
          return;
        }

        if (config.validateExistence && config.tableName && config.idColumn) {
          try {
            const { rows } = await db.query(
              `SELECT ${config.idColumn} FROM ${config.tableName} WHERE ${config.idColumn} = $1`,
              [value]
            );

            if (rows.length === 0) {
              const resourceName =
                RESOURCE_NAMES[config.tableName] || "Resource";
              res.status(404).send({
                message: `${resourceName} not found`,
              });
              return;
            }
          } catch (error) {
            // If there's a database error (like invalid input syntax), return 400
            res.status(400).send({
              message: `Invalid number format for ${config.paramName}`,
            });
            return;
          }
        }
      }
      next();
    } catch (error) {
      console.error("Error in validateIds middleware:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  };
};

// Helper functions to create common ID validators
export const validateChildId = () =>
  validateIds([
    {
      paramName: "childId",
      validateExistence: true,
      tableName: "child_profiles",
      idColumn: "id",
    },
  ]);

export const validateChoreId = () =>
  validateIds([
    {
      paramName: "choreId",
      validateExistence: true,
      tableName: "chores",
      idColumn: "id",
    },
  ]);

export const validateAssignedChoreId = () =>
  validateIds([
    {
      paramName: "choreId",
      validateExistence: true,
      tableName: "assigned_chores",
      idColumn: "id",
    },
  ]);

export const validateChoreCategoryId = () =>
  validateIds([
    {
      paramName: "id",
      validateExistence: true,
      tableName: "user_chore_categories",
      idColumn: "id",
    },
  ]);

export const validateUserId = () =>
  validateIds([
    {
      paramName: "userId",
      validateExistence: true,
      tableName: "user_profiles",
      idColumn: "id",
    },
  ]);

export const validateWordId = () =>
  validateIds([
    {
      paramName: "wordId",
      validateExistence: true,
      tableName: "words",
      idColumn: "word_id",
      isString: true,
    },
  ]);

export const validateAchievementId = () =>
  validateIds([
    {
      paramName: "achievementId",
      validateExistence: true,
      tableName: "achievements",
      idColumn: "id",
    },
  ]);

export const validatePremiumRewardId = () =>
  validateIds([
    {
      paramName: "id",
      validateExistence: true,
      tableName: "premium_rewards",
      idColumn: "id",
    },
  ]);

export const validatePurchaseId = () =>
  validateIds([
    {
      paramName: "purchaseId",
      validateExistence: true,
      tableName: "premium_reward_purchases",
      idColumn: "id",
    },
  ]);

export const validateUserSessionId = () =>
  validateIds([
    {
      paramName: "sessionId",
      validateExistence: true,
      tableName: "user_sessions",
      idColumn: "id",
    },
  ]);

export const validateShapeId = () =>
  validateIds([
    {
      paramName: "shapeId",
      validateExistence: true,
      tableName: "shapes",
      idColumn: "id",
    },
  ]);

// Simple number validation for parameters
export const validateNumberParam = (paramName: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const value = req.params[paramName];

    if (value && isNaN(Number(value))) {
      res.status(400).send({
        message: `Invalid number format for ${paramName}`,
      });
      return;
    }

    next();
  };
};

// Validate purchase exists and belongs to the specified child
export const validatePurchaseForChild = () => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { purchaseId, childId } = req.params;

      if (!purchaseId) {
        res.status(400).send({
          message: "purchaseId is required",
        });
        return;
      }

      if (!childId) {
        res.status(400).send({
          message: "childId is required",
        });
        return;
      }

      // Validate number format
      if (isNaN(Number(purchaseId))) {
        res.status(400).send({
          message: "Invalid number format for purchaseId",
        });
        return;
      }

      if (isNaN(Number(childId))) {
        res.status(400).send({
          message: "Invalid number format for childId",
        });
        return;
      }

      // Check if purchase exists and belongs to the child
      const { rows } = await db.query(
        `SELECT id FROM premium_reward_purchases 
         WHERE id = $1 AND child_id = $2 AND is_activated = false`,
        [purchaseId, childId]
      );

      if (rows.length === 0) {
        // Check if purchase exists at all
        const { rows: purchaseExists } = await db.query(
          `SELECT id FROM premium_reward_purchases WHERE id = $1`,
          [purchaseId]
        );

        if (purchaseExists.length === 0) {
          res.status(404).send({
            message: "Purchased reward not found",
          });
          return;
        }

        // Purchase exists but either doesn't belong to child or is already activated
        res.status(400).send({
          message: "Purchase not found or already activated",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Error in validatePurchaseForChild middleware:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  };
};
