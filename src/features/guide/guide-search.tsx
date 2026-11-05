import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/theme";

import type { GuideSearchResult } from "./search";
import type { StepProgress } from "./types";

export function GuideSearchField({
  value,
  onChangeText,
  onSubmit,
  className = "",
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      className={`h-11 flex-row items-center gap-2 rounded-control border bg-canvas px-3 ${
        focused ? "border-ink" : "border-line"
      } ${className}`}
    >
      <Ionicons name="search" size={16} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search steps by name"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Search guide steps"
        returnKeyType="search"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={onSubmit}
        onKeyPress={(event) => {
          if (event.nativeEvent.key === "Escape" && value) onChangeText("");
        }}
        className="flex-1 font-inter text-[14px] text-ink"
        style={
          Platform.OS === "web"
            ? { outlineStyle: "solid", outlineWidth: 0 }
            : undefined
        }
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear the search"
          hitSlop={8}
          onPress={() => onChangeText("")}
          className="h-7 w-7 items-center justify-center rounded-full active:bg-surface"
        >
          <Ionicons name="close-circle" size={16} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function GuideSearchResults({
  query,
  results,
  progress,
  onSelect,
  limit = 8,
  className = "",
}: {
  query: string;
  results: GuideSearchResult[];
  progress: Record<string, StepProgress>;
  onSelect: (result: GuideSearchResult) => void;
  limit?: number;
  className?: string;
}) {
  const shown = results.slice(0, limit);
  const extra = results.length - shown.length;

  return (
    <View
      accessibilityLiveRegion="polite"
      className={`rounded-control ${className}`}
    >
      <View className="px-2.5 pb-1 pt-2">
        <Text variant="label" tone="muted">
          {results.length === 0
            ? "No matching step"
            : `${results.length} ${
                results.length === 1 ? "step matches" : "steps match"
              } “${query.trim()}”`}
        </Text>
      </View>

      {results.length === 0 ? (
        <Text variant="small" tone="muted" className="px-2.5 pb-2">
          Try a shorter phrase, like the name on the official page.
        </Text>
      ) : null}

      {shown.map((result) => {
        const checked = Boolean(progress[result.step.id]?.checked);
        return (
          <Pressable
            key={result.step.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${result.step.title} in ${result.section.title}`}
            onPress={() => onSelect(result)}
            className="flex-row items-start gap-2.5 rounded-control px-2.5 py-2 active:bg-surface"
          >
            <Ionicons
              name={checked ? "checkmark-circle" : "ellipse-outline"}
              size={16}
              color={checked ? colors.accent : colors.muted}
              style={{ marginTop: 2 }}
            />
            <View className="flex-1">
              <Text variant="small" numberOfLines={2}>
                {result.step.title}
              </Text>
              <Text
                variant="small"
                tone="muted"
                numberOfLines={1}
                className="mt-0.5 text-[12px] leading-[16px]"
              >
                {result.section.title} · Step {result.stepIndex + 1} of{" "}
                {result.stepCount}
              </Text>
            </View>
          </Pressable>
        );
      })}

      {extra > 0 ? (
        <Text variant="small" tone="muted" className="px-2.5 pb-1 pt-1.5">
          {extra} more — add another word to narrow it down.
        </Text>
      ) : null}
    </View>
  );
}
