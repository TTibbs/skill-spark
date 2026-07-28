import app from "../app";
import request from "supertest";
import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data/index";
import { SeedData } from "../types";
import { getAuthToken } from "../utils";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

describe("Words Endpoints", () => {
  describe("GET /api/words", () => {
    test("should return all words with default pagination", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { words },
      } = await request(app)
        .get("/api/words")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(words).toBeDefined();
      expect(words.length).toBe(10);
    });
    test("should return words by category", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { words },
      } = await request(app)
        .get("/api/words?category=Animals")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(words).toBeDefined();
      expect(words.length).toBe(10);
    });
    test("should return words by limit", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { words },
      } = await request(app)
        .get("/api/words?limit=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(words).toBeDefined();
      expect(words.length).toBe(5);
    });
    test("should use all 3 filters together", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { words },
      } = await request(app)
        .get("/api/words?category=Animals&limit=5&page=2")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(words).toBeDefined();
      expect(words.length).toBe(5);
    });
    test("should return words by page", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { words },
      } = await request(app)
        .get("/api/words?page=2&limit=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(words).toBeDefined();
      expect(words.length).toBe(5);
    });
    test("should return 401 if not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).get("/api/words").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return 401 if token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .get("/api/words")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
  });
  describe("GET /api/words/:wordId", () => {
    test("should return a word by id", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { word },
      } = await request(app)
        .get(`/api/words/1`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(word).toBeDefined();
      expect(word.word_id).toBe(1);
    });
    test("should return 400 if wordId is not a valid id", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/words/abc")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for wordId");
    });
    test("should return 401 if not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).get("/api/words/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return 404 if word not found", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/words/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("Word not found");
    });
  });
  describe("POST /api/words", () => {
    test("should create a new word", async () => {
      const authToken = await getAuthToken("alice123");
      const newWord = {
        word: "test-word",
        category: "test category",
        image: "test-image.jpg",
      };
      const {
        body: { word },
      } = await request(app)
        .post("/api/words")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newWord)
        .expect(201);
      expect(word).toBeDefined();
      expect(word.word_id).toBeDefined();
    });
    test("should capitalise the category name", async () => {
      const authToken = await getAuthToken("alice123");
      const newWord = {
        word: "test word",
        category: "test category",
        image: "test-image.jpg",
      };
      const {
        body: { word },
      } = await request(app)
        .post("/api/words")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newWord)
        .expect(201);
      expect(word.category).toBe("Test Category");
    });
    test("should return 400 if word data is not provided", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/words")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);
      expect(message).toBe("Missing word data");
    });
    test("should return 401 if not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).post("/api/words").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return 401 if token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .post("/api/words")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
  });
  describe("PATCH /api/words/:wordId", () => {
    test("should update a word", async () => {
      const authToken = await getAuthToken("alice123");
      const updatedWord = {
        word: "updated word",
        category: "updated category",
        image: "updated-image.jpg",
      };
      const {
        body: { word },
      } = await request(app)
        .patch("/api/words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedWord)
        .expect(200);
      expect(word).toBeDefined();
      expect(word.word_id).toBe(1);
      expect(word.word).toBe("updated word");
      expect(word.category).toBe("Updated Category");
      expect(word.image).toBe("updated-image.jpg");
    });
    test("should accept multiple values as a partial update", async () => {
      const authToken = await getAuthToken("alice123");
      const updatedWord = {
        word: "updated word",
        category: "updated category",
      };
      const {
        body: { word },
      } = await request(app)
        .patch("/api/words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedWord)
        .expect(200);
      expect(word).toMatchObject({
        word_id: 1,
        word: "updated word",
        category: "Updated Category",
        image: expect.any(String),
      });
    });
    test("should accept partial update for word only", async () => {
      const authToken = await getAuthToken("alice123");
      const updatedWord = {
        word: "updated word",
      };
      const {
        body: { word },
      } = await request(app)
        .patch("/api/words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedWord)
        .expect(200);
      expect(word).toMatchObject({
        word_id: 1,
        word: "updated word",
        category: "Animals",
        image: expect.any(String),
      });
    });
    test("should accept partial update for category only", async () => {
      const authToken = await getAuthToken("alice123");
      const updatedWord = {
        category: "updated category",
      };
      const {
        body: { word },
      } = await request(app)
        .patch("/api/words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedWord)
        .expect(200);
      expect(word).toMatchObject({
        word_id: 1,
        word: "Dog",
        category: "Updated Category",
        image: expect.any(String),
      });
    });
    test("should accept partial update for image only", async () => {
      const authToken = await getAuthToken("alice123");
      const updatedWord = {
        image: "updated-image.jpg",
      };
      const {
        body: { word },
      } = await request(app)
        .patch("/api/words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedWord)
        .expect(200);
      expect(word).toMatchObject({
        word_id: 1,
        word: "Dog",
        category: "Animals",
        image: "updated-image.jpg",
      });
    });
    test("should return 400 if the patch body is empty", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Body can not be empty");
    });
    test("should return 401 if not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).patch("/api/words/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return 401 if token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .patch("/api/words/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return 404 if word not found", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/words/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("Word not found");
    });
  });
  describe("DELETE /api/words/:wordId", () => {
    test("should delete a word", async () => {
      const authToken = await getAuthToken("alice123");
      await request(app)
        .delete("/api/words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);
    });
    test("should return 401 if not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).delete("/api/words/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return 401 if token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .delete("/api/words/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return 404 if word not found", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .delete("/api/words/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("Word not found");
    });
  });
});
