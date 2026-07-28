import type {
  ApiSuccessMessage,
  AuthResponse,
  CurrentUserResponse,
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  RefreshTokenResponse,
  RegisterInput,
  ResetPasswordInput,
} from "@skill-spark/contracts";
import type { ApiClient } from "./client";

export const createAuthApi = (client: ApiClient) => ({
  register(input: RegisterInput, signal?: AbortSignal) {
    return client.post<AuthResponse>("/auth/register", { body: input, signal });
  },

  login(input: LoginInput, signal?: AbortSignal) {
    return client.post<AuthResponse>("/auth/login", { body: input, signal });
  },

  refreshToken(input: RefreshTokenInput = {}, signal?: AbortSignal) {
    return client.post<RefreshTokenResponse>("/auth/refresh-token", {
      body: input,
      signal,
    });
  },

  logout(input: RefreshTokenInput = {}, signal?: AbortSignal) {
    return client.post<ApiSuccessMessage>("/auth/logout", {
      body: input,
      signal,
    });
  },

  forgotPassword(input: ForgotPasswordInput, signal?: AbortSignal) {
    return client.post<ApiSuccessMessage>("/auth/forgot-password", {
      body: input,
      signal,
    });
  },

  resetPassword(input: ResetPasswordInput, signal?: AbortSignal) {
    return client.post<ApiSuccessMessage>("/auth/reset-password", {
      body: input,
      signal,
    });
  },

  me(signal?: AbortSignal) {
    return client.get<CurrentUserResponse>("/auth/me", { signal });
  },
});

export type AuthApi = ReturnType<typeof createAuthApi>;
