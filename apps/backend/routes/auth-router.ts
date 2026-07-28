import { Router, RequestHandler } from "express";
import {
  register,
  addNewUser,
  login,
  logout,
  refreshToken,
  passwordReset,
  forgotPassword,
  resetPassword,
  getActiveSessions,
  getSessionToRevoke,
  logoutAllDevices,
  addSession,
  getSessionsToCleanup,
  getCurrentUser,
} from "../controllers/auth-controller";
const authRouter = Router();
import { authenticate } from "../middlewares/authMiddleware";
import { validateUserSessionId } from "../middlewares/validationMiddleware";
import { authRateLimit } from "../middlewares/authRateLimit";

authRouter.post("/register", authRateLimit, register as RequestHandler);
authRouter.post("/add-new-user", addNewUser as RequestHandler);
authRouter.post("/login", authRateLimit, login as RequestHandler);
authRouter.post("/refresh-token", authRateLimit, refreshToken as RequestHandler);
authRouter.post("/logout", logout as RequestHandler);
authRouter.post(
  "/forgot-password",
  authRateLimit,
  forgotPassword as RequestHandler
);
authRouter.post("/reset-password", resetPassword as RequestHandler);
authRouter.post(
  "/password-reset",
  authRateLimit,
  passwordReset as unknown as RequestHandler
);

authRouter.get("/me", authenticate, getCurrentUser as RequestHandler);
authRouter.get("/sessions", authenticate, getActiveSessions as RequestHandler);
authRouter.post("/sessions", authenticate, addSession as RequestHandler);
authRouter.post(
  "/logout-all",
  authenticate,
  logoutAllDevices as RequestHandler
);
authRouter.post(
  "/cleanup-sessions",
  authenticate,
  getSessionsToCleanup as RequestHandler
);
authRouter.delete(
  "/sessions/:sessionId",
  authenticate,
  validateUserSessionId(),
  getSessionToRevoke as RequestHandler
);

export default authRouter;
