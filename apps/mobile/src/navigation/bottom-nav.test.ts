import { describe, expect, test } from "vitest";
import { BOTTOM_NAV_ITEMS } from "./bottom-nav-items";

describe("bottom nav", () => {
  test("exposes the supported mobile routes", () => {
    expect(BOTTOM_NAV_ITEMS.filter((item) => item.enabled).map((item) => item.route))
      .toEqual(["/home", "/learn", "/rewards", "/profile"]);
  });

  test("keeps insights as a disabled placeholder", () => {
    expect(BOTTOM_NAV_ITEMS.find((item) => item.key === "insights")).toMatchObject({
      enabled: false,
      route: "/home",
    });
  });
});
