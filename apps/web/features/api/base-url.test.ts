import { afterEach, describe, expect, it } from "vitest";
import { getBrowserApiBaseUrl } from "./base-url";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
});

describe("getBrowserApiBaseUrl", () => {
  it("defaults to the same-origin API proxy when unset", () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(getBrowserApiBaseUrl()).toBe("/api");
  });

  it("allows a same-origin API path", () => {
    process.env.NEXT_PUBLIC_API_URL = "/api";

    expect(getBrowserApiBaseUrl()).toBe("/api");
  });

  it("allows an absolute API URL", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test/api";

    expect(getBrowserApiBaseUrl()).toBe("https://api.example.test/api");
  });

  it("throws for malformed relative values", () => {
    process.env.NEXT_PUBLIC_API_URL = "Aug 02 23:42/api";

    expect(() => getBrowserApiBaseUrl()).toThrow(
      'Invalid NEXT_PUBLIC_API_URL value "Aug 02 23:42/api".'
    );
  });
});
