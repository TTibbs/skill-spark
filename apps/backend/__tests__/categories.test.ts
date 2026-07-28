import app from "../app";
import request from "supertest";
import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data/index";
import { SeedData, ChoreCategory, WordCategory } from "../types";
import { getAuthToken } from "../utils";
import "jest-sorted";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

describe("Categories endpoints", () => {
  describe("GET /api/categories/word-categories", () => {
    test("Should return 200 and all word categories", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { wordCategories },
      } = await request(app)
        .get("/api/categories/word-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      wordCategories.forEach((category: WordCategory) => {
        expect(category).toHaveProperty("id", expect.any(Number));
        expect(category).toHaveProperty("name", expect.any(String));
      });
    });
    test("Should be sorted alphabetically", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { wordCategories },
      } = await request(app)
        .get("/api/categories/word-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      expect(wordCategories).toBeSorted({
        key: "name",
        descending: false,
      });
    });
  });
  describe("GET /api/categories/word-categories/:name", () => {
    test("Should return 200 and the word category", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { wordCategory },
      } = await request(app)
        .get("/api/categories/word-categories/Animals")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      expect(wordCategory).toHaveProperty("id", expect.any(Number));
      expect(wordCategory).toHaveProperty("name", "Animals");
    });
    test("Should return 401 if not authenticated", async () => {
      const { body } = await request(app)
        .get("/api/categories/word-categories/Animals")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const { body } = await request(app)
        .get("/api/categories/word-categories/Animals")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 if the word category does not exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .get("/api/categories/word-categories/NonExistentCategory")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(body.message).toBe("Word category not found");
    });
  });
  describe("POST /api/categories/word-categories", () => {
    test("Should create a new word category", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .post("/api/categories/word-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({ name: "Test Category" })
        .expect(201);
      expect(body.wordCategory).toHaveProperty("id", expect.any(Number));
      expect(body.wordCategory).toHaveProperty("name", "Test Category");
    });
    test("Should return 400 if the name is not provided", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .post("/api/categories/word-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({})
        .expect(400);
      expect(body.message).toBe("Missing word category data");
    });
    test("Should return 400 if the name is already taken", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .post("/api/categories/word-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({ name: "Animals" })
        .expect(400);
      expect(body.message).toBe("Word category already exists");
    });
    test("Should return 401 if not authenticated", async () => {
      const { body } = await request(app)
        .post("/api/categories/word-categories")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const { body } = await request(app)
        .post("/api/categories/word-categories")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
  });
  describe("GET /api/categories/chore-categories", () => {
    test("Should return 200 and all chore categories", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { choreCategories },
      } = await request(app)
        .get("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      choreCategories.forEach((category: ChoreCategory) => {
        expect(category).toHaveProperty("id", expect.any(Number));
        expect(category).toHaveProperty("name", expect.any(String));
      });
    });
    test("Should be sorted alphabetically", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { choreCategories },
      } = await request(app)
        .get("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      expect(choreCategories).toBeSorted({
        key: "name",
        descending: false,
      });
    });
  });
  describe("GET /api/categories/chore-categories/:name", () => {
    test("Should return 200 and the chore category", async () => {
      const aliceToken = await getAuthToken("alice123");

      const createdCategory = {
        name: "home",
      };
      await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(createdCategory)
        .expect(201);

      const {
        body: { choreCategory },
      } = await request(app)
        .get("/api/categories/chore-categories/home")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      expect(choreCategory).toHaveProperty("id", expect.any(Number));
      expect(choreCategory).toHaveProperty("name", "Home");
    });
    test("Should return 401 if not authenticated", async () => {
      const { body } = await request(app)
        .get("/api/categories/chore-categories/Home")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const { body } = await request(app)
        .get("/api/categories/chore-categories/Home")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 if the chore category does not exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .get("/api/categories/chore-categories/NonExistentCategory")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(body.message).toBe("Chore category not found");
    });
  });
  describe("POST /api/categories/chore-categories", () => {
    test("Should create a new chore category", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({ name: "test category" })
        .expect(201);
      expect(body.newChoreCategory).toHaveProperty("id", expect.any(Number));
      expect(body.newChoreCategory).toHaveProperty("name", "Test Category");
    });
    test("Should return 400 if the name is not provided", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({})
        .expect(400);
      expect(body.message).toBe("Chore category name cannot be empty");
    });
    test("Should return 400 if the name is already taken", async () => {
      const aliceToken = await getAuthToken("alice123");
      const createdCategory = {
        name: "Home",
      };
      await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(createdCategory)
        .expect(201);

      const { body } = await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({ name: "Home" })
        .expect(400);
      expect(body.message).toBe("Chore category already exists");
    });
    test("Should return 401 if not authenticated", async () => {
      const { body } = await request(app)
        .post("/api/categories/chore-categories")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const { body } = await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
  });
  describe("PATCH /api/categories/chore-categories/:id", () => {
    test("Should update a chore category", async () => {
      const aliceToken = await getAuthToken("alice123");
      const createdCategory = {
        name: "Home",
      };
      const { body: createdCategoryBody } = await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(createdCategory)
        .expect(201);
      const { id } = createdCategoryBody.newChoreCategory;
      const { body } = await request(app)
        .patch(`/api/categories/chore-categories/${id}`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({ name: "Updated Category" })
        .expect(200);
      expect(body.updatedChoreCategory).toHaveProperty(
        "id",
        expect.any(Number)
      );
      expect(body.updatedChoreCategory).toHaveProperty(
        "name",
        "Updated Category"
      );
    });
    test("Should return 400 if the name is not provided", async () => {
      const aliceToken = await getAuthToken("alice123");
      const createdCategory = {
        name: "Home",
      };
      const { body: createdCategoryBody } = await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(createdCategory)
        .expect(201);
      const { id } = createdCategoryBody.newChoreCategory;
      const { body } = await request(app)
        .patch(`/api/categories/chore-categories/${id}`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({})
        .expect(400);
      expect(body.message).toBe("Missing chore category data");
    });
    test("Should return 400 if the name is already taken", async () => {
      const aliceToken = await getAuthToken("alice123");
      const createdCategory = {
        name: "Home",
      };
      const { body: createdCategoryBody } = await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(createdCategory)
        .expect(201);
      const { id } = createdCategoryBody.newChoreCategory;
      const { body } = await request(app)
        .patch(`/api/categories/chore-categories/${id}`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({ name: "Home" })
        .expect(400);
      expect(body.message).toBe("Chore category already exists");
    });
    test("Should return 401 if not authenticated", async () => {
      const { body } = await request(app)
        .patch("/api/categories/chore-categories/1")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const { body } = await request(app)
        .patch("/api/categories/chore-categories/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 if the chore category does not exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .patch("/api/categories/chore-categories/999")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(body.message).toBe("Chore category not found");
    });
    test("Should move chores to the new category when updating category name", async () => {
      const aliceToken = await getAuthToken("alice123");

      // Create a category
      const createdCategory = {
        name: "Home",
      };
      const { body: createdCategoryBody } = await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(createdCategory)
        .expect(201);

      const { id } = createdCategoryBody.newChoreCategory;

      // Create chores in the "Home" category
      const chore1 = {
        title: "Make bed",
        description: "Make your bed in the morning",
        category: "Home",
        xp: 10,
      };
      const chore2 = {
        title: "Clean room",
        description: "Clean your room",
        category: "Home",
        xp: 15,
      };

      await request(app)
        .post("/api/chores")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(chore1)
        .expect(201);

      await request(app)
        .post("/api/chores")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(chore2)
        .expect(201);

      // Verify chores are in "Home" category
      const { body: choresBeforeUpdate } = await request(app)
        .get("/api/chores?category=Home")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(choresBeforeUpdate.chores).toHaveLength(2);

      // Update category name from "Home" to "Household"
      await request(app)
        .patch(`/api/categories/chore-categories/${id}`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({ name: "Household" })
        .expect(200);

      // Verify chores are now in "Household" category
      const { body: choresAfterUpdate } = await request(app)
        .get("/api/chores?category=Household")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(choresAfterUpdate.chores).toHaveLength(2);

      // Verify chores are no longer in "Home" category
      const { body: choresInOldCategory } = await request(app)
        .get("/api/chores?category=Home")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);

      expect(choresInOldCategory.message).toBe(
        "No chores found for Home. Do you have any chores added?"
      );
    });
  });
  describe("DELETE /api/categories/chore-categories/:id", () => {
    test("Should delete a chore category", async () => {
      const aliceToken = await getAuthToken("alice123");
      const createdCategory = {
        name: "Home",
      };
      const { body: createdCategoryBody } = await request(app)
        .post("/api/categories/chore-categories")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(createdCategory)
        .expect(201);
      const { id } = createdCategoryBody.newChoreCategory;
      await request(app)
        .delete(`/api/categories/chore-categories/${id}`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
    });
    test("Should return 401 if not authenticated", async () => {
      const { body } = await request(app)
        .delete("/api/categories/chore-categories/1")
        .expect(401);
      expect(body.message).toBe("Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const { body } = await request(app)
        .delete("/api/categories/chore-categories/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(body.message).toBe("Invalid token");
    });
    test("Should return 404 if the chore category does not exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .delete("/api/categories/chore-categories/999")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(body.message).toBe("Chore category not found");
    });
  });
});
