import { User } from "./user";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type UserSession = {
  id?: number;
  user_id: number;
  token_id: string;
  expires_at: Date;
  revoked_at?: Date | null;
  last_used_at?: Date | null;
  created_at: Date;
};

export interface RegistrationData {
  username: string;
  display_name?: string;
  email: string;
  password: string;
  is_parent?: boolean;
  timezone?: string;
}

export interface LoginResult {
  user: User | null;
  error?: {
    type: "missing_fields" | "auth_error";
    status: number;
    message: string;
    errors?: { message: string }[];
  };
}

export interface VerificationRecord {
  user_id: number;
  expires_at: Date;
  used_at: Date | null;
}

export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export interface UpdateResult {
  rows: {
    id: number;
    username: string;
    email: string;
    profile_image_url: string | null;
    xp: number;
    level: string;
    last_played: Date | null;
    is_parent: boolean;
    created_at: Date;
    updated_at: Date;
  }[];
  rowCount: number;
}
