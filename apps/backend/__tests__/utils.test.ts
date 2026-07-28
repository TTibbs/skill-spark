import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data";
import { SeedData } from "../types";
import {
  calculateMathXP,
  calculateMemoryXP,
  calculateShapeXP,
  calculateWordXP,
} from "../utils";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

describe("Word XP Calculation", () => {
  test("should calculate xp for short words with perfect score", async () => {
    const xp = calculateWordXP("cat", 0, 3, 0);
    expect(xp).toBe(27);
  });
  test("should calculate XP correctly for medium words with perfect score", async () => {
    const xp = calculateWordXP("elephant", 0, 8, 0);
    expect(xp).toBe(29);
  });
  test("should calculate xp for long words with perfect score", async () => {
    const xp = calculateWordXP("playground", 0, 10, 0);
    expect(xp).toBe(30);
  });
  test("should calculate XP correctly for game over", async () => {
    const xp = calculateWordXP("elephant", 0, 0, 8);
    expect(xp).toBe(5);
  });
});

describe("Math XP Calculation", () => {
  test("should calculate XP correctly for perfect score", async () => {
    const xp = calculateMathXP(1, 0);
    expect(xp).toBe(15);
  });
  test("should calculate XP correctly for perfect score with more than 1 correct answer", async () => {
    const xp = calculateMathXP(2, 0);
    expect(xp).toBe(20);
  });
  test("should award 10xp for being a good sport if no answers are correct", async () => {
    const xp = calculateMathXP(0, 10);
    expect(xp).toBe(5);
  });
});

describe("Memory XP Calculation", () => {
  test("should calculate XP correctly for less than 12 moves and less than 30 seconds", async () => {
    const xp = calculateMemoryXP(11, 25);
    expect(xp).toBe(45);
  });
  test("should calculate XP correctly for less than 12 moves and less than 60 seconds", async () => {
    const xp = calculateMemoryXP(11, 35);
    expect(xp).toBe(35);
  });
  test("should calculate XP correctly for less than 12 moves and less than 90 seconds", async () => {
    const xp = calculateMemoryXP(11, 65);
    expect(xp).toBe(33);
  });
  test("should calculate XP correctly for less than 12 moves and less than 120 seconds", async () => {
    const xp = calculateMemoryXP(11, 95);
    expect(xp).toBe(31);
  });
  test("should calculate XP correctly for less than 12 moves and less than 150 seconds", async () => {
    const xp = calculateMemoryXP(11, 125);
    expect(xp).toBe(30);
  });
  test("should calculate XP correctly for less than 24 moves and less than 30 seconds", async () => {
    const xp = calculateMemoryXP(15, 25);
    expect(xp).toBe(35);
  });
  test("should calculate XP correctly for less than 24 moves and less than 60 seconds", async () => {
    const xp = calculateMemoryXP(15, 35);
    expect(xp).toBe(25);
  });
  test("should calculate XP correctly for less than 24 moves and less than 90 seconds", async () => {
    const xp = calculateMemoryXP(15, 65);
    expect(xp).toBe(23);
  });
  test("should calculate XP correctly for less than 24 moves and less than 120 seconds", async () => {
    const xp = calculateMemoryXP(15, 95);
    expect(xp).toBe(21);
  });
  test("should calculate XP correctly for less than 24 moves and less than 150 seconds", async () => {
    const xp = calculateMemoryXP(15, 125);
    expect(xp).toBe(20);
  });
  test("should calculate XP correctly for more than 24 moves and less than 30 seconds", async () => {
    const xp = calculateMemoryXP(25, 25);
    expect(xp).toBe(30);
  });
  test("should calculate XP correctly for more than 24 moves and less than 60 seconds", async () => {
    const xp = calculateMemoryXP(25, 35);
    expect(xp).toBe(20);
  });
  test("should calculate XP correctly for more than 24 moves and less than 90 seconds", async () => {
    const xp = calculateMemoryXP(25, 65);
    expect(xp).toBe(18);
  });
  test("should calculate XP correctly for more than 24 moves and less than 120 seconds", async () => {
    const xp = calculateMemoryXP(25, 95);
    expect(xp).toBe(16);
  });
  test("should calculate XP correctly for more than 24 moves and less than 150 seconds", async () => {
    const xp = calculateMemoryXP(25, 125);
    expect(xp).toBe(15);
  });
});

describe("Shape XP Calculation", () => {
  test("should calculate XP correctly for perfect score and less than 30 seconds", async () => {
    const xp = calculateShapeXP(10, 0, 25);
    expect(xp).toBe(75);
  });
  test("should calculate XP correctly for perfect score and less than 60 seconds", async () => {
    const xp = calculateShapeXP(10, 0, 35);
    expect(xp).toBe(65);
  });
  test("should calculate XP correctly for perfect score and less than 90 seconds", async () => {
    const xp = calculateShapeXP(10, 0, 65);
    expect(xp).toBe(63);
  });
  test("should calculate XP correctly for perfect score and less than 120 seconds", async () => {
    const xp = calculateShapeXP(10, 0, 95);
    expect(xp).toBe(61);
  });
  test("should calculate XP correctly for perfect score and less than 150 seconds", async () => {
    const xp = calculateShapeXP(10, 0, 125);
    expect(xp).toBe(60);
  });
  test("should calculate XP correctly for scores with 2 incorrect answers and less than 30 seconds", async () => {
    const xp = calculateShapeXP(8, 2, 25);
    expect(xp).toBe(55);
  });
});
