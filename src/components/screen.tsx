import type { ReactNode, RefObject } from "react";
import { ScrollView, type ScrollViewInstance, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  children,
  scrollRef,
  wide = false,
  background = "canvas",
}: {
  children: ReactNode;
  scrollRef?: RefObject<ScrollViewInstance | null>;
  wide?: boolean;
  background?: "canvas" | "surface";
}) {
  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${background === "surface" ? "bg-surface" : "bg-canvas"}`}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        <View
          className="w-full px-5"
          style={{ maxWidth: wide ? 1240 : 720, marginHorizontal: "auto" }}
        >
          <View className="pt-4">{children}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
