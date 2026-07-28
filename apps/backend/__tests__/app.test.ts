import request from "supertest";
import app from "../app";

describe("app fallback routes", () => {
  test("returns a single 404 response for unknown API routes", async () => {
    const response = await request(app).get("/api/health").expect(404);

    expect(response.body).toEqual({ msg: "Invalid input" });
  });
});
