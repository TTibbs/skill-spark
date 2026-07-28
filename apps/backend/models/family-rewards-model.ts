import { PoolClient } from "pg";
import db from "../db/connection";
import { FamilyReward, RewardRedemption } from "../types";

type RewardInput = {
  title: string;
  description?: string | null;
  star_cost: number;
  image_url?: string | null;
  is_active?: boolean;
};

type RedemptionResult = {
  redemption: RewardRedemption;
  child: {
    id: number;
    xp: number;
    level: number;
    reward_points: number;
  };
};

const selectChildProgression = async (client: PoolClient, childId: number) => {
  const { rows } = await client.query<RedemptionResult["child"]>(
    `SELECT id, xp, level, reward_points
     FROM child_profiles
     WHERE id = $1`,
    [childId]
  );
  return rows[0];
};

export const selectFamilyRewards = async (
  userId: number
): Promise<FamilyReward[]> => {
  const { rows } = await db.query<FamilyReward>(
    `SELECT *
     FROM family_rewards
     WHERE user_id = $1 AND archived_at IS NULL
     ORDER BY is_active DESC, created_at DESC`,
    [userId]
  );
  return rows;
};

export const insertFamilyReward = async (
  userId: number,
  input: RewardInput
): Promise<FamilyReward> => {
  const { rows } = await db.query<FamilyReward>(
    `INSERT INTO family_rewards
       (user_id, title, description, star_cost, image_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      input.title,
      input.description ?? null,
      input.star_cost,
      input.image_url ?? null,
      input.is_active ?? true,
    ]
  );
  return rows[0];
};

export const updateFamilyReward = async (
  userId: number,
  rewardId: number,
  input: Partial<RewardInput>
): Promise<FamilyReward | null> => {
  const updates: string[] = [];
  const values: unknown[] = [];

  const addUpdate = (column: string, value: unknown) => {
    values.push(value);
    updates.push(`${column} = $${values.length}`);
  };

  if (input.title !== undefined) addUpdate("title", input.title);
  if (input.description !== undefined) {
    addUpdate("description", input.description);
  }
  if (input.star_cost !== undefined) addUpdate("star_cost", input.star_cost);
  if (input.image_url !== undefined) addUpdate("image_url", input.image_url);
  if (input.is_active !== undefined) addUpdate("is_active", input.is_active);

  if (updates.length === 0) {
    return null;
  }

  values.push(userId, rewardId);
  const { rows } = await db.query<FamilyReward>(
    `UPDATE family_rewards
     SET ${updates.join(", ")}, updated_at = NOW()
     WHERE user_id = $${values.length - 1}
       AND id = $${values.length}
       AND archived_at IS NULL
     RETURNING *`,
    values
  );
  return rows[0] ?? null;
};

export const archiveFamilyReward = async (
  userId: number,
  rewardId: number
): Promise<FamilyReward | null> => {
  const { rows } = await db.query<FamilyReward>(
    `UPDATE family_rewards
     SET archived_at = NOW(), is_active = false, updated_at = NOW()
     WHERE user_id = $1 AND id = $2 AND archived_at IS NULL
     RETURNING *`,
    [userId, rewardId]
  );
  return rows[0] ?? null;
};

export const selectRewardRedemptions = async (
  userId: number,
  childId: number
): Promise<RewardRedemption[]> => {
  const { rows } = await db.query<RewardRedemption>(
    `SELECT rr.*, row_to_json(fr.*) AS reward
     FROM reward_redemptions rr
     LEFT JOIN family_rewards fr ON fr.id = rr.reward_id
     WHERE rr.user_id = $1 AND rr.child_id = $2
     ORDER BY rr.updated_at DESC, rr.requested_at DESC`,
    [userId, childId]
  );
  return rows;
};

export const requestRewardRedemption = async (
  userId: number,
  childId: number,
  rewardId: number
): Promise<RedemptionResult | null> => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { rows: rewardRows } = await client.query<FamilyReward>(
      `SELECT *
       FROM family_rewards
       WHERE id = $1
         AND user_id = $2
         AND is_active = true
         AND archived_at IS NULL
       FOR UPDATE`,
      [rewardId, userId]
    );
    const reward = rewardRows[0];
    if (!reward) {
      await client.query("ROLLBACK");
      return null;
    }

    const { rows: childRows } = await client.query<{
      id: number;
      reward_points: number;
    }>(
      `SELECT id, reward_points
       FROM child_profiles
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
      [childId, userId]
    );
    const child = childRows[0];
    if (!child) {
      await client.query("ROLLBACK");
      return null;
    }

    const { rows: existingRows } = await client.query<RewardRedemption>(
      `SELECT *
       FROM reward_redemptions
       WHERE reward_id = $1
         AND child_id = $2
         AND user_id = $3
         AND status = 'requested'
       FOR UPDATE`,
      [rewardId, childId, userId]
    );
    const existingRedemption = existingRows[0];
    if (existingRedemption) {
      const existingChild = await selectChildProgression(client, childId);
      await client.query("COMMIT");
      return { redemption: existingRedemption, child: existingChild };
    }

    if (child.reward_points < reward.star_cost) {
      await client.query("ROLLBACK");
      throw new Error("INSUFFICIENT_STARS");
    }

    await client.query(
      `UPDATE child_profiles
       SET reward_points = reward_points - $1, updated_at = NOW()
       WHERE id = $2`,
      [reward.star_cost, childId]
    );

    const { rows: redemptionRows } = await client.query<RewardRedemption>(
      `INSERT INTO reward_redemptions
         (reward_id, child_id, user_id, reward_title, reward_description, star_cost)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        reward.id,
        childId,
        userId,
        reward.title,
        reward.description,
        reward.star_cost,
      ]
    );

    const updatedChild = await selectChildProgression(client, childId);
    await client.query("COMMIT");
    return { redemption: redemptionRows[0], child: updatedChild };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const selectRedemptionWithClient = async (
  client: PoolClient,
  userId: number,
  childId: number,
  requestId: number
) => {
  const { rows } = await client.query<RewardRedemption>(
    `SELECT *
     FROM reward_redemptions
     WHERE id = $1 AND user_id = $2 AND child_id = $3
     FOR UPDATE`,
    [requestId, userId, childId]
  );
  return rows[0] ?? null;
};

export const approveRewardRedemption = async (
  userId: number,
  childId: number,
  requestId: number
): Promise<RedemptionResult | null> => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const redemption = await selectRedemptionWithClient(
      client,
      userId,
      childId,
      requestId
    );
    if (!redemption) {
      await client.query("ROLLBACK");
      return null;
    }
    if (redemption.status === "approved") {
      const child = await selectChildProgression(client, childId);
      await client.query("COMMIT");
      return { redemption, child };
    }
    if (redemption.status !== "requested") {
      await client.query("ROLLBACK");
      return null;
    }
    const { rows } = await client.query<RewardRedemption>(
      `UPDATE reward_redemptions
       SET status = 'approved',
           reviewed_at = NOW(),
           reviewed_by = $4,
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND child_id = $3
       RETURNING *`,
      [requestId, userId, childId, userId]
    );
    const child = await selectChildProgression(client, childId);
    await client.query("COMMIT");
    return { redemption: rows[0], child };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const rejectOrCancelRewardRedemption = async (
  userId: number,
  childId: number,
  requestId: number,
  status: "rejected" | "cancelled",
  reason: string | null = null
): Promise<RedemptionResult | null> => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const redemption = await selectRedemptionWithClient(
      client,
      userId,
      childId,
      requestId
    );
    if (!redemption) {
      await client.query("ROLLBACK");
      return null;
    }
    if (redemption.status === status) {
      const child = await selectChildProgression(client, childId);
      await client.query("COMMIT");
      return { redemption, child };
    }
    if (redemption.status !== "requested") {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `UPDATE child_profiles
       SET reward_points = reward_points + $1, updated_at = NOW()
       WHERE id = $2`,
      [redemption.star_cost, childId]
    );

    const { rows } = await client.query<RewardRedemption>(
      `UPDATE reward_redemptions
       SET status = $4,
           reviewed_at = CASE WHEN $4 = 'rejected' THEN NOW() ELSE reviewed_at END,
           reviewed_by = CASE WHEN $4 = 'rejected' THEN $5 ELSE reviewed_by END,
           cancelled_at = CASE WHEN $4 = 'cancelled' THEN NOW() ELSE cancelled_at END,
           rejection_reason = CASE WHEN $4 = 'rejected' THEN $6 ELSE rejection_reason END,
           refunded_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND child_id = $3
       RETURNING *`,
      [requestId, userId, childId, status, userId, reason]
    );
    const child = await selectChildProgression(client, childId);
    await client.query("COMMIT");
    return { redemption: rows[0], child };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
