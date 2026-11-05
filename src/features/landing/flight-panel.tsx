import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { Text } from "@/components/ui/text";
import { cardShadow } from "@/theme/shadow";
import { colors } from "@/theme/theme";

const NEXT_STEP = {
  label: "get your education assessed",
  step: 3,
  total: 8,
  minutes: 20,
};

const PROGRESS = Math.round((NEXT_STEP.step / NEXT_STEP.total) * 100);

const HEADLINE = "Your one-stop, great and user-friendly guide.";

function FlightPath() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 600 760"
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
    >
      <Path
        d="M 70 660 C 150 560 250 430 470 205"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="2 13"
        fill="none"
      />
      <Circle cx={70} cy={660} r={13} stroke="rgba(255,255,255,0.85)" strokeWidth={1.5} fill="none" />
      <Circle cx={70} cy={660} r={4} fill="#FFFFFF" />
    </Svg>
  );
}

function NextStepCard() {
  return (
    <View
      className="flex-row items-center gap-4 rounded-card bg-canvas px-5 py-4"
      style={cardShadow}
    >
      <View className="h-11 w-11 items-center justify-center rounded-[12px] bg-danger-surface">
        <Ionicons name="school-outline" size={20} color={colors.accent} />
      </View>
      <View className="flex-1">
        <Text className="font-inter-semibold text-[15px] leading-[21px] text-ink">
          Next: {NEXT_STEP.label}
        </Text>
        <Text variant="small" tone="muted" className="mt-0.5">
          Step {NEXT_STEP.step} of {NEXT_STEP.total} · about {NEXT_STEP.minutes}{" "}
          minutes
        </Text>
      </View>
      <Text className="font-inter-semibold text-[15px] text-ink">{PROGRESS}%</Text>
    </View>
  );
}

export function FlightPanel({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <View className="overflow-hidden bg-accent px-6 pb-8 pt-10">
        <Text className="font-inter-bold text-[26px] leading-[32px] tracking-[-0.7px] text-white">
          {HEADLINE}
        </Text>
        <View className="mt-6">
          <NextStepCard />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 overflow-hidden bg-accent">
      <View
        pointerEvents="none"
        className="absolute -bottom-40 -left-24 h-[520px] w-[520px] rounded-full border border-white/10"
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-64 -left-44 h-[760px] w-[760px] rounded-full border border-white/10"
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-96 -left-64 h-[1040px] w-[1040px] rounded-full border border-white/10"
      />

      <FlightPath />

      <View className="absolute right-[9%] top-[23%]">
        <Ionicons name="airplane" size={58} color="#FFFFFF" />
      </View>

      <View className="flex-1 justify-between px-14 pb-12 pt-32">
        <Text className="max-w-[560px] font-inter-bold text-[44px] leading-[50px] tracking-[-1.4px] text-white">
          {HEADLINE}
        </Text>
        <View className="max-w-[520px]">
          <NextStepCard />
        </View>
      </View>
    </View>
  );
}
