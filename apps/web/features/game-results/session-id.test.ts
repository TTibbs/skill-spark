import { describe, expect, test, vi } from "vitest";
import { createGameSessionId } from "./session-id";

describe("createGameSessionId", () => {
  test("uses randomUUID when the browser provides it", () => {
    const randomUUID = vi.fn(() => "uuid-from-browser");
    vi.stubGlobal("crypto", { randomUUID });

    expect(createGameSessionId()).toBe("uuid-from-browser");
    expect(randomUUID).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  test("falls back to getRandomValues when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {
      getRandomValues(bytes: Uint8Array) {
        bytes.set([
          0x10, 0x91, 0x8c, 0x1d, 0xa7, 0x23, 0x2f, 0x46, 0x35, 0x89, 0x5a,
          0x3d, 0x9c, 0x8a, 0x18, 0x5b,
        ]);
        return bytes;
      },
    });

    expect(createGameSessionId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );

    vi.unstubAllGlobals();
  });
});
