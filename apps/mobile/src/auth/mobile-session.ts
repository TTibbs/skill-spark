import type {
  AuthenticatedUser,
  LoginInput,
} from "@skill-spark/contracts";
import type { AuthApi } from "@skill-spark/api-client";
import type { RefreshTokenStorage } from "@/storage/session-storage";

export type MobileSessionState = {
  user: AuthenticatedUser | null;
  accessToken: string | null;
};

export class MobileSessionManager {
  private accessToken: string | null = null;
  private user: AuthenticatedUser | null = null;

  constructor(
    private readonly authApi: AuthApi,
    private readonly storage: RefreshTokenStorage
  ) {}

  getAccessToken() {
    return this.accessToken;
  }

  getState(): MobileSessionState {
    return {
      user: this.user,
      accessToken: this.accessToken,
    };
  }

  async login(input: LoginInput) {
    const response = await this.authApi.login({
      ...input,
      refreshTokenMode: "explicit",
    });
    return this.applyAuthResponse(response.data);
  }

  async restore() {
    const refreshToken = await this.storage.getRefreshToken();
    if (!refreshToken) {
      this.clearMemory();
      return this.getState();
    }

    try {
      await this.refreshSession(refreshToken);
      const currentUser = await this.authApi.me();
      this.user = currentUser.data.user;
      return this.getState();
    } catch {
      await this.clear();
      return this.getState();
    }
  }

  async refreshSession(existingRefreshToken?: string) {
    const refreshToken =
      existingRefreshToken ?? (await this.storage.getRefreshToken());
    if (!refreshToken) {
      throw new Error("No refresh token stored");
    }

    const response = await this.authApi.refreshToken({
      refreshToken,
      refreshTokenMode: "explicit",
    });

    this.accessToken = response.data.accessToken;
    if (response.data.refreshToken) {
      await this.storage.setRefreshToken(response.data.refreshToken);
    }

    return this.getState();
  }

  async logout() {
    const refreshToken = await this.storage.getRefreshToken();
    try {
      await this.authApi.logout({
        refreshToken: refreshToken ?? undefined,
        refreshTokenMode: "explicit",
      });
    } finally {
      await this.clear();
    }
  }

  async clear() {
    await this.storage.clearRefreshToken();
    this.clearMemory();
  }

  private async applyAuthResponse(response: {
    user: AuthenticatedUser;
    accessToken: string;
    refreshToken?: string;
  }) {
    if (!response.refreshToken) {
      throw new Error("Explicit refresh-token mode did not return a token");
    }

    this.user = response.user;
    this.accessToken = response.accessToken;
    await this.storage.setRefreshToken(response.refreshToken);
    return this.getState();
  }

  private clearMemory() {
    this.accessToken = null;
    this.user = null;
  }
}
