import db from "../db/connection";
import { ChildProfile, PremiumReward } from "../types";

export const selectPremiumRewards = async () => {
  const result = await db.query(
    "SELECT * FROM premium_rewards WHERE is_active = true"
  );
  return result.rows;
};

export const createPremiumReward = async (newReward: PremiumReward) => {
  const {
    title,
    description,
    points_required,
    is_active,
    category,
    does_expire,
    duration_days,
  } = newReward;

  const result = await db.query(
    "INSERT INTO premium_rewards (title, description, points_required, is_active, category, does_expire, duration_days) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [
      title,
      description,
      points_required,
      is_active,
      category,
      does_expire,
      duration_days,
    ]
  );
  return result.rows[0];
};

export const selectPremiumRewardById = async (
  id: number
): Promise<PremiumReward> => {
  const result = await db.query<PremiumReward>(
    "SELECT * FROM premium_rewards WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const updatePremiumReward = async (
  id: number,
  updatedReward: PremiumReward
) => {
  const result = await db.query(
    "UPDATE premium_rewards SET title = $1, description = $2, points_required = $3, is_active = $4, category = $5, does_expire = $6, duration_days = $7 WHERE id = $8 RETURNING *",
    [
      updatedReward.title,
      updatedReward.description,
      updatedReward.points_required,
      updatedReward.is_active,
      updatedReward.category,
      updatedReward.does_expire,
      updatedReward.duration_days,
      id,
    ]
  );
  return result.rows[0];
};

export const deletePremiumRewardById = async (id: number) => {
  const result = await db.query<PremiumReward>(
    "DELETE FROM premium_rewards WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

export const createChildPremiumPurchase = async (
  premiumRewardId: number,
  childId?: number
) => {
  // First get the premium reward details
  const reward = await selectPremiumRewardById(premiumRewardId);

  // Start a transaction to ensure atomicity
  try {
    // Insert the purchase without setting expiry_date immediately
    // Only set expiry_date when the reward is actually activated
    const insertPurchaseResult = await db.query(
      `INSERT INTO premium_reward_purchases (reward_id, child_id, is_activated, expiry_date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [premiumRewardId, childId || null, false, null]
    );

    // Deduct points from child's account if childId is provided
    if (childId) {
      await db.query(
        `UPDATE child_profiles 
         SET reward_points = reward_points - $1 
         WHERE id = $2`,
        [reward.points_required, childId]
      );
    }

    return insertPurchaseResult.rows[0];
  } catch (error) {
    throw error;
  }
};

export const activatePremiumReward = async (
  purchaseId: number,
  childId: number
) => {
  // Get the purchase details (validation already done in middleware)
  const purchaseResult = await db.query(
    `SELECT prp.*, pr.does_expire, pr.duration_days 
     FROM premium_reward_purchases prp
     JOIN premium_rewards pr ON pr.id = prp.reward_id
     WHERE prp.id = $1 AND prp.child_id = $2 AND prp.is_activated = false`,
    [purchaseId, childId]
  );

  const purchase = purchaseResult.rows[0] as {
    does_expire: boolean;
    duration_days: number;
  };

  // Calculate expiry date if the reward has a duration
  let expiryDate = null;
  if (purchase.does_expire && purchase.duration_days > 0) {
    expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + purchase.duration_days);
  }

  // Update the purchase to mark it as activated and set expiry date
  const updateResult = await db.query(
    `UPDATE premium_reward_purchases 
     SET is_activated = true, expiry_date = $1 
     WHERE id = $2 
     RETURNING *`,
    [expiryDate, purchaseId]
  );

  return updateResult.rows[0];
};

export const selectActiveChildProfilePremiumRewards = async (
  childId?: number
) => {
  const result = await db.query(
    `SELECT pr.*, prp.expiry_date, prp.purchase_date, prp.is_activated, prp.id as purchase_id
     FROM premium_reward_purchases prp
     JOIN premium_rewards pr ON pr.id = prp.reward_id
     WHERE (prp.child_id = $1 OR prp.child_id IS NULL)
     AND prp.is_activated = true
     AND (prp.expiry_date IS NULL OR prp.expiry_date > NOW())
     ORDER BY prp.purchase_date DESC`,
    [childId || null]
  );
  return result.rows;
};

export const selectPurchasedChildProfilePremiumRewards = async (
  childId?: number
) => {
  const result = await db.query(
    `SELECT pr.*, prp.expiry_date, prp.purchase_date, prp.is_activated, prp.id as purchase_id
     FROM premium_reward_purchases prp
     JOIN premium_rewards pr ON pr.id = prp.reward_id
     WHERE (prp.child_id = $1 OR prp.child_id IS NULL)
     AND prp.is_activated = false
     ORDER BY prp.purchase_date DESC`,
    [childId || null]
  );
  return result.rows;
};

export const checkChildHasEnoughRewardPoints = async (
  rewardId: number,
  childId: number
): Promise<boolean> => {
  const { rows: rewardRows } = await db.query<PremiumReward>(
    `SELECT points_required FROM premium_rewards WHERE id = $1`,
    [rewardId]
  );

  const { rows: childRows } = await db.query<ChildProfile>(
    `SELECT reward_points FROM child_profiles WHERE id = $1`,
    [childId]
  );

  let hasEnoughPoints = false;
  if (rewardRows.length > 0) {
    const reward = rewardRows[0];
    hasEnoughPoints = reward.points_required <= childRows[0].reward_points;
  }

  return hasEnoughPoints;
};
