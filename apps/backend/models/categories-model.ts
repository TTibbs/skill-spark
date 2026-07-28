import db from "../db/connection";

export const selectWordCategories = async () => {
  const { rows } = await db.query(
    `SELECT * FROM word_categories ORDER BY name`
  );
  return rows;
};

export const selectWordCategory = async (name: string) => {
  const { rows } = await db.query(
    `SELECT * FROM word_categories WHERE name = $1`,
    [name]
  );
  return rows[0];
};

export const insertWordCategory = async (name: string) => {
  const { rows } = await db.query(
    `INSERT INTO word_categories (name) VALUES ($1) RETURNING *`,
    [name]
  );
  return rows[0];
};

export const selectChoreCategories = async (userId: number) => {
  // Get categories from user's chore categories
  const { rows } = await db.query(
    `SELECT * FROM user_chore_categories 
     WHERE user_id = $1 
     ORDER BY name`,
    [userId]
  );
  return rows;
};

export const selectChoreCategory = async (name: string, userId: number) => {
  const { rows } = await db.query(
    `SELECT * FROM user_chore_categories WHERE name = $1 AND user_id = $2`,
    [name, userId]
  );
  return rows[0];
};

export const insertChoreCategory = async (name: string, userId: number) => {
  const { rows } = await db.query(
    `INSERT INTO user_chore_categories (name, user_id) VALUES ($1, $2) RETURNING *`,
    [name, userId]
  );
  return rows[0];
};

export const updateChoreCategory = async (
  id: number,
  name: string,
  userId: number
) => {
  // First, get the old category name
  const { rows: oldCategoryRows } = await db.query<{ name: string }>(
    `SELECT name FROM user_chore_categories WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (oldCategoryRows.length === 0) {
    return null;
  }

  const oldCategoryName = oldCategoryRows[0].name;

  // Update the category name
  const { rows } = await db.query(
    `UPDATE user_chore_categories SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
    [name, id, userId]
  );

  // Update all chores that belong to the old category to use the new category name
  await db.query(
    `UPDATE chores SET category = $1 WHERE category = $2 AND user_id = $3`,
    [name, oldCategoryName, userId]
  );

  return rows[0];
};

export const removeChoreCategory = async (id: number, userId: number) => {
  const { rows } = await db.query(
    `DELETE FROM user_chore_categories WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return rows[0];
};
