import { View } from "react-native";

import { CRS_MAX, type ScoreBand } from "@/features/crs/rules";

import { Text } from "./ui/text";

const BAND_STYLES: Record<
  ScoreBand,
  { container: string; dot: string; text: string; bar: string }
> = {
  strong: {
    container: "bg-success-surface",
    dot: "bg-success",
    text: "text-success",
    bar: "bg-success",
  },
  average: {
    container: "bg-warning-surface",
    dot: "bg-warning",
    text: "text-warning",
    bar: "bg-warning",
  },
  low: {
    container: "bg-danger-surface",
    dot: "bg-accent",
    text: "text-accent",
    bar: "bg-accent",
  },
};

export const BAND_LABELS: Record<ScoreBand, string> = {
  strong: "At or above the latest Express Entry draw",
  average: "Within 49 points of the latest Express Entry draw",
  low: "More than 49 points below the latest Express Entry draw",
};

const BAND_SHORT: Record<ScoreBand, string> = {
  strong: "Strong",
  average: "Average",
  low: "Below cutoff",
};

export function CrsBandChip({ band }: { band: ScoreBand }) {
  const palette = BAND_STYLES[band];

  return (
    <View
      className={`flex-row items-center gap-2 rounded-full px-3 py-1.5 ${palette.container}`}
    >
      <View className={`h-2 w-2 rounded-full ${palette.dot}`} />
      <Text variant="label" className={palette.text}>
        {BAND_SHORT[band]}
      </Text>
    </View>
  );
}

export function CrsScoreBadge({
  score,
  band,
  large = false,
}: {
  score: number;
  band: ScoreBand;
  large?: boolean;
}) {
  const palette = BAND_STYLES[band];

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`CRS score ${score} out of ${CRS_MAX}. ${BAND_LABELS[band]}.`}
      className={`flex-row items-center gap-2 rounded-full ${palette.container} ${
        large ? "px-4 py-2.5" : "px-3 py-1.5"
      }`}
    >
      <View className={`h-2 w-2 rounded-full ${palette.dot}`} />
      <Text
        className={`font-inter-bold ${palette.text} ${
          large ? "text-[22px] leading-[26px]" : "text-[15px] leading-[20px]"
        }`}
      >
        {score}
      </Text>
      <Text variant="label" className={palette.text}>
        CRS
      </Text>
    </View>
  );
}

export function CrsScoreBar({
  score,
  band,
}: {
  score: number;
  band: ScoreBand;
}) {
  const percent = Math.min(100, Math.round((score / CRS_MAX) * 100));

  return (
    <View>
      <View className="h-2 overflow-hidden rounded-full bg-surface">
        <View
          className={`h-2 rounded-full ${BAND_STYLES[band].bar}`}
          style={{ width: `${percent}%` }}
        />
      </View>
      <View className="mt-2 flex-row justify-between">
        <Text variant="small" tone="muted">
          {score.toLocaleString()} of {CRS_MAX.toLocaleString()} points
        </Text>
        <Text variant="small" tone="muted">
          {percent}% of maximum
        </Text>
      </View>
    </View>
  );
}
