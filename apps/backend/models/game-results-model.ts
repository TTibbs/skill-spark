import db from "../db/connection";

export type GameResultType = "math" | "memory" | "spelling" | "shapes";

export type GameResultSubmission = {
  id: number;
  child_id: number;
  game_type: GameResultType;
  session_id: string;
  response: unknown | null;
  completed_at: string | null;
  inserted: boolean;
};

export const reserveGameResultSubmission = async (
  childId: number,
  gameType: GameResultType,
  sessionId: string
) => {
  const insertResult = await db.query<GameResultSubmission>(
    `INSERT INTO game_result_submissions (child_id, game_type, session_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (child_id, game_type, session_id) DO NOTHING
     RETURNING id, child_id, game_type, session_id, response, completed_at, true AS inserted`,
    [childId, gameType, sessionId]
  );

  if (insertResult.rows[0]) {
    return insertResult.rows[0];
  }

  const { rows } = await db.query<GameResultSubmission>(
    `SELECT id, child_id, game_type, session_id, response, completed_at, false AS inserted
     FROM game_result_submissions
     WHERE child_id = $1
       AND game_type = $2
       AND session_id = $3`,
    [childId, gameType, sessionId]
  );

  return rows[0];
};

export const completeGameResultSubmission = async (
  id: number,
  response: unknown
) => {
  await db.query(
    `UPDATE game_result_submissions
     SET response = $1, completed_at = NOW()
     WHERE id = $2`,
    [response, id]
  );
};
