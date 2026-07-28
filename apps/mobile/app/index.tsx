import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "@/tw";
import { useAuth } from "@/auth/use-auth";

export default function IndexRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-[#f7f2e8] px-6">
        <ActivityIndicator color="#315f4c" />
        <Text className="mt-4 text-center text-base font-semibold text-[#315f4c]">
          Restoring your session...
        </Text>
      </View>
    );
  }

  return <Redirect href={status === "authenticated" ? "/home" : "/login"} />;
}
