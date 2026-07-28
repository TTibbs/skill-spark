import * as React from "react";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "@/tw";
import { useAuth } from "@/auth/use-auth";
import { useChildren } from "@/children/use-children";

export function HomeScreen() {
  const { user, logout } = useAuth();
  const {
    children,
    selectedChild,
    status,
    error,
    reload,
    selectChild,
  } = useChildren();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-[#f7f2e8]"
      contentContainerClassName="px-5 pb-10 pt-16"
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
            Skill Spark
          </Text>
          <Text className="mt-2 text-3xl font-black text-[#243c32]">
            Hello, {user?.display_name ?? "parent"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={isLoggingOut}
          onPress={() => void handleLogout()}
          className="rounded-full border border-[#c9d6ce] bg-white px-4 py-3"
        >
          <Text className="text-sm font-black text-[#315f4c]">
            {isLoggingOut ? "Leaving..." : "Log out"}
          </Text>
        </Pressable>
      </View>

      {status === "loading" ? (
        <View className="mt-10 items-center rounded-[28px] bg-white p-8">
          <ActivityIndicator color="#315f4c" />
          <Text className="mt-4 text-base font-semibold text-[#315f4c]">
            Loading children...
          </Text>
        </View>
      ) : null}

      {status === "error" ? (
        <View className="mt-10 rounded-[28px] bg-white p-6">
          <Text className="text-xl font-black text-[#243c32]">
            Could not load children
          </Text>
          <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
            {error ?? "Try again when your connection is ready."}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void reload()}
            className="mt-5 items-center rounded-2xl bg-[#315f4c] px-5 py-4"
          >
            <Text className="font-black text-white">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {status === "ready" && children.length === 0 ? (
        <View className="mt-10 rounded-[28px] bg-white p-6">
          <Text className="text-xl font-black text-[#243c32]">
            No child profiles yet
          </Text>
          <Text className="mt-2 text-base leading-6 text-[#5c6f65]">
            Create a child profile from the web parent dashboard, then return
            here to follow their progress.
          </Text>
        </View>
      ) : null}

      {selectedChild ? (
        <>
          <View className="mt-8 rounded-[28px] bg-[#315f4c] p-6">
            <Text className="text-sm font-black uppercase tracking-[2px] text-[#bad3c7]">
              Selected child
            </Text>
            <Text className="mt-2 text-4xl font-black text-white">
              {selectedChild.name}
            </Text>
            <Text className="mt-2 text-base font-semibold text-[#e5f0ea]">
              Age {selectedChild.age}
            </Text>
          </View>

          <View className="mt-5 flex-row gap-3">
            <Metric label="Level" value={selectedChild.level} />
            <Metric label="XP" value={selectedChild.xp} />
            <Metric label="Stars" value={selectedChild.reward_points} />
          </View>

          <View className="mt-8 gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/chores")}
              className="items-center rounded-2xl bg-[#315f4c] px-5 py-4"
            >
              <Text className="text-base font-black text-white">
                Open chores
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/rewards")}
              className="items-center rounded-2xl border border-[#c9d6ce] bg-white px-5 py-4"
            >
              <Text className="text-base font-black text-[#315f4c]">
                Open rewards
              </Text>
            </Pressable>
          </View>

          {children.length > 1 ? (
            <View className="mt-8">
              <Text className="text-lg font-black text-[#243c32]">
                Switch child
              </Text>
              <View className="mt-3 gap-3">
                {children.map((child) => (
                  <Pressable
                    accessibilityRole="button"
                    key={child.id}
                    onPress={() => void selectChild(child.id)}
                    className={`rounded-2xl border px-4 py-4 ${
                      child.id === selectedChild.id
                        ? "border-[#315f4c] bg-[#e2efe8]"
                        : "border-[#d8cdb8] bg-white"
                    }`}
                  >
                    <Text className="text-base font-black text-[#243c32]">
                      {child.name}
                    </Text>
                    <Text className="mt-1 text-sm font-semibold text-[#5c6f65]">
                      Level {child.level} · {child.reward_points} stars
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 rounded-3xl bg-white p-4">
      <Text className="text-xs font-black uppercase tracking-[1.5px] text-[#5d9476]">
        {label}
      </Text>
      <Text className="mt-2 text-2xl font-black text-[#243c32]">{value}</Text>
    </View>
  );
}
