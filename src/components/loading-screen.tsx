import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/theme";

import { BrandLockup } from "./brand";

export function LoadingScreen() {
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-canvas">
      <View className="flex-1 items-center justify-center gap-5">
        <BrandLockup />
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    </SafeAreaView>
  );
}
