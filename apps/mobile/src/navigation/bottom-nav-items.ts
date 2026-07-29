export type MobileTab = "home" | "practice" | "rewards" | "insights" | "profile";

export type BottomNavItem = {
  key: MobileTab;
  label: string;
  icon: string;
  route: "/home" | "/learn" | "/rewards" | "/profile";
  enabled: boolean;
};

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { key: "home", label: "Home", icon: "⌂", route: "/home", enabled: true },
  {
    key: "practice",
    label: "Practice",
    icon: "✎",
    route: "/learn",
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
    route: "/home",
    enabled: false,
  },
  {
    key: "profile",
    label: "Profile",
    icon: "♙",
    route: "/profile",
    enabled: true,
  },
];
