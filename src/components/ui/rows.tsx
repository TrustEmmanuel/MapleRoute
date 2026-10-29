import { View } from "react-native";

import { Text } from "./text";

export function Divider({ className = "" }: { className?: string }) {
  return <View className={`h-px bg-line ${className}`} />;
}

export function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-4 py-3">
      <Text variant="small" tone="muted">
        {label}
      </Text>
      <Text variant="small" className="flex-1 text-right" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
