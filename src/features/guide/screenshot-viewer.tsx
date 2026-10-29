import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Text } from "@/components/ui/text";
import { isLocalImagePath } from "@/lib/local-images";
import { colors } from "@/theme/theme";

import type { StepHighlight, StepScreenshot } from "./types";
import { useImageUri } from "./use-image-uri";

function HighlightOverlay({ highlights }: { highlights: StepHighlight[] }) {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      {highlights.map((box, index) => (
        <View
          key={`${box.x}-${box.y}-${index}`}
          style={{
            position: "absolute",
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.w}%`,
            height: `${box.h}%`,
            borderWidth: 2,
            borderColor: colors.accent,
            borderRadius: 6,
            backgroundColor: "rgba(213, 43, 30, 0.08)",
          }}
        >
          {box.label ? (
            <View
              style={{
                position: "absolute",
                top: -1,
                left: -2,
                backgroundColor: colors.accent,
                borderTopLeftRadius: 4,
                borderBottomRightRadius: 4,
                paddingHorizontal: 5,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  color: colors.canvas,
                  fontSize: 10,
                  lineHeight: 14,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                {box.label}
              </Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function ScreenshotImage({
  screenshot,
  uri,
  aspect,
  onAspect,
  style,
}: {
  screenshot: StepScreenshot;
  uri: string;
  aspect: number;
  onAspect?: (aspect: number) => void;
  style?: object;
}) {
  return (
    <View
      style={[style, { aspectRatio: aspect }]}
      className="w-full overflow-hidden rounded-card border border-line bg-surface"
    >
      <Image
        source={{ uri }}
        resizeMode="contain"
        accessible
        accessibilityLabel={screenshot.altText}
        style={{ width: "100%", height: "100%" }}
        onLoad={(event) => {
          const source = (
            event.nativeEvent as {
              source?: { width?: number; height?: number };
            }
          ).source;
          if (source?.width && source?.height) {
            onAspect?.(source.width / source.height);
          }
        }}
      />
      <HighlightOverlay highlights={screenshot.highlights} />
    </View>
  );
}

export function ScreenshotViewer({
  screenshot,
  showEmpty = false,
}: {
  screenshot: StepScreenshot | null;
  showEmpty?: boolean;
}) {
  const [zoom, setZoom] = useState(false);
  const [aspect, setAspect] = useState(16 / 10);
  const uri = useImageUri(screenshot?.storagePath ?? null);

  if (!screenshot) {
    if (!showEmpty) return null;
    return (
      <View className="mt-6 rounded-card border border-dashed border-line bg-surface px-5 py-8">
        <View className="items-center">
          <Ionicons name="image-outline" size={28} color={colors.muted} />
          <Text variant="small" className="mt-3 font-inter-semibold">
            No screenshot yet
          </Text>
          <Text variant="small" tone="muted" className="mt-1 text-center">
            Add one from the admin guide so this step shows the exact official
            page.
          </Text>
        </View>
      </View>
    );
  }

  if (!uri) {
    const savedElsewhere = isLocalImagePath(screenshot.storagePath);
    return (
      <View className="mt-6 rounded-card border border-dashed border-line bg-surface px-5 py-8">
        <View className="items-center">
          <Ionicons name="image-outline" size={28} color={colors.muted} />
          <Text variant="small" className="mt-3 font-inter-semibold">
            {savedElsewhere ? "Screenshot saved on another device" : "Screenshot unavailable"}
          </Text>
          <Text variant="small" tone="muted" className="mt-1 text-center">
            {savedElsewhere
              ? "This image has not been uploaded yet, so other devices can't show it."
              : "The image could not be loaded. Open the official page to see the current screen."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${screenshot.altText}. Open full screen`}
        onPress={() => setZoom(true)}
        className="mt-6 active:opacity-90"
      >
        <ScreenshotImage
          screenshot={screenshot}
          uri={uri}
          aspect={aspect}
          onAspect={setAspect}
        />
        <View className="absolute bottom-3 right-3 flex-row items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5">
          <Ionicons name="expand-outline" size={13} color={colors.canvas} />
          <Text variant="small" tone="white" className="text-[12px] leading-[16px]">
            Tap to zoom
          </Text>
        </View>
      </Pressable>

      <Modal
        visible={zoom}
        transparent
        animationType="fade"
        onRequestClose={() => setZoom(false)}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/90">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close screenshot"
            className="absolute inset-0"
            onPress={() => setZoom(false)}
          />
          <View className="flex-1 items-center justify-center px-4 py-12">
            <ScrollView
              maximumZoomScale={3}
              minimumZoomScale={1}
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
              className="w-full"
            >
              <View className="w-full max-w-[1100px]">
                <ScreenshotImage
                  screenshot={screenshot}
                  uri={uri}
                  aspect={aspect}
                  onAspect={setAspect}
                />
                <Text variant="small" tone="white" className="mt-4 text-center">
                  {screenshot.altText}
                </Text>
              </View>
            </ScrollView>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close screenshot"
            onPress={() => setZoom(false)}
            className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white/15"
          >
            <Ionicons name="close" size={20} color={colors.canvas} />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
