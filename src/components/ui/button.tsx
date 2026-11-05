import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";

import { hapticLight } from "@/lib/haptics";
import { colors } from "@/theme/theme";

import { Text } from "./text";

type ButtonProps = Omit<PressableProps, "children"> & {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger";
};

export function Button({
  label,
  loading = false,
  loadingLabel = "Please wait…",
  icon,
  variant = "primary",
  disabled,
  onPress,
  className = "",
  ...props
}: ButtonProps) {
  const inactive = disabled || loading;
  const secondary = variant === "secondary";
  const danger = variant === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={(event) => {
        hapticLight();
        onPress?.(event);
      }}
      className={`h-[52px] flex-row items-center justify-center gap-2 rounded-control px-5 ${
        danger
          ? "border border-accent bg-canvas active:bg-danger-surface"
          : secondary
            ? "border border-control-line bg-canvas active:bg-surface"
            : "bg-accent active:bg-accent-pressed"
      } ${inactive ? "opacity-60" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={danger ? colors.accent : secondary ? colors.ink : colors.canvas}
        />
      ) : (
        icon
      )}
      <Text
        variant="button"
        tone={danger ? "accent" : secondary ? "ink" : "white"}
      >
        {loading ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}
