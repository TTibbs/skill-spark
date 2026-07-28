import db from "../../db/connection";
import seed from "../../db/seeds/seed";
import { testData } from "../../db/data/test-data/index";
import { SeedData } from "../../types";
import { getAchievementQueryCost } from "../queries";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

test("Should return cost of query", async () => {
  const costOfQuery = await getAchievementQueryCost(1);
  expect(costOfQuery).toBeLessThan(500);
});
