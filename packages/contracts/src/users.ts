export type UserPreferences = {
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
  language: "en" | "es" | "fr" | "de" | "it" | "pt" | "ru" | "zh";
  has_pin: boolean;
};

export type AuthenticatedUser = {
  id: number;
  username: string;
  display_name: string;
  email: string;
  profile_image_url?: string | null;
  is_parent: boolean;
  total_children?: number;
  timezone: string;
  user_preferences: UserPreferences;
  created_at: string;
  updated_at: string;
};

export type CurrentUserResponse = {
  status: "success";
  data: {
    user: AuthenticatedUser;
  };
};

export type UserResponse = {
  user: AuthenticatedUser;
};

export type SetPinInput = {
  pin: string;
};

export type VerifyPinInput = {
  pin: string;
};

export type PinPreferencesResponse = {
  status: "success";
  data: {
    user_preferences: UserPreferences | null;
  };
};

export type VerifyPinResponse = {
  status: "success";
  data: {
    verified: boolean;
  };
};
