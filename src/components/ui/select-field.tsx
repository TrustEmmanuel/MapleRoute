import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState, type ReactNode } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hapticLight } from "@/lib/haptics";
import { cardShadow } from "@/theme/shadow";
import { colors } from "@/theme/theme";

import { Text } from "./text";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type SelectFieldProps<T extends string> = {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  helper?: string;
  labelInfo?: ReactNode;
};

function useVisibleHeight(fallback: number) {
  const [height, setHeight] = useState(fallback);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const read = () => {
      const next = window.visualViewport?.height ?? window.innerHeight;
      setHeight(Math.round(next));
    };

    read();
    window.addEventListener("resize", read);
    window.visualViewport?.addEventListener("resize", read);
    return () => {
      window.removeEventListener("resize", read);
      window.visualViewport?.removeEventListener("resize", read);
    };
  }, []);

  return Platform.OS === "web" ? height : fallback;
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  helper,
  labelInfo,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width } = useWindowDimensions();
  const visibleHeight = useVisibleHeight(windowHeight);
  const isWeb = Platform.OS === "web";
  const centered = isWeb && width >= 720;
  const selected = options.find((option) => option.value === value);

  const chrome = centered ? 64 : Math.max(insets.bottom, 16) + 16;
  const sheetMaxHeight = Math.max(280, Math.round(visibleHeight - chrome));
  const listMaxHeight = Math.max(180, sheetMaxHeight - 72);

  return (
    <View className={labelInfo ? "relative z-20" : undefined}>
      {labelInfo ? (
        <View className="relative z-10 flex-row items-center justify-between gap-2">
          <Text variant="label" tone="muted" className="flex-1">
            {label}
          </Text>
          {labelInfo}
        </View>
      ) : (
        <Text variant="label" tone="muted">
          {label}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}. Selected: ${selected?.label ?? "None"}`}
        onPress={() => {
          hapticLight();
          setOpen(true);
        }}
        className="mt-2 h-[52px] flex-row items-center justify-between rounded-control border border-control-line bg-canvas px-4 active:bg-surface"
      >
        <Text variant="body" className="flex-1 pr-3" numberOfLines={1}>
          {selected?.label ?? "Select an option"}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      {helper ? (
        <Text variant="small" tone="muted" className="mt-2">
          {helper}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType={isWeb ? "fade" : "slide"}
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <View
          className={`bg-black/30 ${
            centered ? "items-center justify-center px-6" : "justify-end"
          }`}
          style={
            isWeb
              ? {
                  position: "fixed",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  height: visibleHeight,
                }
              : { flex: 1 }
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close options"
            className="absolute inset-0"
            onPress={() => setOpen(false)}
          />
          <View
            className={`w-full overflow-hidden bg-canvas ${
              centered
                ? "max-w-[440px] rounded-panel"
                : "max-w-[680px] self-center rounded-t-panel"
            }`}
            style={[
              centered ? cardShadow : null,
              { maxHeight: sheetMaxHeight },
            ]}
          >
            <View className="flex-row items-center justify-between border-b border-line px-5 py-4">
              <Text variant="heading" className="flex-1 pr-3">
                {label}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={10}
                onPress={() => setOpen(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-surface"
              >
                <Ionicons name="close" size={18} color={colors.ink} />
              </Pressable>
            </View>
            <ScrollView
              style={{ maxHeight: listMaxHeight }}
              bounces={false}
              showsVerticalScrollIndicator
              contentContainerStyle={{
                paddingBottom: centered ? 8 : Math.max(insets.bottom, 12),
              }}
            >
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      hapticLight();
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex-row items-center justify-between gap-3 border-b border-line px-5 py-4 active:bg-surface ${
                      active ? "bg-surface" : ""
                    }`}
                  >
                    <Text
                      variant="body"
                      className={active ? "flex-1 font-inter-semibold" : "flex-1"}
                    >
                      {option.label}
                    </Text>
                    {active ? (
                      <Ionicons name="checkmark" size={18} color={colors.accent} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
