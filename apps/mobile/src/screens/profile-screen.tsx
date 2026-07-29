import * as React from "react";
import { Alert } from "react-native";
import { useAuth } from "@/auth/use-auth";
import { useChildren } from "@/children/use-children";
import { BottomNav } from "@/navigation/bottom-nav";
import {
  PROFILE_ACCOUNT_ROWS,
  PROFILE_PREFERENCE_ROWS,
  type ProfileRow,
} from "@/profile/profile-model";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#f4efff";

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { children, selectedChild, selectChild, status } = useChildren();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="px-5 pt-16"
        contentContainerStyle={{ paddingBottom: 132 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-4xl font-black text-[#243c32]">Profile</Text>
            <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
              Manage your account, children and preferences.
            </Text>
          </View>
          <View
            className="items-center justify-center rounded-full border border-[#d8cdb8] bg-white"
            style={{ height: 58, width: 58 }}
          >
            <Text className="text-2xl">♢</Text>
          </View>
        </View>

        <View
          className="mt-8 flex-row items-center rounded-[28px] border border-[#d8cdb8] bg-white p-5"
          style={{ boxShadow: "0 12px 24px rgba(36, 60, 50, 0.08)" }}
        >
          <Avatar label={user?.display_name ?? user?.username ?? "Parent"} size={82} />
          <View className="flex-1" style={{ marginLeft: 18 }}>
            <Text className="text-2xl font-black text-[#243c32]">
              {user?.display_name ?? user?.username ?? "Parent"}
            </Text>
            <Text className="mt-2 text-base font-semibold text-[#5c6f65]">
              {user?.email ?? "Signed in"}
            </Text>
            <Text
              className="mt-3 text-sm font-black"
              style={{
                alignSelf: "flex-start",
                backgroundColor: PURPLE_LIGHT,
                borderRadius: 12,
                color: PURPLE,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              Parent account
            </Text>
          </View>
          <Text className="text-3xl text-[#5c6f65]">›</Text>
        </View>

        <View className="mt-8 rounded-[28px] border border-[#d8cdb8] bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-black text-[#243c32]">Children</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(
                  "Manage children",
                  "Child profiles are created and edited from the parent web dashboard."
                )
              }
            >
              <Text className="text-base font-black" style={{ color: PURPLE }}>
                Manage Children ›
              </Text>
            </Pressable>
          </View>

          {status === "loading" ? (
            <View className="mt-5 items-center">
              <ActivityIndicator color={PURPLE} />
            </View>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
            className="mt-5"
          >
            {children.map((child) => {
              const selected = selectedChild?.id === child.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={child.id}
                  onPress={() => void selectChild(child.id)}
                  className="items-center rounded-2xl border bg-white p-4"
                  style={{
                    borderColor: selected ? PURPLE : "#d8cdb8",
                    width: 132,
                  }}
                >
                  <Avatar label={child.name} size={58} />
                  <Text className="mt-3 text-base font-black text-[#243c32]">
                    {child.name}
                  </Text>
                  <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">
                    Age {child.age}
                  </Text>
                  {selected ? (
                    <Text className="mt-2 text-sm font-black" style={{ color: PURPLE }}>
                      Selected
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
            <View
              className="items-center justify-center rounded-2xl border border-[#d8cdb8] bg-white p-4"
              style={{ width: 132 }}
            >
              <Text className="text-3xl" style={{ color: PURPLE }}>
                +
              </Text>
              <Text className="mt-3 text-base font-black" style={{ color: PURPLE }}>
                Add Child
              </Text>
              <Text className="mt-1 text-center text-xs font-semibold text-[#5c6f65]">
                Web dashboard
              </Text>
            </View>
          </ScrollView>
        </View>

        <SettingsGroup
          title="Account"
          rows={PROFILE_ACCOUNT_ROWS}
        />

        <SettingsGroup
          title="Preferences"
          rows={PROFILE_PREFERENCE_ROWS}
        />

        <Pressable
          accessibilityRole="button"
          disabled={isLoggingOut}
          onPress={() => void handleLogout()}
          className="mt-8 items-center rounded-2xl px-5 py-4"
          style={{ backgroundColor: "#f9ded7" }}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#8a3324" />
          ) : (
            <Text className="text-base font-black text-[#8a3324]">Log out</Text>
          )}
        </Pressable>
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
    <View className="mt-8 rounded-[28px] border border-[#d8cdb8] bg-white p-5">
      <Text className="text-xl font-black text-[#243c32]">{title}</Text>
      <View className="mt-4">
        {rows.map((row, index) => (
          <View
            key={row.title}
            className="flex-row items-center py-4"
            style={{
              borderBottomColor: index === rows.length - 1 ? "transparent" : "#eee8f8",
              borderBottomWidth: index === rows.length - 1 ? 0 : 1,
              opacity: row.enabled ? 1 : 0.72,
            }}
          >
            <View
              className="items-center justify-center rounded-full"
              style={{ backgroundColor: PURPLE_LIGHT, height: 54, width: 54 }}
            >
              <Text className="text-2xl" style={{ color: PURPLE }}>
                {row.icon}
              </Text>
            </View>
            <View className="flex-1" style={{ marginLeft: 16 }}>
              <Text className="text-base font-black text-[#243c32]">
                {row.title}
              </Text>
              <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">
                {row.subtitle}
              </Text>
            </View>
            <Text className="text-3xl text-[#5c6f65]">›</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Avatar({ label, size }: { label: string; size: number }) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{ backgroundColor: PURPLE_LIGHT, height: size, width: size }}
    >
      <Text className="font-black" style={{ color: PURPLE, fontSize: size * 0.34 }}>
        {label.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}
