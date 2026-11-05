import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { hapticSuccess } from "@/lib/haptics";
import { useReduceMotion } from "@/lib/use-reduce-motion";
import { colors } from "@/theme/theme";

export function DoneToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  const scale = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      scale.setValue(checked ? 1 : 0);
      return;
    }
    Animated.spring(scale, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 9,
    }).start();
  }, [checked, reduceMotion, scale]);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      aria-checked={checked}
      accessibilityLabel={label}
      onPress={() => {
        if (!checked) hapticSuccess();
        onChange(!checked);
      }}
      className={`min-h-[56px] flex-row items-center gap-3.5 rounded-card border px-4 py-3.5 active:opacity-90 ${
        checked ? "border-accent bg-danger-surface" : "border-control-line bg-canvas"
      }`}
    >
      <View
        className={`h-7 w-7 items-center justify-center rounded-full border-2 ${
          checked ? "border-accent bg-accent" : "border-control-line bg-canvas"
        }`}
      >
        <Animated.View
          style={{ transform: [{ scale }], opacity: scale }}
          className="items-center justify-center"
        >
          <Ionicons name="checkmark" size={17} color={colors.canvas} />
        </Animated.View>
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-inter-semibold">{label}</Text>
        {description ? (
          <Text variant="small" tone="muted" className="mt-0.5">
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function ReadyToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      aria-checked={checked}
      accessibilityLabel="I have this ready"
      onPress={() => onChange(!checked)}
      className="min-h-[44px] flex-row items-center gap-2 pl-1 active:opacity-70"
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-[6px] border ${
          checked ? "border-accent bg-accent" : "border-control-line bg-canvas"
        }`}
      >
        {checked ? (
          <Ionicons name="checkmark" size={13} color={colors.canvas} />
        ) : null}
      </View>
      <Text variant="small" className="font-inter-medium">
        I have this ready
      </Text>
    </Pressable>
  );
}
