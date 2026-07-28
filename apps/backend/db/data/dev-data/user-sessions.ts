import { UserSession } from "../../../types";

export const userSessions: UserSession[] = [
  {
    user_id: 1,
    token_id: "1234567890",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_at: new Date(),
  },
  {
    user_id: 2,
    token_id: "1234567891",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_at: new Date(),
  },
  {
    user_id: 3,
    token_id: "1234567892",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_at: new Date(),
  },
];
