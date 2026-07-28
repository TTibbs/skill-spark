import app from "../app";
import request from "supertest";
import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data/index";
import { SeedData } from "../types";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

const expectEmptySpellingStats = (spellingStats: {
  stats: {
    totalGames: number;
    total_learned_words: number;
    total_hints_used: number;
    total_correct_guesses: number;
    total_incorrect_guesses: number;
    accuracy: number;
  };
  learned_words?: unknown[];
}) => {
  expect(spellingStats.stats).toMatchObject({
    totalGames: 0,
    total_learned_words: 0,
    total_hints_used: 0,
    total_correct_guesses: 0,
    total_incorrect_guesses: 0,
    accuracy: 0,
  });
  expect(spellingStats.learned_words).toEqual([]);
};

describe("E2E Tests", () => {
  test("Register a new user and create a child profile", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const login = await request(app)
      .post("/api/auth/login")
      .send({
        username: "test",
        password: "password123",
      })
      .expect(200);
    const userID = login.body.data.user.id;
    const accessToken = login.body.data.accessToken;

    const {
      body: { newChildProfile },
    } = await request(app)
      .post(`/api/users/${userID}/children`)
      .send({
        name: "testchild",
        age: 5,
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    expect(newChildProfile.name).toBe("testchild");
    expect(newChildProfile.age).toBe(5);
  });
  test("Register a new user and create a child profile and play a addition activity and update math stats", async () => {
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;
    const accessToken = registerResponse.data.accessToken;

    const {
      body: { newChildProfile },
    } = await request(app)
      .post(`/api/users/${userID}/children`)
      .send({
        name: "testchild",
        age: 5,
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    const childId = newChildProfile.id;

    const profileCheck = await request(app)
      .get(`/api/children/${childId}/stats/spelling`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expectEmptySpellingStats(profileCheck.body.spellingStats);

    const mathResult = {
      correct: 6,
      incorrect: 0,
      type: "addition",
    };
    const { body } = await request(app)
      .post(`/api/children/${childId}/stats/math`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mathResult)
      .expect(201);

    expect(body).toMatchObject({
      child: expect.any(Object),
      stats: expect.any(Object),
      xpEarned: expect.any(Number),
      message: "Math stats updated and achievements checked",
      completedAchievements: expect.any(Array),
    });
    expect(body.stats.totalProblems).toBe(6);
    expect(body.stats.correctAnswers).toBe(6);
    expect(body.stats.incorrectAnswers).toBe(0);
    expect(body.stats.overallAccuracy).toBe(100);
    expect(body.stats.addition.correct).toBe(6);
    expect(body.stats.addition.incorrect).toBe(0);
    expect(body.stats.addition.accuracy).toBe(100);
  });
  test("Register a new user and create a child profile and play a subtraction activity and update math stats", async () => {
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;
    const accessToken = registerResponse.data.accessToken;

    const {
      body: { newChildProfile },
    } = await request(app)
      .post(`/api/users/${userID}/children`)
      .send({
        name: "testchild",
        age: 5,
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    const childId = newChildProfile.id;

    const profileCheck = await request(app)
      .get(`/api/children/${childId}/stats/spelling`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expectEmptySpellingStats(profileCheck.body.spellingStats);

    const mathResult = {
      correct: 6,
      incorrect: 0,
      type: "subtraction",
    };
    const { body } = await request(app)
      .post(`/api/children/${childId}/stats/math`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mathResult)
      .expect(201);

    expect(body).toMatchObject({
      child: expect.any(Object),
      stats: expect.any(Object),
      xpEarned: expect.any(Number),
      message: "Math stats updated and achievements checked",
      completedAchievements: expect.any(Array),
    });
    expect(body.stats.totalProblems).toBe(6);
    expect(body.stats.correctAnswers).toBe(6);
    expect(body.stats.incorrectAnswers).toBe(0);
    expect(body.stats.overallAccuracy).toBe(100);
    expect(body.stats.subtraction.correct).toBe(6);
    expect(body.stats.subtraction.incorrect).toBe(0);
    expect(body.stats.subtraction.accuracy).toBe(100);
  });
  test("Register a new user and create a child profile and play a multiplication activity and update math stats", async () => {
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;
    const accessToken = registerResponse.data.accessToken;

    const {
      body: { newChildProfile },
    } = await request(app)
      .post(`/api/users/${userID}/children`)
      .send({
        name: "testchild",
        age: 5,
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    const childId = newChildProfile.id;

    const profileCheck = await request(app)
      .get(`/api/children/${childId}/stats/spelling`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expectEmptySpellingStats(profileCheck.body.spellingStats);

    const mathResult = {
      correct: 6,
      incorrect: 0,
      type: "multiplication",
    };
    const { body } = await request(app)
      .post(`/api/children/${childId}/stats/math`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mathResult)
      .expect(201);

    expect(body).toMatchObject({
      child: expect.any(Object),
      stats: expect.any(Object),
      xpEarned: expect.any(Number),
      message: "Math stats updated and achievements checked",
      completedAchievements: expect.any(Array),
    });
    expect(body.stats.totalProblems).toBe(6);
    expect(body.stats.correctAnswers).toBe(6);
    expect(body.stats.incorrectAnswers).toBe(0);
    expect(body.stats.overallAccuracy).toBe(100);
    expect(body.stats.multiplication.correct).toBe(6);
    expect(body.stats.multiplication.incorrect).toBe(0);
    expect(body.stats.multiplication.accuracy).toBe(100);
  });
  test("Register a new user and create a child profile and play a division activity and update math stats", async () => {
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;
    const accessToken = registerResponse.data.accessToken;

    const {
      body: { newChildProfile },
    } = await request(app)
      .post(`/api/users/${userID}/children`)
      .send({
        name: "testchild",
        age: 5,
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    const childId = newChildProfile.id;

    const profileCheck = await request(app)
      .get(`/api/children/${childId}/stats/spelling`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expectEmptySpellingStats(profileCheck.body.spellingStats);

    const mathResult = {
      correct: 6,
      incorrect: 0,
      type: "division",
    };
    const { body } = await request(app)
      .post(`/api/children/${childId}/stats/math`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mathResult)
      .expect(201);

    expect(body).toMatchObject({
      child: expect.any(Object),
      stats: expect.any(Object),
      xpEarned: expect.any(Number),
      message: "Math stats updated and achievements checked",
      completedAchievements: expect.any(Array),
    });
    expect(body.stats.totalProblems).toBe(6);
    expect(body.stats.correctAnswers).toBe(6);
    expect(body.stats.incorrectAnswers).toBe(0);
    expect(body.stats.overallAccuracy).toBe(100);
    expect(body.stats.division.correct).toBe(6);
    expect(body.stats.division.incorrect).toBe(0);
    expect(body.stats.division.accuracy).toBe(100);
  });
  test("Register a new user and create a child profile and play a counting activity and update math stats", async () => {
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;
    const accessToken = registerResponse.data.accessToken;

    const {
      body: { newChildProfile },
    } = await request(app)
      .post(`/api/users/${userID}/children`)
      .send({
        name: "testchild",
        age: 5,
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    const childId = newChildProfile.id;

    const profileCheck = await request(app)
      .get(`/api/children/${childId}/stats/spelling`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expectEmptySpellingStats(profileCheck.body.spellingStats);

    const mathResult = {
      correct: 6,
      incorrect: 0,
      type: "counting",
    };
    const { body } = await request(app)
      .post(`/api/children/${childId}/stats/math`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mathResult)
      .expect(201);

    expect(body).toMatchObject({
      child: expect.any(Object),
      stats: expect.any(Object),
      xpEarned: expect.any(Number),
      message: "Math stats updated and achievements checked",
      completedAchievements: expect.any(Array),
    });
    expect(body.stats.totalProblems).toBe(6);
    expect(body.stats.correctAnswers).toBe(6);
    expect(body.stats.incorrectAnswers).toBe(0);
    expect(body.stats.overallAccuracy).toBe(100);
    expect(body.stats.counting.correct).toBe(6);
    expect(body.stats.counting.incorrect).toBe(0);
    expect(body.stats.counting.accuracy).toBe(100);
  });
  test("Register a new user and create a child profile and play a word activity and update spelling stats", async () => {
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;
    const accessToken = registerResponse.data.accessToken;

    const {
      body: { newChildProfile },
    } = await request(app)
      .post(`/api/users/${userID}/children`)
      .send({
        name: "testchild",
        age: 5,
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    const childId = newChildProfile.id;

    const profileCheck = await request(app)
      .get(`/api/children/${childId}/stats/spelling`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expectEmptySpellingStats(profileCheck.body.spellingStats);

    const spellingResult = {
      hintsUsed: 1,
      totalCorrectGuesses: 3,
      totalIncorrectGuesses: 0,
    };
    const { body } = await request(app)
      .post(`/api/children/${childId}/stats/spelling/1`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(spellingResult)
      .expect(201);

    expect(body).toMatchObject({
      child: expect.any(Object),
      spelling_stats: expect.any(Object),
      xpEarned: expect.any(Number),
      message: "Spelling stats updated and achievements checked",
      completedAchievements: expect.any(Array),
    });
    expect(body.spelling_stats.accuracy).toBe(100);
    expect(body.spelling_stats.total_hints_used).toBe(1);
    expect(body.spelling_stats.total_correct_guesses).toBe(3);
    expect(body.spelling_stats.total_incorrect_guesses).toBe(0);
    expect(body.spelling_stats.total_learned_words).toBe(1);
  });
  test("Register a new user and create a child profile and play a picture memory activity and update memory stats", async () => {
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;
    const accessToken = registerResponse.data.accessToken;

    const {
      body: { newChildProfile },
    } = await request(app)
      .post(`/api/users/${userID}/children`)
      .send({
        name: "testchild",
        age: 5,
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    const childId = newChildProfile.id;

    const profileCheck = await request(app)
      .get(`/api/children/${childId}/stats/spelling`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expectEmptySpellingStats(profileCheck.body.spellingStats);

    const memoryResult = {
      totalMoves: 10,
      timeSpent: 35,
      type: "picture",
    };
    const { body } = await request(app)
      .post(`/api/children/${childId}/stats/memory`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(memoryResult)
      .expect(201);

    expect(body).toMatchObject({
      child: expect.any(Object),
      stats: expect.any(Object),
      xpEarned: expect.any(Number),
      message: "Memory stats updated and achievements checked",
      completedAchievements: expect.any(Array),
    });
    expect(body.stats.picture.totalMoves).toBe(10);
    expect(body.stats.picture.totalTimeSecs).toBe(35);
    expect(body.stats.picture.gamesPlayed).toBe(1);
    expect(body.stats.picture.bestTimeSecs).toBe(35);
    expect(body.stats.picture.fewestMoves).toBe(10);
  });
  test("Register a new user and create a child profile and play a sound memory activity and update memory stats", async () => {
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;
    const accessToken = registerResponse.data.accessToken;

    const {
      body: { newChildProfile },
    } = await request(app)
      .post(`/api/users/${userID}/children`)
      .send({
        name: "testchild",
        age: 5,
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    const childId = newChildProfile.id;

    const profileCheck = await request(app)
      .get(`/api/children/${childId}/stats/spelling`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expectEmptySpellingStats(profileCheck.body.spellingStats);

    const memoryResult = {
      totalMoves: 10,
      timeSpent: 35,
      type: "sound",
    };
    const { body } = await request(app)
      .post(`/api/children/${childId}/stats/memory`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(memoryResult)
      .expect(201);

    expect(body).toMatchObject({
      child: expect.any(Object),
      stats: expect.any(Object),
      xpEarned: expect.any(Number),
      message: "Memory stats updated and achievements checked",
      completedAchievements: expect.any(Array),
    });
    expect(body.stats.sound.totalMoves).toBe(10);
    expect(body.stats.sound.totalTimeSecs).toBe(35);
    expect(body.stats.sound.gamesPlayed).toBe(1);
    expect(body.stats.sound.bestTimeSecs).toBe(35);
    expect(body.stats.sound.fewestMoves).toBe(10);
  });
  test("Register a new user and create a child profile and play a shapes activity and update shapes stats", async () => {
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;
    const accessToken = registerResponse.data.accessToken;

    const {
      body: { newChildProfile },
    } = await request(app)
      .post(`/api/users/${userID}/children`)
      .send({
        name: "testchild",
        age: 5,
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    const childId = newChildProfile.id;

    const profileCheck = await request(app)
      .get(`/api/children/${childId}/stats/spelling`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expectEmptySpellingStats(profileCheck.body.spellingStats);

    const shapesResult = {
      correct: 12,
      incorrect: 0,
      timeSpent: 35,
    };
    const { body } = await request(app)
      .post(`/api/children/${childId}/stats/shapes`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(shapesResult)
      .expect(201);

    expect(body).toMatchObject({
      child: expect.any(Object),
      stats: expect.any(Object),
      xpEarned: expect.any(Number),
      message: "Shape stats updated and achievements checked",
      completedAchievements: expect.any(Array),
    });
    expect(body.stats.totalGames).toBe(1);
    expect(body.stats.totalShapes).toBe(12);
    expect(body.stats.bestTimeSecs).toBeLessThanOrEqual(35);
    expect(body.stats.totalTimeSecs).toBeGreaterThan(0);
    expect(body.stats.totalCorrectShapes).toBe(12);
    expect(body.stats.totalIncorrectShapes).toBe(0);
    expect(body.stats.overallAccuracy).toBe(100);
  });
  test("Register new user and check user preferences", async () => {
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;
    const accessToken = registerResponse.data.accessToken;

    const { body: preferences } = await request(app)
      .get(`/api/users/${userID}/preferences`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(preferences.theme).toBe("system");
    expect(preferences.language).toBe("en");
    expect(preferences.notificationsEnabled).toBe(false);
    expect(preferences.has_pin).toBe(false);
    expect(preferences).not.toHaveProperty("pin_key");
  });
  test("Login, refresh token, and verify user can still access protected endpoints", async () => {
    // Register a new user
    const { body: registerResponse } = await request(app)
      .post("/api/auth/register")
      .send({
        username: "test",
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);
    const userID = registerResponse.data.user.id;

    // Login to get a fresh refresh token
    const { body: loginResponse } = await request(app)
      .post("/api/auth/login")
      .send({
        username: "test",
        password: "password123",
      })
      .expect(200);
    const refreshToken = loginResponse.data.refreshToken;
    const loginAccessToken = loginResponse.data.accessToken;

    // Verify we can access a protected endpoint with the login access token
    await request(app)
      .get(`/api/users/${userID}/preferences`)
      .set("Authorization", `Bearer ${loginAccessToken}`)
      .expect(200);

    // Use the refresh token to get new tokens
    const { body: refreshResponse } = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken })
      .expect(200);

    const newAccessToken = refreshResponse.data.accessToken;
    const newRefreshToken = refreshResponse.data.refreshToken;

    // Verify we got new tokens (they should be different)
    expect(newAccessToken).not.toBe(loginAccessToken);
    expect(newRefreshToken).not.toBe(refreshToken);

    // Verify we can access a protected endpoint with the new access token
    await request(app)
      .get(`/api/users/${userID}/preferences`)
      .set("Authorization", `Bearer ${newAccessToken}`)
      .expect(200);

    // Verify the old refresh token can't be used again (token rotation)
    await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken })
      .expect(401);

    // Verify we can use the new refresh token to get another set of tokens
    const { body: secondRefreshResponse } = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: newRefreshToken })
      .expect(200);

    const secondNewAccessToken = secondRefreshResponse.data.accessToken;

    // Verify we can access a protected endpoint with the second new access token
    await request(app)
      .get(`/api/users/${userID}/preferences`)
      .set("Authorization", `Bearer ${secondNewAccessToken}`)
      .expect(200);
  });
});
