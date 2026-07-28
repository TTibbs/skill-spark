import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import {
  selectUserByUsername,
  selectUserByEmail,
  selectUserById,
} from "../models/users-models";
import { User, RegistrationData } from "../types";
import {
  updatePassword,
  insertUser,
  selectActiveSessions,
  selectSessionToRevoke,
  revokeAllUserSessions,
  selectSessionsToCleanup,
  insertSession,
  selectActiveSessionByToken,
  revokeSessionByToken,
  insertResetToken,
  selectResetToken,
  markResetTokenAsUsed,
  deleteExpiredResetTokens,
} from "../models/auth-model";
import {
  findUserForLogin,
  generateTokens,
  sanitizeUser,
} from "../utils/databaseHelpers";
import { sendResetEmail } from "../utils/sendResetEmail";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import {
  REFRESH_TOKEN_COOKIE_NAME,
  generateSecureToken,
  getRefreshTokenExpiryDate,
  getRefreshTokenFromRequest,
  hashToken,
} from "../utils/tokenSecurity";

// Environment variables
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error(
    "JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables"
  );
}

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const INVALID_LOGIN_MESSAGE = "Invalid email or password";
type RefreshTokenMode = "cookie" | "explicit";

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

const sendRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...refreshCookieOptions,
    expires: getRefreshTokenExpiryDate(refreshToken),
  });
};

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, refreshCookieOptions);
};

const issueSessionTokens = async (user: User) => {
  const tokens = generateTokens(user);
  await insertSession(
    Number(user.id),
    hashToken(tokens.refreshToken),
    getRefreshTokenExpiryDate(tokens.refreshToken)
  );
  return tokens;
};

const getRefreshTokenMode = (value: unknown): RefreshTokenMode | null => {
  if (value === undefined) {
    return "explicit";
  }
  if (value === "cookie" || value === "explicit") {
    return value;
  }
  return null;
};

const sendAuthTokens = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  mode: RefreshTokenMode
) => {
  if (mode === "cookie") {
    sendRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  return tokens;
};

// Register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData: RegistrationData = req.body;
    const { username, email, password, display_name } = userData;
    const refreshTokenMode = getRefreshTokenMode(req.body?.refreshTokenMode);

    if (!refreshTokenMode) {
      return res.status(400).send({
        status: "error",
        message: "Invalid refresh token response mode",
      });
    }

    // Validate input
    if (!username && !email && !password) {
      return res.status(400).send({
        status: "error",
        message: "Username, email, and password are required",
      });
    }

    if (!username) {
      return res.status(400).send({
        status: "error",
        message: "Username is required",
      });
    }

    if (!email) {
      return res.status(400).send({
        status: "error",
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).send({
        status: "error",
        message: "Password is required",
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).send({
        status: "error",
        message: "Username must be between 3 and 30 characters",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        status: "error",
        message: "Invalid email format",
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).send({
        status: "error",
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if username exists
    const existingUsername = await selectUserByUsername(username);
    if (existingUsername) {
      return res.status(400).send({
        status: "error",
        message: "Username is already taken",
      });
    }

    // Check if email exists
    const existingEmail = await selectUserByEmail(email);
    if (existingEmail) {
      return res.status(400).send({
        status: "error",
        message: "Email address is already registered",
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcryptjs.hash(password, saltRounds);

    // Create pending user
    const newUser = (await insertUser(
      username,
      display_name,
      email,
      passwordHash
    )) as User;

    // Generate tokens for automatic login
    const tokens = await issueSessionTokens(newUser);
    const tokenResponse = sendAuthTokens(res, tokens, refreshTokenMode);

    // Sanitize user object for response
    const sanitizedUser = sanitizeUser(newUser);

    res.status(201).send({
      status: "success",
      message: "Registration successful! Welcome aboard!",
      data: {
        user: sanitizedUser,
        ...tokenResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addNewUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData: RegistrationData = req.body;
    const { username, email, password, display_name, timezone } = userData;

    // Validate input
    if (!username && !email && !password) {
      return res.status(400).send({
        status: "error",
        message: "Username, email, and password are required",
      });
    }

    if (!username) {
      return res.status(400).send({
        status: "error",
        message: "Username is required",
      });
    }

    if (!email) {
      return res.status(400).send({
        status: "error",
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).send({
        status: "error",
        message: "Password is required",
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).send({
        status: "error",
        message: "Username must be between 3 and 30 characters",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        status: "error",
        message: "Invalid email format",
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).send({
        status: "error",
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if username exists
    const existingUsername = await selectUserByUsername(username);
    if (existingUsername) {
      return res.status(400).send({
        status: "error",
        message: "Username is already taken",
      });
    }

    // Check if email exists
    const existingEmail = await selectUserByEmail(email);
    if (existingEmail) {
      return res.status(400).send({
        status: "error",
        message: "Email address is already registered",
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcryptjs.hash(password, saltRounds);

    // Create new user
    const newUser = (await insertUser(
      username,
      display_name,
      email,
      passwordHash,
      timezone
    )) as User;

    // Sanitize user object for response
    const sanitizedUser = sanitizeUser(newUser as User);

    res.status(201).send({
      status: "success",
      message: "User created successfully",
      data: {
        user: sanitizedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.user?.id;
    const { tokenId } = req.body;

    if (!id) {
      res.status(401).send({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }
    if (typeof tokenId !== "string" || tokenId.length === 0) {
      res.status(400).send({
        status: "error",
        message: "Token ID is required",
      });
      return;
    }

    await insertSession(
      Number(id),
      hashToken(tokenId),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    res.status(201).send({
      status: "success",
      message: "Session created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;
    const refreshTokenMode = getRefreshTokenMode(req.body?.refreshTokenMode);

    if (!refreshTokenMode) {
      return res.status(400).send({
        status: "error",
        message: "Invalid refresh token response mode",
      });
    }

    if (!username && !email && !password) {
      return res.status(400).send({
        status: "error",
        message: "Missing required fields",
      });
    }

    // Password validation
    if (!password) {
      return res.status(400).send({
        status: "error",
        message: "Password is required",
      });
    }

    // Username/email validation - at least one must be provided
    if (!username && !email) {
      return res.status(400).send({
        status: "error",
        message: "Either username or email is required",
      });
    }

    // Find user by username or email using the model function
    const loginResult = await findUserForLogin(username, email);

    // Check if user exists
    if (!loginResult.user) {
      return res.status(401).send({
        status: "error",
        message: INVALID_LOGIN_MESSAGE,
      });
    }

    const user = loginResult.user;

    // Verify password
    const isPasswordValid = await bcryptjs.compare(
      password,
      user.password_hash
    );
    if (!isPasswordValid) {
      return res.status(401).send({
        status: "error",
        message: INVALID_LOGIN_MESSAGE,
      });
    }

    // Generate tokens
    const tokens = await issueSessionTokens(user);
    const tokenResponse = sendAuthTokens(res, tokens, refreshTokenMode);

    // Sanitize user object for response
    const sanitizedUser = sanitizeUser(user);

    res.status(200).send({
      status: "success",
      data: {
        user: sanitizedUser,
        ...tokenResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all active sessions for a user
export const getActiveSessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    const userId = user?.id;

    if (!userId) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }

    const sessions = await selectActiveSessions(userId);

    res.status(200).send(sessions);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).send({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const user = await selectUserById(userId);
    if (!user) {
      res.status(404).send({
        status: "error",
        message: "User account not found",
      });
      return;
    }

    res.status(200).send({
      status: "success",
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Revoke a specific session
export const getSessionToRevoke = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;

    if (!userId) {
      res.status(401).send({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    await selectSessionToRevoke(Number(sessionId), userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Logout from all devices
export const logoutAllDevices = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).send({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    await revokeAllUserSessions(userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Modify the refreshToken function to implement token rotation with limits
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    const refreshTokenMode = getRefreshTokenMode(req.body?.refreshTokenMode);

    if (!refreshTokenMode) {
      return res.status(400).send({
        status: "error",
        message: "Invalid refresh token response mode",
      });
    }

    if (!refreshToken) {
      return res.status(400).send({
        status: "error",
        message: "Refresh token is required",
      });
    }

    // Verify and decode refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      id: number;
    };
    const refreshTokenHash = hashToken(refreshToken);

    // Get user from database
    const user = await selectUserById(decoded.id);
    if (!user) {
      return res.status(401).send({
        status: "error",
        message: "User account not found",
      });
    }

    const activeSession = await selectActiveSessionByToken(refreshTokenHash);
    if (!activeSession || activeSession.user_id !== user.id) {
      return res.status(401).send({
        status: "error",
        message: "Invalid or expired refresh token",
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);
    await revokeSessionByToken(refreshTokenHash);
    await insertSession(
      user.id,
      hashToken(tokens.refreshToken),
      getRefreshTokenExpiryDate(tokens.refreshToken)
    );
    const tokenResponse = sendAuthTokens(res, tokens, refreshTokenMode);

    res.status(200).send({
      status: "success",
      data: tokenResponse,
    });
  } catch (error) {
    return res.status(401).send({
      status: "error",
      message: "Invalid or expired refresh token",
    });
  }
};

// Logout user
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      return res.status(400).send({
        status: "error",
        message: "Refresh token is required",
      });
    }

    try {
      jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      await revokeSessionByToken(hashToken(refreshToken));
    } catch (error) {
      // If token is invalid, we still want to return success
      // This prevents token enumeration attacks
    }

    clearRefreshCookie(res);

    res.status(200).send({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const PASSWORD_RESET_GENERIC_MESSAGE =
  "If your account exists, you will receive a password reset email shortly";

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email } = req.body as {
      username?: unknown;
      email?: unknown;
    };
    const normalizedUsername = typeof username === "string" ? username : undefined;
    const normalizedEmail = typeof email === "string" ? email : undefined;

    if (!normalizedUsername && !normalizedEmail) {
      return res.status(400).send({
        status: "error",
        message: "Email or username is required",
      });
    }

    const loginResult = await findUserForLogin(
      normalizedUsername,
      normalizedEmail
    );

    const user = loginResult.user;
    const userId = user?.id;
    if (!loginResult.error && user && typeof userId === "number") {

      await deleteExpiredResetTokens();

      const resetToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await insertResetToken(userId, hashToken(resetToken), expiresAt);

      if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
        const webUrl = process.env.WEB_URL || "http://localhost:3000";
        console.log(
          `Development password reset URL: ${webUrl}/reset-password?token=${resetToken}`
        );
      }

      const emailResult = await sendResetEmail({
        email: user.email,
        username: user.username,
        resetToken,
      });
      if (!emailResult.success) {
        console.error("Failed to send reset email:", emailResult.error);
      }
    }

    return res.status(200).send({
      status: "success",
      message: PASSWORD_RESET_GENERIC_MESSAGE,
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body as {
      token?: unknown;
      newPassword?: unknown;
    };

    if (typeof token !== "string" || typeof newPassword !== "string") {
      return res.status(400).send({
        status: "error",
        message: "Token and newPassword are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).send({
        status: "error",
        message: "Password must be at least 8 characters long",
      });
    }

    const tokenRecord = await selectResetToken(hashToken(token));
    if (!tokenRecord) {
      return res.status(400).send({
        status: "error",
        message: "Invalid or expired reset token",
      });
    }

    const user = await selectUserById(tokenRecord.user_id);
    if (!user?.id) {
      return res.status(400).send({
        status: "error",
        message: "User account not found",
      });
    }

    const isSamePassword = await bcryptjs.compare(
      newPassword,
      user.password_hash
    );
    if (isSamePassword) {
      return res.status(400).send({
        status: "error",
        message: "New password must be different from current password",
      });
    }

    const passwordHash = await bcryptjs.hash(newPassword, 10);
    const tokenHash = hashToken(token);
    await updatePassword(user.id, passwordHash);
    await markResetTokenAsUsed(tokenHash);
    await revokeAllUserSessions(user.id);
    clearRefreshCookie(res);

    return res.status(200).send({
      status: "success",
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    next(error);
  }
};

/**
 * Legacy endpoint for password reset flow:
 * - Request reset: POST { email? } or { username? }
 * - Complete reset: POST { token, newPassword }
 */
export const passwordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token, newPassword } = req.body as {
    token?: unknown;
    newPassword?: unknown;
  };

  if (token || newPassword) {
    return resetPassword(req, res, next);
  }

  return forgotPassword(req, res, next);
};

export const getSessionsToCleanup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await selectSessionsToCleanup(thirtyDaysAgo);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
