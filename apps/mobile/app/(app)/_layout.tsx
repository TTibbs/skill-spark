import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "@/tw";
import { useAuth } from "@/auth/use-auth";
import { ChildrenProvider } from "@/children/children-provider";

export default function AppLayout() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-[#f7f2e8] px-6">
        <ActivityIndicator color="#315f4c" />
        <Text className="mt-4 text-center text-base font-semibold text-[#315f4c]">
          Checking your session...
        </Text>
      </View>
    );
  }

  if (status === "unauthenticated") {
    return <Redirect href="/login" />;
  }

  return (
    <ChildrenProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="chores" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="learn" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="games/maths-meadow" />
        <Stack.Screen name="games/memory-match" />
        <Stack.Screen name="games/spelling-garden" />
        <Stack.Screen name="games/colour-critter-catch" />
      </Stack>
    </ChildrenProvider>
  );
}
