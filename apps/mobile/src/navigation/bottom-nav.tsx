import * as React from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, Text, View } from "@/tw";
import { BOTTOM_NAV_ITEMS, type MobileTab } from "./bottom-nav-items";

export { BOTTOM_NAV_ITEMS, type MobileTab } from "./bottom-nav-items";

export const BOTTOM_NAV_BASE_HEIGHT = 74;

export function BottomNav({ active }: { active: MobileTab }) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <View
      className="flex-row border-t border-[#d8cdb8] bg-white px-4"
      style={{
        bottom: 0,
        height: BOTTOM_NAV_BASE_HEIGHT + bottomInset,
        left: 0,
        paddingBottom: bottomInset,
        paddingTop: 10,
        position: "absolute",
        right: 0,
      }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive, disabled: !item.enabled }}
            disabled={!item.enabled}
            key={item.key}
            onPress={() => router.push(item.route)}
            className="flex-1 items-center justify-center"
          >
            <Text
              className="text-2xl font-black"
              style={{ color: isActive ? "#7c3aed" : "#5c6f65" }}
            >
              {item.icon}
            </Text>
            <Text
              className="mt-1 text-xs font-bold"
              style={{ color: isActive ? "#7c3aed" : "#5c6f65" }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
