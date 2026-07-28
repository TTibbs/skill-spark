import app from "../app";
import request from "supertest";
import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data/index";
import { ChildProfile, SeedData, User } from "../types";
import { getAuthToken } from "../utils";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

describe("Users API Endpoints", () => {
  describe("GET /api/users", () => {
    test("Should successfully retrieve a list of all users", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { users },
      } = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      users.forEach((user: User) => {
        expect(user).toHaveProperty("id", expect.any(Number));
        expect(user).toHaveProperty("username", expect.any(String));
        expect(user).toHaveProperty("display_name", expect.any(String));
        expect(user).toHaveProperty("email", expect.any(String));
        expect(user).toHaveProperty("profile_image_url", expect.any(String));
        expect(user).toHaveProperty("is_parent", expect.any(Boolean));
        expect(user).toHaveProperty("created_at", expect.any(String));
        expect(user).toHaveProperty("updated_at", expect.any(String));
        expect(user).toHaveProperty("timezone", expect.any(String));
        expect(user).toHaveProperty("total_children", expect.any(Number));
      });
    });
    test("Should return the total number of users", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(body).toHaveProperty("total_users", expect.any(Number));
    });
  });
  describe("GET /api/users/username/:username", () => {
    test("Should successfully retrieve a user when provided a valid username", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { user },
      } = await request(app)
        .get("/api/users/username/alice123")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(user).toMatchObject({
        id: expect.any(Number),
        username: "alice123",
        display_name: "Alice",
        email: "alice@example.com",
        profile_image_url: expect.any(String),
        is_parent: expect.any(Boolean),
        total_children: expect.any(Number),
        timezone: expect.any(String),
        user_preferences: expect.any(Object),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app)
        .get("/api/users/username/alice123")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .get("/api/users/username/alice123")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 when username does not exist", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/username/nonexistent")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("User not found");
    });
  });
  describe("GET /api/users/email/:email", () => {
    test("Should successfully retrieve a user when provided a valid email address", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { user },
      } = await request(app)
        .get("/api/users/email/alice@example.com")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(user).toMatchObject({
        id: expect.any(Number),
        username: "alice123",
        display_name: "Alice",
        email: "alice@example.com",
        profile_image_url: expect.any(String),
        is_parent: expect.any(Boolean),
        total_children: expect.any(Number),
        timezone: expect.any(String),
        user_preferences: expect.any(Object),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app)
        .get("/api/users/email/alice@example.com")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .get("/api/users/email/alice@example.com")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 when email address does not exist", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/email/nonexistent@example.com")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("User not found");
    });
  });
  describe("GET /api/users/:id", () => {
    test("Should successfully retrieve a user when provided a valid ID", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { user },
      } = await request(app)
        .get("/api/users/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(user).toMatchObject({
        id: expect.any(Number),
        username: "alice123",
        display_name: "Alice",
        email: "alice@example.com",
        profile_image_url: expect.any(String),
        is_parent: expect.any(Boolean),
        total_children: expect.any(Number),
        timezone: expect.any(String),
        user_preferences: expect.any(Object),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
    test("Should return 400 when user ID is not a number", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/notanumber")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for userId");
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app).get("/api/users/1").expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .get("/api/users/1")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 when user ID does not exist", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/9999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("User account not found");
    });
  });
  describe("PATCH /api/users/:id", () => {
    test("Should successfully update a user with all fields", async () => {
      const userUpdate = {
        username: "updated_alice",
        email: "updated_alice@example.com",
        profile_image_url: "https://example.com/updated_alice.jpg",
        display_name: "Updated Alice",
        timezone: "Europe/London",
        is_parent: true,
        user_preferences: {
          theme: "dark",
          language: "en",
        },
      };
      const authToken = await getAuthToken("alice123");
      const {
        body: { updatedUser },
      } = await request(app)
        .patch("/api/users/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send(userUpdate)
        .expect(200);
      expect(updatedUser).toMatchObject({
        username: userUpdate.username,
        email: userUpdate.email,
        profile_image_url: userUpdate.profile_image_url,
        display_name: userUpdate.display_name,
        timezone: userUpdate.timezone,
        is_parent: userUpdate.is_parent,
        user_preferences: {
          theme: userUpdate.user_preferences.theme,
          language: userUpdate.user_preferences.language,
          has_pin: false,
        },
      });
    });
    test("Should successfully update a user with some fields", async () => {
      const userUpdate = {
        username: "updated_alice",
        email: "updated_alice@example.com",
        profile_image_url: "https://example.com/updated_alice.jpg",
      };
      const authToken = await getAuthToken("alice123");
      const {
        body: { updatedUser },
      } = await request(app)
        .patch("/api/users/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send(userUpdate)
        .expect(200);
      expect(updatedUser).toHaveProperty("username", userUpdate.username);
      expect(updatedUser).toHaveProperty("email", userUpdate.email);
      expect(updatedUser).toHaveProperty(
        "profile_image_url",
        userUpdate.profile_image_url
      );
    });
    test("Should return 400 for invalid update data", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/users/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ username: 123 })
        .expect(400);
      expect(message).toBe("Username must be a string");
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app).patch("/api/users/1").expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .patch("/api/users/1")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 for non-existent user", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/users/999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ username: "updated_alice" })
        .expect(404);
      expect(message).toBe("User account not found");
    });
  });
  describe("DELETE /api/users/:id", () => {
    test("Should successfully delete a user", async () => {
      const authToken = await getAuthToken("alice123");
      await request(app)
        .delete("/api/users/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);
    });
    test("Should delete children profiles when user is deleted", async () => {
      const authToken = await getAuthToken("alice123");
      await request(app)
        .delete("/api/users/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);
      const {
        body: { childProfiles },
      } = await request(app)
        .get("/api/children")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      childProfiles.forEach((childProfile: ChildProfile) => {
        expect(childProfile).not.toHaveProperty("user_id", 1);
      });
    });
    test("Should return 400 for invalid user ID", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .delete("/api/users/invalid")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for userId");
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app).delete("/api/users/1").expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .delete("/api/users/1")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 for non-existent user", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .delete("/api/users/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("User account not found");
    });
  });
});

describe("User Preferences Endpoints", () => {
  describe("GET /api/users/:id/preferences", () => {
    test("Should successfully retrieve a user's preferences", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .get("/api/users/1/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(body).toMatchObject({
        notificationsEnabled: expect.any(Boolean),
        theme: expect.any(String),
        language: expect.any(String),
        has_pin: expect.any(Boolean),
      });
      expect(body).not.toHaveProperty("pin_key");
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app)
        .get("/api/users/1/preferences")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .get("/api/users/1/preferences")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 for non-existent user", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .get("/api/users/999/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(body.message).toBe("User account not found");
    });
  });
  describe("PATCH /api/users/:id/preferences", () => {
    test("Should successfully update a user's preferences", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .patch("/api/users/1/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          notificationsEnabled: false,
          theme: "dark",
          language: "es",
        })
        .expect(200);
      expect(body).toMatchObject({
        user_preferences: expect.any(Object),
      });
      expect(body.user_preferences).toMatchObject({
        notificationsEnabled: false,
        theme: "dark",
        language: "es",
        has_pin: true,
      });
      expect(body.user_preferences).not.toHaveProperty("pin_key");
    });
    test("Should accept partial updates", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .patch("/api/users/1/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ notificationsEnabled: false })
        .expect(200);
      expect(body.user_preferences).toMatchObject({
        notificationsEnabled: false,
        theme: "dark",
        language: "en",
        has_pin: true,
      });
    });
    test("Should reject pin_key updates through generic preferences", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .patch("/api/users/1/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ theme: "dark", pin_key: "5555" })
        .expect(400);
      expect(body.message).toBe(
        "Use the dedicated PIN endpoint to update a parent PIN"
      );
    });
    test("Should reject pin_key reset through generic preferences", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .patch("/api/users/1/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ pin_key: "" })
        .expect(400);
      expect(body.message).toBe(
        "Use the dedicated PIN endpoint to update a parent PIN"
      );
    });
    test("Should return 400 for empty update body", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .patch("/api/users/1/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);
      expect(body.message).toBe("Update body cannot be empty");
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app)
        .patch("/api/users/1/preferences")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .patch("/api/users/1/preferences")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 for non-existent user", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .patch("/api/users/999/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(body.message).toBe("User account not found");
    });
  });
});

describe("Parent PIN Endpoints", () => {
  test("Should set a PIN and expose only has_pin", async () => {
    const authToken = await getAuthToken("alice123");
    const { body } = await request(app)
      .post("/api/users/me/pin")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pin: "5555" })
      .expect(200);

    expect(body.status).toBe("success");
    expect(body.data.user_preferences).toMatchObject({ has_pin: true });
    expect(body.data.user_preferences).not.toHaveProperty("pin_key");
  });

  test("Should verify a correct PIN and reject an incorrect PIN", async () => {
    const authToken = await getAuthToken("alice123");
    await request(app)
      .post("/api/users/me/pin")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pin: "5555" })
      .expect(200);

    const correct = await request(app)
      .post("/api/users/me/pin/verify")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pin: "5555" })
      .expect(200);
    expect(correct.body.data.verified).toBe(true);

    const incorrect = await request(app)
      .post("/api/users/me/pin/verify")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pin: "5556" })
      .expect(200);
    expect(incorrect.body.data.verified).toBe(false);
  });

  test("Should preserve leading-zero PINs", async () => {
    const authToken = await getAuthToken("alice123");
    await request(app)
      .post("/api/users/me/pin")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pin: "0123" })
      .expect(200);

    const { body } = await request(app)
      .post("/api/users/me/pin/verify")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pin: "0123" })
      .expect(200);

    expect(body.data.verified).toBe(true);
  });

  test("Should change and delete a PIN", async () => {
    const authToken = await getAuthToken("alice123");
    await request(app)
      .post("/api/users/me/pin")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pin: "1111" })
      .expect(200);
    await request(app)
      .post("/api/users/me/pin")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pin: "2222" })
      .expect(200);

    const oldPin = await request(app)
      .post("/api/users/me/pin/verify")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pin: "1111" })
      .expect(200);
    expect(oldPin.body.data.verified).toBe(false);

    const newPin = await request(app)
      .post("/api/users/me/pin/verify")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pin: "2222" })
      .expect(200);
    expect(newPin.body.data.verified).toBe(true);

    const deleted = await request(app)
      .delete("/api/users/me/pin")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
    expect(deleted.body.data.user_preferences.has_pin).toBe(false);
  });

  test("Should not allow one user to modify another user's PIN through preferences", async () => {
    const daveToken = await getAuthToken("dave123");
    const { body } = await request(app)
      .patch("/api/users/1/preferences")
      .set("Authorization", `Bearer ${daveToken}`)
      .send({ pin_key: "9999" })
      .expect(400);

    expect(body.message).toBe(
      "Use the dedicated PIN endpoint to update a parent PIN"
    );
  });
});

describe("Child Profile Endpoints", () => {
  describe("GET /api/users/:id/children", () => {
    test("Should successfully retrieve all children for a user", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { children },
      } = await request(app)
        .get("/api/users/1/children")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(Array.isArray(children)).toBe(true);
      expect(children[0]).toMatchObject({
        id: expect.any(Number),
        user_id: expect.any(Number),
        name: expect.any(String),
        age: expect.any(Number),
        xp: expect.any(Number),
        level: expect.any(Number),
        reward_points: expect.any(Number),
        last_played: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
    test("Should return 400 for invalid user ID", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/invalid/children")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for userId");
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app)
        .get("/api/users/1/children")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .get("/api/users/1/children")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return empty array for non-parent user", async () => {
      const authToken = await getAuthToken("dave123");
      const { body } = await request(app)
        .get("/api/users/4/children") // dave123 is not a parent
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(body.children).toEqual([]);
    });
    test("Should reject access to another parent's children", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/2/children")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);

      expect(message).toBe("You are not authorized to access this user's children");
    });
    test("Should return 404 for non-existent user", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/999/children")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("User account not found");
    });
  });
  describe("POST /api/users/:id/children", () => {
    test("Should create a child profile for the authenticated parent via /me", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { newChildProfile },
      } = await request(app)
        .post("/api/users/me/children")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "  New   Explorer  ", age: 7, xp: 999, level: 9 })
        .expect(201);

      expect(newChildProfile).toMatchObject({
        user_id: 1,
        name: "New Explorer",
        age: 7,
        xp: 0,
        level: 1,
        reward_points: 0,
      });
    });

    test("Should successfully create a new child profile", async () => {
      const authToken = await getAuthToken("alice123");
      const newChild = {
        name: "Test Child",
        age: 5,
      };
      const {
        body: { newChildProfile },
      } = await request(app)
        .post("/api/users/1/children")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newChild)
        .expect(201);
      expect(newChildProfile).toMatchObject({
        id: expect.any(Number),
        user_id: expect.any(Number),
        name: expect.any(String),
        xp: expect.any(Number),
        level: expect.any(Number),
        reward_points: expect.any(Number),
        last_played: null,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
    test("Should successfully create a new child profile for non-parent user", async () => {
      const authToken = await getAuthToken("dave123");
      const newChild = {
        name: "Test Child",
        age: 5,
      };
      const {
        body: { newChildProfile },
      } = await request(app)
        .post("/api/users/4/children")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newChild)
        .expect(201);
      expect(newChildProfile).toMatchObject({
        id: expect.any(Number),
        user_id: expect.any(Number),
        name: expect.any(String),
        xp: expect.any(Number),
        level: expect.any(Number),
        reward_points: expect.any(Number),
        last_played: null,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
    test("Should return 400 for invalid user ID", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/users/invalid/children")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test Child" })
        .expect(400);
      expect(message).toBe("Invalid number format for userId");
    });
    test("Should return 400 for invalid name", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/users/1/children")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: 123 })
        .expect(400);
      expect(message).toBe("Name must be a string");
    });
    test("Should return 400 for invalid age", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/users/1/children")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test Child", age: -1 })
        .expect(400);
      expect(message).toBe("Age must be a positive number");
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app)
        .post("/api/users/1/children")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .post("/api/users/1/children")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 403 when user is not the child's parent", async () => {
      const authToken = await getAuthToken("dave123");
      const { body } = await request(app)
        .post("/api/users/1/children")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
      expect(body.message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("Should return 404 for non-existent user", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/users/999/children")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("User account not found");
    });
  });
  describe("GET /api/users/:id/children/:childId", () => {
    test("Should successfully retrieve a child profile", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(body.childProfile).toMatchObject({
        id: expect.any(Number),
        user_id: expect.any(Number),
        name: expect.any(String),
        age: expect.any(Number),
        xp: expect.any(Number),
        level: expect.any(Number),
        reward_points: expect.any(Number),
        last_played: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
    test("Should return 400 for invalid user ID", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/invalid/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for userId");
    });
    test("Should return 400 for invalid child ID", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/1/children/invalid")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for childId");
    });
    test("Should return 401 for non-authenticated user", async () => {
      const {
        body: { message },
      } = await request(app).get("/api/users/1/children/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("Should return 403 for non-parent user", async () => {
      const authToken = await getAuthToken("dave123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/4/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
      expect(message).toBe("You need to be a parent to access this resource");
    });
    test("Should return 403 for user who is not the child's parent", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/1/children/3")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
      expect(message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("Should return 404 for non-existent child profile", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/1/children/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("Child profile not found");
    });
    test("Should return 404 for non-existent user", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/users/999/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("User account not found");
    });
  });
  describe("PATCH /api/users/:id/children/:childId", () => {
    test("Should update only editable child fields via /api/children/:childId", async () => {
      const authToken = await getAuthToken("alice123");
      const before = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      const {
        body: { updatedChildProfile },
      } = await request(app)
        .patch("/api/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "  Updated   Child  ",
          age: 8,
          xp: before.body.childProfile.xp + 999,
          level: before.body.childProfile.level + 9,
          reward_points: before.body.childProfile.reward_points + 50,
        })
        .expect(200);

      expect(updatedChildProfile).toMatchObject({
        id: 1,
        name: "Updated Child",
        age: 8,
        xp: before.body.childProfile.xp,
        level: before.body.childProfile.level,
        reward_points: before.body.childProfile.reward_points,
      });
    });

    test("Should reject cross-parent child edits via /api/children/:childId", async () => {
      const bobToken = await getAuthToken("bob123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/children/1")
        .set("Authorization", `Bearer ${bobToken}`)
        .send({ name: "Not yours", age: 7 })
        .expect(403);

      expect(message).toBe(
        "You are not authorized to access this child's profile"
      );
    });

    test("Should successfully update a child profile", async () => {
      const authToken = await getAuthToken("alice123");
      const update = {
        name: "Updated Name",
      };
      const {
        body: { updatedChildProfile },
      } = await request(app)
        .patch("/api/users/1/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send(update)
        .expect(200);
      expect(updatedChildProfile).toMatchObject({
        id: expect.any(Number),
        user_id: expect.any(Number),
        name: update.name,
        age: expect.any(Number),
        xp: expect.any(Number),
        level: expect.any(Number),
        reward_points: expect.any(Number),
        last_played: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
    test("Should return 400 for invalid user ID", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/users/invalid/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for userId");
    });
    test("Should return 400 for invalid child ID", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/users/1/children/invalid")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for childId");
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app)
        .patch("/api/users/1/children/1")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .patch("/api/users/1/children/1")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 403 for non-parent user", async () => {
      const authToken = await getAuthToken("dave123");
      const { body } = await request(app)
        .patch("/api/users/4/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
      expect(body.message).toBe(
        "You need to be a parent to access this resource"
      );
    });
    test("Should return 403 if child does not belong to user", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .patch("/api/users/1/children/3")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Updated Name" })
        .expect(403);
      expect(body.message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("Should return 404 for non-existent child profile", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/users/1/children/999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Updated Name" })
        .expect(404);
      expect(message).toBe("Child profile not found");
    });
  });
  describe("DELETE /api/users/:id/children/:childId", () => {
    test("Should safely archive a child profile", async () => {
      const authToken = await getAuthToken("alice123");
      await request(app)
        .delete("/api/users/1/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      const list = await request(app)
        .get("/api/users/1/children")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(list.body.children.some((child: ChildProfile) => child.id === 1)).toBe(
        false
      );

      await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    test("Should archive a child profile via /api/children/:childId", async () => {
      const authToken = await getAuthToken("alice123");

      await request(app)
        .delete("/api/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      await request(app)
        .delete("/api/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
    test("Should return 400 for invalid child ID", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .delete("/api/users/1/children/invalid")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for childId");
    });
    test("Should return 400 for invalid user ID", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .delete("/api/users/invalid/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for userId");
    });
    test("Should return 401 for non-authenticated user", async () => {
      const { body } = await request(app)
        .delete("/api/users/1/children/1")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const { body } = await request(app)
        .delete("/api/users/1/children/1")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 403 for non-parent user", async () => {
      const authToken = await getAuthToken("dave123");
      const { body } = await request(app)
        .delete("/api/users/4/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
      expect(body.message).toBe(
        "You need to be a parent to access this resource"
      );
    });
    test("Should return 403 if child does not belong to user", async () => {
      const authToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .delete("/api/users/1/children/3")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
      expect(body.message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("Should return 404 for non-existent child profile", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .delete("/api/users/1/children/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("Child profile not found");
    });
    test("Should return 404 for non-existent user", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .delete("/api/users/999/children/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("User account not found");
    });
  });
});
