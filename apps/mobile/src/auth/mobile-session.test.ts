import { beforeEach, describe, expect, test, vi } from "vitest";
import type { AuthApi } from "@skill-spark/api-client";
import type { AuthenticatedUser } from "@skill-spark/contracts";
import type { RefreshTokenStorage } from "@/storage/session-storage";
import { MobileSessionManager } from "./mobile-session";

const user: AuthenticatedUser = {
  id: 1,
  username: "local_parent",
  display_name: "Local Parent",
  email: "local-parent@example.test",
  is_parent: true,
  timezone: "Europe/London",
  user_preferences: {
    notificationsEnabled: true,
    theme: "system",
    language: "en",
    has_pin: false,
  },
  created_at: "2026-07-28T00:00:00.000Z",
  updated_at: "2026-07-28T00:00:00.000Z",
};

function createStorage(initialToken: string | null = null) {
  let token = initialToken;
  const storage: RefreshTokenStorage = {
    getRefreshToken: vi.fn(async () => token),
    setRefreshToken: vi.fn(async (nextToken: string) => {
      token = nextToken;
    }),
    clearRefreshToken: vi.fn(async () => {
      token = null;
    }),
  };
  return storage;
}

function createAuthApi(overrides: Partial<AuthApi> = {}) {
  return {
    login: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    ...overrides,
  } as AuthApi;
}

describe("MobileSessionManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("logs in using explicit refresh-token mode and stores the refresh token", async () => {
    const storage = createStorage();
    const authApi = createAuthApi({
      login: vi.fn(async () => ({
        status: "success" as const,
        data: {
          user,
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      })),
    });
    const manager = new MobileSessionManager(authApi, storage);

    const state = await manager.login({
      email: "local-parent@example.test",
      password: "password123",
    });

    expect(authApi.login).toHaveBeenCalledWith({
      email: "local-parent@example.test",
      password: "password123",
      refreshTokenMode: "explicit",
    });
    expect(storage.setRefreshToken).toHaveBeenCalledWith("refresh-token");
    expect(state.accessToken).toBe("access-token");
    expect(state.user).toEqual(user);
  });

  test("restores a session using the stored refresh token and verifies /auth/me", async () => {
    const storage = createStorage("stored-refresh");
    const authApi = createAuthApi({
      refreshToken: vi.fn(async () => ({
        status: "success" as const,
        data: {
          accessToken: "new-access",
          refreshToken: "rotated-refresh",
        },
      })),
      me: vi.fn(async () => ({
        status: "success" as const,
        data: { user },
      })),
    });
    const manager = new MobileSessionManager(authApi, storage);

    const state = await manager.restore();

    expect(authApi.refreshToken).toHaveBeenCalledWith({
      refreshToken: "stored-refresh",
      refreshTokenMode: "explicit",
    });
    expect(storage.setRefreshToken).toHaveBeenCalledWith("rotated-refresh");
    expect(authApi.me).toHaveBeenCalledTimes(1);
    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe("new-access");
  });

  test("clears invalid sessions during restoration", async () => {
    const storage = createStorage("bad-refresh");
    const authApi = createAuthApi({
      refreshToken: vi.fn(async () => {
        throw new Error("revoked");
      }),
    });
    const manager = new MobileSessionManager(authApi, storage);

    const state = await manager.restore();

    expect(storage.clearRefreshToken).toHaveBeenCalledTimes(1);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  test("logs out with explicit mode and clears memory and secure storage", async () => {
    const storage = createStorage("stored-refresh");
    const authApi = createAuthApi({
      login: vi.fn(async () => ({
        status: "success" as const,
        data: {
          user,
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      })),
      logout: vi.fn(async () => ({
        status: "success" as const,
        message: "Logged out",
      })),
    });
    const manager = new MobileSessionManager(authApi, storage);

    await manager.login({
      email: "local-parent@example.test",
      password: "password123",
    });
    await manager.logout();

    expect(authApi.logout).toHaveBeenCalledWith({
      refreshToken: "refresh-token",
      refreshTokenMode: "explicit",
    });
    expect(storage.clearRefreshToken).toHaveBeenCalledTimes(1);
    expect(manager.getState()).toEqual({ user: null, accessToken: null });
  });
});
