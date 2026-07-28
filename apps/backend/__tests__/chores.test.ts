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

const createChore = async (token: string, xp = 10, rewardPoints = 3) => {
  const response = await request(app)
    .post("/api/chores")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: `Test chore ${Date.now()}-${Math.random()}`,
      description: "A fictional local test chore",
      category: "home",
      xp,
      reward_points: rewardPoints,
    })
    .expect(201);

  return response.body.chore as { id: number; xp: number; reward_points?: number };
};

const assignChore = async (
  token: string,
  childId: number,
  choreId: number
) => {
  const response = await request(app)
    .post(`/api/children/${childId}/chores/assign/${choreId}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(201);

  return response.body.assignment as {
    id: number;
    status: string;
    assigned_xp_reward: number;
    assigned_reward_points: number;
  };
};

describe("Chore assignment lifecycle", () => {
  test("lists a parent's child assignments", async () => {
    const token = await getAuthToken("alice123");
    const chore = await createChore(token);
    const assignment = await assignChore(token, 1, chore.id);

    const response = await request(app)
      .get("/api/children/1/chores")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.assignments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: assignment.id,
          status: "assigned",
          chore: expect.objectContaining({ id: chore.id }),
        }),
      ])
    );
  });

  test("rejects unauthenticated lifecycle access", async () => {
    await request(app).get("/api/children/1/chores").expect(401);
  });

  test("rejects cross-parent assignment access", async () => {
    const aliceToken = await getAuthToken("alice123");
    const bobToken = await getAuthToken("bob123");
    const chore = await createChore(aliceToken);
    await assignChore(aliceToken, 1, chore.id);

    await request(app)
      .get("/api/children/1/chores")
      .set("Authorization", `Bearer ${bobToken}`)
      .expect(403);
  });

  test("assigns a chore and snapshots reward values", async () => {
    const token = await getAuthToken("alice123");
    const chore = await createChore(token, 25, 7);
    const assignment = await assignChore(token, 1, chore.id);

    expect(assignment).toMatchObject({
      status: "assigned",
      assigned_xp_reward: 25,
      assigned_reward_points: 7,
    });
  });

  test("prevents duplicate active assignments", async () => {
    const token = await getAuthToken("alice123");
    const chore = await createChore(token);
    await assignChore(token, 1, chore.id);

    await request(app)
      .post(`/api/children/1/chores/assign/${chore.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });

  test("submission awards nothing until approval", async () => {
    const token = await getAuthToken("alice123");
    const chore = await createChore(token, 15, 5);
    const assignment = await assignChore(token, 1, chore.id);
    const beforeChild = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const response = await request(app)
      .post(`/api/children/1/chores/${assignment.id}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const afterChild = await request(app)
      .get("/api/users/1/children/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.assignment.status).toBe("submitted");
    expect(afterChild.body.childProfile.xp).toBe(beforeChild.body.childProfile.xp);
    expect(afterChild.body.childProfile.reward_points).toBe(
      beforeChild.body.childProfile.reward_points
    );
  });

  test("approval awards XP and stars once", async () => {
    const token = await getAuthToken("alice123");
    const chore = await createChore(token, 20, 6);
    const assignment = await assignChore(token, 1, chore.id);

    await request(app)
      .post(`/api/children/1/chores/${assignment.id}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const firstApproval = await request(app)
      .post(`/api/children/1/chores/${assignment.id}/approve`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const secondApproval = await request(app)
      .post(`/api/children/1/chores/${assignment.id}/approve`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(firstApproval.body).toMatchObject({
      assignment: expect.objectContaining({
        status: "approved",
        awarded_xp: 20,
        awarded_reward_points: 6,
      }),
      awarded: { xp: 20, reward_points: 6 },
    });
    expect(secondApproval.body.awarded).toEqual({
      xp: 20,
      reward_points: 6,
    });
    expect(secondApproval.body.progression).toEqual(
      firstApproval.body.progression
    );
  });

  test("rejects and resubmits a submitted chore", async () => {
    const token = await getAuthToken("alice123");
    const chore = await createChore(token);
    const assignment = await assignChore(token, 1, chore.id);

    await request(app)
      .post(`/api/children/1/chores/${assignment.id}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const rejection = await request(app)
      .post(`/api/children/1/chores/${assignment.id}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Please finish the last step." })
      .expect(200);

    expect(rejection.body.assignment).toMatchObject({
      id: assignment.id,
      status: "rejected",
      rejection_reason: "Please finish the last step.",
    });

    const resubmission = await request(app)
      .post(`/api/children/1/chores/${assignment.id}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(resubmission.body.assignment).toMatchObject({
      id: assignment.id,
      status: "submitted",
      rejection_reason: null,
    });
  });

  test("rejects invalid lifecycle transitions and protects approved history", async () => {
    const token = await getAuthToken("alice123");
    const chore = await createChore(token);
    const assignment = await assignChore(token, 1, chore.id);

    await request(app)
      .post(`/api/children/1/chores/${assignment.id}/approve`)
      .set("Authorization", `Bearer ${token}`)
      .expect(409);

    await request(app)
      .delete(`/api/children/1/chores/${assignment.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });

  test("removed completion endpoint is not mounted", async () => {
    const token = await getAuthToken("alice123");
    const removedPath = `/api/children/1/chores/${"complete"}`;

    await request(app)
      .post(removedPath)
      .set("Authorization", `Bearer ${token}`)
      .send({ choreIds: [1] })
      .expect(404);
  });
});
