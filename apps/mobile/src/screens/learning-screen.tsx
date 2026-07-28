import * as React from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { useChildren } from "@/children/use-children";

export function LearningScreen() {
  const { selectedChild } = useChildren();

  return (
    <ScrollView
      className="flex-1 bg-[#f7f2e8]"
      contentContainerClassName="px-5 pb-10 pt-16"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
            Learning
          </Text>
          <Text className="mt-2 text-3xl font-black text-[#243c32]">
            {selectedChild ? `Ready, ${selectedChild.name}?` : "Pick a child"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/home")}
          className="rounded-full border border-[#c9d6ce] bg-white px-4 py-3"
        >
          <Text className="text-sm font-black text-[#315f4c]">Home</Text>
        </Pressable>
      </View>

      <View className="mt-8 gap-3">
        <ActivityCard
          title="Maths Meadow"
          body="Answer a short round of number questions and save progress."
          action="Play"
          onPress={() => router.push("/games/maths-meadow")}
        />
        <ActivityCard title="Memory Match" body="Coming soon on mobile." />
        <ActivityCard title="Spelling Garden" body="Coming soon on mobile." />
        <ActivityCard title="Colour Critter Catch" body="Coming soon on mobile." />
      </View>
    </ScrollView>
  );
}

function ActivityCard({
  title,
  body,
  action,
  onPress,
}: {
  title: string;
  body: string;
  action?: string;
  onPress?: () => void;
}) {
  const playable = Boolean(onPress);

  return (
    <View className="rounded-[28px] border border-[#d8cdb8] bg-white p-5">
      <Text className="text-xl font-black text-[#243c32]">{title}</Text>
      <Text className="mt-2 text-base leading-6 text-[#5c6f65]">{body}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={!playable}
        onPress={onPress}
        className={`mt-4 items-center rounded-2xl px-5 py-4 ${
          playable ? "bg-[#315f4c]" : "bg-[#c9d6ce]"
        }`}
      >
        <Text className="font-black text-white">{action ?? "Coming soon"}</Text>
      </Pressable>
    </View>
  );
}
