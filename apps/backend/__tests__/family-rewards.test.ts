import request from "supertest";
import app from "../app";
import db from "../db/connection";
import seed from "../db/seeds/seed";
import { testData } from "../db/data/test-data/index";
import { getAuthToken } from "../utils";
import { SeedData } from "../types";

beforeEach(() => seed(testData as SeedData));

afterAll(async () => {
  await db.end();
});

const createReward = async (token: string, starCost = 20) => {
  const response = await request(app)
    .post("/api/rewards")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Extra story time",
      description: "A fictional local family reward",
      star_cost: starCost,
    })
    .expect(201);
  return response.body.reward as { id: number; star_cost: number };
};

const requestReward = async (
  token: string,
  childId: number,
  rewardId: number
) => {
  const response = await request(app)
    .post(`/api/children/${childId}/reward-redemptions`)
    .set("Authorization", `Bearer ${token}`)
    .send({ rewardId })
    .expect(201);
  return response.body as {
    redemption: { id: number; status: string; star_cost: number };
    child: { reward_points: number };
  };
};

describe("Family rewards", () => {
  test("parents can create, list, update and archive family rewards", async () => {
    const token = await getAuthToken("alice123");
    const reward = await createReward(token, 15);

    const list = await request(app)
      .get("/api/rewards")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(list.body.rewards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: reward.id, star_cost: 15 }),
      ])
    );

    const update = await request(app)
      .patch(`/api/rewards/${reward.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated reward", star_cost: 18, is_active: false })
      .expect(200);
    expect(update.body.reward).toMatchObject({
      title: "Updated reward",
      star_cost: 18,
      is_active: false,
    });

    await request(app)
      .delete(`/api/rewards/${reward.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });

  test("rejects invalid costs and cross-parent catalogue updates", async () => {
    const aliceToken = await getAuthToken("alice123");
    const bobToken = await getAuthToken("bob123");
    const reward = await createReward(aliceToken);

    await request(app)
      .post("/api/rewards")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({ title: "Bad reward", star_cost: 0 })
      .expect(400);

    await request(app)
      .patch(`/api/rewards/${reward.id}`)
      .set("Authorization", `Bearer ${bobToken}`)
      .send({ title: "Mine now" })
      .expect(404);
  });

  test("child requests affordable reward and stars are deducted once", async () => {
    const token = await getAuthToken("alice123");
    const reward = await createReward(token, 20);
    const before = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const result = await requestReward(token, 1, reward.id);
    const repeated = await requestReward(token, 1, reward.id);

    expect(result.redemption).toMatchObject({
      status: "requested",
      star_cost: 20,
    });
    expect(result.child.reward_points).toBe(
      before.body.childProfile.reward_points - 20
    );
    expect(repeated.redemption.id).toBe(result.redemption.id);
    expect(repeated.child.reward_points).toBe(result.child.reward_points);
  });

  test("rejects insufficient stars and archived rewards", async () => {
    const token = await getAuthToken("alice123");
    const expensive = await createReward(token, 9999);

    await request(app)
      .post("/api/children/1/reward-redemptions")
      .set("Authorization", `Bearer ${token}`)
      .send({ rewardId: expensive.id })
      .expect(400);

    const archived = await createReward(token, 10);
    await request(app)
      .delete(`/api/rewards/${archived.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    await request(app)
      .post("/api/children/1/reward-redemptions")
      .set("Authorization", `Bearer ${token}`)
      .send({ rewardId: archived.id })
      .expect(404);
  });

  test("approval does not deduct again and is idempotent", async () => {
    const token = await getAuthToken("alice123");
    const reward = await createReward(token, 10);
    const requested = await requestReward(token, 1, reward.id);

    const approval = await request(app)
      .post(
        `/api/children/1/reward-redemptions/${requested.redemption.id}/approve`
      )
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    const repeated = await request(app)
      .post(
        `/api/children/1/reward-redemptions/${requested.redemption.id}/approve`
      )
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(approval.body.redemption.status).toBe("approved");
    expect(repeated.body.child.reward_points).toBe(
      approval.body.child.reward_points
    );
  });

  test("rejection and cancellation refund once", async () => {
    const token = await getAuthToken("alice123");
    const rejectReward = await createReward(token, 12);
    const cancelReward = await createReward(token, 11);
    const rejectedRequest = await requestReward(token, 1, rejectReward.id);
    const cancelledRequest = await requestReward(token, 1, cancelReward.id);

    const rejection = await request(app)
      .post(
        `/api/children/1/reward-redemptions/${rejectedRequest.redemption.id}/reject`
      )
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Not today" })
      .expect(200);
    const repeatedRejection = await request(app)
      .post(
        `/api/children/1/reward-redemptions/${rejectedRequest.redemption.id}/reject`
      )
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Not today" })
      .expect(200);
    expect(repeatedRejection.body.child.reward_points).toBe(
      rejection.body.child.reward_points
    );

    const cancellation = await request(app)
      .post(
        `/api/children/1/reward-redemptions/${cancelledRequest.redemption.id}/cancel`
      )
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    const repeatedCancellation = await request(app)
      .post(
        `/api/children/1/reward-redemptions/${cancelledRequest.redemption.id}/cancel`
      )
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(repeatedCancellation.body.child.reward_points).toBe(
      cancellation.body.child.reward_points
    );
  });

  test("reward edits do not alter redemption snapshots", async () => {
    const token = await getAuthToken("alice123");
    const reward = await createReward(token, 14);
    const requestResult = await requestReward(token, 1, reward.id);

    await request(app)
      .patch(`/api/rewards/${reward.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Changed later", star_cost: 99 })
      .expect(200);

    const redemptions = await request(app)
      .get("/api/children/1/reward-redemptions")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(redemptions.body.redemptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: requestResult.redemption.id,
          reward_title: "Extra story time",
          star_cost: 14,
        }),
      ])
    );
  });
});
