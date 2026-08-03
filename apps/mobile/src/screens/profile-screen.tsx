import * as React from "react";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/auth/use-auth";
import { ChildProfileSwitcher } from "@/children/child-profile-switcher";
import { useChildren } from "@/children/use-children";
import { BottomNav, BOTTOM_NAV_BASE_HEIGHT } from "@/navigation/bottom-nav";
import {
  PROFILE_ACCOUNT_ROWS,
  PROFILE_PREFERENCE_ROWS,
  type ProfileRow,
} from "@/profile/profile-model";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";

const INK = "#21372e";
const MUTED = "#66766f";
const GREEN = "#2b5f4b";
const CREAM = "#fbfcf7";
const BORDER = "#d9e5dd";
const YELLOW = "#ffd86f";
const YELLOW_SOFT = "#fff0bd";
const SAGE = "#dceee3";
const BLUE_SOFT = "#dcecff";

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { children, selectedChild, selectChild, status } = useChildren();
  const insets = useSafeAreaInsets();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: CREAM }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom:
            BOTTOM_NAV_BASE_HEIGHT + Math.max(insets.bottom, 12) + 24,
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 24) + 20,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-4xl font-black" style={{ color: INK }}>
              Profile
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: MUTED }}>
              Manage your account, children and preferences.
            </Text>
          </View>
          <View
            className="items-center justify-center rounded-full border"
            style={{
              backgroundColor: YELLOW,
              borderColor: "#e2b94d",
              height: 58,
              width: 58,
            }}
          >
            <Text className="text-2xl" style={{ color: INK }}>
              ♢
            </Text>
          </View>
        </View>

        <View
          className="mt-8 flex-row items-center overflow-hidden rounded-[32px] border p-5"
          style={{
            backgroundColor: "#203c32",
            borderColor: "#315848",
            boxShadow: "0 18px 40px rgba(32, 60, 50, 0.16)",
          }}
        >
          <View
            className="absolute -right-10 -top-12 h-32 w-32 rounded-full"
            style={{ backgroundColor: "rgba(255,216,111,0.2)" }}
          />
          <Avatar
            label={user?.display_name ?? user?.username ?? "Parent"}
            size={70}
            variant="gold"
          />
          <View className="flex-1" style={{ marginLeft: 18 }}>
            <Text
              className="text-sm font-black uppercase tracking-[2px]"
              style={{ color: "#b9d7c8" }}
            >
              Parent account
            </Text>
            <Text
              className="mt-2 text-2xl font-black"
              style={{ color: "#ffffff" }}
            >
              {user?.display_name ?? user?.username ?? "Parent"}
            </Text>
            <Text
              className="mt-1 text-base font-semibold"
              style={{ color: "#d7e8df" }}
            >
              {user?.email ?? "Signed in"}
            </Text>
          </View>
        </View>

        <View
          className="mt-8 rounded-[28px] border bg-white p-5"
          style={{ borderColor: BORDER }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-black" style={{ color: INK }}>
                Child profiles
              </Text>
              <Text
                className="mt-1 text-sm font-semibold"
                style={{ color: MUTED }}
              >
                Switch who is active in the app.
              </Text>
            </View>
          </View>

          {status === "loading" ? (
            <View className="mt-5 items-center">
              <ActivityIndicator color={GREEN} />
            </View>
          ) : null}

          <ChildProfileSwitcher
            className="mt-5"
            children={children}
            selectedChildId={selectedChild?.id}
            onSelect={(childId) => void selectChild(childId)}
          />

          {selectedChild ? (
            <View className="mt-5 flex-row gap-3">
              <ProfileStat label="Level" value={selectedChild.level} />
              <ProfileStat label="Stars" value={selectedChild.reward_points} />
              <ProfileStat label="XP" value={selectedChild.xp} />
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              Alert.alert(
                "Manage children",
                "Child profiles are created and edited from the parent web dashboard."
              )
            }
            className="mt-5 items-center rounded-2xl border px-5 py-4"
            style={{ borderColor: GREEN, backgroundColor: SAGE }}
          >
            <Text className="text-base font-black" style={{ color: GREEN }}>
              Manage children on web
            </Text>
          </Pressable>
        </View>

        <SettingsGroup title="Account" rows={PROFILE_ACCOUNT_ROWS} />

        <SettingsGroup title="Preferences" rows={PROFILE_PREFERENCE_ROWS} />

        <View
          className="mt-8 rounded-[28px] border bg-white p-5"
          style={{ borderColor: BORDER }}
        >
          <Text className="text-xl font-black" style={{ color: INK }}>
            Session
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isLoggingOut}
            onPress={() => void handleLogout()}
            className="mt-4 items-center rounded-2xl px-5 py-4"
            style={{ backgroundColor: "#f9ded7" }}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#8a3324" />
            ) : (
              <Text
                className="text-base font-black"
                style={{ color: "#8a3324" }}
              >
                Log out
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
      <BottomNav active="profile" />
    </View>
  );
}

function SettingsGroup({
  title,
  rows,
}: {
  title: string;
  rows: ProfileRow[];
}) {
  return (
    <View
      className="mt-8 rounded-[28px] border bg-white p-5"
      style={{ borderColor: BORDER }}
    >
      <Text className="text-xl font-black" style={{ color: INK }}>
        {title}
      </Text>
      <View className="mt-4">
        {rows.map((row, index) => (
          <View
            key={row.title}
            className="flex-row items-center py-4"
            style={{
              borderBottomColor:
                index === rows.length - 1 ? "transparent" : BORDER,
              borderBottomWidth: index === rows.length - 1 ? 0 : 1,
              opacity: row.enabled ? 1 : 0.72,
            }}
          >
            <View
              className="items-center justify-center rounded-2xl"
              style={{ backgroundColor: SAGE, height: 52, width: 52 }}
            >
              <Text className="text-xl" style={{ color: GREEN }}>
                {row.icon}
              </Text>
            </View>
            <View className="flex-1" style={{ marginLeft: 16 }}>
              <Text className="text-base font-black" style={{ color: INK }}>
                {row.title}
              </Text>
              <Text
                className="mt-1 text-sm font-semibold"
                style={{ color: MUTED }}
              >
                {row.subtitle}
              </Text>
            </View>
            <Text
              className="text-xs font-black uppercase tracking-[1px]"
              style={{
                backgroundColor: row.enabled ? YELLOW_SOFT : "#eef3ef",
                borderRadius: 999,
                color: row.enabled ? GREEN : MUTED,
                overflow: "hidden",
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              {row.enabled ? "Open" : "Soon"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <View
      className="flex-1 rounded-2xl px-3 py-3"
      style={{ backgroundColor: YELLOW_SOFT }}
    >
      <Text
        className="text-xl font-black"
        style={{ color: INK, fontVariant: ["tabular-nums"] }}
      >
        {value}
      </Text>
      <Text className="mt-1 text-xs font-bold" style={{ color: MUTED }}>
        {label}
      </Text>
    </View>
  );
}

function Avatar({
  label,
  size,
  variant = "blue",
}: {
  label: string;
  size: number;
  variant?: "blue" | "gold";
}) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        backgroundColor: variant === "gold" ? YELLOW : BLUE_SOFT,
        height: size,
        width: size,
      }}
    >
      <Text
        className="font-black"
        style={{ color: INK, fontSize: size * 0.34 }}
      >
        {label.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}
