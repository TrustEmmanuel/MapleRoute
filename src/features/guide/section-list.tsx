import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/theme";

import { ProgressRing } from "./progress-ring";
import {
  checkedCount,
  stepsVisibleTo,
  type Guide,
  type StepProgress,
} from "./types";

export function GuideSectionList({
  guide,
  isAdmin,
  progress,
  activeSectionId,
  activeStepId,
  onSelectSection,
  onSelectStep,
}: {
  guide: Guide;
  isAdmin: boolean;
  progress: Record<string, StepProgress>;
  activeSectionId: string | null;
  activeStepId: string | null;
  onSelectSection: (sectionId: string) => void;
  onSelectStep: (sectionId: string, stepId: string) => void;
}) {
  return (
    <View>
      {guide.sections.map((section) => {
        const steps = stepsVisibleTo(section, isAdmin);
        const done = checkedCount(steps, progress);
        const total = steps.length;
        const complete = total > 0 && done === total;
        const current = section.id === activeSectionId;

        return (
          <View key={section.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${section.title}, ${
                total > 0
                  ? `${done} of ${total} steps done in this section`
                  : "being verified"
              }`}
              accessibilityState={{ selected: current }}
              onPress={() => onSelectSection(section.id)}
              className={`flex-row items-center gap-3 rounded-control px-2.5 py-2.5 active:bg-surface ${
                current ? "bg-surface" : ""
              }`}
            >
              <View className="h-7 w-7 items-center justify-center">
                {complete ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.accent}
                  />
                ) : (
                  <ProgressRing done={done} total={total} />
                )}
              </View>
              <View className="flex-1">
                <Text
                  variant="small"
                  numberOfLines={2}
                  className={current ? "font-inter-semibold" : "font-inter-medium"}
                >
                  {section.title}
                </Text>
                <Text variant="small" tone="muted" className="mt-0.5 text-[12px] leading-[16px]">
                  {total > 0
                    ? complete
                      ? `${done} of ${total} done`
                      : `${done} of ${total} done · ${total - done} left`
                    : "Being verified"}
                </Text>
              </View>
              {current ? (
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              ) : null}
            </Pressable>

            {current && total > 0 ? (
              <View className="mb-1 ml-[38px] border-l border-line pl-3">
                {steps.map((step) => {
                  const checked = Boolean(progress[step.id]?.checked);
                  const isActive = step.id === activeStepId;
                  return (
                    <Pressable
                      key={step.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${step.title}${
                        checked ? ", done" : ""
                      }`}
                      accessibilityState={{ selected: isActive }}
                      onPress={() => onSelectStep(section.id, step.id)}
                      className={`flex-row items-center gap-2 rounded-control px-2 py-1.5 active:bg-surface ${
                        isActive ? "bg-surface" : ""
                      }`}
                    >
                      <Ionicons
                        name={
                          checked
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={15}
                        color={checked ? colors.accent : colors.muted}
                      />
                      <Text
                        variant="small"
                        tone={isActive ? "ink" : "muted"}
                        numberOfLines={1}
                        className={isActive ? "flex-1 font-inter-semibold" : "flex-1"}
                      >
                        {step.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
