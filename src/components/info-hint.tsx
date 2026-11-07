import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, useWindowDimensions, View } from "react-native";

import { cardShadow } from "@/theme/shadow";
import { colors } from "@/theme/theme";

import { Text } from "./ui/text";

export function InfoHint({
  label,
  title,
  children,
  guidePath,
  guideLabel = "Read the full explanation",
}: {
  label: string;
  title: string;
  children: ReactNode;
  guidePath: string;
  guideLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = useWindowDimensions();
  const popoverWidth = Math.min(290, Math.max(220, width - 88));

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function cancelHide() {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }

  function show() {
    cancelHide();
    setOpen(true);
  }

  function scheduleHide() {
    cancelHide();
    hideTimer.current = setTimeout(() => setOpen(false), 150);
  }

  function openGuide() {
    cancelHide();
    setOpen(false);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.open(guidePath, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(guidePath as Href);
  }

  return (
    <View
      className="relative"
      onPointerEnter={show}
      onPointerLeave={scheduleHide}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${label} — opens an explanation`}
        hitSlop={8}
        onPress={openGuide}
        onFocus={show}
        onBlur={scheduleHide}
        className="h-6 w-6 items-center justify-center rounded-full active:bg-surface"
      >
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.muted}
        />
      </Pressable>

      {open ? (
        <View
          className="absolute right-0 top-7 z-50 rounded-control border border-line bg-canvas p-3.5"
          style={[{ width: popoverWidth }, cardShadow]}
        >
          <Text variant="small" className="font-inter-semibold">
            {title}
          </Text>
          <View className="mt-1">{children}</View>
          <Pressable
            accessibilityRole="link"
            onPress={openGuide}
            onFocus={cancelHide}
            onBlur={scheduleHide}
            className="mt-1.5 min-h-[32px] justify-center"
          >
            <Text
              variant="small"
              className="font-inter-semibold text-ink underline"
            >
              {guideLabel}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
