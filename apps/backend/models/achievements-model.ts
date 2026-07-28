import db from "../db/connection";
import { Achievement } from "../types";

export const selectAchievements = async () => {
  const { rows } = await db.query(`
    SELECT id, title, description, criteria, required_value, xp_reward, points_reward, is_active, image_url, category, is_special FROM achievements
    ORDER BY category, id
    `);
  return rows;
};

export const selectAchievementById = async (
  achievementId: number
): Promise<Achievement[]> => {
  const { rows } = await db.query<Achievement>(
    `SELECT id, title, description, criteria, required_value, xp_reward, points_reward, is_active, image_url, category, is_special FROM achievements WHERE id = $1 ORDER BY category, id`,
    [achievementId]
  );
  return rows;
};

export const insertAchievement = async (
  newAchievement: Achievement
): Promise<Achievement> => {
  const {
    title,
    description,
    criteria,
    required_value,
    xp_reward,
    points_reward,
    category,
    image_url,
    is_special,
  } = newAchievement;
  const { rows } = await db.query<Achievement>(
    `INSERT INTO achievements (title, description, criteria, required_value, xp_reward, points_reward, category, image_url, is_special) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      title,
      description,
      criteria,
      required_value,
      xp_reward,
      points_reward,
      category,
      image_url,
      is_special,
    ]
  );
  return rows[0];
};

export const updateAchievementById = async (
  achievementId: number,
  updatedAchievement: Partial<Achievement>
): Promise<Achievement> => {
  // Build dynamic SQL query for partial updates
  const fields = Object.keys(updatedAchievement);
  const values = Object.values(updatedAchievement);

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  // Create SET clause dynamically
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  // Add achievementId parameter at the end
  values.push(achievementId);

  const query = `UPDATE achievements SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`;

  const { rows } = await db.query<Achievement>(query, values);

  return rows[0];
};

export const deleteAchievementById = async (
  achievementId: number
): Promise<void> => {
  await db.query(`DELETE FROM achievements WHERE id = $1 RETURNING *`, [
    achievementId,
  ]);
};
