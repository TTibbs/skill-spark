import { Response, NextFunction } from "express";
import bcryptjs from "bcryptjs";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import {
  selectUsers,
  selectUserByEmail,
  selectUserById,
  selectUserByUsername,
  updateUserById,
  deleteUserById,
  selectUserPreferences,
  updateUserPreferencesById,
  updateUserPinHashById,
  clearUserPinById,
  selectChildrenForUser,
  insertChildProfile,
  selectChildProfile,
  updateChildProfileById,
  deleteChildProfileById,
} from "../models/users-models";
import {
  sanitizeUser,
  sanitizeUserPreferences,
  sanitizeUsers,
} from "../utils/databaseHelpers";
import { User, ChildProfile } from "../types";
import { getNumericId, getStringValue } from "../utils/request-values";

const normalizeChildInput = (body: unknown, partial = false) => {
  if (typeof body !== "object" || body === null) return null;
  const input = body as Record<string, unknown>;
  const output: Pick<Partial<ChildProfile>, "name" | "age"> = {};

  if (input.name !== undefined) {
    if (typeof input.name !== "string") return null;
    const name = input.name.trim().replace(/\s+/g, " ");
    if (name.length < 1 || name.length > 80) return null;
    output.name = name;
  } else if (!partial) {
    return null;
  }

  if (input.age !== undefined) {
    const age = Number(input.age);
    if (!Number.isInteger(age) || age < 1 || age > 18) return null;
    output.age = age;
  } else if (!partial) {
    return null;
  }

  return output;
};

const getChildInputValidationMessage = (body: unknown, partial = false) => {
  if (typeof body !== "object" || body === null) {
    return "Invalid child profile data";
  }
  const input = body as Record<string, unknown>;
  if (input.name !== undefined && typeof input.name !== "string") {
    return "Name must be a string";
  }
  if (input.name !== undefined && input.name.trim().length === 0) {
    return "Name is required";
  }
  if (!partial && input.name === undefined) {
    return "Name must be a string";
  }
  if (input.age !== undefined) {
    const age = Number(input.age);
    if (!Number.isInteger(age) || age < 1 || age > 18) {
      return "Age must be a positive number";
    }
  }
  if (!partial && input.age === undefined) {
    return "Age must be a positive number";
  }
  return "Invalid child profile data";
};

const resolveChildOwnerId = (
  req: AuthenticatedRequest,
  res: Response
): number | null => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).send({ message: "Please log in" });
    return null;
  }
  const paramUserId = getNumericId(req.params, "id");
  if (paramUserId !== undefined && paramUserId !== userId) {
    res.status(403).send({
      message: "You are not authorized to access this child's profile",
    });
    return null;
  }
  return userId;
};

export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { users, total_users } = await selectUsers();
    if (!users) {
      return res.status(404).send({ message: "No users found" });
    }
    const sanitizedUsers = sanitizeUsers(users);
    res.status(200).send({ users: sanitizedUsers, total_users });
  } catch (err) {
    next(err);
  }
};

export const getUserByUsername = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const username = getStringValue(req.params, "username");
    if (!username) {
      return res.status(400).send({ message: "Username is required" });
    }
    const user = await selectUserByUsername(username);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const sanitizedUser = sanitizeUser(user as User);
    res.status(200).send({ user: sanitizedUser });
  } catch (err) {
    next(err);
  }
};

export const getUserByEmail = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = getStringValue(req.params, "email");
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    const user = await selectUserByEmail(email);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const sanitizedUser = sanitizeUser(user as User);
    res.status(200).send({ user: sanitizedUser });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = getNumericId(req.params, "id");
    if (id === undefined) {
      return res.status(400).send({ message: "Invalid user ID" });
    }
    const user = await selectUserById(id);
    const sanitizedUser = sanitizeUser(user as User);
    res.status(200).send({ user: sanitizedUser });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    username,
    email,
    profile_image_url,
    display_name,
    timezone,
    is_parent,
    user_preferences,
  } = req.body;
  try {
    if (username !== undefined && typeof username !== "string") {
      return res.status(400).send({ message: "Username must be a string" });
    }
    if (email !== undefined && typeof email !== "string") {
      return res.status(400).send({ message: "Email must be a string" });
    }
    if (
      profile_image_url !== undefined &&
      typeof profile_image_url !== "string"
    ) {
      return res
        .status(400)
        .send({ message: "Profile image URL must be a string" });
    }
    if (display_name !== undefined && typeof display_name !== "string") {
      return res.status(400).send({ message: "Display name must be a string" });
    }
    if (timezone !== undefined && typeof timezone !== "string") {
      return res.status(400).send({ message: "Timezone must be a string" });
    }
    if (is_parent !== undefined && typeof is_parent !== "boolean") {
      return res.status(400).send({ message: "Is parent must be a boolean" });
    }
    if (
      user_preferences !== undefined &&
      typeof user_preferences !== "object"
    ) {
      return res
        .status(400)
        .send({ message: "User preferences must be an object" });
    }
    if (
      user_preferences &&
      typeof user_preferences === "object" &&
      "pin_key" in user_preferences
    ) {
      return res.status(400).send({
        message: "Use the dedicated PIN endpoint to update a parent PIN",
      });
    }
    const id = getNumericId(req.params, "id");
    if (id === undefined) {
      return res.status(400).send({ message: "Invalid user ID" });
    }
    const updatedUser = await updateUserById(id, req.body);
    const sanitizedUser = sanitizeUser(updatedUser as User);
    res.status(200).send({ updatedUser: sanitizedUser });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = getNumericId(req.params, "id");
    if (id === undefined) {
      return res.status(400).send({ message: "Invalid user ID" });
    }
    await deleteUserById(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getUserPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = getNumericId(req.params, "id");
    if (id === undefined) {
      return res.status(400).send({ message: "Invalid user ID" });
    }
    const userPreferences = await selectUserPreferences(id);
    if (!userPreferences) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send(sanitizeUserPreferences(userPreferences));
  } catch (err) {
    next(err);
  }
};

export const updateUserPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userPreferences = req.body;
  try {
    const id = getNumericId(req.params, "id");
    if (id === undefined) {
      return res.status(400).send({ message: "Invalid user ID" });
    }
    if (Object.keys(userPreferences).length === 0) {
      return res.status(400).send({ message: "Update body cannot be empty" });
    }
    if ("pin_key" in userPreferences) {
      return res.status(400).send({
        message: "Use the dedicated PIN endpoint to update a parent PIN",
      });
    }
    const updatedUserPreferences = await updateUserPreferencesById(
      id,
      userPreferences
    );
    res.status(200).send({
      user_preferences: sanitizeUserPreferences(updatedUserPreferences),
    });
  } catch (err) {
    next(err);
  }
};

const getAuthenticatedUserId = (
  req: AuthenticatedRequest,
  res: Response
): number | null => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).send({ message: "Please log in" });
    return null;
  }
  return userId;
};

export const setCurrentUserPin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { pin } = req.body as { pin?: unknown };
    if (typeof pin !== "string" || pin.length < 4 || pin.length > 12) {
      return res.status(400).send({
        status: "error",
        message: "PIN must be a string between 4 and 12 characters",
      });
    }

    const pinHash = await bcryptjs.hash(pin, 10);
    const preferences = await updateUserPinHashById(userId, pinHash);

    res.status(200).send({
      status: "success",
      data: {
        user_preferences: sanitizeUserPreferences(preferences),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyCurrentUserPin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { pin } = req.body as { pin?: unknown };
    if (typeof pin !== "string") {
      return res.status(400).send({
        status: "error",
        message: "PIN is required",
      });
    }

    const preferences = await selectUserPreferences(userId);
    const pinHash = preferences?.pin_key;
    const verified = pinHash ? await bcryptjs.compare(pin, pinHash) : false;

    res.status(200).send({
      status: "success",
      data: {
        verified,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCurrentUserPin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const preferences = await clearUserPinById(userId);

    res.status(200).send({
      status: "success",
      data: {
        user_preferences: sanitizeUserPreferences(preferences),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getChildrenForUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = getNumericId(req.params, "id");
    if (id === undefined) {
      return res.status(400).send({ message: "Invalid user ID" });
    }
    const children = await selectChildrenForUser(id);
    if (!children) {
      return { children: [] };
    }
    res.status(200).send({ children });
  } catch (err) {
    next(err);
  }
};

export const createChildProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = resolveChildOwnerId(req, res);
    if (!id) return;
    const input = normalizeChildInput(req.body);
    if (!input?.name || input.age === undefined) {
      return res
        .status(400)
        .send({ message: getChildInputValidationMessage(req.body) });
    }

    const newChildProfile = await insertChildProfile(id, {
      name: input.name,
      age: input.age,
    });
    return res.status(201).send({ newChildProfile });
  } catch (err) {
    next(err);
  }
};

export const getChildProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = getNumericId(req.params, "childId");
    if (childId === undefined) {
      return res.status(400).send({ message: "Invalid child ID" });
    }
    const childProfile = await selectChildProfile(childId);
    if (!childProfile) {
      return res.status(404).send({ message: "Child profile not found" });
    }
    res.status(200).send({ childProfile });
  } catch (err) {
    next(err);
  }
};

export const updateChildProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = resolveChildOwnerId(req, res);
    const childId = getNumericId(req.params, "childId");
    if (!id) return;
    if (childId === undefined) {
      return res.status(400).send({ message: "Invalid child ID" });
    }
    const updates = normalizeChildInput(req.body, true);
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).send({
        message:
          req.body && typeof req.body === "object"
            ? getChildInputValidationMessage(req.body, true)
            : "No valid fields to update",
      });
    }

    const updatedChildProfile = await updateChildProfileById(
      id,
      childId,
      updates
    );
    if (!updatedChildProfile) {
      return res.status(404).send({ message: "Child profile not found" });
    }

    return res.status(200).send({ updatedChildProfile });
  } catch (err) {
    next(err);
  }
};

export const deleteChildProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = resolveChildOwnerId(req, res);
    const childId = getNumericId(req.params, "childId");
    if (!id) return;
    if (childId === undefined) {
      return res.status(400).send({ message: "Invalid child ID" });
    }
    const archivedChild = await deleteChildProfileById(id, childId);
    if (!archivedChild) {
      return res.status(404).send({ message: "Child profile not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
