import db from "../db/connection";
import { User, PasswordResetToken } from "../types";

export const updatePassword = async (
  userId: number,
  newPasswordHash: string
): Promise<{ success: boolean; error?: { message: string } }> => {
  try {
    await db.query(
      "UPDATE user_profiles SET password_hash = $1 WHERE id = $2",
      [newPasswordHash, userId]
    );

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: "Failed to update password" },
    };
  }
};

export const insertUser = async (
  username: string,
  display_name: string | undefined,
  email: string,
  passwordHash: string,
  timezone: string = "UTC"
): Promise<User> => {
  const result = await db.query(
    "INSERT INTO user_profiles (username, display_name, email, password_hash, timezone) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [username, display_name || username, email, passwordHash, timezone]
  );
  return result.rows[0] as User;
};

export const insertSession = async (
  userId: number,
  tokenId: string,
  expiresAt: Date
) => {
  await db.query(
    "INSERT INTO user_sessions (user_id, token_id, expires_at) VALUES ($1, $2, $3)",
    [userId, tokenId, expiresAt]
  );
};

export const selectActiveSessionByToken = async (
  tokenId: string
): Promise<{ id: number; user_id: number; expires_at: Date } | undefined> => {
  const { rows } = await db.query<{
    id: number;
    user_id: number;
    expires_at: Date;
  }>(
    `SELECT id, user_id, expires_at
     FROM user_sessions
     WHERE token_id = $1
       AND revoked_at IS NULL
       AND expires_at > NOW()`,
    [tokenId]
  );
  return rows[0];
};

export const revokeSessionByToken = async (tokenId: string): Promise<void> => {
  await db.query(
    `UPDATE user_sessions
     SET revoked_at = NOW()
     WHERE token_id = $1
       AND revoked_at IS NULL`,
    [tokenId]
  );
};

export const selectActiveSessions = async (userId: number) => {
  const { rows } = await db.query(
    `SELECT id, created_at, token_id, expires_at, revoked_at
      FROM user_sessions 
      WHERE user_id = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
      ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

export const selectSessionToRevoke = async (
  sessionId: number,
  userId: number
) => {
  const { rows } = await db.query(
    `UPDATE user_sessions
     SET revoked_at = NOW()
     WHERE id = $1 AND user_id = $2 
     RETURNING id`,
    [sessionId, userId]
  );
  return rows;
};

export const revokeAllUserSessions = async (userId: number) => {
  await db.query(
    `UPDATE user_sessions
     SET revoked_at = NOW()
     WHERE user_id = $1
       AND revoked_at IS NULL`,
    [userId]
  );
};

export const selectSessionsToCleanup = async (thirtyDaysAgo: Date) => {
  await db.query(
    `DELETE FROM user_sessions
     WHERE created_at < $1
        OR expires_at < NOW()
        OR revoked_at IS NOT NULL`,
    [thirtyDaysAgo]
  );
};

// Password reset token functions
export const insertResetToken = async (
  userId: number,
  token: string,
  expiresAt: Date
): Promise<void> => {
  await db.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
};

export const selectResetToken = async (
  token: string
): Promise<PasswordResetToken | undefined> => {
  const { rows } = await db.query(
    `SELECT * FROM password_reset_tokens 
     WHERE token = $1 
     AND used_at IS NULL 
     AND expires_at > NOW()`,
    [token]
  );
  return rows[0] as PasswordResetToken | undefined;
};

export const markResetTokenAsUsed = async (token: string): Promise<void> => {
  await db.query(
    `UPDATE password_reset_tokens 
     SET used_at = NOW() 
     WHERE token = $1`,
    [token]
  );
};

export const deleteResetToken = async (token: string): Promise<void> => {
  await db.query(`DELETE FROM password_reset_tokens WHERE token = $1`, [token]);
};

export const deleteExpiredResetTokens = async (): Promise<void> => {
  await db.query(
    `DELETE FROM password_reset_tokens 
     WHERE expires_at < NOW() OR used_at IS NOT NULL`
  );
};
