import { View, type ViewProps } from "react-native";

import { cardShadow } from "@/theme/shadow";

type CardProps = ViewProps & {
  variant?: "default" | "muted";
};

export function Card({
  variant = "default",
  className = "",
  style,
  ...props
}: CardProps) {
  const muted = variant === "muted";

  return (
    <View
      className={`rounded-card ${
        muted ? "bg-surface" : "border border-line bg-canvas"
      } ${className}`}
      style={[muted ? undefined : cardShadow, style]}
      {...props}
    />
  );
}
