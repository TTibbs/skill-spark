import app from "../app";
import request from "supertest";
import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data/index";
import { getAuthToken } from "../utils";
import { SeedData, Achievement } from "../types";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

describe("Achievements Endpoints", () => {
  describe("GET /api/achievements", () => {
    test("Should return all achievements", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { achievements },
      } = await request(app)
        .get("/api/achievements")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      achievements.forEach((achievement: Achievement) => {
        expect(achievement).toMatchObject({
          id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          criteria: expect.any(String),
          required_value: expect.any(Number),
          xp_reward: expect.any(Number),
          points_reward: expect.any(Number),
          is_active: expect.any(Boolean),
          image_url: expect.any(String),
          category: expect.any(String),
          is_special: expect.any(Boolean),
        });
      });
    });
    test("Should return 401 if no token is provided", async () => {
      const response = await request(app).get("/api/achievements").expect(401);
      expect(response.body).toEqual({ message: "Please log in" });
    });
    test("Should return 401 if token is invalid", async () => {
      const response = await request(app)
        .get("/api/achievements")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(response.body).toEqual({ message: "Invalid token" });
    });
  });
  describe("GET /api/achievements/:achievementId", () => {
    test("Should successfully retrieve a achievement by id", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .get("/api/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      body.achievement.forEach((achievement: Achievement) => {
        expect(achievement).toMatchObject({
          id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          criteria: expect.any(String),
          required_value: expect.any(Number),
          xp_reward: expect.any(Number),
          points_reward: expect.any(Number),
          is_active: expect.any(Boolean),
          image_url: expect.any(String),
          category: expect.any(String),
          is_special: expect.any(Boolean),
        });
      });
    });
    test("Should return 400 if achievement id is not a number", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/achievements/invalid")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for achievementId");
    });
    test("Should return 401 if no token is provided", async () => {
      const response = await request(app)
        .get("/api/achievements/1")
        .expect(401);
      expect(response.body).toHaveProperty("message", "Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const response = await request(app)
        .get("/api/achievements/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
    test("Should return 404 if achievement is not found", async () => {
      const aliceToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/achievements/999")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(response.body).toHaveProperty("message", "Achievement not found");
    });
  });
  describe("POST /api/achievements", () => {
    test("Should create a new achievement", async () => {
      const aliceToken = await getAuthToken("alice123");
      const newAchievement = {
        title: "Test Achievement",
        description: "Test Description",
        criteria: "Test Criteria",
        required_value: 10,
        xp_reward: 100,
        points_reward: 100,
        category: "Test Category",
        image_url: "https://example.com/image.png",
        is_special: false,
      };
      const {
        body: { createdAchievement },
      } = await request(app)
        .post("/api/achievements")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(newAchievement)
        .expect(201);
      expect(createdAchievement).toMatchObject({
        id: expect.any(Number),
        title: newAchievement.title,
        description: newAchievement.description,
        criteria: newAchievement.criteria,
        required_value: newAchievement.required_value,
        xp_reward: newAchievement.xp_reward,
        points_reward: newAchievement.points_reward,
        is_active: true,
        image_url: newAchievement.image_url,
        category: newAchievement.category,
        is_special: newAchievement.is_special,
      });
    });
    test("Should return 400 if required fields are missing", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/achievements")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({})
        .expect(400);
      expect(message).toBe("Request body cannot be empty");
    });
    test("Should return 400 for missing required fields", async () => {
      const aliceToken = await getAuthToken("alice123");
      const incompleteAchievement = {
        title: "Valid Title",
        description: "Valid Description",
        // Missing required fields: required_problems, xp_reward, points_reward, etc.
      };
      const {
        body: { message },
      } = await request(app)
        .post("/api/achievements")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(incompleteAchievement)
        .expect(400);
      expect(message).toContain("Missing required fields:");
      expect(message).toContain("criteria");
      expect(message).toContain("required_value");
      expect(message).toContain("xp_reward");
      expect(message).toContain("points_reward");
      expect(message).toContain("category");
      expect(message).toContain("image_url");
      expect(message).toContain("is_special");
    });
    test("Should return 400 if data type is invalid", async () => {
      const aliceToken = await getAuthToken("alice123");
      const newAchievement = {
        title: 123,
        description: "Test Description",
        required_problems: 10,
        xp_reward: 100,
        points_reward: 100,
        category: "Test Category",
      };
      const {
        body: { message },
      } = await request(app)
        .post("/api/achievements")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(newAchievement)
        .expect(400);
      expect(message).toBe("Invalid data type for title");
    });
    test("Should return 400 for invalid string fields", async () => {
      const aliceToken = await getAuthToken("alice123");
      const newAchievement = {
        title: "Valid Title",
        description: 123, // Invalid - should be string
        required_problems: 10,
        xp_reward: 100,
        points_reward: 100,
        category: true, // Invalid - should be string
        image_url: "https://example.com/image.png",
        is_special: false,
      };
      const {
        body: { message },
      } = await request(app)
        .post("/api/achievements")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(newAchievement)
        .expect(400);
      expect(message).toBe("Invalid data type for description, category");
    });
    test("Should return 400 for invalid number fields", async () => {
      const aliceToken = await getAuthToken("alice123");
      const newAchievement = {
        title: "Valid Title",
        description: "Valid Description",
        criteria: "Test Criteria",
        required_value: "10", // Invalid - should be number
        xp_reward: true, // Invalid - should be number
        points_reward: 100,
        category: "Valid Category",
        image_url: "https://example.com/image.png",
        is_special: false,
      };
      const {
        body: { message },
      } = await request(app)
        .post("/api/achievements")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(newAchievement)
        .expect(400);
      expect(message).toBe("Invalid data type for required_value, xp_reward");
    });
    test("Should return 401 if user is not authenticated", async () => {
      const response = await request(app).post("/api/achievements").expect(401);
      expect(response.body).toHaveProperty("message", "Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const response = await request(app)
        .post("/api/achievements")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });
  describe("PATCH /api/achievements/:achievementId", () => {
    test("Should update an achievement", async () => {
      const aliceToken = await getAuthToken("alice123");
      const updatedAchievement = {
        title: "Updated Title",
        description: "Updated Description",
        criteria: "Updated Criteria",
        required_value: 20,
        xp_reward: 200,
        points_reward: 200,
        category: "Updated Category",
        image_url: "https://example.com/image.png",
        is_special: false,
      };
      const {
        body: { achievement },
      } = await request(app)
        .patch("/api/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(updatedAchievement)
        .expect(200);
      expect(achievement).toMatchObject({
        id: expect.any(Number),
        title: updatedAchievement.title,
        description: expect.any(String),
        criteria: expect.any(String),
        required_value: expect.any(Number),
        xp_reward: expect.any(Number),
        points_reward: expect.any(Number),
        is_special: expect.any(Boolean),
      });
    });
    test("Should update only a single field", async () => {
      const aliceToken = await getAuthToken("alice123");
      const updatedData = {
        title: "Single Field Update",
      };
      const {
        body: { achievement },
      } = await request(app)
        .patch("/api/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(updatedData)
        .expect(200);
      expect(achievement).toMatchObject({
        id: expect.any(Number),
        title: updatedData.title,
        description: expect.any(String),
        criteria: expect.any(String),
        required_value: expect.any(Number),
        xp_reward: expect.any(Number),
        points_reward: expect.any(Number),
        is_special: expect.any(Boolean),
      });
    });
    test("Should update multiple but not all fields", async () => {
      const aliceToken = await getAuthToken("alice123");
      const updatedData = {
        title: "Partial Update Title",
        xp_reward: 150,
      };
      const {
        body: { achievement },
      } = await request(app)
        .patch("/api/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(updatedData)
        .expect(200);
      expect(achievement).toMatchObject({
        id: expect.any(Number),
        title: updatedData.title,
        xp_reward: updatedData.xp_reward,
        description: expect.any(String),
        criteria: expect.any(String),
        required_value: expect.any(Number),
        points_reward: expect.any(Number),
        is_special: expect.any(Boolean),
      });
    });
    test("Should return 400 if achievement id is not a number", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/achievements/invalid")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({ title: "Test Title" })
        .expect(400);
      expect(message).toBe("Invalid number format for achievementId");
    });
    test("Should return 400 for mixed valid and invalid field types", async () => {
      const aliceToken = await getAuthToken("alice123");
      const updatedData = {
        title: "Valid Title", // Valid
        xp_reward: "invalid", // Invalid - should be number
        description: 123, // Invalid - should be string
        is_special: false,
      };
      const {
        body: { message },
      } = await request(app)
        .patch("/api/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(updatedData)
        .expect(400);
      expect(message).toContain("Invalid data type for");
      expect(message).toContain("xp_reward");
      expect(message).toContain("description");
    });
    test("Should return 400 if required fields are missing", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({})
        .expect(400);
      expect(message).toBe("Request body cannot be empty");
    });
    test("Should return 400 for invalid string fields", async () => {
      const aliceToken = await getAuthToken("alice123");
      const updatedAchievement = {
        title: 123, // Invalid - should be string
        description: "Valid Description",
        criteria: "Test Criteria",
        required_value: 10,
        xp_reward: 100,
        points_reward: 100,
        category: "Valid Category",
        image_url: "https://example.com/image.png",
        is_special: false,
      };
      const {
        body: { message },
      } = await request(app)
        .patch("/api/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(updatedAchievement)
        .expect(400);
      expect(message).toBe("Invalid data type for title");
    });
    test("Should return 400 for invalid number fields", async () => {
      const aliceToken = await getAuthToken("alice123");
      const updatedAchievement = {
        title: "Valid Title",
        description: "Valid Description",
        criteria: "Test Criteria",
        required_value: "10", // Invalid - should be number
        xp_reward: true, // Invalid - should be number
        points_reward: 100,
        category: "Valid Category",
        image_url: "https://example.com/image.png",
        is_special: false,
      };
      const {
        body: { message },
      } = await request(app)
        .patch("/api/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(updatedAchievement)
        .expect(400);
      expect(message).toBe("Invalid data type for required_value, xp_reward");
    });
    test("Should return 401 if user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).patch("/api/achievements/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .patch("/api/achievements/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("Should return 404 if achievement is not found", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/achievements/999")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(message).toBe("Achievement not found");
    });
  });
  describe("DELETE /api/achievements/:achievementId", () => {
    test("Should delete an achievement", async () => {
      const aliceToken = await getAuthToken("alice123");
      await request(app)
        .delete("/api/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(204);
    });
    test("Should return 400 if achievement id is not a number", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .delete("/api/achievements/invalid")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for achievementId");
    });
    test("Should return 401 if user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).delete("/api/achievements/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .delete("/api/achievements/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("Should return 404 if achievement is not found", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .delete("/api/achievements/999")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(message).toBe("Achievement not found");
    });
  });
});
