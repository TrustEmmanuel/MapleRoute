import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { colors } from "@/theme/theme";

import { Text } from "./text";

type TextFieldProps = Omit<TextInputProps, "className"> & {
  label: string;
  error?: string | null;
  helper?: string;
  secure?: boolean;
  plainLabel?: boolean;
};

export function TextField({
  label,
  error,
  helper,
  secure = false,
  plainLabel = false,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  return (
    <View>
      {plainLabel ? (
        <Text className="text-[14px] font-inter-medium text-ink">{label}</Text>
      ) : (
        <Text variant="label" tone="muted">
          {label}
        </Text>
      )}
      <View
        className={`mt-2 h-[52px] flex-row items-center rounded-control border bg-canvas px-4 ${
          error ? "border-accent" : focused ? "border-ink" : "border-control-line"
        }`}
      >
        <TextInput
          className="flex-1 font-inter text-[15px] text-ink"
          style={
            Platform.OS === "web"
              ? { outlineStyle: "solid", outlineWidth: 0 }
              : undefined
          }
          placeholderTextColor={colors.muted}
          secureTextEntry={secure && hidden}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            hitSlop={10}
            onPress={() => setHidden((value) => !value)}
            className="pl-3"
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="small" tone="accent" className="mt-2">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="small" tone="muted" className="mt-2">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
