import { User, LoginResult } from "../types";
import db from "../db/connection";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../app";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test-refresh-secret-key";

export const sanitizeUserPreferences = (
  userPreferences: User["user_preferences"] | null
) => {
  if (!userPreferences) {
    return userPreferences;
  }

  return {
    notificationsEnabled: userPreferences.notificationsEnabled,
    theme: userPreferences.theme,
    language: userPreferences.language,
    has_pin: Boolean(userPreferences.pin_key),
  };
};

export const sanitizeUser = (user: User) => {
  if (!user) return user;

  const { password_hash, user_preferences, ...sanitizedUser } = user;
  return {
    ...sanitizedUser,
    user_preferences: sanitizeUserPreferences(user_preferences),
  };
};

// Helper function to sanitize an array of users
export const sanitizeUsers = (users: User[]) => {
  return users.map((user) => sanitizeUser(user));
};

export const TEST_USERS: Record<string, User> = {
  alice123: {
    id: 1,
    username: "alice123",
    display_name: "Alice",
    email: "alice@example.com",
    password_hash: "password123",
    is_parent: true,
    timezone: "Europe/London",
    user_preferences: {
      notificationsEnabled: true,
      theme: "light",
      language: "en",
      pin_key: "$2b$10$9g6OekWGPb4MgxjlszpN9uQReFcE4g2.t02AABxAFOW1JLA0tzEPu",
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  bob123: {
    id: 2,
    username: "bob123",
    display_name: "Bob",
    email: "bob@example.com",
    password_hash: "password123",
    is_parent: true,
    timezone: "Europe/London",
    user_preferences: {
      notificationsEnabled: true,
      theme: "light",
      language: "en",
      pin_key: "$2b$10$9g6OekWGPb4MgxjlszpN9uQReFcE4g2.t02AABxAFOW1JLA0tzEPu",
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  charlie123: {
    id: 3,
    username: "charlie123",
    display_name: "Charlie",
    email: "charlie@example.com",
    password_hash: "password123",
    is_parent: true,
    timezone: "America/New_York",
    user_preferences: {
      notificationsEnabled: true,
      theme: "light",
      language: "en",
      pin_key: "$2b$10$9g6OekWGPb4MgxjlszpN9uQReFcE4g2.t02AABxAFOW1JLA0tzEPu",
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  dave123: {
    id: 4,
    username: "dave123",
    display_name: "Dave",
    email: "dave@example.com",
    password_hash: "password123",
    is_parent: false,
    timezone: "America/New_York",
    user_preferences: {
      notificationsEnabled: true,
      theme: "light",
      language: "en",
      pin_key: "$2b$10$9g6OekWGPb4MgxjlszpN9uQReFcE4g2.t02AABxAFOW1JLA0tzEPu",
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  testuser1234: {
    id: 5,
    username: "testuser1234",
    display_name: "Test User",
    email: "testuser1234@test.com",
    password_hash: "testpassword1234",
    is_parent: false,
    timezone: "America/New_York",
    user_preferences: {
      notificationsEnabled: true,
      theme: "light",
      language: "en",
      pin_key: "$2b$10$9g6OekWGPb4MgxjlszpN9uQReFcE4g2.t02AABxAFOW1JLA0tzEPu",
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
};

export function generateTestToken(
  id: number,
  username: string,
  email: string
): string {
  const payload = {
    id,
    username,
    email,
  };

  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: "1h" });
}

export async function getAuthToken(
  username: string = "alice123"
): Promise<string> {
  const user = TEST_USERS[username as keyof typeof TEST_USERS];

  if (!user) {
    console.error(`Test user ${username} not defined in TEST_USERS map`);
    return generateTestToken(1, "unknown", "unknown@example.com");
  }

  try {
    const loginCredentials = {
      username,
      password: "password123",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(loginCredentials);

    if (response.body?.data?.accessToken) {
      return response.body.data.accessToken;
    }

    return generateTestToken(user.id!, user.username, user.email);
  } catch (error) {
    console.error("Error generating test token:", error);
    throw error;
  }
}

export const generateTokens = (user: User) => {
  const accessTokenExpiry = String(process.env.ACCESS_TOKEN_EXPIRY || "1h");
  const refreshTokenExpiry = String(process.env.REFRESH_TOKEN_EXPIRY || "7d");
  const tokenIdentity = {
    id: user.id,
    username: user.username,
    email: user.email,
    is_parent: user.is_parent,
  };
  const accessOptions: jwt.SignOptions = {
    expiresIn: accessTokenExpiry as jwt.SignOptions["expiresIn"],
  };
  const refreshOptions: jwt.SignOptions = {
    expiresIn: refreshTokenExpiry as jwt.SignOptions["expiresIn"],
  };

  const accessToken = jwt.sign(
    {
      ...tokenIdentity,
      jti: crypto.randomBytes(16).toString("hex"),
    },
    JWT_SECRET,
    accessOptions
  );

  const refreshToken = jwt.sign(
    { ...tokenIdentity, jti: crypto.randomBytes(16).toString("hex") },
    JWT_REFRESH_SECRET,
    refreshOptions
  );

  return { accessToken, refreshToken };
};

export const findUserForLogin = async (
  username?: string,
  email?: string
): Promise<LoginResult> => {
  // If neither username nor email provided
  if (!username && !email) {
    return {
      user: null,
      error: {
        type: "missing_fields",
        status: 400,
        message: "Missing required fields",
        errors: [
          { message: "Username or email is required" },
          { message: "Password is required" },
        ],
      },
    };
  }

  // If both username and email are provided
  if (username && email) {
    const userByUsername = await db.query<User>(
      "SELECT * FROM user_profiles WHERE username = $1",
      [username]
    );
    const userByEmail = await db.query<User>(
      "SELECT * FROM user_profiles WHERE email = $1",
      [email]
    );
    if (!userByUsername.rows[0] && !userByEmail.rows[0]) {
      return {
        user: null,
        error: {
          type: "auth_error",
          status: 401,
          message: "User not found",
        },
      };
    }
    return { user: userByUsername.rows[0] || userByEmail.rows[0] };
  }

  // Try username if provided
  if (username) {
    const { rows } = await db.query<User>(
      "SELECT * FROM user_profiles WHERE username = $1",
      [username]
    );
    if (rows[0]) {
      return { user: rows[0] };
    }
    return {
      user: null,
      error: {
        type: "auth_error",
        status: 401,
        message: "Username not found",
      },
    };
  }

  // Try email (we know email is provided due to earlier checks)
  const { rows } = await db.query<User>(
    "SELECT * FROM user_profiles WHERE email = $1",
    [email as string]
  );
  if (rows[0]) {
    return { user: rows[0] };
  }
  return {
    user: null,
    error: {
      type: "auth_error",
      status: 401,
      message: "Email not found",
    },
  };
};

export const increaseChildRewardPoints = async (
  points: number,
  childId: number
): Promise<void> => {
  await db.query(
    "UPDATE child_profiles SET reward_points = reward_points + $1 WHERE id = $2",
    [points, childId]
  );
};

export const toTitleCase = (str: string): string => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const checkLastUpdated = async (childId: number) => {
  const { rows } = await db.query<{ updated_at: string }>(
    "SELECT updated_at FROM chore_stats WHERE child_id = $1",
    [childId]
  );
  return rows[0]?.updated_at || null;
};
