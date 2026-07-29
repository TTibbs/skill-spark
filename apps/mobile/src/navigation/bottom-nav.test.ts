import { describe, expect, test } from "vitest";
import { BOTTOM_NAV_ITEMS } from "./bottom-nav-items";

describe("bottom nav", () => {
  test("exposes the supported mobile routes", () => {
    expect(BOTTOM_NAV_ITEMS.filter((item) => item.enabled).map((item) => item.route))
      .toEqual(["/home", "/practice", "/rewards", "/insights", "/profile"]);
  });

  test("marks insights as an active route", () => {
    expect(BOTTOM_NAV_ITEMS.find((item) => item.key === "insights")).toMatchObject({
      enabled: true,
      route: "/insights",
    });
  });

  test("keeps rewards available for the bottom navigation", () => {
    expect(BOTTOM_NAV_ITEMS.find((item) => item.key === "rewards")).toMatchObject({
      enabled: true,
      label: "Rewards",
      route: "/rewards",
    });
  });
});
