import db from "../db/connection";
import { Chore } from "../types";
import { toTitleCase } from "../utils";

export const selectChores = async (
  userId: number,
  normalizedCategory?: string,
  sort_by?: string,
  order: string = "asc"
): Promise<Chore[]> => {
  const validOrder = ["asc", "desc"];

  // Use category parameter for filtering, sort_by for sorting

  if (order && !validOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      message: `Invalid order query: ${order} is not a valid order parameter`,
    });
  }

  let queryString = `SELECT * FROM chores WHERE user_id = $1`;
  const queryValues: (number | string)[] = [userId];

  if (normalizedCategory && normalizedCategory !== "All") {
    queryString += ` AND category = $2`;
    queryValues.push(normalizedCategory);
  }

  // Add sorting - use parameterized query for safety
  if (sort_by) {
    queryString += ` ORDER BY ${sort_by} ${order.toUpperCase()}`;
  } else {
    queryString += ` ORDER BY created_at ${order.toUpperCase()}`;
  }

  const { rows } = await db.query<Chore>(queryString, queryValues);
  return rows;
};

export const createNewChore = async (
  title: string,
  description: string,
  category: string,
  xp: number,
  userId: number,
  rewardPoints: number = 0
): Promise<Chore> => {
  // Convert lowercase category names to capitalized format
  const normalizedCategory = toTitleCase(category);

  const { rows } = await db.query<Chore>(
    `INSERT INTO chores (title, description, category, xp, user_id, reward_points)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, description, normalizedCategory, xp, userId, rewardPoints]
  );

  // Return the chore with the original category value
  return rows[0];
};

export const selectChoreById = async (id: number): Promise<Chore> => {
  const { rows } = await db.query<Chore>(`SELECT * FROM chores WHERE id = $1`, [
    id,
  ]);
  return rows[0];
};

export const updateChoreById = async (
  id: number,
  title?: string,
  description?: string,
  category?: string,
  xp?: number
): Promise<Chore> => {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (title !== undefined) {
    updates.push(`title = $${paramIndex}`);
    values.push(title);
    paramIndex++;
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex}`);
    values.push(description);
    paramIndex++;
  }
  if (category !== undefined) {
    updates.push(`category = $${paramIndex}`);
    values.push(category);
    paramIndex++;
  }
  if (xp !== undefined) {
    updates.push(`xp = $${paramIndex}`);
    values.push(xp);
    paramIndex++;
  }

  // Add id as the last parameter
  values.push(id);

  const queryString = `
    UPDATE chores
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const { rows } = await db.query<Chore>(queryString, values);

  return rows[0];
};

export const deleteChoreById = async (id: number): Promise<void> => {
  await db.query(`DELETE FROM chores WHERE id = $1 RETURNING *`, [id]);
};
