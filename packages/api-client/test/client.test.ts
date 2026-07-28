import { describe, expect, test, vi } from "vitest";
import {
  ApiClient,
  ApiError,
  createAuthApi,
  createChildrenApi,
  createChoresApi,
  createGameResultsApi,
  createRewardsApi,
  createStatsApi,
  createWordsApi,
} from "../src";

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });

describe("ApiClient", () => {
  test("parses successful JSON responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
    });

    await expect(client.get<{ ok: boolean }>("/health")).resolves.toEqual({
      ok: true,
    });
  });

  test("supports successful empty responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
    });

    await expect(client.delete<void>("/sessions/1")).resolves.toBeUndefined();
  });

  test("attaches bearer tokens from the callback", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      getAccessToken: () => "access-token",
      fetch: fetchMock,
    });

    await client.get("/auth/me");

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("Authorization")).toBe(
      "Bearer access-token"
    );
  });

  test("serializes JSON request bodies", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
    });

    await client.post("/auth/login", { body: { username: "alex" } });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json"
    );
    expect(init.body).toBe(JSON.stringify({ username: "alex" }));
  });

  test("throws typed errors for JSON non-2xx responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ status: "error", message: "Nope" }, { status: 401 }));
    const onUnauthorized = vi.fn();
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
      onUnauthorized,
    });

    await expect(client.get("/auth/me")).rejects.toMatchObject<ApiError>({
      status: 401,
      message: "Nope",
    });
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  test("handles non-JSON error responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("Broken", { status: 500 }));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
    });

    await expect(client.get("/boom")).rejects.toMatchObject<ApiError>({
      status: 500,
      message: "Broken",
    });
  });

  test("forwards abort signals", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
    });
    const controller = new AbortController();

    await client.get("/slow", { signal: controller.signal });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.signal).toBe(controller.signal);
  });

  test("binds the default fetch implementation", async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn(function (this: typeof globalThis) {
      if (this !== globalThis) {
        throw new TypeError("Illegal invocation");
      }

      return Promise.resolve(jsonResponse({ ok: true }));
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      const client = new ApiClient({
        baseUrl: "http://api.test/api",
      });

      await expect(client.get<{ ok: boolean }>("/health")).resolves.toEqual({
        ok: true,
      });
    } finally {
      vi.stubGlobal("fetch", originalFetch);
    }
  });
});

describe("auth api", () => {
  test("uses expected authentication paths and bodies", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(jsonResponse({ status: "success" })));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
      credentials: "include",
    });
    const auth = createAuthApi(client);

    await auth.login({
      username: "alex",
      password: "password123",
      refreshTokenMode: "cookie",
    });
    await auth.register({
      username: "alex",
      email: "alex@example.test",
      password: "password123",
    });
    await auth.refreshToken({ refreshTokenMode: "cookie" });
    await auth.logout();
    await auth.forgotPassword({ email: "alex@example.test" });
    await auth.resetPassword({ token: "token", newPassword: "password456" });

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://api.test/api/auth/login",
      "http://api.test/api/auth/register",
      "http://api.test/api/auth/refresh-token",
      "http://api.test/api/auth/logout",
      "http://api.test/api/auth/forgot-password",
      "http://api.test/api/auth/reset-password",
    ]);
    expect((fetchMock.mock.calls[0][1] as RequestInit).body).toBe(
      JSON.stringify({
        username: "alex",
        password: "password123",
        refreshTokenMode: "cookie",
      })
    );
    expect((fetchMock.mock.calls[2][1] as RequestInit).body).toBe(
      JSON.stringify({ refreshTokenMode: "cookie" })
    );
  });
});

describe("children api", () => {
  test("uses expected child paths and attaches bearer token", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(jsonResponse({ children: [] })));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      getAccessToken: () => "access-token",
      fetch: fetchMock,
    });
    const children = createChildrenApi(client);
    const controller = new AbortController();

    await children.listForUser(7, controller.signal);
    await children.getForUser(7, 12);
    await children.create({ name: "Avery", age: 6 });
    await children.update(12, { name: "Avery Bee", age: 7 });
    await children.archive(12);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://api.test/api/users/7/children",
      "http://api.test/api/users/7/children/12",
      "http://api.test/api/users/me/children",
      "http://api.test/api/children/12",
      "http://api.test/api/children/12",
    ]);

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("Authorization")).toBe(
      "Bearer access-token"
    );
    expect(init.signal).toBe(controller.signal);
    expect((fetchMock.mock.calls[2][1] as RequestInit).body).toBe(
      JSON.stringify({ name: "Avery", age: 6 })
    );
    expect((fetchMock.mock.calls[3][1] as RequestInit).body).toBe(
      JSON.stringify({ name: "Avery Bee", age: 7 })
    );
  });
});

describe("stats api", () => {
  test("uses expected stats paths", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(jsonResponse({})));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
    });
    const stats = createStatsApi(client);

    await stats.aggregate(12);
    await stats.math(12);
    await stats.spelling(12);
    await stats.memory(12);
    await stats.shapes(12);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://api.test/api/children/12/stats",
      "http://api.test/api/children/12/stats/math",
      "http://api.test/api/children/12/stats/spelling",
      "http://api.test/api/children/12/stats/memory",
      "http://api.test/api/children/12/stats/shapes",
    ]);
  });

  test("propagates typed API errors from stats requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: "Forbidden" }, { status: 403 }));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
    });
    const stats = createStatsApi(client);

    await expect(stats.aggregate(99)).rejects.toMatchObject<ApiError>({
      status: 403,
      message: "Forbidden",
    });
  });
});

describe("game results api", () => {
  test("uses expected result submission paths and bodies", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(jsonResponse({ child: {}, xpEarned: 1 }))
      );
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      getAccessToken: () => "access-token",
      fetch: fetchMock,
    });
    const gameResults = createGameResultsApi(client);
    const controller = new AbortController();

    await gameResults.submitMath(
      4,
      {
        sessionId: "math-session",
        correct: 3,
        incorrect: 1,
        timeSpent: 20,
        type: "addition",
      },
      controller.signal
    );
    await gameResults.submitMemory(4, {
      sessionId: "memory-session",
      totalMoves: 12,
      timeSpent: 45,
      type: "picture",
    });
    await gameResults.submitSpelling(4, 8, {
      sessionId: "spelling-session",
      correct_attempts: 1,
      total_attempts: 2,
      timeSpent: 30,
      hintsUsed: 1,
    });
    await gameResults.submitShapes(4, {
      sessionId: "shapes-session",
      correct: 5,
      incorrect: 2,
      timeSpent: 40,
    });

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://api.test/api/children/4/stats/math",
      "http://api.test/api/children/4/stats/memory",
      "http://api.test/api/children/4/stats/spelling/8",
      "http://api.test/api/children/4/stats/shapes",
    ]);
    expect((fetchMock.mock.calls[0][1] as RequestInit).body).toBe(
      JSON.stringify({
        sessionId: "math-session",
        correct: 3,
        incorrect: 1,
        timeSpent: 20,
        type: "addition",
      })
    );
    expect(new Headers((fetchMock.mock.calls[0][1] as RequestInit).headers).get("Authorization")).toBe("Bearer access-token");
    expect((fetchMock.mock.calls[0][1] as RequestInit).signal).toBe(
      controller.signal
    );
    expect((fetchMock.mock.calls[3][1] as RequestInit).body).toBe(
      JSON.stringify({
        sessionId: "shapes-session",
        correct: 5,
        incorrect: 2,
        timeSpent: 40,
      })
    );
  });

  test("loads words for spelling games", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        jsonResponse({ words: [], total: 0, page: 1, limit: 10, hasMore: false })
      )
    );
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
    });
    const words = createWordsApi(client);

    await words.list({ limit: 5, page: 2, category: "Animals" });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://api.test/api/words?limit=5&page=2&category=Animals"
    );
  });
});

describe("chores api", () => {
  test("uses current chore lifecycle paths and bodies", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(jsonResponse({ assignment: { id: 9 } }))
      );
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      getAccessToken: () => "access-token",
      fetch: fetchMock,
    });
    const chores = createChoresApi(client);
    const controller = new AbortController();

    await chores.listForChild(4, controller.signal);
    await chores.assign(4, 8);
    await chores.submit(4, 9);
    await chores.approve(4, 9);
    await chores.reject(4, 9, { reason: "Try folding it again" });
    await chores.remove(4, 9);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://api.test/api/children/4/chores",
      "http://api.test/api/children/4/chores/assign/8",
      "http://api.test/api/children/4/chores/9/submit",
      "http://api.test/api/children/4/chores/9/approve",
      "http://api.test/api/children/4/chores/9/reject",
      "http://api.test/api/children/4/chores/9",
    ]);
    expect((fetchMock.mock.calls[0][1] as RequestInit).signal).toBe(
      controller.signal
    );
    expect((fetchMock.mock.calls[4][1] as RequestInit).body).toBe(
      JSON.stringify({ reason: "Try folding it again" })
    );
    expect(
      new Headers((fetchMock.mock.calls[2][1] as RequestInit).headers).get(
        "Authorization"
      )
    ).toBe("Bearer access-token");
  });

  test("propagates typed chore API errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: "Forbidden" }, { status: 403 }));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
    });
    const chores = createChoresApi(client);

    await expect(chores.submit(4, 9)).rejects.toMatchObject<ApiError>({
      status: 403,
      message: "Forbidden",
    });
  });
});

describe("rewards api", () => {
  test("uses family reward and redemption paths and bodies", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        jsonResponse({
          reward: { id: 1 },
          redemption: { id: 2 },
          child: { id: 4, reward_points: 10 },
        })
      )
    );
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      getAccessToken: () => "access-token",
      fetch: fetchMock,
    });
    const rewards = createRewardsApi(client);
    const controller = new AbortController();

    await rewards.list(controller.signal);
    await rewards.create({ title: "Movie night", star_cost: 20 });
    await rewards.update(1, { is_active: false });
    await rewards.listRedemptions(4);
    await rewards.request(4, { rewardId: 1 });
    await rewards.approve(4, 2);
    await rewards.reject(4, 2, { reason: "Not today" });
    await rewards.cancel(4, 2);
    await rewards.archive(1);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://api.test/api/rewards",
      "http://api.test/api/rewards",
      "http://api.test/api/rewards/1",
      "http://api.test/api/children/4/reward-redemptions",
      "http://api.test/api/children/4/reward-redemptions",
      "http://api.test/api/children/4/reward-redemptions/2/approve",
      "http://api.test/api/children/4/reward-redemptions/2/reject",
      "http://api.test/api/children/4/reward-redemptions/2/cancel",
      "http://api.test/api/rewards/1",
    ]);
    expect((fetchMock.mock.calls[0][1] as RequestInit).signal).toBe(
      controller.signal
    );
    expect((fetchMock.mock.calls[1][1] as RequestInit).body).toBe(
      JSON.stringify({ title: "Movie night", star_cost: 20 })
    );
    expect((fetchMock.mock.calls[4][1] as RequestInit).body).toBe(
      JSON.stringify({ rewardId: 1 })
    );
    expect((fetchMock.mock.calls[6][1] as RequestInit).body).toBe(
      JSON.stringify({ reason: "Not today" })
    );
    expect(
      new Headers((fetchMock.mock.calls[5][1] as RequestInit).headers).get(
        "Authorization"
      )
    ).toBe("Bearer access-token");
  });

  test("propagates typed reward API errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: "Not enough stars" }, { status: 400 }));
    const client = new ApiClient({
      baseUrl: "http://api.test/api",
      fetch: fetchMock,
    });
    const rewards = createRewardsApi(client);

    await expect(rewards.request(4, { rewardId: 1 })).rejects.toMatchObject<
      ApiError
    >({
      status: 400,
      message: "Not enough stars",
    });
  });
});
