import db from "../db/connection";
import { User, ChildProfile, UserPreferences } from "../types";

export const selectUsers = async (): Promise<{
  users: User[];
  total_users: number;
}> => {
  const usersResult = await db.query(`
    SELECT 
      u.*,
      COALESCE(u.profile_image_url, '') as profile_image_url,
      COUNT(DISTINCT cp.id)::integer as total_children
    FROM user_profiles u
    LEFT JOIN child_profiles cp ON u.id = cp.user_id AND cp.archived_at IS NULL
    GROUP BY u.id
  `);

  const countResult = usersResult.rows.length;

  return {
    users: usersResult.rows as User[],
    total_users: countResult,
  };
};

export const selectUserByUsername = async (
  username: string
): Promise<User | null> => {
  const { rows } = await db.query(
    `
    SELECT 
      u.*,
      COALESCE(u.profile_image_url, '') as profile_image_url,
      COUNT(DISTINCT cp.id)::integer as total_children
    FROM user_profiles u
    LEFT JOIN child_profiles cp ON u.id = cp.user_id AND cp.archived_at IS NULL
    WHERE u.username = $1
    GROUP BY u.id
  `,
    [username]
  );
  return rows[0] as User;
};

export const selectUserByEmail = async (
  email: string
): Promise<User | null> => {
  const { rows } = await db.query(
    `
    SELECT 
      u.*,
      COALESCE(u.profile_image_url, '') as profile_image_url,
      COUNT(DISTINCT cp.id)::integer as total_children
    FROM user_profiles u
    LEFT JOIN child_profiles cp ON u.id = cp.user_id AND cp.archived_at IS NULL
    WHERE u.email = $1
    GROUP BY u.id
  `,
    [email]
  );
  return rows[0] as User;
};

export const selectUserById = async (id: number): Promise<User | null> => {
  const { rows } = await db.query(
    `
    SELECT 
      u.*,
      COALESCE(u.profile_image_url, '') as profile_image_url,
      COUNT(DISTINCT cp.id)::integer as total_children
    FROM user_profiles u
    LEFT JOIN child_profiles cp ON u.id = cp.user_id
    WHERE u.id = $1
    GROUP BY u.id
  `,
    [id]
  );
  return rows[0] as User;
};

export const updateUserById = async (id: number, user: Partial<User>) => {
  const { ...updateFields } = user;

  const fields = Object.keys(updateFields);
  const values = Object.values(updateFields);

  if (fields.length === 0) {
    return null;
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const { rows } = await db.query(
    `
    UPDATE user_profiles
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${fields.length + 1}
    RETURNING *
  `,
    [...values, id]
  );

  return rows[0] as User;
};

export const deleteUserById = async (id: number) => {
  await db.query(
    `
    DELETE FROM user_profiles WHERE id = $1 RETURNING *
  `,
    [id]
  );
};

export const selectUserPreferences = async (
  id: number
): Promise<UserPreferences | null> => {
  const { rows } = await db.query(
    `SELECT user_preferences FROM user_profiles WHERE id = $1`,
    [id]
  );
  return rows[0]
    ? (rows[0] as { user_preferences: UserPreferences }).user_preferences
    : null;
};

export const updateUserPinHashById = async (
  id: number,
  pinHash: string | null
): Promise<UserPreferences | null> => {
  const { rows } = await db.query(
    `
      UPDATE user_profiles
      SET
        user_preferences = user_preferences || jsonb_build_object('pin_key', $1::text),
        updated_at = NOW()
      WHERE id = $2
      RETURNING user_preferences
    `,
    [pinHash, id]
  );

  return rows[0]
    ? (rows[0] as { user_preferences: UserPreferences }).user_preferences
    : null;
};

export const clearUserPinById = async (
  id: number
): Promise<UserPreferences | null> => {
  const { rows } = await db.query(
    `
      UPDATE user_profiles
      SET
        user_preferences = user_preferences || jsonb_build_object('pin_key', NULL),
        updated_at = NOW()
      WHERE id = $1
      RETURNING user_preferences
    `,
    [id]
  );

  return rows[0]
    ? (rows[0] as { user_preferences: UserPreferences }).user_preferences
    : null;
};

// Let callers pass in one or more prefs:
export type PartialPreferences = Partial<{
  notificationsEnabled: boolean;
  theme: "light" | "dark";
}>;

export const updateUserPreferencesById = async (
  id: number,
  prefs: PartialPreferences
): Promise<UserPreferences | null> => {
  // If prefs is empty ({}), we could early-return, but || {} is a no-op merge anyway.
  const { rows } = await db.query(
    `
      UPDATE user_profiles
      SET
        user_preferences = user_preferences || $1::jsonb,
        updated_at       = NOW()
      WHERE id = $2
      RETURNING user_preferences
    `,
    [prefs, id]
  );

  return (rows[0] as { user_preferences: UserPreferences }).user_preferences;
};

export const selectChildrenForUser = async (userId: number) => {
  const { rows } = await db.query(
    `
    SELECT 
      cp.*,
      CAST(cp.level AS INTEGER) as level
    FROM child_profiles cp
    WHERE cp.user_id = $1 AND cp.archived_at IS NULL
    ORDER BY cp.created_at ASC, cp.id ASC
  `,
    [userId]
  );
  return rows as ChildProfile[];
};

export const insertChildProfile = async (
  userId: number,
  child: Partial<ChildProfile>
) => {
  // Insert the child profile
  const { rows } = await db.query(
    `
    INSERT INTO child_profiles (user_id, name, age, last_played) 
    VALUES ($1, $2, $3, NULL) 
    RETURNING *, CAST(level AS INTEGER) as level
  `,
    [userId, child.name, child.age || 0]
  );

  // Check if this is the user's first child profile and update is_parent if needed
  const { rows: childCountRows } = await db.query<{ count: string }>(
    "SELECT COUNT(*) as count FROM child_profiles WHERE user_id = $1 AND archived_at IS NULL",
    [userId]
  );

  if (parseInt(childCountRows[0].count) === 1) {
    // This is the first child profile, so set the user as a parent
    await db.query("UPDATE user_profiles SET is_parent = true WHERE id = $1", [
      userId,
    ]);
  }

  return rows[0] as ChildProfile;
};

export const selectChildProfile = async (childId: number) => {
  const { rows } = await db.query(
    `
    SELECT *, CAST(level AS INTEGER) as level
    FROM child_profiles
    WHERE id = $1 AND archived_at IS NULL`,
    [childId]
  );
  return rows[0] as ChildProfile;
};

export const updateChildProfileById = async (
  userId: number,
  childId: number,
  child: Partial<ChildProfile>
) => {
  const allowedFields = ["name", "age"];
  const updates = Object.entries(child)
    .filter(([key]) => allowedFields.includes(key))
    .map(([key, value], index) => {
      return `${key} = $${index + 3}`;
    })
    .join(", ");

  if (!updates) {
    return null;
  }

  // First check if the child exists and belongs to the user
  const { rows: checkRows } = await db.query<{ user_id: number }>(
    "SELECT user_id FROM child_profiles WHERE id = $1",
    [childId]
  );

  if (checkRows.length === 0) {
    return null;
  }

  if (checkRows[0].user_id !== userId) {
    throw new Error("You need to be a parent to access child profiles");
  }

  const values = Object.values(child).filter((value) => value !== undefined);
  const { rows } = await db.query(
    `
    UPDATE child_profiles 
    SET ${updates}, updated_at = NOW()
    WHERE user_id = $1 AND id = $2 AND archived_at IS NULL
    RETURNING *, CAST(level AS INTEGER) as level
  `,
    [userId, childId, ...values]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as ChildProfile;
};

export const deleteChildProfileById = async (
  userId: number,
  childId: number
) => {
  const { rows } = await db.query(
    `
    UPDATE child_profiles
    SET archived_at = NOW(), updated_at = NOW()
    WHERE user_id = $1 AND id = $2 AND archived_at IS NULL
    RETURNING *
  `,
    [userId, childId]
  );
  return (rows[0] as ChildProfile | undefined) ?? null;
};
