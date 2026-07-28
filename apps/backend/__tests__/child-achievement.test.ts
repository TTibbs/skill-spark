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

describe("Child achievements endpoints", () => {
  describe("GET /api/children/:childId/achievements/completed", () => {
    test("Should return all completed achievements for a child or empty array if no achievements are completed", async () => {
      const aliceToken = await getAuthToken("alice123");
      const { body: completedAchievements } = await request(app)
        .get("/api/children/1/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      expect(completedAchievements).toEqual(expect.any(Array));
    });
    test("Should successfully retrieve completed achievements for spelling activity", async () => {
      const aliceToken = await getAuthToken("alice123");
      await request(app)
        .post(`/api/children/1/stats/spelling/3`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({
          hintsUsed: 0,
          totalCorrectGuesses: 8,
          totalIncorrectGuesses: 0,
        })
        .expect(201);

      const { body } = await request(app)
        .get("/api/children/1/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      // Find the spelling achievement specifically
      const spellingAchievement = body.find(
        (achievement: any) => achievement.category === "spelling"
      );
      expect(spellingAchievement).toBeDefined();
      expect(spellingAchievement).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        criteria: expect.any(String),
        required_value: expect.any(Number),
        xp_reward: expect.any(Number),
        points_reward: expect.any(Number),
        is_active: expect.any(Boolean),
        image_url: expect.any(String),
        category: "spelling",
        is_special: expect.any(Boolean),
        is_achieved: true,
      });
    });
    test("Should successfully retrieve completed achievements for math activity", async () => {
      const aliceToken = await getAuthToken("alice123");
      const mathResults = [
        {
          correct: 5,
          incorrect: 1,
          type: "addition",
        },
        {
          correct: 1,
          incorrect: 1,
          type: "subtraction",
        },
        {
          correct: 1,
          incorrect: 1,
          type: "multiplication",
        },
        {
          correct: 1,
          incorrect: 1,
          type: "division",
        },
        {
          correct: 1,
          incorrect: 1,
          type: "counting",
        },
      ];

      for (const mathResult of mathResults) {
        await request(app)
          .post("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(mathResult)
          .expect(201);
      }

      const { body } = await request(app)
        .get("/api/children/1/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(body[0]).toMatchObject({
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
        is_achieved: expect.any(Boolean),
      });
    });
    test("Should successfully retrieve multiple completed achievements for math activity", async () => {
      const aliceToken = await getAuthToken("alice123");
      const mathResult = {
        correct: 30,
        incorrect: 0,
        timeSpent: 60,
        type: "addition",
      };

      await request(app)
        .post("/api/children/1/stats/math")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(mathResult)
        .expect(201);

      const { body } = await request(app)
        .get("/api/children/1/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(body.length).toBeGreaterThan(1);
    });
    test("Should retrieve completed achievements for shapes activity", async () => {
      const aliceToken = await getAuthToken("alice123");
      const shapesResult = {
        correct: 5,
        incorrect: 1,
        timeSpent: 35,
      };

      await request(app)
        .post("/api/children/1/stats/shapes")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(shapesResult)
        .expect(201);

      const { body } = await request(app)
        .get("/api/children/1/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(body[0]).toMatchObject({
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
        is_achieved: expect.any(Boolean),
      });
    });
    test("Should retrieve completed achievements for picture memory activity", async () => {
      const aliceToken = await getAuthToken("alice123");
      const memoryResults = {
        totalMoves: 6,
        timeSpent: 1,
        type: "picture",
      };

      await request(app)
        .post("/api/children/1/stats/memory")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(memoryResults)
        .expect(201);

      const { body } = await request(app)
        .get("/api/children/1/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(body[0]).toMatchObject({
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
        is_achieved: expect.any(Boolean),
      });
    });
    test("Should retrieve completed achievements for sound memory activity", async () => {
      const aliceToken = await getAuthToken("alice123");
      const memoryResults = {
        totalMoves: 6,
        timeSpent: 1,
        type: "sound",
      };

      await request(app)
        .post("/api/children/1/stats/memory")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(memoryResults)
        .expect(201);

      const { body } = await request(app)
        .get("/api/children/1/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(body[0]).toMatchObject({
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
        is_achieved: expect.any(Boolean),
      });
    });
    test("Should return 400 for invalid child ID", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/invalid/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);

      expect(message).toBe("Invalid number format for childId");
    });
    test("Should return 401 if no token is provided", async () => {
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/1/achievements/completed")
        .expect(401);
      expect(message).toBe("Please log in");
    });
    test("Should return 401 if token is invalid", async () => {
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/1/achievements/completed")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(message).toBe("Invalid token");
    });
    test("Should return 403 if not parent", async () => {
      const daveToken = await getAuthToken("dave123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/1/achievements/completed")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(403);
      expect(message).toBe("You need to be a parent to access this resource");
    });
    test("Should return 403 if not parent of child", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/3/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(403);
      expect(message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("Should return 404 if child not found", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/999/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);
      expect(message).toBe("Child profile not found");
    });
  });
  describe("GET /api/children/:childId/achievements/:achievementId", () => {
    test("Should successfully retrieve specific achievement details", async () => {
      const aliceToken = await getAuthToken("alice123");
      // First get all achievements to find a valid achievement ID
      const {
        body: { achievement },
      } = await request(app)
        .get(`/api/children/1/achievements/1`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(achievement).toMatchObject({
        id: 1,
        title: expect.any(String),
        description: expect.any(String),
        criteria: expect.any(String),
        required_value: expect.any(Number),
        xp_reward: expect.any(Number),
        points_reward: expect.any(Number),
        is_active: expect.any(Boolean),
        image_url: expect.any(String),
        category: expect.any(String),
        is_achieved: expect.any(Boolean),
      });
    });
    test("Should return achievement with progress information", async () => {
      const aliceToken = await getAuthToken("alice123");

      const mathResult = {
        correct: 6,
        incorrect: 0,
        type: "addition",
      };

      // Add some math progress first
      await request(app)
        .post("/api/children/1/stats/math")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(mathResult)
        .expect(201);

      // Get achievements to find a math achievement
      const achievementsResponse = await request(app)
        .get("/api/children/1/achievements/completed")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(achievementsResponse.body).toContainEqual(
        expect.objectContaining({
          category: "math",
        })
      );
    });
    test("Should return 400 for invalid child ID", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/invalid/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);

      expect(message).toBe("Invalid number format for childId");
    });
    test("Should return 401 when no token is provided", async () => {
      const {
        body: { message },
      } = await request(app).get("/api/children/1/achievements/1").expect(401);

      expect(message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/1/achievements/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);

      expect(message).toBe("Invalid token");
    });
    test("Should return 403 for non-parent user", async () => {
      const daveToken = await getAuthToken("dave123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/1/achievements/1")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(403);

      expect(message).toBe("You need to be a parent to access this resource");
    });
    test("Should return 403 when trying to access another parent's child", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/3/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(403);

      expect(message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("Should return 404 for non-existent child profile", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/999/achievements/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);

      expect(message).toBe("Child profile not found");
    });
    test("Should return 404 for non-existent achievement", async () => {
      const aliceToken = await getAuthToken("alice123");
      const {
        body: { message },
      } = await request(app)
        .get("/api/children/1/achievements/999")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);

      expect(message).toBe("Achievement not found");
    });
  });
});

describe("Triggering achievements", () => {
  describe("Chore achievements", () => {
    test("Should award xp, achievements and reward points for completing chores", async () => {
      const aliceToken = await getAuthToken("alice123");

      const createdChore = {
        title: "Test Chore",
        description: "Test Description",
        category: "test category",
        xp: 10,
        reward_points: 2,
      };

      const choreResponse = await request(app)
        .post("/api/chores")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(createdChore)
        .expect(201);

      const initialResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      const initialXp = initialResponse.body.childProfile.xp;
      const initialRewardPoints =
        initialResponse.body.childProfile.reward_points;

      const assignmentResponse = await request(app)
        .post(`/api/children/1/chores/assign/${choreResponse.body.chore.id}`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(201);

      await request(app)
        .post(
          `/api/children/1/chores/${assignmentResponse.body.assignment.id}/submit`
        )
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      const { body } = await request(app)
        .post(
          `/api/children/1/chores/${assignmentResponse.body.assignment.id}/approve`
        )
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(body).toMatchObject({
        assignment: expect.objectContaining({ status: "approved" }),
        awarded: expect.objectContaining({ xp: 10 }),
      });

      const finalResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(finalResponse.body.childProfile.xp).toBeGreaterThan(initialXp);
      expect(finalResponse.body.childProfile.reward_points).toBeGreaterThan(
        initialRewardPoints
      );
    });
  });
  describe("Math achievements", () => {
    test("Should successfully award achievements, xp and reward points for addition activity", async () => {
      const aliceToken = await getAuthToken("alice123");
      const childResponse = await request(app)
        .get(`/api/users/1/children/1`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      const initialRewardPoints = childResponse.body.childProfile.reward_points;
      const initialXp = childResponse.body.childProfile.xp;

      const mathResult = {
        correct: 21,
        incorrect: 0,
        type: "addition",
      };

      const { body } = await request(app)
        .post(`/api/children/1/stats/math`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(mathResult)
        .expect(201);

      expect(body).toMatchObject({
        message: "Math stats updated and achievements checked",
        completedAchievements: expect.any(Array),
      });
      expect(body.completedAchievements.length).toBeGreaterThan(0);
      expect(body.child.xp).toBeGreaterThan(initialXp);
      expect(body.child.reward_points).toBeGreaterThan(initialRewardPoints);
    });
    test("Should successfully award achievements, xp and reward points for subtraction activity", async () => {
      const aliceToken = await getAuthToken("alice123");

      const initialResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      const initialXp = initialResponse.body.childProfile.xp;
      const initialRewardPoints =
        initialResponse.body.childProfile.reward_points;

      const mathResult = {
        correct: 6,
        incorrect: 0,
        timeSpent: 30,
        type: "subtraction",
      };
      const { body } = await request(app)
        .post(`/api/children/1/stats/math`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(mathResult)
        .expect(201);

      expect(body).toMatchObject({
        message: "Math stats updated and achievements checked",
        completedAchievements: expect.any(Array),
      });

      expect(body.completedAchievements.length).toBeGreaterThan(0);

      const finalResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(finalResponse.body.childProfile.xp).toBeGreaterThan(initialXp);
      expect(finalResponse.body.childProfile.reward_points).toBeGreaterThan(
        initialRewardPoints
      );
    });
    test("Should successfully award achievements, xp and reward points for multiplication activity", async () => {
      const aliceToken = await getAuthToken("alice123");

      const initialResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      const initialXp = initialResponse.body.childProfile.xp;
      const initialRewardPoints =
        initialResponse.body.childProfile.reward_points;

      const mathResult = {
        correct: 6,
        incorrect: 0,
        timeSpent: 30,
        type: "multiplication",
      };
      const { body } = await request(app)
        .post(`/api/children/1/stats/math`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(mathResult)
        .expect(201);

      expect(body).toMatchObject({
        message: "Math stats updated and achievements checked",
        completedAchievements: expect.any(Array),
      });

      expect(body.completedAchievements.length).toBeGreaterThan(0);

      const finalResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(finalResponse.body.childProfile.xp).toBeGreaterThan(initialXp);
      expect(finalResponse.body.childProfile.reward_points).toBeGreaterThan(
        initialRewardPoints
      );
    });
    test("Should successfully award achievements, xp and reward points for division activity", async () => {
      const aliceToken = await getAuthToken("alice123");

      const initialResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      const initialXp = initialResponse.body.childProfile.xp;
      const initialRewardPoints =
        initialResponse.body.childProfile.reward_points;

      const mathResult = {
        correct: 6,
        incorrect: 0,
        timeSpent: 30,
        type: "division",
      };
      const { body } = await request(app)
        .post(`/api/children/1/stats/math`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(mathResult)
        .expect(201);

      expect(body).toMatchObject({
        message: "Math stats updated and achievements checked",
        completedAchievements: expect.any(Array),
      });

      expect(body.completedAchievements.length).toBeGreaterThan(0);

      const finalResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(finalResponse.body.childProfile.xp).toBeGreaterThan(initialXp);
      expect(finalResponse.body.childProfile.reward_points).toBeGreaterThan(
        initialRewardPoints
      );
    });
    test("Should successfully award achievements, xp and reward points for counting activity", async () => {
      const aliceToken = await getAuthToken("alice123");

      const initialResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      const initialXp = initialResponse.body.childProfile.xp;
      const initialRewardPoints =
        initialResponse.body.childProfile.reward_points;

      const mathResult = {
        correct: 6,
        incorrect: 0,
        timeSpent: 30,
        type: "counting",
      };
      const { body } = await request(app)
        .post(`/api/children/1/stats/math`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(mathResult)
        .expect(201);

      expect(body).toMatchObject({
        message: "Math stats updated and achievements checked",
        completedAchievements: expect.any(Array),
      });

      expect(body.completedAchievements.length).toBeGreaterThan(0);

      const finalResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(finalResponse.body.childProfile.xp).toBeGreaterThan(initialXp);
      expect(finalResponse.body.childProfile.reward_points).toBeGreaterThan(
        initialRewardPoints
      );
    });
  });
  describe("Spelling achievements", () => {
    test("Should award achievements, xp and reward points for spelling activity", async () => {
      const aliceToken = await getAuthToken("alice123");

      const childResponse = await request(app)
        .get(`/api/users/1/children/1`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      const initialRewardPoints = childResponse.body.childProfile.reward_points;
      const initialXp = childResponse.body.childProfile.xp;

      const spellingResult = {
        hintsUsed: 0,
        totalCorrectGuesses: 8,
        totalIncorrectGuesses: 0,
      };
      const { body } = await request(app)
        .post(`/api/children/1/stats/spelling/3`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(spellingResult)
        .expect(201);

      expect(body).toMatchObject({
        child: expect.any(Object),
        spelling_stats: expect.any(Object),
        xpEarned: expect.any(Number),
        message: "Spelling stats updated and achievements checked",
        completedAchievements: expect.any(Array),
      });

      expect(body.completedAchievements.length).toBeGreaterThan(0);

      // Check that the child's XP and reward points increased
      const finalResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(finalResponse.body.childProfile.xp).toBeGreaterThan(initialXp);
      expect(finalResponse.body.childProfile.reward_points).toBeGreaterThan(
        initialRewardPoints
      );
    });
  });
  describe("Memory achievements", () => {
    test("Should successfully award achievements, xp and reward points for picture memory activity", async () => {
      const aliceToken = await getAuthToken("alice123");

      // Get initial child profile state
      const initialResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      const initialXp = initialResponse.body.childProfile.xp;
      const initialRewardPoints =
        initialResponse.body.childProfile.reward_points;

      const memoryResult = {
        totalMoves: 8,
        timeSpent: 15,
        type: "picture",
      };

      const { body } = await request(app)
        .post("/api/children/1/stats/memory")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(memoryResult)
        .expect(201);

      expect(body).toMatchObject({
        child: expect.any(Object),
        stats: expect.any(Object),
        xpEarned: expect.any(Number),
        message: "Memory stats updated and achievements checked",
        completedAchievements: expect.any(Array),
      });
      expect(body.child).toMatchObject({
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

      expect(body.completedAchievements.length).toBeGreaterThan(0);

      // Check that the child's XP and reward points increased due to achievement completion
      const finalResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(finalResponse.body.childProfile.xp).toBeGreaterThan(initialXp);
      expect(finalResponse.body.childProfile.reward_points).toBeGreaterThan(
        initialRewardPoints
      );
    });
    test("Should successfully award achievements, xp and reward points for sound memory activity", async () => {
      const aliceToken = await getAuthToken("alice123");

      // Get initial child profile state
      const initialResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      const initialXp = initialResponse.body.childProfile.xp;
      const initialRewardPoints =
        initialResponse.body.childProfile.reward_points;

      const memoryResult = {
        totalMoves: 8,
        timeSpent: 15,
        type: "sound",
      };

      const { body } = await request(app)
        .post("/api/children/1/stats/memory")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(memoryResult)
        .expect(201);

      expect(body).toMatchObject({
        child: expect.any(Object),
        stats: expect.any(Object),
        xpEarned: expect.any(Number),
        message: "Memory stats updated and achievements checked",
        completedAchievements: expect.any(Array),
      });
      expect(body.child).toMatchObject({
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

      expect(body.completedAchievements.length).toBeGreaterThan(0);

      // Check that the child's XP and reward points increased due to achievement completion
      const finalResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(finalResponse.body.childProfile.xp).toBeGreaterThan(initialXp);
      expect(finalResponse.body.childProfile.reward_points).toBeGreaterThan(
        initialRewardPoints
      );
    });
  });
  describe("Shapes achievements", () => {
    test("Should successfully award achievements, xp and reward points for shapes activity", async () => {
      const aliceToken = await getAuthToken("alice123");

      // Get initial child profile state
      const initialResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);
      const initialXp = initialResponse.body.childProfile.xp;
      const initialRewardPoints =
        initialResponse.body.childProfile.reward_points;

      const shapesResult = {
        correct: 20,
        incorrect: 0,
        timeSpent: 15,
      };

      const { body } = await request(app)
        .post("/api/children/1/stats/shapes")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send(shapesResult)
        .expect(201);

      expect(body).toMatchObject({
        child: expect.any(Object),
        stats: expect.any(Object),
        xpEarned: expect.any(Number),
        message: expect.any(String),
        completedAchievements: expect.any(Array),
      });

      expect(body.completedAchievements.length).toBeGreaterThan(0);

      // Check that the child's XP and reward points increased due to achievement completion
      const finalResponse = await request(app)
        .get("/api/users/1/children/1")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(finalResponse.body.childProfile.xp).toBeGreaterThan(initialXp);
      expect(finalResponse.body.childProfile.reward_points).toBeGreaterThan(
        initialRewardPoints
      );
    });
  });
});

describe("Edge cases", () => {
  test("Should not award achievements previously achieved", async () => {
    const bobToken = await getAuthToken("bob123");
    const childResponse = await request(app)
      .get(`/api/users/2/children/3`)
      .set("Authorization", `Bearer ${bobToken}`)
      .expect(200);
    const initialRewardPoints = childResponse.body.childProfile.reward_points;
    const initialXp = childResponse.body.childProfile.xp;

    const mathResult = {
      correct: 7,
      incorrect: 0,
      type: "addition",
    };

    const { body } = await request(app)
      .post(`/api/children/3/stats/math`)
      .set("Authorization", `Bearer ${bobToken}`)
      .send(mathResult)
      .expect(201);

    const xpAfterUpdate = body.child.xp;
    expect(body).toMatchObject({
      message: "Math stats updated and achievements checked",
      completedAchievements: expect.any(Array),
    });
    expect(xpAfterUpdate).toBeGreaterThan(initialXp);
    expect(body.completedAchievements.length).toBeGreaterThan(0);
    expect(body.child.reward_points).toBeGreaterThan(initialRewardPoints);

    const finalResponse = await request(app)
      .post(`/api/children/3/stats/math`)
      .set("Authorization", `Bearer ${bobToken}`)
      .send(mathResult)
      .expect(201);

    expect(finalResponse.body.completedAchievements.length).toBe(1);
  });
});
