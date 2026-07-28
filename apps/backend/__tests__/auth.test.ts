import request from "supertest";
import app from "../app";
import jwt from "jsonwebtoken";
import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data/index";
import { SeedData } from "../types";
import { getAuthToken } from "../utils";
import { hashToken } from "../utils/tokenSecurity";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

describe("Authentication", () => {
  describe("POST /api/auth/register", () => {
    test("Should successfully register a new user and return authentication tokens", async () => {
      const newUser = {
        username: "newuser123",
        display_name: "New User",
        email: "newuser@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(newUser)
        .expect(201);
      expect(body.status).toBe("success");
      expect(body.data.user).toHaveProperty("id");
      expect(body.data.user.username).toBe(newUser.username);
      expect(body.data.user.display_name).toBe(newUser.display_name);
      expect(body.data.user.email).toBe(newUser.email);
      expect(body.data.user.password).not.toBeDefined();
    });
    test("Should handle additional fields in registration payload", async () => {
      const userWithExtraFields = {
        username: "extrafieldsuser",
        display_name: "Extra Fields User",
        email: "extra@example.com",
        password: "password123",
        extraField1: "should be ignored",
        extraField2: 123,
      };
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(userWithExtraFields)
        .expect(201);
      expect(body.status).toBe("success");
      expect(body.data.user).toHaveProperty("id");
      expect(body.data.user.username).toBe(userWithExtraFields.username);
      expect(body.data.user.display_name).toBe(
        userWithExtraFields.display_name
      );
      expect(body.data.user.email).toBe(userWithExtraFields.email);
      // Extra fields should not be in the response
      expect(body.data.user).not.toHaveProperty("extraField1");
      expect(body.data.user).not.toHaveProperty("extraField2");
    });
    test("Should handle missing email in registration payload", async () => {
      const missingEmail = {
        username: "missingemail",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(missingEmail)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Email is required");
    });
    test("Should reject empty registration payload", async () => {
      const emptyRegistration = {};
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(emptyRegistration)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Username, email, and password are required");
    });
    test("Should reject registration when username already exists in the system", async () => {
      const existingUser = {
        username: "alice123",
        display_name: "Alice",
        email: "new.alice@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(existingUser)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Username is already taken");
    });
    test("Should reject registration when email address is already in use", async () => {
      const existingEmailUser = {
        username: "newalice",
        display_name: "Alice",
        email: "alice@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(existingEmailUser)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Email address is already registered");
    });
    test("Should reject registration when username is not between 3 and 30 characters", async () => {
      const shortUsername = {
        username: "ab",
        display_name: "Short",
        email: "short@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(shortUsername)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Username must be between 3 and 30 characters");
    });
    test("Should reject registration when password is missing", async () => {
      const missingPassword = {
        username: "validuser",
        display_name: "Valid User",
        email: "valid@example.com",
      };
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(missingPassword)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Password is required");
    });
    test("Should reject registration when username is missing", async () => {
      const missingUsername = {
        display_name: "Missing Username",
        email: "missingusername@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(missingUsername)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Username is required");
    });
    test("Should reject registration when password is less than 8 characters", async () => {
      const shortPassword = {
        username: "validuser",
        display_name: "Valid User",
        email: "valid@example.com",
        password: "pass",
      };
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(shortPassword)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Password must be at least 8 characters long");
    });
    test("Should reject registration when email is not a valid email address", async () => {
      const invalidEmail = {
        username: "validuser",
        display_name: "Valid User",
        email: "not-an-email",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/register")
        .send(invalidEmail)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid email format");
    });
  });
  describe("POST /api/auth/add-new-user", () => {
    test("Should successfully add a new user and return authentication tokens", async () => {
      const newUser = {
        username: "newuser123",
        email: "newuser@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/add-new-user")
        .send(newUser)
        .expect(201);
      expect(body.status).toBe("success");
      expect(body.message).toBe("User created successfully");
      expect(body.data.user).toHaveProperty("id");
      expect(body.data.user.username).toBe(newUser.username);
      expect(body.data.user.email).toBe(newUser.email);
      expect(body.data.user.password).not.toBeDefined();
    });
    test("Should handle additional fields in add-new-user payload", async () => {
      const userWithExtraFields = {
        username: "extrafieldsuser",
        email: "extra@example.com",
        password: "password123",
        extraField1: "should be ignored",
        extraField2: 123,
      };
      const response = await request(app)
        .post("/api/auth/add-new-user")
        .send(userWithExtraFields)
        .expect(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user.username).toBe(
        userWithExtraFields.username
      );
      expect(response.body.data.user.email).toBe(userWithExtraFields.email);
      // Extra fields should not be in the response
      expect(response.body.data.user).not.toHaveProperty("extraField1");
      expect(response.body.data.user).not.toHaveProperty("extraField2");
    });
    test("Should handle missing required fields in add-new-user payload", async () => {
      const missingFields = {};
      const { body } = await request(app)
        .post("/api/auth/add-new-user")
        .send(missingFields)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Username, email, and password are required");
    });
    test("Should handle missing email in add-new-user payload", async () => {
      const missingEmail = {
        username: "missingemail",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/add-new-user")
        .send(missingEmail)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Email is required");
    });
    test("Should handle missing password in add-new-user payload", async () => {
      const missingPassword = {
        username: "missingpassword",
        email: "missingpassword@example.com",
      };
      const { body } = await request(app)
        .post("/api/auth/add-new-user")
        .send(missingPassword)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Password is required");
    });
    test("Should handle missing username in add-new-user payload", async () => {
      const missingUsername = {
        email: "missingusername@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/add-new-user")
        .send(missingUsername)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Username is required");
    });
    test("Should handle username that is not between 3 and 30 characters in add-new-user payload", async () => {
      const invalidUsername = {
        username: "ab",
        email: "invalidusername@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/add-new-user")
        .send(invalidUsername)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Username must be between 3 and 30 characters");
    });
    test("Should handle email that is not a valid email address in add-new-user payload", async () => {
      const invalidEmail = {
        username: "validuser",
        email: "not-an-email",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/add-new-user")
        .send(invalidEmail)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid email format");
    });
    test("Should handle password that is less than 8 characters in add-new-user payload", async () => {
      const shortPassword = {
        username: "validuser",
        email: "valid@example.com",
        password: "pass",
      };
      const { body } = await request(app)
        .post("/api/auth/add-new-user")
        .send(shortPassword)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Password must be at least 8 characters long");
    });
    test("Should handle username that is already taken in add-new-user payload", async () => {
      const existingUser = {
        username: "alice123",
        email: "new.alice@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/add-new-user")
        .send(existingUser)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Username is already taken");
    });
    test("Should handle email that is already taken in add-new-user payload", async () => {
      const existingEmailUser = {
        username: "newalice",
        email: "alice@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/add-new-user")
        .send(existingEmailUser)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Email address is already registered");
    });
  });
  describe("POST /api/auth/login", () => {
    test("Should successfully authenticate a user with their username", async () => {
      const loginCredentials = {
        username: "alice123",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/login")
        .send(loginCredentials)
        .expect(200);
      expect(body.status).toBe("success");
      expect(body.data.user).toHaveProperty("id");
      expect(body.data.user.username).toBe(loginCredentials.username);
      expect(body.data.user.password).not.toBeDefined();
      expect(body.data).toHaveProperty("accessToken");
      expect(body.data).toHaveProperty("refreshToken");
    });
    test("Should support web cookie mode without refresh token JSON", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
          refreshTokenMode: "cookie",
        })
        .expect(200);

      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).not.toHaveProperty("refreshToken");
      expect(response.headers["set-cookie"]?.[0]).toContain(
        "skill_spark_refresh_token="
      );
    });
    test("Should reject unknown refresh token response mode", async () => {
      const { body } = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
          refreshTokenMode: "unknown",
        })
        .expect(400);

      expect(body.message).toBe("Invalid refresh token response mode");
    });
    test("Should successfully authenticate a user with their email address", async () => {
      const loginCredentials = {
        email: "bob@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/login")
        .send(loginCredentials)
        .expect(200);
      expect(body.status).toBe("success");
      expect(body.data.user).toHaveProperty("id");
      expect(body.data.user.email).toBe(loginCredentials.email);
      expect(body.data).toHaveProperty("accessToken");
      expect(body.data).toHaveProperty("refreshToken");
    });
    test("Should handle missing required fields in login validation", async () => {
      const emptyLogin = {};
      const { body } = await request(app)
        .post("/api/auth/login")
        .send(emptyLogin)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Missing required fields");
    });
    test("Should reject login attempt when username does not exist", async () => {
      const nonExistentUser = {
        username: "nonexistent",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/login")
        .send(nonExistentUser)
        .expect(401);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid email or password");
    });
    test("Should reject login attempt when email does not exist", async () => {
      const nonExistentEmail = {
        email: "nonexistent@example.com",
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/login")
        .send(nonExistentEmail)
        .expect(401);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid email or password");
    });
    test("Should reject login attempt when password is incorrect", async () => {
      const invalidPassword = {
        username: "alice123",
        password: "wrongpassword",
      };
      const { body } = await request(app)
        .post("/api/auth/login")
        .send(invalidPassword)
        .expect(401);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid email or password");
    });
    test("Should validate required input fields for login", async () => {
      const missingUsername = {
        password: "password123",
      };
      const { body } = await request(app)
        .post("/api/auth/login")
        .send(missingUsername)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Either username or email is required");
    });
    test("Should reject login attempt when password is missing", async () => {
      const missingPassword = {
        username: "alice123",
      };
      const { body } = await request(app)
        .post("/api/auth/login")
        .send(missingPassword)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Password is required");
    });
  });
  describe("POST /api/auth/refresh-token", () => {
    test("Should successfully refresh tokens with a valid refresh token", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
        })
        .expect(200);
      const refreshToken = loginResponse.body.data.refreshToken;
      const refreshData = {
        refreshToken,
      };
      const refreshResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send(refreshData)
        .expect(200);
      expect(refreshResponse.body.status).toBe("success");
      expect(refreshResponse.body.data).toHaveProperty("accessToken");
      expect(refreshResponse.body.data).toHaveProperty("refreshToken");
      expect(refreshResponse.body.data.refreshToken).not.toBe(refreshToken);
      const oldTokenResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send(refreshData)
        .expect(401);
      expect(oldTokenResponse.body.status).toBe("error");
      expect(oldTokenResponse.body.message).toBe(
        "Invalid or expired refresh token"
      );
    });
    test("Should rotate refresh tokens in cookie mode", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
          refreshTokenMode: "cookie",
        })
        .expect(200);
      const cookie = loginResponse.headers["set-cookie"][0];

      const refreshResponse = await request(app)
        .post("/api/auth/refresh-token")
        .set("Cookie", cookie)
        .send({ refreshTokenMode: "cookie" })
        .expect(200);

      expect(refreshResponse.body.data).toHaveProperty("accessToken");
      expect(refreshResponse.body.data).not.toHaveProperty("refreshToken");
      expect(refreshResponse.headers["set-cookie"]?.[0]).toContain(
        "skill_spark_refresh_token="
      );

      await request(app)
        .post("/api/auth/refresh-token")
        .set("Cookie", cookie)
        .send({ refreshTokenMode: "cookie" })
        .expect(401);
    });
    test("Should reject token refresh request when refresh token is invalid", async () => {
      const invalidTokenData = {
        refreshToken: "invalid_refresh_token",
      };
      const { body } = await request(app)
        .post("/api/auth/refresh-token")
        .send(invalidTokenData)
        .expect(401);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid or expired refresh token");
    });
    test("Should reject token refresh request when refresh token is missing", async () => {
      const { body } = await request(app)
        .post("/api/auth/refresh-token")
        .send({})
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Refresh token is required");
    });
    test("Should handle JWT errors during token refresh", async () => {
      const malformedToken = {
        refreshToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzNDU2Nzg5MCwiaWF0IjoxNTE2MjM5MDIyfQ.invalid_signature",
      };
      const { body } = await request(app)
        .post("/api/auth/refresh-token")
        .send(malformedToken)
        .expect(401);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid or expired refresh token");
    });
    test("Should handle corrupt JWT in refresh token flow", async () => {
      const refreshToken = "invalid_refresh_token";
      const corruptToken = refreshToken.substring(0, refreshToken.length - 5);
      const { body } = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: corruptToken })
        .expect(401);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid or expired refresh token");
    });
    test("Should handle missing refresh token in refresh token flow", async () => {
      const { body } = await request(app)
        .post("/api/auth/refresh-token")
        .send({})
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Refresh token is required");
    });
    test("Should handle hours format in refresh token expiry", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
        })
        .expect(200);
      const refreshToken = loginResponse.body.data.refreshToken;
      const refreshData = {
        refreshToken,
      };
      const refreshResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send(refreshData)
        .expect(200);
      expect(refreshResponse.body.status).toBe("success");
      expect(refreshResponse.body.data).toHaveProperty("accessToken");
      expect(refreshResponse.body.data).toHaveProperty("refreshToken");
      expect(refreshResponse.body.data.refreshToken).not.toBe(refreshToken);
      const oldTokenResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send(refreshData)
        .expect(401);
      expect(oldTokenResponse.body.status).toBe("error");
      expect(oldTokenResponse.body.message).toBe(
        "Invalid or expired refresh token"
      );
    });
    test("Should handle minutes format in refresh token expiry", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
        })
        .expect(200);
      const refreshToken = loginResponse.body.data.refreshToken;
      const refreshData = {
        refreshToken,
      };
      const refreshResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send(refreshData)
        .expect(200);
      expect(refreshResponse.body.status).toBe("success");
      expect(refreshResponse.body.data).toHaveProperty("accessToken");
      expect(refreshResponse.body.data).toHaveProperty("refreshToken");
      expect(refreshResponse.body.data.refreshToken).not.toBe(refreshToken);
      const { body } = await request(app)
        .post("/api/auth/refresh-token")
        .send(refreshData)
        .expect(401);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid or expired refresh token");
    });
    test("Should handle seconds format in refresh token expiry", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
        })
        .expect(200);
      const refreshToken = loginResponse.body.data.refreshToken;
      const refreshData = {
        refreshToken,
      };
      const refreshResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send(refreshData)
        .expect(200);
      expect(refreshResponse.body.status).toBe("success");
      expect(refreshResponse.body.data).toHaveProperty("accessToken");
      expect(refreshResponse.body.data).toHaveProperty("refreshToken");
      expect(refreshResponse.body.data.refreshToken).not.toBe(refreshToken);
      const { body } = await request(app)
        .post("/api/auth/refresh-token")
        .send(refreshData)
        .expect(401);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid or expired refresh token");
    });
    test("Should set access token expiry to 1 hour by default", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
        })
        .expect(200);
      const refreshToken = loginResponse.body.data.refreshToken;
      const refreshData = {
        refreshToken,
      };
      const refreshResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send({
          refreshToken: loginResponse.body.data.refreshToken,
        })
        .expect(200);
      expect(refreshResponse.body.status).toBe("success");
      expect(refreshResponse.body.data).toHaveProperty("accessToken");
      const token = refreshResponse.body.data.accessToken;
      const decoded = jwt.decode(token);
      const expectedExpiry = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour in seconds
      const actualExpiry = (decoded as any).exp;
      expect(actualExpiry).toBeGreaterThan(expectedExpiry - 300); // Within 5 minutes of expected
      expect(actualExpiry).toBeLessThan(expectedExpiry + 300);
      const { body } = await request(app)
        .post("/api/auth/refresh-token")
        .send(refreshData)
        .expect(401);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid or expired refresh token");
    });
  });
  describe("POST /api/auth/logout", () => {
    test("Should successfully log out a user with a valid refresh token", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
        })
        .expect(200);
      const {
        body: { data },
      } = loginResponse;
      const {
        body: { message },
        headers,
      } = await request(app)
        .post("/api/auth/logout")
        .send({
          refreshToken: data.refreshToken,
        })
        .expect(200);
      expect(message).toBe("Logged out successfully");
      expect(headers["set-cookie"]?.[0]).toContain(
        "skill_spark_refresh_token="
      );
      // Verify that the refresh token can no longer be used
      const { body } = await request(app)
        .post("/api/auth/refresh-token")
        .send({
          refreshToken: data.refreshToken,
        })
        .expect(401);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Invalid or expired refresh token");
    });
    test("Should validate that refresh token is required for logout", async () => {
      const emptyRequest = {};
      const { body } = await request(app)
        .post("/api/auth/logout")
        .send(emptyRequest)
        .expect(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Refresh token is required");
    });
    test("Should maintain security by accepting non-existent tokens for logout", async () => {
      const nonExistentToken = {
        refreshToken: "completely_invalid_token_that_does_not_exist",
      };
      const { body } = await request(app)
        .post("/api/auth/logout")
        .send(nonExistentToken)
        .expect(200);
      expect(body.message).toBe("Logged out successfully");
    });
  });
  describe("POST /api/auth/password-reset", () => {
    const genericMessage =
      "If your account exists, you will receive a password reset email shortly";

    describe("Request reset (email or username)", () => {
      test("Should return 200 and generic message when valid email is provided", async () => {
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ email: "alice@example.com" })
          .expect(200);
        expect(body.status).toBe("success");
        expect(body.message).toBe(genericMessage);
      });
      test("Should return 200 and generic message when username is provided", async () => {
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ username: "alice123" })
          .expect(200);
        expect(body.status).toBe("success");
        expect(body.message).toBe(genericMessage);
      });
      test("Should return 200 when both username and email are provided", async () => {
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ username: "alice123", email: "alice@example.com" })
          .expect(200);
        expect(body.status).toBe("success");
        expect(body.message).toBe(genericMessage);
      });
      test("Should return 200 with generic message when user does not exist (email)", async () => {
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ email: "nonexistent@example.com" })
          .expect(200);
        expect(body.status).toBe("success");
        expect(body.message).toBe(genericMessage);
      });
      test("Should return 200 with generic message when username does not exist", async () => {
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ username: "nonexistentuser" })
          .expect(200);
        expect(body.status).toBe("success");
        expect(body.message).toBe(genericMessage);
      });
    });

    describe("Complete reset (token + newPassword)", () => {
      test("Should return 200 and success message when valid token and new password are provided", async () => {
        const { rows } = await db.query<{ id: number }>(
          "SELECT id FROM user_profiles WHERE username = $1",
          ["alice123"]
        );
        const userId = rows[0].id;
        const validToken = "valid-reset-token-12345";
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await db.query(
          `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
          [userId, hashToken(validToken), expiresAt]
        );

        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ token: validToken, newPassword: "newpassword123" })
          .expect(200);
        expect(body.status).toBe("success");
        expect(body.message).toBe(
          "Password reset successfully. Please log in with your new password."
        );

        const loginRes = await request(app)
          .post("/api/auth/login")
          .send({ username: "alice123", password: "newpassword123" })
          .expect(200);
        expect(loginRes.body.status).toBe("success");
      });
      test("Should return 400 when token is invalid or expired", async () => {
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ token: "invalid-token", newPassword: "newpassword123" })
          .expect(400);
        expect(body.status).toBe("error");
        expect(body.message).toBe("Invalid or expired reset token");
      });
      test("Should return 400 when new password is too short", async () => {
        const { rows } = await db.query<{ id: number }>(
          "SELECT id FROM user_profiles WHERE username = $1",
          ["alice123"]
        );
        const validToken = "short-pw-token";
        await db.query(
          `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
          [
            rows[0].id,
            hashToken(validToken),
            new Date(Date.now() + 15 * 60 * 1000),
          ]
        );
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ token: validToken, newPassword: "short" })
          .expect(400);
        expect(body.status).toBe("error");
        expect(body.message).toBe(
          "Password must be at least 8 characters long"
        );
      });
      test("Should return 400 when new password is same as current password", async () => {
        const { rows } = await db.query<{ id: number }>(
          "SELECT id FROM user_profiles WHERE username = $1",
          ["alice123"]
        );
        const validToken = "same-pw-token";
        await db.query(
          `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
          [
            rows[0].id,
            hashToken(validToken),
            new Date(Date.now() + 15 * 60 * 1000),
          ]
        );
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ token: validToken, newPassword: "password123" })
          .expect(400);
        expect(body.status).toBe("error");
        expect(body.message).toBe(
          "New password must be different from current password"
        );
      });
    });

    describe("Invalid request body", () => {
      test("Should return 400 when no fields are provided", async () => {
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({})
          .expect(400);
        expect(body.status).toBe("error");
        expect(body.message).toBe("Email or username is required");
      });
      test("Should return 400 when only newPassword is provided (no token)", async () => {
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ newPassword: "password12345" })
          .expect(400);
        expect(body.status).toBe("error");
        expect(body.message).toBe("Token and newPassword are required");
      });
      test("Should return 400 when only token is provided (no newPassword)", async () => {
        const { body } = await request(app)
          .post("/api/auth/password-reset")
          .send({ token: "some-token" })
          .expect(400);
        expect(body.status).toBe("error");
        expect(body.message).toBe("Token and newPassword are required");
      });
    });
  });
});

describe("Session Management", () => {
  let accessToken: string;

  beforeEach(async () => {
    // Login to create initial session
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        username: "alice123",
        password: "password123",
        refreshTokenMode: "explicit",
      })
      .expect(200);

    expect(loginResponse.body.status).toBe("success");
    accessToken = loginResponse.body.data.accessToken;

    // Create additional sessions by logging in multiple times
    for (let i = 1; i < 2; i++) {
      await request(app).post("/api/auth/login").send({
        username: "alice123",
        password: "password123",
        refreshTokenMode: "explicit",
      });
    }
  });

  describe("GET /api/auth/sessions", () => {
    test("Should return all active sessions for authenticated user", async () => {
      const { body } = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(body[0]).toMatchObject({
        id: expect.any(Number),
        created_at: expect.any(String),
        token_id: expect.any(String),
      });
    });
    test("Should return 401 when no access token provided", async () => {
      const { body } = await request(app).get("/api/auth/sessions").expect(401);

      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 when invalid access token provided", async () => {
      const { body } = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);

      expect(body.message).toBe("Invalid token");
    });
  });
  describe("DELETE /api/auth/sessions/:sessionId", () => {
    test("Should successfully revoke a specific session", async () => {
      // First get all sessions
      const { body } = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      const sessionToRevoke = body[0];

      // Then revoke it
      await request(app)
        .delete(`/api/auth/sessions/${sessionToRevoke.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);

      // Verify session is gone
      const updatedSessions = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(updatedSessions.body).not.toContainEqual(
        expect.objectContaining({ id: sessionToRevoke.id })
      );
    });
    test("Should return 400 when trying to revoke session with invalid sessionId", async () => {
      const { body } = await request(app)
        .delete("/api/auth/sessions/invalid")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);
      expect(body.message).toBe("Invalid number format for sessionId");
    });
    test("Should return 401 when trying to revoke session without auth", async () => {
      const { body } = await request(app)
        .delete("/api/auth/sessions/1")
        .expect(401);

      expect(body.message).toBe("Please log in");
    });
    test("Should return 404 when trying to revoke non-existent session", async () => {
      const { body } = await request(app)
        .delete("/api/auth/sessions/999999")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
      expect(body.message).toBe("User session not found");
    });
  });
  describe("POST /api/auth/logout-all", () => {
    test("Should successfully revoke all sessions for user", async () => {
      const aliceToken = await getAuthToken("alice123");
      // First verify we have the seeded session plus the login session.
      const initialSessions = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(initialSessions.body.length).toBeGreaterThanOrEqual(2);

      // Create sessions by using refresh tokens
      const loginResponse1 = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
        })
        .expect(200);

      // Use the refresh token to create a session
      await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: loginResponse1.body.data.refreshToken })
        .expect(200);

      // Create another session
      const loginResponse2 = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
        })
        .expect(200);

      await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: loginResponse2.body.data.refreshToken })
        .expect(200);

      // Check that login and refresh created active server-side sessions.
      const sessionsCheck = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      expect(sessionsCheck.body.length).toBeGreaterThanOrEqual(4);

      // Revoke all sessions
      await request(app)
        .post("/api/auth/logout-all")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(204);

      // Verify all sessions are gone
      const finalSessions = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(finalSessions.body.length).toBe(0);
    });
    test("Should return 401 when trying to logout all without auth", async () => {
      const { body } = await request(app)
        .post("/api/auth/logout-all")
        .expect(401);

      expect(body.message).toBe("Please log in");
    });
    test("Should invalidate all refresh tokens after logout-all", async () => {
      // First get a refresh token
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          username: "alice123",
          password: "password123",
        })
        .expect(200);

      const newRefreshToken = loginResponse.body.data.refreshToken;

      // Logout all
      await request(app)
        .post("/api/auth/logout-all")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);

      const { body } = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: newRefreshToken })
      .expect(401);
      expect(body.message).toBe("Invalid or expired refresh token");
    });
  });
  describe("Session Cleanup", () => {
    test("Should cleanup expired sessions", async () => {
      const daveToken = await getAuthToken("dave123");

      // Get Dave's user ID directly from database
      const { rows } = await db.query<{ id: number }>(
        "SELECT id FROM user_profiles WHERE username = $1",
        ["dave123"]
      );
      const daveId = rows[0].id;

      // Create some old sessions by directly inserting into database
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31); // 31 days old

      // Get initial session count
      await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(200);

      await db.query(
        `INSERT INTO user_sessions (user_id, token_id, expires_at, created_at)
         VALUES ($1, $2, $3, $4)`,
        [daveId, "old_token_1", oldDate, oldDate]
      );

      await db.query(
        `INSERT INTO user_sessions (user_id, token_id, expires_at, created_at)
         VALUES ($1, $2, $3, $4)`,
        [daveId, "old_token_2", oldDate, oldDate]
      );

      const { rows: dbSessionsAfterInsert } = await db.query(
        "SELECT * FROM user_sessions WHERE user_id = $1 ORDER BY created_at ASC",
        [daveId]
      );

      // Run cleanup
      await request(app)
        .post("/api/auth/cleanup-sessions")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(204);

      // Verify old sessions are gone
      const { rows: dbSessionsAfterCleanup } = await db.query(
        "SELECT * FROM user_sessions WHERE user_id = $1 ORDER BY created_at ASC",
        [daveId]
      );
      expect(dbSessionsAfterCleanup.length).toBeLessThan(
        dbSessionsAfterInsert.length
      );
    });
  });
});
