import type { ReactNode, RefObject } from "react";
import { ScrollView, type ScrollViewInstance, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  children,
  scrollRef,
}: {
  children: ReactNode;
  scrollRef?: RefObject<ScrollViewInstance | null>;
}) {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        <View className="mx-auto w-full max-w-[680px]">
          <View className="px-5 pt-4">{children}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
