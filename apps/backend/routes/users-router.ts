import { Router, RequestHandler } from "express";
const usersRouter = Router();
import {
  getUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  updateUser,
  deleteUser,
  getUserPreferences,
  updateUserPreferences,
  setCurrentUserPin,
  verifyCurrentUserPin,
  deleteCurrentUserPin,
  getChildrenForUser,
  createChildProfile,
  getChildProfile,
  updateChildProfile,
  deleteChildProfile,
} from "../controllers/users-controller";
import {
  authenticate,
  isParent,
  updateUserValidation,
} from "../middlewares/authMiddleware";
import {
  validateUserId,
  validateChildId,
} from "../middlewares/validationMiddleware";
import { authRateLimit } from "../middlewares/authRateLimit";

usersRouter.use(authenticate);

usersRouter.get("/", getUsers as RequestHandler);
usersRouter.post("/me/pin", authRateLimit, setCurrentUserPin as RequestHandler);
usersRouter.post(
  "/me/pin/verify",
  authRateLimit,
  verifyCurrentUserPin as RequestHandler
);
usersRouter.delete("/me/pin", deleteCurrentUserPin as RequestHandler);
usersRouter.get("/username/:username", getUserByUsername as RequestHandler);
usersRouter.get("/email/:email", getUserByEmail as RequestHandler);
usersRouter.post(
  "/me/children",
  createChildProfile as RequestHandler
);
usersRouter.get("/:id", validateUserId(), getUserById as RequestHandler);
usersRouter.patch(
  "/:id",
  validateUserId(),
  updateUserValidation,
  updateUser as RequestHandler
);
usersRouter.delete("/:id", validateUserId(), deleteUser as RequestHandler);
usersRouter.get(
  "/:id/preferences",
  validateUserId(),
  getUserPreferences as RequestHandler
);
usersRouter.patch(
  "/:id/preferences",
  validateUserId(),
  updateUserPreferences as RequestHandler
);
usersRouter.get(
  "/:id/children",
  validateUserId(),
  isParent,
  getChildrenForUser as RequestHandler
);
usersRouter.post(
  "/:id/children",
  validateUserId(),
  isParent,
  createChildProfile as RequestHandler
);
usersRouter.get(
  "/:id/children/:childId",
  validateUserId(),
  validateChildId(),
  isParent,
  getChildProfile as RequestHandler
);
usersRouter.patch(
  "/:id/children/:childId",
  validateUserId(),
  validateChildId(),
  isParent,
  updateChildProfile as RequestHandler
);
usersRouter.delete(
  "/:id/children/:childId",
  validateUserId(),
  validateChildId(),
  isParent,
  deleteChildProfile as RequestHandler
);

export default usersRouter;
