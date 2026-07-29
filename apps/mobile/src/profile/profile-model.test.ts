import { describe, expect, test } from "vitest";
import { PROFILE_ACCOUNT_ROWS, PROFILE_PREFERENCE_ROWS } from "./profile-model";

describe("profile model", () => {
  test("keeps unsupported account rows as placeholders", () => {
    expect(PROFILE_ACCOUNT_ROWS.map((row) => row.title)).toEqual([
      "Account Information",
      "Plan & Billing",
      "Usage & Limits",
    ]);
    expect(PROFILE_ACCOUNT_ROWS.every((row) => !row.enabled)).toBe(true);
  });

  test("includes settings as a future preference route placeholder", () => {
    expect(PROFILE_PREFERENCE_ROWS[0]).toMatchObject({
      title: "Settings",
      enabled: false,
    });
  });
});
