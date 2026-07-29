export type ProfileRow = {
  icon: string;
  title: string;
  subtitle: string;
  enabled: boolean;
};

export const PROFILE_ACCOUNT_ROWS: ProfileRow[] = [
  {
    icon: "♙",
    title: "Account Information",
    subtitle: "View your signed-in parent details",
    enabled: false,
  },
  {
    icon: "♕",
    title: "Plan & Billing",
    subtitle: "Future subscription settings",
    enabled: false,
  },
  {
    icon: "▣",
    title: "Usage & Limits",
    subtitle: "Future family limit controls",
    enabled: false,
  },
];

export const PROFILE_PREFERENCE_ROWS: ProfileRow[] = [
  {
    icon: "⚙",
    title: "Settings",
    subtitle: "Future app preferences",
    enabled: false,
  },
  {
    icon: "◇",
    title: "Privacy & Security",
    subtitle: "Managed through the parent web dashboard",
    enabled: false,
  },
  {
    icon: "?",
    title: "Help & Support",
    subtitle: "Support content is not available in-app yet",
    enabled: false,
  },
];
