import { View } from "react-native";

import { Text } from "./ui/text";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <View className={`rounded-card bg-surface p-4 ${className}`}>
      <Text variant="small" tone="muted">
        MapleRoute is an independent guide. It is not legal or immigration
        advice and is not affiliated with IRCC or the Government of Canada.
      </Text>
    </View>
  );
}
