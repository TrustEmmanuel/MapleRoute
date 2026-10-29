import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { cardShadow } from "@/theme/shadow";
import { colors } from "@/theme/theme";

import { Text } from "./ui/text";

export function InfoDialog({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/30 px-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="absolute inset-0"
          onPress={onClose}
        />
        <View
          className="w-full max-w-[460px] overflow-hidden rounded-panel bg-canvas"
          style={cardShadow}
        >
          <View className="flex-row items-center justify-between border-b border-line px-5 py-4">
            <Text variant="heading" className="flex-1 pr-3">
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={10}
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-surface"
            >
              <Ionicons name="close" size={18} color={colors.ink} />
            </Pressable>
          </View>
          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingVertical: 18 }}
            style={{ maxHeight: 520 }}
            showsVerticalScrollIndicator
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
