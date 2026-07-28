import app from "../app";
import request from "supertest";
import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data/index";
import { SeedData, Achievement } from "../types";
import { getAuthToken } from "../utils";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

describe("Child stats endpoints", () => {
  describe("GET child stats endpoints", () => {
    describe("GET /api/children/:childId/stats", () => {
      test("Should successfully retrieve child's stats", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { childStats },
        } = await request(app)
          .get(`/api/children/1/stats`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        expect(childStats).toMatchObject({
          choreStats: expect.any(Object),
          mathStats: expect.any(Object),
          spellingStats: expect.any(Object),
          shapeStats: expect.any(Object),
          memoryStats: expect.any(Object),
        });
      });
      test("Should return 400 for invalid child ID", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/invalid/stats")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(400);

        expect(message).toBe("Invalid number format for childId");
      });
      test("Should return 401 when no token is provided", async () => {
        const {
          body: { message },
        } = await request(app).get("/api/children/1/stats").expect(401);

        expect(message).toBe("Please log in");
      });
      test("Should return 401 for invalid token", async () => {
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats")
          .set("Authorization", `Bearer invalid`)
          .expect(401);

        expect(message).toBe("Invalid token");
      });
      test("Should return 403 when trying to access another parent's child stats", async () => {
        const bobToken = await getAuthToken("bob123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats")
          .set("Authorization", `Bearer ${bobToken}`)
          .expect(403);

        expect(message).toBe(
          "You are not authorized to access this child's profile"
        );
      });
      test("Should return 403 for non-parent user", async () => {
        const daveToken = await getAuthToken("dave123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats")
          .set("Authorization", `Bearer ${daveToken}`)
          .expect(403);

        expect(message).toBe("You need to be a parent to access this resource");
      });
      test("Should return 404 for non-existent child profile", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/999/stats")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(404);

        expect(message).toBe("Child profile not found");
      });
      test("Should return zero stats for an owned child with no learning history", async () => {
        const charlieToken = await getAuthToken("charlie123");
        const {
          body: { childStats },
        } = await request(app)
          .get("/api/children/4/stats")
          .set("Authorization", `Bearer ${charlieToken}`)
          .expect(200);

        expect(childStats.mathStats.stats).toMatchObject({
          totalGames: 0,
          totalProblems: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
        });
        expect(childStats.spellingStats.stats).toMatchObject({
          totalGames: 0,
          total_learned_words: 0,
          total_correct_guesses: 0,
          total_incorrect_guesses: 0,
        });
        expect(childStats.spellingStats.learned_words).toEqual([]);
        expect(childStats.memoryStats.stats).toMatchObject({
          totalGames: 0,
          totalMoves: 0,
          totalTimeSecs: 0,
          bestTimeSecs: null,
          fewestMoves: null,
        });
        expect(childStats.shapeStats.stats).toMatchObject({
          totalGames: 0,
          totalShapes: 0,
          totalCorrectShapes: 0,
          totalIncorrectShapes: 0,
        });
      });
    });
    describe("GET /api/children/:childId/stats/math", () => {
      test("Should successfully retrieve child's math stats", async () => {
        const aliceToken = await getAuthToken("alice123");
        const { body } = await request(app)
          .get(`/api/children/1/stats/math`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        expect(body.mathStats.stats).toMatchObject({
          addition: expect.any(Object),
          counting: expect.any(Object),
          division: expect.any(Object),
          subtraction: expect.any(Object),
          multiplication: expect.any(Object),
          totalProblems: expect.any(Number),
          correctAnswers: expect.any(Number),
          incorrectAnswers: expect.any(Number),
          overallAccuracy: expect.any(Number),
        });
      });
      test("Should return 400 for invalid child ID", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/invalid/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(400);

        expect(message).toBe("Invalid number format for childId");
      });
      test("Should return 401 when no token is provided", async () => {
        const {
          body: { message },
        } = await request(app).get(`/api/children/1/stats/math`).expect(401);

        expect(message).toBe("Please log in");
      });
      test("Should return 401 for invalid token", async () => {
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/math")
          .set("Authorization", `Bearer invalid`)
          .expect(401);
        expect(message).toBe("Invalid token");
      });
      test("Should return 403 when trying to access another parent's child profile", async () => {
        const bobToken = await getAuthToken("bob123");
        const {
          body: { message },
        } = await request(app)
          .get(`/api/children/1/stats/math`)
          .set("Authorization", `Bearer ${bobToken}`)
          .expect(403);

        expect(message).toBe(
          "You are not authorized to access this child's profile"
        );
      });
      test("Should return 403 for non-parent user", async () => {
        const daveToken = await getAuthToken("dave123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${daveToken}`)
          .expect(403);

        expect(message).toBe("You need to be a parent to access this resource");
      });
      test("Should return 404 for non-existent child profile", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/999/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(404);

        expect(message).toBe("Child profile not found");
      });
      test("Should return zero math stats for an owned child with no math history", async () => {
        const charlieToken = await getAuthToken("charlie123");
        const {
          body: { mathStats },
        } = await request(app)
          .get("/api/children/4/stats/math")
          .set("Authorization", `Bearer ${charlieToken}`)
          .expect(200);

        expect(mathStats.stats).toMatchObject({
          totalGames: 0,
          totalProblems: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          overallAccuracy: 0,
        });
      });
    });
    describe("GET /api/children/:childId/stats/spelling", () => {
      test("Should successfully retrieve child's spelling stats", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { spellingStats },
        } = await request(app)
          .get(`/api/children/1/stats/spelling`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        expect(spellingStats).toMatchObject({
          stats: expect.any(Object),
          child_id: expect.any(Number),
        });
        expect(spellingStats.stats).toMatchObject({
          total_learned_words: expect.any(Number),
          total_hints_used: expect.any(Number),
          total_correct_guesses: expect.any(Number),
          total_incorrect_guesses: expect.any(Number),
          accuracy: expect.any(Number),
        });
        expect(spellingStats.learned_words).toBeInstanceOf(Array);
        expect(spellingStats.learned_words[0]).toMatchObject({
          word_id: expect.any(Number),
          word: expect.any(String),
          image: expect.any(String),
          category: expect.any(String),
          learned_at: expect.any(String),
          times_learned: expect.any(Number),
        });
      });
      test("Should return 400 for invalid child ID", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/invalid/stats/spelling")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(400);

        expect(message).toBe("Invalid number format for childId");
      });
      test("Should return 401 when no token is provided", async () => {
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/spelling")
          .expect(401);

        expect(message).toBe("Please log in");
      });
      test("Should return 401 for invalid token", async () => {
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/spelling")
          .set("Authorization", `Bearer invalid`)
          .expect(401);

        expect(message).toBe("Invalid token");
      });
      test("Should return 403 when trying to access another parent's child profile", async () => {
        const bobToken = await getAuthToken("bob123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/spelling")
          .set("Authorization", `Bearer ${bobToken}`)
          .expect(403);

        expect(message).toBe(
          "You are not authorized to access this child's profile"
        );
      });
      test("Should return 403 for non-parent user", async () => {
        const daveToken = await getAuthToken("dave123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/spelling")
          .set("Authorization", `Bearer ${daveToken}`)
          .expect(403);

        expect(message).toBe("You need to be a parent to access this resource");
      });
      test("Should return 404 for non-existent child profile", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/999/stats/spelling")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(404);

        expect(message).toBe("Child profile not found");
      });
    });
    describe("GET /api/children/:childId/stats/memory", () => {
      test("Should successfully retrieve child's memory stats", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { memoryStats },
        } = await request(app)
          .get("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        expect(memoryStats).toMatchObject({
          child_id: expect.any(Number),
          stats: expect.any(Object),
          updated_at: expect.any(String),
        });
        expect(memoryStats.stats).toMatchObject({
          sound: expect.any(Object),
          picture: expect.any(Object),
          totalGames: expect.any(Number),
          totalMoves: expect.any(Number),
          totalTimeSecs: expect.any(Number),
          bestTimeSecs: expect.any(Number),
          fewestMoves: expect.any(Number),
        });
      });
      test("Should return 400 for invalid child ID", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/invalid/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(400);

        expect(message).toBe("Invalid number format for childId");
      });
      test("Should return 401 when no token is provided", async () => {
        const {
          body: { message },
        } = await request(app).get("/api/children/1/stats/memory").expect(401);

        expect(message).toBe("Please log in");
      });
      test("Should return 401 for invalid token", async () => {
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/memory")
          .set("Authorization", `Bearer invalid`)
          .expect(401);
        expect(message).toBe("Invalid token");
      });
      test("Should return 403 when trying to access another parent's child profile", async () => {
        const bobToken = await getAuthToken("bob123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${bobToken}`)
          .expect(403);

        expect(message).toBe(
          "You are not authorized to access this child's profile"
        );
      });
      test("Should return 403 for non-parent user", async () => {
        const daveToken = await getAuthToken("dave123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${daveToken}`)
          .expect(403);

        expect(message).toBe("You need to be a parent to access this resource");
      });
      test("Should return 404 for non-existent child profile", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/999/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(404);

        expect(message).toBe("Child profile not found");
      });
    });
    describe("GET /api/children/:childId/stats/shapes", () => {
      test("Should successfully retrieve child's shapes stats", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { shapeStats },
        } = await request(app)
          .get(`/api/children/1/stats/shapes`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        expect(shapeStats).toMatchObject({
          child_id: expect.any(Number),
          stats: expect.any(Object),
          updated_at: expect.any(String),
        });
        expect(shapeStats.stats).toMatchObject({
          totalGames: expect.any(Number),
          totalShapes: expect.any(Number),
          totalCorrectShapes: expect.any(Number),
          totalIncorrectShapes: expect.any(Number),
          overallAccuracy: expect.any(Number),
          totalTimeSecs: expect.any(Number),
          bestTimeSecs: expect.any(Number),
        });
      });
      test("Should return 400 for invalid child ID", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/invalid/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(400);

        expect(message).toBe("Invalid number format for childId");
      });
      test("Should return 401 when no token is provided", async () => {
        const {
          body: { message },
        } = await request(app).get("/api/children/1/stats/shapes").expect(401);

        expect(message).toBe("Please log in");
      });
      test("Should return 401 for invalid token", async () => {
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer invalid`)
          .expect(401);
        expect(message).toBe("Invalid token");
      });
      test("Should return 403 when trying to access another parent's child profile", async () => {
        const bobToken = await getAuthToken("bob123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${bobToken}`)
          .expect(403);

        expect(message).toBe(
          "You are not authorized to access this child's profile"
        );
      });
      test("Should return 403 for non-parent user", async () => {
        const daveToken = await getAuthToken("dave123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${daveToken}`)
          .expect(403);

        expect(message).toBe("You need to be a parent to access this resource");
      });
      test("Should return 404 for non-existent child profile", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .get("/api/children/999/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(404);

        expect(message).toBe("Child profile not found");
      });
    });
  });
  describe("POST child stats endpoints", () => {
    describe("POST /api/children/:childId/stats/math", () => {
      test("Should successfully update child's math stats with addition", async () => {
        const aliceToken = await getAuthToken("alice123");
        const profileCheck = await request(app)
          .get("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const statsBefore = profileCheck.body.mathStats.stats;
        const mathResult = {
          correct: 6,
          incorrect: 0,
          type: "addition",
        };
        const { body } = await request(app)
          .post(`/api/children/1/stats/math`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(mathResult)
          .expect(201);
        expect(body).toMatchObject({
          stats: expect.any(Object),
          child: expect.any(Object),
          xpEarned: expect.any(Number),
          completedAchievements: expect.any(Array),
        });
        expect(body.stats).toMatchObject({
          totalProblems: expect.any(Number),
          correctAnswers: expect.any(Number),
          incorrectAnswers: expect.any(Number),
          overallAccuracy: expect.any(Number),
          addition: expect.any(Object),
          subtraction: expect.any(Object),
          multiplication: expect.any(Object),
          division: expect.any(Object),
          counting: expect.any(Object),
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
        expect(body.stats.totalGames).toBeGreaterThan(statsBefore.totalGames);
        expect(body.stats.addition.correct).toBeGreaterThan(
          statsBefore.addition.correct
        );
        expect(body.stats.addition.incorrect).toBeGreaterThanOrEqual(
          statsBefore.addition.incorrect
        );
        expect(body.stats.overallAccuracy).toBeGreaterThanOrEqual(
          statsBefore.overallAccuracy
        );
      });
      test("Should treat duplicate math session IDs as idempotent", async () => {
        const aliceToken = await getAuthToken("alice123");
        const mathResult = {
          sessionId: "math-duplicate-session",
          correct: 3,
          incorrect: 1,
          timeSpent: 25,
          type: "addition",
        };

        const first = await request(app)
          .post("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(mathResult)
          .expect(201);
        const second = await request(app)
          .post("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(mathResult)
          .expect(200);

        expect(second.body).toMatchObject(first.body);
      });
      test("Should reject negative and non-integer math counts", async () => {
        const aliceToken = await getAuthToken("alice123");

        await request(app)
          .post("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send({
            sessionId: "bad-math-session",
            correct: -1,
            incorrect: 0,
            timeSpent: 10,
            type: "addition",
          })
          .expect(400);

        await request(app)
          .post("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send({
            sessionId: "bad-math-session-2",
            correct: 1.5,
            incorrect: 0,
            timeSpent: 10,
            type: "addition",
          })
          .expect(400);
      });
      test("Should update child's level when math stats are updated", async () => {
        const aliceToken = await getAuthToken("alice123");
        const profileCheck = await request(app)
          .get("/api/users/1/children/1")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const levelCheckBefore = profileCheck.body.childProfile;

        const mathResult = {
          correct: 4,
          incorrect: 0,
          type: "addition",
        };
        await request(app)
          .post(`/api/children/1/stats/math`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(mathResult)
          .expect(201);
        const { body } = await request(app)
          .get("/api/users/1/children/1")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const levelCheckAfter = body.childProfile;
        expect(levelCheckAfter.level).toBeGreaterThan(levelCheckBefore.level);
      });
      test("Should successfully update child's math stats with subtraction", async () => {
        const aliceToken = await getAuthToken("alice123");
        const profileCheck = await request(app)
          .get("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const statsBefore = profileCheck.body.mathStats.stats;
        const mathResult = {
          correct: 6,
          incorrect: 0,
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

        expect(body.stats).toMatchObject({
          totalProblems: expect.any(Number),
          correctAnswers: expect.any(Number),
          incorrectAnswers: expect.any(Number),
          addition: expect.any(Object),
          subtraction: expect.any(Object),
          multiplication: expect.any(Object),
          division: expect.any(Object),
          counting: expect.any(Object),
        });
        expect(body.stats.totalGames).toBeGreaterThan(statsBefore.totalGames);
        expect(body.stats.subtraction.correct).toBeGreaterThan(
          statsBefore.subtraction.correct
        );
        expect(body.stats.subtraction.incorrect).toBeGreaterThanOrEqual(
          statsBefore.subtraction.incorrect
        );
        expect(body.stats.overallAccuracy).toBeGreaterThanOrEqual(
          statsBefore.overallAccuracy
        );
      });
      test("Should successfully update child's math stats with multiplication", async () => {
        const aliceToken = await getAuthToken("alice123");
        const profileCheck = await request(app)
          .get("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const statsBefore = profileCheck.body.mathStats.stats;
        const mathResult = {
          correct: 6,
          incorrect: 0,
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

        expect(body.stats).toMatchObject({
          totalProblems: expect.any(Number),
          correctAnswers: expect.any(Number),
          incorrectAnswers: expect.any(Number),
          addition: expect.any(Object),
          subtraction: expect.any(Object),
          multiplication: expect.any(Object),
          division: expect.any(Object),
          counting: expect.any(Object),
        });
        expect(body.stats.totalGames).toBeGreaterThan(statsBefore.totalGames);
        expect(body.stats.multiplication.correct).toBeGreaterThan(
          statsBefore.multiplication.correct
        );
        expect(body.stats.multiplication.incorrect).toBeGreaterThanOrEqual(
          statsBefore.multiplication.incorrect
        );
        expect(body.stats.overallAccuracy).toBeGreaterThanOrEqual(
          statsBefore.overallAccuracy
        );
      });
      test("Should successfully update child's math stats with division", async () => {
        const aliceToken = await getAuthToken("alice123");
        const profileCheck = await request(app)
          .get("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const statsBefore = profileCheck.body.mathStats.stats;
        const mathResult = {
          correct: 6,
          incorrect: 0,
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

        expect(body.stats).toMatchObject({
          totalProblems: expect.any(Number),
          correctAnswers: expect.any(Number),
          incorrectAnswers: expect.any(Number),
          addition: expect.any(Object),
          subtraction: expect.any(Object),
          multiplication: expect.any(Object),
          division: expect.any(Object),
          counting: expect.any(Object),
        });
        expect(body.stats.totalGames).toBeGreaterThan(statsBefore.totalGames);
        expect(body.stats.division.correct).toBeGreaterThan(
          statsBefore.division.correct
        );
        expect(body.stats.division.incorrect).toBeGreaterThanOrEqual(
          statsBefore.division.incorrect
        );
        expect(body.stats.overallAccuracy).toBeGreaterThanOrEqual(
          statsBefore.overallAccuracy
        );
      });
      test("Should successfully update child's math stats with counting", async () => {
        const aliceToken = await getAuthToken("alice123");
        const profileCheck = await request(app)
          .get("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const statsBefore = profileCheck.body.mathStats.stats;
        const mathResult = {
          correct: 6,
          incorrect: 0,
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
        expect(body.stats).toMatchObject({
          totalProblems: expect.any(Number),
          correctAnswers: expect.any(Number),
          incorrectAnswers: expect.any(Number),
          addition: expect.any(Object),
          subtraction: expect.any(Object),
          multiplication: expect.any(Object),
          division: expect.any(Object),
          counting: expect.any(Object),
        });
        expect(body.stats.totalGames).toBeGreaterThan(statsBefore.totalGames);
        expect(body.stats.counting.correct).toBeGreaterThan(
          statsBefore.counting.correct
        );
        expect(body.stats.counting.incorrect).toBeGreaterThanOrEqual(
          statsBefore.counting.incorrect
        );
        expect(body.stats.overallAccuracy).toBeGreaterThanOrEqual(
          statsBefore.overallAccuracy
        );
      });
      test("Should return 400 for empty math result", async () => {
        const aliceToken = await getAuthToken("alice123");
        const mathResult = {};
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(mathResult)
          .expect(400);

        expect(message).toBe(
          "Invalid math result data - missing required fields or invalid type"
        );
      });
      test("Should return 400 for invalid child ID", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/invalid/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(400);

        expect(message).toBe("Invalid number format for childId");
      });
      test("Should return 401 when no token is provided", async () => {
        const mathResult = {
          correct: 10,
          type: "addition",
        };
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/math")
          .send(mathResult)
          .expect(401);

        expect(message).toBe("Please log in");
      });
      test("Should return 401 for invalid token", async () => {
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/math")
          .set("Authorization", `Bearer invalid`)
          .expect(401);
        expect(message).toBe("Invalid token");
      });
      test("Should return 403 when trying to access another parent's child profile", async () => {
        const bobToken = await getAuthToken("bob123");
        const mathResult = {
          correct: 10,
          type: "addition",
        };
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${bobToken}`)
          .send(mathResult)
          .expect(403);

        expect(message).toBe(
          "You are not authorized to access this child's profile"
        );
      });
      test("Should return 403 for non-parent user", async () => {
        const daveToken = await getAuthToken("dave123");
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/math")
          .set("Authorization", `Bearer ${daveToken}`)
          .expect(403);

        expect(message).toBe("You need to be a parent to access this resource");
      });
      test("Should return 404 for non-existent child profile", async () => {
        const aliceToken = await getAuthToken("alice123");
        const mathResult = {
          correct: 10,
          type: "addition",
        };
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/999/stats/math")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(mathResult)
          .expect(404);

        expect(message).toBe("Child profile not found");
      });
    });
    describe("POST /api/children/:childId/stats/spelling/:wordId", () => {
      test("Should update spelling stats", async () => {
        const aliceToken = await getAuthToken("alice123");
        const profileCheck = await request(app)
          .get("/api/children/1/stats/spelling")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const statsBefore = profileCheck.body.spellingStats.stats;

        const spellingResult = {
          hintsUsed: 1,
          totalCorrectGuesses: 3,
          totalIncorrectGuesses: 1,
        };
        const { body } = await request(app)
          .post(`/api/children/1/stats/spelling/1`)
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
        expect(body.spelling_stats.totalGames).toBeGreaterThan(
          statsBefore.totalGames
        );
        expect(body.spelling_stats.accuracy).toBeGreaterThanOrEqual(
          statsBefore.accuracy
        );
        expect(body.spelling_stats.total_hints_used).toBeGreaterThan(
          statsBefore.total_hints_used
        );
        expect(body.spelling_stats.total_correct_guesses).toBeGreaterThan(
          statsBefore.total_correct_guesses
        );
        expect(body.spelling_stats.total_incorrect_guesses).toBeGreaterThan(
          statsBefore.total_incorrect_guesses
        );
      });
      test("Should accept API-facing spelling attempt fields with a session ID", async () => {
        const aliceToken = await getAuthToken("alice123");
        const { body } = await request(app)
          .post("/api/children/1/stats/spelling/1")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send({
            sessionId: "spelling-attempt-fields",
            correct_attempts: 2,
            total_attempts: 3,
            timeSpent: 20,
            hintsUsed: 1,
          })
          .expect(201);

        expect(body.spelling_stats.total_correct_guesses).toBeGreaterThanOrEqual(2);
        expect(body.spelling_stats.total_incorrect_guesses).toBeGreaterThanOrEqual(1);
      });
      test("Should treat duplicate spelling session IDs as idempotent", async () => {
        const aliceToken = await getAuthToken("alice123");
        const spellingResult = {
          sessionId: "spelling-duplicate-session",
          correct_attempts: 1,
          total_attempts: 1,
          timeSpent: 12,
          hintsUsed: 0,
        };

        const first = await request(app)
          .post("/api/children/1/stats/spelling/2")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(spellingResult)
          .expect(201);
        const second = await request(app)
          .post("/api/children/1/stats/spelling/2")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(spellingResult)
          .expect(200);

        expect(second.body).toMatchObject(first.body);
      });
      test("Should return 404 for invalid word ID", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/spelling/999")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send({
            sessionId: "missing-word-session",
            correct_attempts: 1,
            total_attempts: 1,
            timeSpent: 12,
            hintsUsed: 0,
          })
          .expect(404);

        expect(message).toBe("Word not found");
      });
      test("Should only increment total_learned_words if it's a new word", async () => {
        const aliceToken = await getAuthToken("alice123");
        const spellingResult = {
          hintsUsed: 0,
          totalCorrectGuesses: 8,
          totalIncorrectGuesses: 0,
        };
        await request(app)
          .post(`/api/children/1/stats/spelling/3`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(spellingResult)
          .expect(201);
        const {
          body: { learnedWord },
        } = await request(app)
          .get("/api/children/1/learned-words/3")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        expect(learnedWord.times_learned).toBe(1);
      });
      test("Should update child's level when spelling stats are updated", async () => {
        const aliceToken = await getAuthToken("alice123");
        const profileCheck = await request(app)
          .get("/api/users/1/children/1")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const levelCheckBefore = profileCheck.body.childProfile;

        const spellingResult = {
          hintsUsed: 0,
          totalCorrectGuesses: 8,
          totalIncorrectGuesses: 0,
        };

        await request(app)
          .post(`/api/children/1/stats/spelling/3`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(spellingResult)
          .expect(201);

        const { body } = await request(app)
          .get("/api/users/1/children/1")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const levelCheckAfter = body.childProfile;
        expect(levelCheckAfter.level).toBeGreaterThan(levelCheckBefore.level);
      });
      test("Should return 400 for invalid spelling result data", async () => {
        const aliceToken = await getAuthToken("alice123");

        const {
          body: { message: typeMessage },
        } = await request(app)
          .post(`/api/children/1/stats/spelling/1`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .send({ hintsUsed: "invalid" })
          .expect(400);

        expect(typeMessage).toBe("Invalid spelling result data types");
      });
      test("Should return 400 for invalid child ID", async () => {
        const aliceToken = await getAuthToken("alice123");

        const {
          body: { message },
        } = await request(app)
          .post(`/api/children/invalid/stats/spelling/1`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .send({ hintsUsed: 0 })
          .expect(400);

        expect(message).toBe("Invalid number format for childId");
      });
      test("Should return 401 when no token is provided", async () => {
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/spelling/1")
          .expect(401);

        expect(message).toBe("Please log in");
      });
      test("Should return 401 for invalid token", async () => {
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/spelling/1")
          .set("Authorization", `Bearer invalid`)
          .expect(401);

        expect(message).toBe("Invalid token");
      });
      test("Should return 403 when trying to access another parent's child profile", async () => {
        const bobToken = await getAuthToken("bob123");

        const {
          body: { message },
        } = await request(app)
          .post(`/api/children/1/stats/spelling/1`)
          .set("Authorization", `Bearer ${bobToken}`)
          .expect(403);

        expect(message).toBe(
          "You are not authorized to access this child's profile"
        );
      });
      test("Should return 403 for non-parent user", async () => {
        const daveToken = await getAuthToken("dave123");
        const {
          body: { message },
        } = await request(app)
          .post(`/api/children/1/stats/spelling/1`)
          .set("Authorization", `Bearer ${daveToken}`)
          .expect(403);

        expect(message).toBe("You need to be a parent to access this resource");
      });
      test("Should return 404 for non-existent child profile", async () => {
        const aliceToken = await getAuthToken("alice123");

        const {
          body: { message },
        } = await request(app)
          .post(`/api/children/999/stats/spelling/1`)
          .set("Authorization", `Bearer ${aliceToken}`)
          .send({ hintsUsed: 0 })
          .expect(404);

        expect(message).toBe("Child profile not found");
      });
    });
    describe("POST /api/children/:childId/stats/memory", () => {
      test("Should successfully update child's memory stats from picture activity", async () => {
        const aliceToken = await getAuthToken("alice123");

        const profileCheck = await request(app)
          .get("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const statsBefore = profileCheck.body.memoryStats.stats;

        const memoryResult = {
          totalMoves: 10,
          timeSpent: 35,
          type: "picture",
        };

        const { body } = await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(memoryResult)
          .expect(201);

        expect(body.stats.picture.totalMoves).toBeGreaterThan(
          statsBefore.picture.totalMoves
        );
        expect(body.stats.picture.totalTimeSecs).toBeGreaterThan(
          statsBefore.picture.totalTimeSecs
        );
        expect(body.stats.picture.gamesPlayed).toBeGreaterThan(
          statsBefore.picture.gamesPlayed
        );
        expect(body.stats.picture.bestTimeSecs).toStrictEqual(
          expect.any(Number)
        );
        expect(body.stats.picture.fewestMoves).toStrictEqual(
          expect.any(Number)
        );
      });
      test("Should successfully update child's memory stats from sound activity", async () => {
        const aliceToken = await getAuthToken("alice123");

        const profileCheck = await request(app)
          .get("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const statsBefore = profileCheck.body.memoryStats.stats;

        const memoryResult = {
          totalMoves: 10,
          timeSpent: 35,
          type: "sound",
        };

        const { body } = await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(memoryResult)
          .expect(201);

        expect(body.stats.sound.totalMoves).toBeGreaterThan(
          statsBefore.sound.totalMoves
        );
        expect(body.stats.sound.totalTimeSecs).toBeGreaterThan(
          statsBefore.sound.totalTimeSecs
        );
        expect(body.stats.sound.gamesPlayed).toBeGreaterThan(
          statsBefore.sound.gamesPlayed
        );
        expect(body.stats.sound.bestTimeSecs).toStrictEqual(expect.any(Number));
        expect(body.stats.sound.fewestMoves).toStrictEqual(expect.any(Number));
      });
      test("Should accept an update without a time spent field", async () => {
        const aliceToken = await getAuthToken("alice123");

        const profileCheck = await request(app)
          .get("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const totalTimeBefore =
          profileCheck.body.memoryStats.stats.totalTimeSecs;

        const memoryResult = {
          totalMoves: 10,
          type: "picture",
        };

        const { body } = await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(memoryResult)
          .expect(201);
        expect(body.stats.totalTimeSecs).toEqual(totalTimeBefore);
      });
      test("Should update the overall stats correctly", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { memoryStats },
        } = await request(app)
          .get("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);

        const statsBefore = memoryStats.stats;

        const memoryResult = {
          totalMoves: 10,
          timeSpent: 35,
          type: "picture",
        };

        const { body } = await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(memoryResult)
          .expect(201);

        expect(body.stats.totalGames).toBeGreaterThan(statsBefore.totalGames);
        expect(body.stats.totalMoves).toBeGreaterThan(statsBefore.totalMoves);
        expect(body.stats.totalTimeSecs).toBeGreaterThan(
          statsBefore.totalTimeSecs
        );
        expect(body.stats.bestTimeSecs).toStrictEqual(expect.any(Number));
        expect(body.stats.fewestMoves).toStrictEqual(expect.any(Number));
      });
      test("Should treat duplicate memory session IDs as idempotent", async () => {
        const aliceToken = await getAuthToken("alice123");
        const memoryResult = {
          sessionId: "memory-duplicate-session",
          totalMoves: 10,
          timeSpent: 35,
          type: "picture",
        };

        const first = await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(memoryResult)
          .expect(201);
        const second = await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(memoryResult)
          .expect(200);

        expect(second.body).toMatchObject(first.body);
      });
      test("Should reject excessive memory time values", async () => {
        const aliceToken = await getAuthToken("alice123");
        await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send({
            sessionId: "bad-memory-time",
            totalMoves: 10,
            timeSpent: 999999,
            type: "picture",
          })
          .expect(400);
      });
      test("Should return 400 for invalid memory result data", async () => {
        const aliceToken = await getAuthToken("alice123");
        const memoryResult = {
          totalMoves: "invalid", // Invalid type for totalMoves
          type: "picture",
        };
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(memoryResult)
          .expect(400);
        expect(message).toBe(
          "Invalid memory result data - missing required fields or invalid type"
        );
      });
      test("Should return 400 for invalid child ID", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/invalid/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(400);
        expect(message).toBe("Invalid number format for childId");
      });
      test("Should return 401 when no token is provided", async () => {
        const {
          body: { message },
        } = await request(app).post("/api/children/1/stats/memory").expect(401);

        expect(message).toBe("Please log in");
      });
      test("Should return 401 for invalid token", async () => {
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer invalid`)
          .expect(401);
        expect(message).toBe("Invalid token");
      });
      test("Should return 403 when trying to access another parent's child profile", async () => {
        const bobToken = await getAuthToken("bob123");
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${bobToken}`)
          .expect(403);

        expect(message).toBe(
          "You are not authorized to access this child's profile"
        );
      });
      test("Should return 403 for non-parent user", async () => {
        const daveToken = await getAuthToken("dave123");
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/memory")
          .set("Authorization", `Bearer ${daveToken}`)
          .expect(403);

        expect(message).toBe("You need to be a parent to access this resource");
      });
      test("Should return 404 for non-existent child profile", async () => {
        const aliceToken = await getAuthToken("alice123");
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/999/stats/memory")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(404);
        expect(message).toBe("Child profile not found");
      });
    });
    describe("POST /api/children/:childId/stats/shapes", () => {
      test("Should successfully update child's shapes stats", async () => {
        const aliceToken = await getAuthToken("alice123");
        const profileCheck = await request(app)
          .get("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const statsBefore = profileCheck.body.shapeStats;

        const shapesResult = {
          correct: 12,
          incorrect: 0,
          timeSpent: 35,
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
        expect(body.stats.totalGames).toBeGreaterThan(
          statsBefore.stats.totalGames
        );
        expect(body.stats.totalShapes).toBeGreaterThan(
          statsBefore.stats.totalShapes
        );
        expect(body.stats.bestTimeSecs).toBeLessThanOrEqual(
          statsBefore.stats.bestTimeSecs
        );
        expect(body.stats.totalTimeSecs).toBeGreaterThan(
          statsBefore.stats.totalTimeSecs
        );
        expect(body.stats.overallAccuracy).toBeGreaterThanOrEqual(
          statsBefore.stats.overallAccuracy
        );
        expect(body.stats.totalCorrectShapes).toBeGreaterThan(
          statsBefore.stats.totalCorrectShapes
        );
        expect(body.stats.totalIncorrectShapes).toBeGreaterThanOrEqual(
          statsBefore.stats.totalIncorrectShapes
        );
      });
      test("Should return the same response for a duplicate shapes session", async () => {
        const aliceToken = await getAuthToken("alice123");
        const shapesResult = {
          sessionId: "shapes-duplicate-session",
          correct: 6,
          incorrect: 1,
          timeSpent: 30,
        };

        const first = await request(app)
          .post("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(shapesResult)
          .expect(201);
        const second = await request(app)
          .post("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(shapesResult)
          .expect(200);

        expect(second.body).toMatchObject(first.body);
        const statsCheck = await request(app)
          .get("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        expect(statsCheck.body.shapeStats.stats.totalGames).toBe(
          first.body.stats.totalGames
        );
      });
      test("Should update child's level when shapes stats are updated", async () => {
        const aliceToken = await getAuthToken("alice123");
        const profileCheck = await request(app)
          .get("/api/users/1/children/1")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const levelCheckBefore = profileCheck.body.childProfile;

        const shapesResult = {
          correct: 5,
          incorrect: 0,
          timeSpent: 35,
        };

        await request(app)
          .post("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(shapesResult)
          .expect(201);

        const { body } = await request(app)
          .get("/api/users/1/children/1")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const levelCheckAfter = body.childProfile;
        expect(levelCheckAfter.level).toBeGreaterThan(levelCheckBefore.level);
      });
      test("Should accept an update without a time spent field", async () => {
        const aliceToken = await getAuthToken("alice123");

        const profileCheck = await request(app)
          .get("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .expect(200);
        const totalTimeBefore =
          profileCheck.body.shapeStats.stats.totalTimeSecs;

        const shapesResult = {
          correct: 12,
          incorrect: 0,
        };

        const { body } = await request(app)
          .post("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(shapesResult)
          .expect(201);
        expect(body.stats.totalTimeSecs).toEqual(totalTimeBefore);
      });
      test("Should return 400 for invalid shapes result data", async () => {
        const aliceToken = await getAuthToken("alice123");
        const shapesResult = {
          incorrect: 15,
        };
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(shapesResult)
          .expect(400);
        expect(message).toBe(
          "Invalid shape result data - missing required fields or invalid type"
        );
      });
      test("Should return 400 for malformed shapes values", async () => {
        const aliceToken = await getAuthToken("alice123");

        await request(app)
          .post("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send({
            sessionId: "bad-shapes-session",
            correct: -1,
            incorrect: 0,
            timeSpent: 20,
          })
          .expect(400);

        await request(app)
          .post("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send({
            sessionId: "bad-shapes-time",
            correct: 1,
            incorrect: 0,
            timeSpent: 60 * 60 * 4,
          })
          .expect(400);
      });
      test("Should return 400 for invalid child ID", async () => {
        const aliceToken = await getAuthToken("alice123");
        const shapesResult = {
          incorrect: 15,
        };
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/invalid/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(shapesResult)
          .expect(400);
        expect(message).toBe("Invalid number format for childId");
      });
      test("Should return 401 when no token is provided", async () => {
        const shapesResult = {
          incorrect: 15,
        };
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/shapes")
          .send(shapesResult)
          .expect(401);

        expect(message).toBe("Please log in");
      });
      test("Should return 401 for invalid token", async () => {
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer invalid`)
          .expect(401);
        expect(message).toBe("Invalid token");
      });
      test("Should return 403 when trying to access another parent's child profile", async () => {
        const bobToken = await getAuthToken("bob123");
        const shapesResult = {
          incorrect: 15,
        };
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${bobToken}`)
          .send(shapesResult)
          .expect(403);

        expect(message).toBe(
          "You are not authorized to access this child's profile"
        );
      });
      test("Should return 403 for non-parent user", async () => {
        const daveToken = await getAuthToken("dave123");
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/1/stats/shapes")
          .set("Authorization", `Bearer ${daveToken}`)
          .expect(403);

        expect(message).toBe("You need to be a parent to access this resource");
      });
      test("Should return 404 for non-existent child profile", async () => {
        const aliceToken = await getAuthToken("alice123");
        const shapesResult = {
          incorrect: 15,
        };
        const {
          body: { message },
        } = await request(app)
          .post("/api/children/999/stats/shapes")
          .set("Authorization", `Bearer ${aliceToken}`)
          .send(shapesResult)
          .expect(404);
        expect(message).toBe("Child profile not found");
      });
    });
  });
});

describe("Learned words endpoints", () => {
  describe("GET /api/children/:childId/learned-words", () => {
    test("should return all learned words by child id", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { learnedWords },
      } = await request(app)
        .get("/api/children/1/learned-words")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(learnedWords[0]).toMatchObject({
        id: expect.any(Number),
        word_id: expect.any(Number),
        word: expect.any(String),
        image: expect.any(String),
        category: expect.any(String),
        learned_at: expect.any(String),
        times_learned: expect.any(Number),
        child_id: expect.any(Number),
      });
    });
    test("should return 400 if invalid child id", async () => {
      const authToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/invalid/learned-words")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(response.body.message).toBe("Invalid number format for childId");
    });
    test("should return 401 if not authenticated", async () => {
      const response = await request(app)
        .get("/api/children/1/learned-words")
        .expect(401);
      expect(response.body.message).toBe("Please log in");
    });
    test("should return 401 if invalid token", async () => {
      const response = await request(app)
        .get("/api/children/1/learned-words")
        .set("Authorization", `Bearer invalid`)
        .expect(401);
      expect(response.body.message).toBe("Invalid token");
    });
    test("should return 403 if not parent of child", async () => {
      const authToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/3/learned-words")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
      expect(response.body.message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("should return 403 if not parent", async () => {
      const daveToken = await getAuthToken("dave123");
      const response = await request(app)
        .get("/api/children/1/learned-words")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(403);
      expect(response.body.message).toBe(
        "You need to be a parent to access this resource"
      );
    });
    test("should return 404 if child not found", async () => {
      const authToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/999/learned-words")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(response.body.message).toBe("Child profile not found");
    });
  });
  describe("POST /api/children/:childId/learned-words/:wordId", () => {
    test("should add a learned word for a child", async () => {
      const authToken = await getAuthToken("alice123");
      const response = await request(app)
        .post("/api/children/1/learned-words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(201);
      expect(response.body.learnedWord).toMatchObject({
        id: expect.any(Number),
        word_id: expect.any(Number),
        word: expect.any(String),
        image: expect.any(String),
        category: expect.any(String),
        learned_at: expect.any(String),
        times_learned: expect.any(Number),
      });
    });
    test("should add a duplicate learned word for a child", async () => {
      const authToken = await getAuthToken("alice123");
      const {
        body: { learnedWord },
      } = await request(app)
        .post("/api/children/1/learned-words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(201);
      expect(learnedWord.times_learned).toBe(2);
      const {
        body: { learnedWord: responseLearnedWord },
      } = await request(app)
        .post("/api/children/1/learned-words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(201);
      expect(responseLearnedWord.times_learned).toBe(3);
    });
    test("should return 400 if wordId is not a valid id", async () => {
      const authToken = await getAuthToken("alice123");
      const response = await request(app)
        .post("/api/children/1/learned-words/abc")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(response.body.message).toBe("Invalid number format for wordId");
    });
    test("should return 400 if childId is not a valid id", async () => {
      const authToken = await getAuthToken("alice123");
      const response = await request(app)
        .post("/api/children/abc/learned-words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
      expect(response.body.message).toBe("Invalid number format for childId");
    });
    test("should return 401 if not authenticated", async () => {
      const response = await request(app)
        .post("/api/children/1/learned-words/1")
        .expect(401);
      expect(response.body.message).toBe("Please log in");
    });
    test("should return 401 if token is invalid", async () => {
      const response = await request(app)
        .post("/api/children/1/learned-words/1")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);
      expect(response.body.message).toBe("Invalid token");
    });
    test("should return 403 if user is not the owner of the child", async () => {
      const authToken = await getAuthToken("alice123");
      const response = await request(app)
        .post("/api/children/3/learned-words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
      expect(response.body.message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("should return 404 if word not found", async () => {
      const authToken = await getAuthToken("alice123");
      const response = await request(app)
        .post("/api/children/1/learned-words/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(response.body.message).toBe("Word not found");
    });
    test("should return 404 if child not found", async () => {
      const authToken = await getAuthToken("alice123");
      const response = await request(app)
        .post("/api/children/999/learned-words/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
      expect(response.body.message).toBe("Child profile not found");
    });
  });
});

describe("Daily Challenges endpoints", () => {
  describe("GET /api/children/:childId/challenges/daily", () => {
    test("Should successfully retrieve daily challenges for a child", async () => {
      const aliceToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/1/challenges/daily")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        dailyChallenges: expect.any(Array),
        totalChallenges: expect.any(Number),
        completedToday: expect.any(Number),
      });

      if (response.body.dailyChallenges.length > 0) {
        response.body.dailyChallenges.forEach((challenge: Achievement) => {
          expect(challenge).toMatchObject({
            id: expect.any(Number),
            title: expect.any(String),
            description: expect.any(String),
            criteria: expect.any(String),
            required_value: expect.any(Number),
            xp_reward: expect.any(Number),
            points_reward: expect.any(Number),
            is_achieved: expect.any(Boolean),
            category: expect.any(String),
          });
        });
      }
    });
    test("Should return empty array when no daily challenges exist", async () => {
      const aliceToken = await getAuthToken("alice123");
      // Test with a child that has no daily challenges set up
      const response = await request(app)
        .get("/api/children/2/challenges/daily")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        dailyChallenges: expect.any(Array),
        totalChallenges: expect.any(Number),
        completedToday: expect.any(Number),
      });
    });
    test("Should return 400 for invalid child ID", async () => {
      const aliceToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/invalid/challenges/daily")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);

      expect(response.body.message).toBe("Invalid number format for childId");
    });
    test("Should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get("/api/children/1/challenges/daily")
        .expect(401);

      expect(response.body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/api/children/1/challenges/daily")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);

      expect(response.body.message).toBe("Invalid token");
    });
    test("Should return 403 for non-parent user", async () => {
      const daveToken = await getAuthToken("dave123");
      const response = await request(app)
        .get("/api/children/1/challenges/daily")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(403);

      expect(response.body.message).toBe(
        "You need to be a parent to access this resource"
      );
    });
    test("Should return 403 when trying to access another parent's child", async () => {
      const aliceToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/3/challenges/daily")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(403);

      expect(response.body.message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("Should return 404 for non-existent child profile", async () => {
      const aliceToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/999/challenges/daily")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);

      expect(response.body.message).toBe("Child profile not found");
    });
  });
});

describe("Weekly Reports endpoints", () => {
  describe("GET /api/children/:childId/reports/weekly", () => {
    test("Should successfully retrieve weekly progress report", async () => {
      const aliceToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/1/reports/weekly")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        weeklyReport: expect.objectContaining({
          totalWeeklyGoals: expect.any(Number),
          completed: expect.any(Number),
          inProgress: expect.any(Number),
          notStarted: expect.any(Number),
          achievements: expect.any(Array),
        }),
      });

      if (response.body.weeklyReport.achievements.length > 0) {
        response.body.weeklyReport.achievements.forEach(
          (achievement: Achievement) => {
            expect(achievement).toMatchObject({
              id: expect.any(Number),
              title: expect.any(String),
              description: expect.any(String),
              criteria: expect.any(String),
              required_value: expect.any(Number),
              xp_reward: expect.any(Number),
              points_reward: expect.any(Number),
              is_achieved: expect.any(Boolean),
              category: expect.any(String),
            });
          }
        );
      }
    });
    test("Should return correct progress categorization", async () => {
      const aliceToken = await getAuthToken("alice123");

      await request(app)
        .post("/api/children/1/stats/math")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({
          correct: 21,
          incorrect: 0,
          timeSpent: 30,
          type: "addition",
        })
        .expect(201);

      const response = await request(app)
        .get("/api/children/1/reports/weekly")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(200);

      const report = response.body.weeklyReport;

      // Verify the totals add up correctly
      expect(report.completed + report.inProgress + report.notStarted).toBe(
        report.totalWeeklyGoals
      );

      // Verify each category is a non-negative number
      expect(report.completed).toBeGreaterThanOrEqual(0);
      expect(report.inProgress).toBeGreaterThanOrEqual(0);
      expect(report.notStarted).toBeGreaterThanOrEqual(0);
    });
    test("Should return 400 for invalid child ID", async () => {
      const aliceToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/invalid/reports/weekly")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(400);

      expect(response.body.message).toBe("Invalid number format for childId");
    });
    test("Should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get("/api/children/1/reports/weekly")
        .expect(401);

      expect(response.body.message).toBe("Please log in");
    });
    test("Should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/api/children/1/reports/weekly")
        .set("Authorization", `Bearer invalid-token`)
        .expect(401);

      expect(response.body.message).toBe("Invalid token");
    });
    test("Should return 403 for non-parent user", async () => {
      const daveToken = await getAuthToken("dave123");
      const response = await request(app)
        .get("/api/children/1/reports/weekly")
        .set("Authorization", `Bearer ${daveToken}`)
        .expect(403);

      expect(response.body.message).toBe(
        "You need to be a parent to access this resource"
      );
    });
    test("Should return 403 when trying to access another parent's child", async () => {
      const aliceToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/3/reports/weekly")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(403);

      expect(response.body.message).toBe(
        "You are not authorized to access this child's profile"
      );
    });
    test("Should return 404 for non-existent child profile", async () => {
      const aliceToken = await getAuthToken("alice123");
      const response = await request(app)
        .get("/api/children/999/reports/weekly")
        .set("Authorization", `Bearer ${aliceToken}`)
        .expect(404);

      expect(response.body.message).toBe("Child profile not found");
    });
  });
});
