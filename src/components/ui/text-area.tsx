import { Platform, TextInput, View } from "react-native";

import { colors } from "@/theme/theme";

import { Text } from "./text";

export function TextArea({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  minHeight = 96,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  helper?: string;
  minHeight?: number;
  editable?: boolean;
}) {
  return (
    <View>
      <Text className="text-[14px] font-inter-medium text-ink">{label}</Text>
      <TextInput
        multiline
        editable={editable}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        className="mt-2 rounded-control border border-line bg-canvas px-4 py-3 font-inter text-[15px] text-ink"
        style={{
          minHeight,
          textAlignVertical: "top",
          ...(Platform.OS === "web"
            ? { outlineStyle: "solid", outlineWidth: 0 }
            : undefined),
        }}
        accessibilityLabel={label}
      />
      {helper ? (
        <Text variant="small" tone="muted" className="mt-2">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
