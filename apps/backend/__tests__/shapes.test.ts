import app from "../app";
import request from "supertest";
import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data/index";
import { SeedData, Shape } from "../types";
import { getAuthToken } from "../utils";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

describe("Shapes API Endpoints", () => {
  describe("GET /api/shapes", () => {
    test("should return all shapes", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { shapes },
      } = await request(app)
        .get("/api/shapes")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      shapes.forEach((shape: Shape) => {
        expect(shape).toHaveProperty("id", expect.any(Number));
        expect(shape).toHaveProperty("name", expect.any(String));
        expect(shape).toHaveProperty("description", expect.any(String));
        expect(shape).toHaveProperty("image", expect.any(String));
      });
    });
  });
  describe("GET /api/shapes/:shapeId", () => {
    test("should return a shape by id", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { shape },
      } = await request(app)
        .get("/api/shapes/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(shape).toMatchObject({
        id: 1,
        name: expect.any(String),
        description: expect.any(String),
        image: expect.any(String),
      });
    });
    test("should return a 400 if the shapeId is not a number", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/shapes/not-a-number")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for shapeId");
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).get("/api/shapes/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .get("/api/shapes/1")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return a 404 if the shape does not exist", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/shapes/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("Shape not found");
    });
  });
  describe("POST /api/shapes", () => {
    test("should create a new shape", async () => {
      const authToken = await getAuthToken("alice123");
      const addedShape = {
        name: "New Shape",
        description: "A new shape",
        image: "https://example.com/new-shape.png",
      };
      const {
        body: { newShape },
      } = await request(app)
        .post("/api/shapes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(addedShape)
        .expect(201);
      expect(newShape).toMatchObject({
        id: expect.any(Number),
        name: addedShape.name,
        description: addedShape.description,
        image: addedShape.image,
      });
    });
    test("should return a 400 if the body is empty", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/shapes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);
      expect(message).toBe("Body can not be empty");
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).post("/api/shapes").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .post("/api/shapes")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
      expect(message).toBe("Invalid token");
    });
  });
  describe("PATCH /api/shapes/:shapeId", () => {
    test("should update a shape", async () => {
      const authToken = await getAuthToken("alice123");
      const updatedShape = {
        name: "Updated Shape",
        description: "An updated shape",
        image: "https://example.com/updated-shape.png",
      };
      const {
        body: { shape },
      } = await request(app)
        .patch("/api/shapes/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedShape)
        .expect(200);
      expect(shape).toMatchObject({
        id: 1,
        name: updatedShape.name,
        description: updatedShape.description,
        image: updatedShape.image,
      });
    });
    test("should return a 400 if the body is empty", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/shapes/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);
      expect(message).toBe("Body can not be empty");
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).patch("/api/shapes/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .patch("/api/shapes/1")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return a 404 if the shape does not exist", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .patch("/api/shapes/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("Shape not found");
    });
  });
  describe("DELETE /api/shapes/:shapeId", () => {
    test("should delete a shape", async () => {
      const authToken = await getAuthToken("alice123");
      await request(app)
        .delete("/api/shapes/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).delete("/api/shapes/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .delete("/api/shapes/1")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return a 404 if the shape does not exist", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .delete("/api/shapes/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(message).toBe("Shape not found");
    });
  });
});
