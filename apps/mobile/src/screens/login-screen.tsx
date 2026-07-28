import * as React from "react";
import { router } from "expo-router";
import { ApiError } from "@skill-spark/api-client";
import {
  ActivityIndicator,
  Pressable,
  ScreenKeyboardView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "@/tw";
import { useAuth } from "@/auth/use-auth";

export function LoginScreen() {
  const { login, status } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/home");
    }
  }, [status]);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await login({ email: trimmedEmail, password });
      router.replace("/home");
    } catch (loginError) {
      const developmentDetail =
        __DEV__ && loginError instanceof Error ? ` ${loginError.message}` : "";
      setError(
        loginError instanceof ApiError
          ? "Invalid email or password."
          : `Unable to log in right now.${developmentDetail}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenKeyboardView className="flex-1 bg-[#f7f2e8]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="min-h-full justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="rounded-[28px] border border-[#d8cdb8] bg-white/90 p-6 shadow-sm">
          <Text className="text-sm font-black uppercase tracking-[2px] text-[#5d9476]">
            Skill Spark
          </Text>
          <Text className="mt-3 text-4xl font-black text-[#243c32]">
            Parent login
          </Text>
          <Text className="mt-3 text-base leading-6 text-[#5c6f65]">
            Sign in to choose a child and follow their learning progress.
          </Text>

          <View className="mt-8">
            <Text className="mb-2 text-sm font-bold text-[#315f4c]">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="parent@example.com"
              className="rounded-2xl border border-[#cbd8cf] bg-[#fbfaf5] px-4 py-4 text-base text-[#243c32]"
            />
          </View>

          <View className="mt-5">
            <Text className="mb-2 text-sm font-bold text-[#315f4c]">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="password"
              secureTextEntry
              placeholder="Password"
              className="rounded-2xl border border-[#cbd8cf] bg-[#fbfaf5] px-4 py-4 text-base text-[#243c32]"
            />
          </View>

          {error ? (
            <Text className="mt-4 rounded-2xl bg-[#f9ded7] px-4 py-3 text-sm font-semibold text-[#8a3324]">
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => void handleLogin()}
            className={`mt-6 items-center rounded-2xl px-5 py-4 ${
              isSubmitting ? "bg-[#9ab9a8]" : "bg-[#315f4c]"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-black text-white">Log in</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenKeyboardView>
  );
}
