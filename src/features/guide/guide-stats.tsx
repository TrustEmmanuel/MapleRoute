import { router } from "expo-router";
import { type ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";

function Stat({
  label,
  children,
  accessibilityLabel,
}: {
  label: string;
  children: ReactNode;
  accessibilityLabel?: string;
}) {
  return (
    <View
      className="flex-1"
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
    >
      <Text
        variant="label"
        tone="muted"
        className="text-[10px] leading-[13px] tracking-[1px]"
      >
        {label}
      </Text>
      <View className="mt-0.5 flex-row items-baseline gap-1">{children}</View>
    </View>
  );
}

export function GuideStatsStrip({
  doneSteps,
  totalSteps,
  crsScore,
  readinessScore,
  className = "",
}: {
  doneSteps: number;
  totalSteps: number;
  crsScore: number | null;
  readinessScore: number;
  className?: string;
}) {
  const percent =
    totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  return (
    <View className={className}>
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={
            crsScore === null
              ? "Add your CRS score"
              : `CRS score ${crsScore}. Change it`
          }
          onPress={() => router.push("/crs")}
          className="flex-1 active:opacity-70"
        >
          <Stat label="CRS">
            {crsScore === null ? (
              <Text
                variant="small"
                tone="accent"
                className="text-[12px] font-inter-semibold leading-[18px]"
              >
                Add score
              </Text>
            ) : (
              <Text className="text-[14px] font-inter-semibold leading-[18px]">
                {crsScore}
              </Text>
            )}
          </Stat>
        </Pressable>

        <View className="h-8 w-px bg-line" />

        <Stat
          label="Prep score"
          accessibilityLabel={`Preparation score ${readinessScore} out of 100`}
        >
          <Text className="text-[14px] font-inter-semibold leading-[18px]">
            {readinessScore}
            <Text
              variant="small"
              tone="muted"
              className="text-[12px] leading-[18px]"
            >
              {" "}
              / 100
            </Text>
          </Text>
        </Stat>

        <View className="h-8 w-px bg-line" />

        <Stat label="Steps done">
          <Text className="text-[14px] font-inter-semibold leading-[18px]">
            {doneSteps}
            <Text
              variant="small"
              tone="muted"
              className="text-[12px] leading-[18px]"
            >
              {" "}
              / {totalSteps}
            </Text>
          </Text>
        </Stat>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: totalSteps || 1,
          now: doneSteps,
          text: `${doneSteps} of ${totalSteps} steps done`,
        }}
        className="mt-2 h-[3px] overflow-hidden rounded-full bg-surface"
      >
        <View
          className="h-[3px] rounded-full bg-accent"
          style={{ width: `${percent}%` }}
        />
      </View>
    </View>
  );
}
