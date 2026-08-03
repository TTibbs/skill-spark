import type { ChildProfile } from "@skill-spark/contracts";
import { Pressable, ScrollView, Text, View } from "@/tw";

const INK = "#21372e";
const GREEN_DARK = "#203c32";
const BORDER = "#d9e5dd";
const YELLOW = "#ffd86f";
const BLUE_SOFT = "#dcecff";

export function ChildProfileSwitcher({
  children,
  selectedChildId,
  onSelect,
  className,
}: {
  children: ChildProfile[];
  selectedChildId?: number;
  onSelect(childId: number): void;
  className?: string;
}) {
  if (children.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className}
      contentContainerStyle={{
        gap: 12,
        paddingHorizontal: 2,
        paddingVertical: 4,
      }}
    >
      {children.map((child) => {
        const selected = selectedChildId === child.id;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={child.id}
            onPress={() => onSelect(child.id)}
            className="flex-row items-center rounded-full border px-4 py-3"
            style={{
              backgroundColor: selected ? GREEN_DARK : "rgba(255,255,255,0.78)",
              borderColor: selected ? GREEN_DARK : BORDER,
            }}
          >
            <ChildPillAvatar label={child.name} selected={selected} size={32} />
            <Text
              className="text-base font-black"
              style={{ color: selected ? "#ffffff" : INK, marginLeft: 8 }}
            >
              {child.name}
            </Text>
            {selected ? (
              <Text
                className="text-base font-black"
                style={{ color: "#ffffff", marginLeft: 8 }}
              >
                ✓
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ChildPillAvatar({
  label,
  selected,
  size,
}: {
  label: string;
  selected: boolean;
  size: number;
}) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        backgroundColor: selected ? YELLOW : BLUE_SOFT,
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
