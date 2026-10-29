import { Pressable, View } from "react-native";

import { hapticLight } from "@/lib/haptics";

import { Text } from "./text";

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
};

type ChoiceGroupProps<T extends string> = {
  label: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
  helper?: string;
};

export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  helper,
}: ChoiceGroupProps<T>) {
  return (
    <View>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${label}: ${option.label}`}
              onPress={() => {
                hapticLight();
                onChange(option.value);
              }}
              className={`min-h-[44px] justify-center rounded-full border px-4 py-2 ${
                active
                  ? "border-ink bg-ink"
                  : "border-line bg-canvas active:bg-surface"
              }`}
            >
              <Text
                variant="small"
                className={active ? "font-inter-semibold text-white" : ""}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {helper ? (
        <Text variant="small" tone="muted" className="mt-2">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
