export type MobileTab = "home" | "practice" | "rewards" | "insights" | "profile";

export type BottomNavItem = {
  key: MobileTab;
  label: string;
  icon: string;
  route: "/home" | "/practice" | "/rewards" | "/insights" | "/profile";
  enabled: boolean;
};

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { key: "home", label: "Home", icon: "⌂", route: "/home", enabled: true },
  {
    key: "practice",
    label: "Practice",
    icon: "✎",
    route: "/practice",
    enabled: true,
  },
  {
    key: "rewards",
    label: "Rewards",
    icon: "☆",
    route: "/rewards",
    enabled: true,
  },
  {
    key: "insights",
    label: "Insights",
    icon: "▥",
    route: "/insights",
    enabled: true,
  },
  {
    key: "profile",
    label: "Profile",
    icon: "♙",
    route: "/profile",
    enabled: true,
  },
];
