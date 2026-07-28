import type { AuthenticatedUser } from "./users";

export type RefreshTokenMode = "cookie" | "explicit";

export type RegisterInput = {
  username: string;
  display_name?: string;
  email: string;
  password: string;
  refreshTokenMode?: RefreshTokenMode;
};

export type LoginInput = {
  username?: string;
  email?: string;
  password: string;
  refreshTokenMode?: RefreshTokenMode;
};

export type AuthSession = {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken?: string;
};

export type AuthResponse = {
  status: "success";
  message?: string;
  data: AuthSession;
};

export type AccessTokenResponse = {
  status: "success";
  data: {
    accessToken: string;
    refreshToken?: string;
  };
};

export type RefreshTokenInput = {
  refreshToken?: string;
  refreshTokenMode?: RefreshTokenMode;
};

export type RefreshTokenResponse = AccessTokenResponse;

export type ForgotPasswordInput = {
  email?: string;
  username?: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export type ApiSuccessMessage = {
  status: "success";
  message: string;
};

export type ApiErrorResponse = {
  status?: "error";
  message: string;
  errors?: { message: string }[];
};
