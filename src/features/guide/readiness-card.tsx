import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { colors } from "@/theme/theme";

import type { Readiness } from "./readiness";

function bandColor(id: Readiness["band"]["id"]) {
  if (id === "ready") return colors.success;
  if (id === "close") return colors.warning;
  return colors.accent;
}

export function ReadinessCard({ readiness }: { readiness: Readiness }) {
  const color = bandColor(readiness.band.id);

  return (
    <Card className="mt-4 p-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text variant="label" tone="muted">
            Preparation score
          </Text>
          <Text className="mt-1 text-[30px] font-inter-semibold leading-[36px]">
            {readiness.score}
            <Text variant="small" tone="muted">
              {" "}
              / 100
            </Text>
          </Text>
        </View>
        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: `${color}1A` }}
        >
          <Text
            variant="small"
            className="font-inter-semibold"
            style={{ color }}
          >
            {readiness.band.title}
          </Text>
        </View>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: readiness.score,
          text: `${readiness.score} out of 100`,
        }}
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface"
      >
        <View
          className="h-2 rounded-full"
          style={{
            width: `${Math.min(readiness.score, 100)}%`,
            backgroundColor: color,
          }}
        />
      </View>

      <Text variant="small" className="mt-3">
        {readiness.band.message}
      </Text>

      <View className="mt-4 gap-2.5">
        {readiness.parts.map((part) => {
          const ratio = part.max > 0 ? part.earned / part.max : 0;
          return (
            <View key={part.key}>
              <View className="flex-row items-center justify-between gap-3">
                <Text variant="small" className="font-inter-medium">
                  {part.label}
                </Text>
                <Text variant="small" tone="muted">
                  {Math.round(part.earned)} / {part.max}
                </Text>
              </View>
              <View className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
                <View
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${Math.round(ratio * 100)}%`,
                    backgroundColor: ratio >= 0.85 ? colors.success : color,
                  }}
                />
              </View>
              <Text
                variant="small"
                tone="muted"
                className="mt-1 text-[12px] leading-[16px]"
              >
                {part.detail}
              </Text>
            </View>
          );
        })}
      </View>

      {readiness.nextFix ? (
        <View className="mt-4 flex-row items-start gap-2.5 rounded-control bg-surface px-3.5 py-3">
          <Ionicons name="arrow-forward-circle" size={18} color={colors.ink} />
          <View className="flex-1">
            <Text variant="small" className="font-inter-semibold">
              Fix this next
            </Text>
            <Text variant="small" tone="muted" className="mt-0.5">
              {readiness.nextFix.fix}
            </Text>
          </View>
        </View>
      ) : null}

      <Text
        variant="small"
        tone="muted"
        className="mt-4 text-[12px] leading-[18px]"
      >
        This is a preparation score for this guide, not your CRS score. It
        doesn't predict an invitation or a decision.
      </Text>
    </Card>
  );
}
