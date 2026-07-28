import app from "../app";
import request from "supertest";
import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data";
import { PremiumReward, SeedData } from "../types";
import { getAuthToken, increaseChildRewardPoints } from "../utils";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

describe("Premium Rewards API Endpoints", () => {
  describe("GET /api/premium-rewards", () => {
    test("should return all premium rewards that are active", async () => {
      const token = await getAuthToken();
      const { body } = await request(app)
        .get("/api/premium-rewards")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      body.forEach((reward: PremiumReward) => {
        expect(reward).toMatchObject({
          id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          points_required: expect.any(Number),
          is_active: true,
          category: expect.any(String),
          does_expire: expect.any(Boolean),
          duration_days: expect.any(Number),
        });
      });
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).get("/api/premium-rewards").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
  });
  describe("POST /api/premium-rewards", () => {
    test("should create a new premium reward", async () => {
      const token = await getAuthToken();
      const newReward = {
        title: "Test Reward",
        description: "Test Description",
        points_required: 100,
        is_active: true,
        category: "premium",
        does_expire: false,
        duration_days: 0,
      };
      const { body } = await request(app)
        .post("/api/premium-rewards")
        .set("Authorization", `Bearer ${token}`)
        .send(newReward)
        .expect(201);
      expect(body).toMatchObject({
        id: expect.any(Number),
        title: newReward.title,
        description: newReward.description,
        points_required: newReward.points_required,
        is_active: newReward.is_active,
        category: newReward.category,
        does_expire: newReward.does_expire,
        duration_days: newReward.duration_days,
      });
    });
    test("should return a 400 if the reward object is empty", async () => {
      const token = await getAuthToken();
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards")
        .set("Authorization", `Bearer ${token}`)
        .send({})
        .expect(400);
      expect(message).toBe("No reward data provided");
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).post("/api/premium-rewards").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
  });
  describe("GET /api/premium-rewards/:id", () => {
    test("should return a premium reward by id", async () => {
      const token = await getAuthToken();
      const { body } = await request(app)
        .get("/api/premium-rewards/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(body).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        points_required: expect.any(Number),
        is_active: expect.any(Boolean),
        category: expect.any(String),
        does_expire: expect.any(Boolean),
        duration_days: expect.any(Number),
      });
    });
    test("should return a 400 if the id is not a number", async () => {
      const token = await getAuthToken();
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/not-a-number")
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
      expect(message).toBe("Invalid number format for id");
    });
    test("should return a 404 if the id does not exist", async () => {
      const token = await getAuthToken();
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/999")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
      expect(message).toBe("Premium reward not found");
    });
  });
  describe("PATCH /api/premium-rewards/:id", () => {
    test("should update a premium reward", async () => {
      const token = await getAuthToken();
      const updatedReward = {
        title: "Updated Reward",
        description: "Updated Description",
        points_required: 200,
        is_active: false,
        category: "premium",
        does_expire: true,
        duration_days: 7,
      };
      const { body } = await request(app)
        .patch("/api/premium-rewards/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedReward)
        .expect(200);
      expect(body).toMatchObject({
        id: expect.any(Number),
        title: updatedReward.title,
        description: updatedReward.description,
        points_required: updatedReward.points_required,
        is_active: updatedReward.is_active,
        category: updatedReward.category,
        does_expire: updatedReward.does_expire,
        duration_days: updatedReward.duration_days,
      });
    });
    test("should return a 400 if the reward object is empty", async () => {
      const token = await getAuthToken();
      const {
        body: { message },
      } = await request(app)
        .patch("/api/premium-rewards/1")
        .set("Authorization", `Bearer ${token}`)
        .send({})
        .expect(400);
      expect(message).toBe("No reward data provided");
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).patch("/api/premium-rewards/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .patch("/api/premium-rewards/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return a 404 if the reward id does not exist", async () => {
      const token = await getAuthToken();
      const {
        body: { message },
      } = await request(app)
        .patch("/api/premium-rewards/999")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
      expect(message).toBe("Premium reward not found");
    });
  });
  describe("DELETE /api/premium-rewards/:id", () => {
    test("should delete a premium reward", async () => {
      const token = await getAuthToken();
      await request(app)
        .delete("/api/premium-rewards/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(204);
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).delete("/api/premium-rewards/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .delete("/api/premium-rewards/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return a 404 if the reward id does not exist", async () => {
      const token = await getAuthToken();
      const {
        body: { message },
      } = await request(app)
        .delete("/api/premium-rewards/999")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
      expect(message).toBe("Premium reward not found");
    });
  });
  describe("POST /api/premium-rewards/:id/purchase/:childId", () => {
    test("should create a premium reward purchase for a child profile without immediate activation", async () => {
      const aliceToken = await getAuthToken("alice123");
      // Check the childs reward points
      const {
        body: { childProfile },
      } = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      expect(childProfile.reward_points).toBe(100);

      await increaseChildRewardPoints(200, 1);

      const { body } = await request(app)
        .post("/api/premium-rewards/2/purchase/1") // Double XP Boost (expires)
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(201);

      expect(body).toMatchObject({
        id: expect.any(Number),
        child_id: expect.any(Number),
        reward_id: expect.any(Number),
        purchase_date: expect.any(String),
        is_activated: false,
        expiry_date: null,
      });

      // Verify the reward is not immediately active
      const activeRewards = await request(app)
        .get("/api/premium-rewards/active/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(activeRewards.body).toHaveLength(0);
    });
    test("should not allow purchase if the user does not have enough reward points", async () => {
      const aliceToken = await getAuthToken("alice123");
      // First check the child profile reward points
      const {
        body: { childProfile },
      } = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      expect(childProfile.reward_points).toBe(100);
      // Then try to purchase the reward that costs 200 points
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/1/purchase/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);
      expect(message).toBe(
        "You do not have enough reward points to purchase this reward"
      );
    });
    test("should return a 400 if the reward id is not a number", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/not-a-number/purchase/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for id");
    });
    test("should return a 400 if the child id is not a number", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/1/purchase/not-a-number")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for childId");
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/1/purchase/1")
        .expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/1/purchase/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return a 403 if the user is not a parent", async () => {
      const daveToken = await getAuthToken("dave123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/1/purchase/1")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(403);
      expect(message).toBe("You need to be a parent to access this resource");
    });
    test("should return a 403 if the user is not the parent of the child", async () => {
      const bobToken = await getAuthToken("bob123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/1/purchase/1")
        .set("Authorization", `Bearer ${bobToken}`)
        .expect(403);
      expect(message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("should return a 404 if the reward id does not exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/999/purchase/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(message).toBe("Premium reward not found");
    });
    test("should return a 404 if the child id does not exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/1/purchase/999")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(message).toBe("Child profile not found");
    });
  });
  describe("GET /api/premium-rewards/purchased/:childId", () => {
    test("should return purchased but unactivated premium rewards", async () => {
      const aliceToken = await getAuthToken("alice123");

      // Purchase a reward
      await increaseChildRewardPoints(200, 1);
      await request(app)
        .post("/api/premium-rewards/2/purchase/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(201);

      const { body } = await request(app)
        .get("/api/premium-rewards/purchased/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(body).toHaveLength(1);
      expect(body[0]).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        is_activated: false,
        purchase_id: expect.any(Number),
      });
    });
    test("should return a 400 if the child id is not a number", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/purchased/not-a-number")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for childId");
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/purchased/1")
        .expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/purchased/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return a 403 if the user is not a parent", async () => {
      const daveToken = await getAuthToken("dave123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/purchased/1")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(403);
      expect(message).toBe("You need to be a parent to access this resource");
    });
    test("should return a 403 if the user is not the parent of the child", async () => {
      const bobToken = await getAuthToken("bob123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/purchased/1")
        .set("Authorization", `Bearer ${bobToken}`)
        .expect(403);
      expect(message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("should return a 404 if the child id does not exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/purchased/999")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(message).toBe("Child profile not found");
    });
  });
  describe("GET /api/premium-rewards/active/:childId", () => {
    test("should return the active premium rewards for a child profile", async () => {
      const aliceToken = await getAuthToken("alice123");
      // Buy the reward that costs 100 points
      await request(app)
        .post("/api/premium-rewards/2/purchase/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(201);

      // Activate the reward
      await request(app)
        .post("/api/premium-rewards/activate/1/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      const { body } = await request(app)
        .get("/api/premium-rewards/active/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      expect(body).toMatchObject([
        {
          id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          points_required: expect.any(Number),
          is_active: expect.any(Boolean),
          category: expect.any(String),
          does_expire: expect.any(Boolean),
          duration_days: expect.any(Number),
        },
      ]);
    });
    test("should return empty array if none are active", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body } = await request(app)
        .get("/api/premium-rewards/active/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      expect(body).toEqual([]);
    });
    test("should return a 400 if the child id is not a number", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/active/not-a-number")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for childId");
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app).get("/api/premium-rewards/active/1/1").expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/active/1/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return a 403 if the user is not a parent", async () => {
      const daveToken = await getAuthToken("dave123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/active/1")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(403);
      expect(message).toBe("You need to be a parent to access this resource");
    });
    test("should return a 403 if the user is not the parent of the child", async () => {
      const bobToken = await getAuthToken("bob123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/active/1")
        .set("Authorization", `Bearer ${bobToken}`)
        .expect(403);
      expect(message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("should return a 404 if the child id does not exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/premium-rewards/active/999")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(message).toBe("Child profile not found");
    });
  });
  describe("POST /api/premium-rewards/activate/:childId/:purchaseId", () => {
    test("should activate a purchased premium reward", async () => {
      const aliceToken = await getAuthToken("alice123");

      // First purchase a reward
      await increaseChildRewardPoints(200, 1);
      const purchase = await request(app)
        .post("/api/premium-rewards/2/purchase/1") // Double XP Boost
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(201);

      // Then activate it
      const { body } = await request(app)
        .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(body).toMatchObject({
        id: expect.any(Number),
        child_id: expect.any(Number),
        reward_id: expect.any(Number),
        is_activated: true,
        expiry_date: expect.any(String),
      });

      // Verify the reward is now active
      const activeRewards = await request(app)
        .get("/api/premium-rewards/active/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(activeRewards.body).toHaveLength(1);
      expect(activeRewards.body[0].is_activated).toBe(true);
    });
    test("should not allow activating an already activated reward", async () => {
      const aliceToken = await getAuthToken("alice123");

      // First purchase and activate a reward
      await increaseChildRewardPoints(200, 1);
      const purchase = await request(app)
        .post("/api/premium-rewards/2/purchase/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(201);

      await request(app)
        .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      // Try to activate it again
      const { body } = await request(app)
        .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);

      expect(body.message).toBe("Purchase not found or already activated");
    });
    test("should return a 400 if the purchase id is not a number", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/activate/1/not-a-number")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for purchaseId");
    });
    test("should return a 400 if the child id is not a number", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/activate/not-a-number/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);
      expect(message).toBe("Invalid number format for childId");
    });
    test("should return a 401 if the user is not authenticated", async () => {
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/activate/1/1")
        .expect(401);
      expect(message).toBe("Please log in");
    });
    test("should return a 401 if the token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/activate/1/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("should return a 403 if the user is not a parent", async () => {
      const daveToken = await getAuthToken("dave123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/activate/1/1")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(403);
      expect(message).toBe("You need to be a parent to access this resource");
    });
    test("should return a 403 if the user is not the parent of the child", async () => {
      const bobToken = await getAuthToken("bob123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/activate/1/1")
        .set("Authorization", `Bearer ${bobToken}`)
        .expect(403);
      expect(message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("should return a 404 if the child id does not exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/activate/999/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(message).toBe("Child profile not found");
    });
    test("should return a 404 if the purchase id does not exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .post("/api/premium-rewards/activate/1/999")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(message).toBe("Purchased reward not found");
    });
  });
});

describe("Activating double XP reward", () => {
  test("should activate a double XP reward using addition activity", async () => {
    const aliceToken = await getAuthToken("alice123");
    const {
      body: { childProfile },
    } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    const rewardPoints = childProfile.reward_points;
    const purchase = await request(app)
      .post("/api/premium-rewards/2/purchase/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(201);
    expect(purchase.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: expect.any(String),
      is_activated: false,
      expiry_date: null,
    });
    const { body: secondRewardPointCheck } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(secondRewardPointCheck.childProfile.reward_points).toBeLessThan(
      rewardPoints
    );
    const mathResult = {
      correct: 6,
      incorrect: 0,
      type: "addition",
    };
    const { body: firstXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/math`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(mathResult)
      .expect(201);
    const xpEarned = firstXpRewardCheck.xpEarned;
    const activate = await request(app)
      .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(activate.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: purchase.body.purchase_date,
      is_activated: !purchase.body.is_activated,
      expiry_date: expect.any(String),
    });
    const { body: secondXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/math`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(mathResult)
      .expect(201);
    const secondXpEarned = secondXpRewardCheck.xpEarned;
    expect(secondXpEarned).toBe(xpEarned * 2);
  });
  test("should activate a double XP reward using subtraction activity", async () => {
    const aliceToken = await getAuthToken("alice123");
    const {
      body: { childProfile },
    } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    const rewardPoints = childProfile.reward_points;
    const purchase = await request(app)
      .post("/api/premium-rewards/2/purchase/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(201);
    expect(purchase.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: expect.any(String),
      is_activated: false,
      expiry_date: null,
    });
    const { body: secondRewardPointCheck } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(secondRewardPointCheck.childProfile.reward_points).toBeLessThan(
      rewardPoints
    );
    const mathResult = {
      correct: 6,
      incorrect: 0,
      type: "subtraction",
    };
    const { body: firstXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/math`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(mathResult)
      .expect(201);
    const xpEarned = firstXpRewardCheck.xpEarned;
    const activate = await request(app)
      .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(activate.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: purchase.body.purchase_date,
      is_activated: !purchase.body.is_activated,
      expiry_date: expect.any(String),
    });
    const { body: secondXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/math`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(mathResult)
      .expect(201);
    const secondXpEarned = secondXpRewardCheck.xpEarned;
    expect(secondXpEarned).toBe(xpEarned * 2);
  });
  test("should activate a double XP reward using multiplication activity", async () => {
    const aliceToken = await getAuthToken("alice123");
    const {
      body: { childProfile },
    } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    const rewardPoints = childProfile.reward_points;
    const purchase = await request(app)
      .post("/api/premium-rewards/2/purchase/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(201);
    expect(purchase.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: expect.any(String),
      is_activated: false,
      expiry_date: null,
    });
    const { body: secondRewardPointCheck } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(secondRewardPointCheck.childProfile.reward_points).toBeLessThan(
      rewardPoints
    );
    const mathResult = {
      correct: 6,
      incorrect: 0,
      type: "multiplication",
    };
    const { body: firstXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/math`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(mathResult)
      .expect(201);
    const xpEarned = firstXpRewardCheck.xpEarned;
    const activate = await request(app)
      .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(activate.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: purchase.body.purchase_date,
      is_activated: !purchase.body.is_activated,
      expiry_date: expect.any(String),
    });
    const { body: secondXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/math`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(mathResult)
      .expect(201);
    const secondXpEarned = secondXpRewardCheck.xpEarned;
    expect(secondXpEarned).toBe(xpEarned * 2);
  });
  test("should activate a double XP reward using division activity", async () => {
    const aliceToken = await getAuthToken("alice123");
    const {
      body: { childProfile },
    } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    const rewardPoints = childProfile.reward_points;
    const purchase = await request(app)
      .post("/api/premium-rewards/2/purchase/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(201);
    expect(purchase.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: expect.any(String),
      is_activated: false,
      expiry_date: null,
    });
    const { body: secondRewardPointCheck } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(secondRewardPointCheck.childProfile.reward_points).toBeLessThan(
      rewardPoints
    );
    const mathResult = {
      correct: 6,
      incorrect: 0,
      type: "division",
    };
    const { body: firstXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/math`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(mathResult)
      .expect(201);
    const xpEarned = firstXpRewardCheck.xpEarned;
    const activate = await request(app)
      .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(activate.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: purchase.body.purchase_date,
      is_activated: !purchase.body.is_activated,
      expiry_date: expect.any(String),
    });
    const { body: secondXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/math`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(mathResult)
      .expect(201);
    const secondXpEarned = secondXpRewardCheck.xpEarned;
    expect(secondXpEarned).toBe(xpEarned * 2);
  });
  test("should activate a double XP reward using counting activity", async () => {
    const aliceToken = await getAuthToken("alice123");
    const {
      body: { childProfile },
    } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    const rewardPoints = childProfile.reward_points;
    const purchase = await request(app)
      .post("/api/premium-rewards/2/purchase/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(201);
    expect(purchase.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: expect.any(String),
      is_activated: false,
      expiry_date: null,
    });
    const { body: secondRewardPointCheck } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(secondRewardPointCheck.childProfile.reward_points).toBeLessThan(
      rewardPoints
    );
    const mathResult = {
      correct: 6,
      incorrect: 0,
      type: "counting",
    };
    const { body: firstXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/math`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(mathResult)
      .expect(201);
    const xpEarned = firstXpRewardCheck.xpEarned;
    const activate = await request(app)
      .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(activate.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: purchase.body.purchase_date,
      is_activated: !purchase.body.is_activated,
      expiry_date: expect.any(String),
    });
    const { body: secondXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/math`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(mathResult)
      .expect(201);
    const secondXpEarned = secondXpRewardCheck.xpEarned;
    expect(secondXpEarned).toBe(xpEarned * 2);
  });
  test("should activate a double XP reward using spelling activity", async () => {
    const aliceToken = await getAuthToken("alice123");
    const {
      body: { childProfile },
    } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    const rewardPoints = childProfile.reward_points;
    const purchase = await request(app)
      .post("/api/premium-rewards/2/purchase/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(201);
    expect(purchase.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: expect.any(String),
      is_activated: false,
      expiry_date: null,
    });
    const { body: secondRewardPointCheck } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(secondRewardPointCheck.childProfile.reward_points).toBeLessThan(
      rewardPoints
    );
    const spellingResult = {
      hintsUsed: 1,
      totalCorrectGuesses: 3,
      totalIncorrectGuesses: 1,
    };
    const { body: firstXpRewardCheck } = await request(app)
      .post(`/api/children/1/stats/spelling/1`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(spellingResult)
      .expect(201);
    const xpEarned = firstXpRewardCheck.xpEarned;
    const activate = await request(app)
      .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(activate.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: purchase.body.purchase_date,
      is_activated: !purchase.body.is_activated,
      expiry_date: expect.any(String),
    });
    const { body: secondXpRewardCheck } = await request(app)
      .post("/api/children/1/stats/spelling/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(spellingResult)
      .expect(201);
    const secondXpEarned = secondXpRewardCheck.xpEarned;
    expect(secondXpEarned).toBe(xpEarned * 2);
  });
  test("should activate a double XP reward using picture memory activity", async () => {
    const aliceToken = await getAuthToken("alice123");
    const {
      body: { childProfile },
    } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    const rewardPoints = childProfile.reward_points;
    const purchase = await request(app)
      .post("/api/premium-rewards/2/purchase/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(201);
    expect(purchase.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: expect.any(String),
      is_activated: false,
      expiry_date: null,
    });
    const { body: secondRewardPointCheck } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(secondRewardPointCheck.childProfile.reward_points).toBeLessThan(
      rewardPoints
    );
    const memoryResult = {
      totalMoves: 10,
      timeSpent: 35,
      type: "picture",
    };

    const { body: firstXpRewardCheck } = await request(app)
      .post("/api/children/1/stats/memory")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(memoryResult)
      .expect(201);
    const xpEarned = firstXpRewardCheck.xpEarned;
    const activate = await request(app)
      .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(activate.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: purchase.body.purchase_date,
      is_activated: !purchase.body.is_activated,
      expiry_date: expect.any(String),
    });
    const { body: secondXpRewardCheck } = await request(app)
      .post("/api/children/1/stats/memory")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(memoryResult)
      .expect(201);
    const secondXpEarned = secondXpRewardCheck.xpEarned;
    expect(secondXpEarned).toBe(xpEarned * 2);
  });
  test("should activate a double XP reward using sound memory activity", async () => {
    const aliceToken = await getAuthToken("alice123");
    const {
      body: { childProfile },
    } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    const rewardPoints = childProfile.reward_points;
    const purchase = await request(app)
      .post("/api/premium-rewards/2/purchase/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(201);
    expect(purchase.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: expect.any(String),
      is_activated: false,
      expiry_date: null,
    });
    const { body: secondRewardPointCheck } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(secondRewardPointCheck.childProfile.reward_points).toBeLessThan(
      rewardPoints
    );
    const memoryResult = {
      totalMoves: 10,
      timeSpent: 35,
      type: "sound",
    };

    const { body: firstXpRewardCheck } = await request(app)
      .post("/api/children/1/stats/memory")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(memoryResult)
      .expect(201);
    const xpEarned = firstXpRewardCheck.xpEarned;
    const activate = await request(app)
      .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(activate.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: purchase.body.purchase_date,
      is_activated: !purchase.body.is_activated,
      expiry_date: expect.any(String),
    });
    const { body: secondXpRewardCheck } = await request(app)
      .post("/api/children/1/stats/memory")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(memoryResult)
      .expect(201);
    const secondXpEarned = secondXpRewardCheck.xpEarned;
    expect(secondXpEarned).toBe(xpEarned * 2);
  });
  test("should activate a double XP reward using shapes activity", async () => {
    const aliceToken = await getAuthToken("alice123");
    const {
      body: { childProfile },
    } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    const rewardPoints = childProfile.reward_points;
    const purchase = await request(app)
      .post("/api/premium-rewards/2/purchase/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(201);
    expect(purchase.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: expect.any(String),
      is_activated: false,
      expiry_date: null,
    });
    const { body: secondRewardPointCheck } = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(secondRewardPointCheck.childProfile.reward_points).toBeLessThan(
      rewardPoints
    );
    const shapesResult = {
      correct: 12,
      incorrect: 0,
      timeSpent: 35,
    };

    const { body: firstXpRewardCheck } = await request(app)
      .post("/api/children/1/stats/shapes")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(shapesResult)
      .expect(201);
    const xpEarned = firstXpRewardCheck.xpEarned;
    const activate = await request(app)
      .post(`/api/premium-rewards/activate/1/${purchase.body.id}`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .expect(200);
    expect(activate.body).toMatchObject({
      id: expect.any(Number),
      child_id: expect.any(Number),
      reward_id: expect.any(Number),
      purchase_date: purchase.body.purchase_date,
      is_activated: !purchase.body.is_activated,
      expiry_date: expect.any(String),
    });
    const { body: secondXpRewardCheck } = await request(app)
      .post("/api/children/1/stats/shapes")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send(shapesResult)
      .expect(201);
    const secondXpEarned = secondXpRewardCheck.xpEarned;
    expect(secondXpEarned).toBe(xpEarned * 2);
  });
});
