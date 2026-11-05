import { useState } from "react";
import { Platform, View } from "react-native";

import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { colors } from "@/theme/theme";

import type { DocumentRule } from "./documents";

type DateFieldProps = {
  rule: DocumentRule;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
};

export function DateField({ rule, value, onChange, error }: DateFieldProps) {
  const [focused, setFocused] = useState(false);
  const label = `${rule.title} — ${rule.dateLabel}`;

  if (Platform.OS !== "web") {
    return (
      <TextField
        label={rule.dateLabel}
        helper={rule.dateHelper}
        error={error}
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        inputMode="numeric"
        maxLength={10}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={label}
      />
    );
  }

  return (
    <View>
      <Text variant="label" tone="muted">
        {rule.dateLabel}
      </Text>
      <View
        className={`mt-2 h-[52px] flex-row items-center rounded-control border bg-canvas px-2 ${
          error ? "border-accent" : focused ? "border-ink" : "border-line"
        }`}
      >
        <input
          type="date"
          lang="en-CA"
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            height: 44,
            border: "none",
            outline: "none",
            background: "transparent",
            padding: "0 12px",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 15,
            color: colors.ink,
          }}
        />
      </View>
      {error ? (
        <Text variant="small" tone="accent" className="mt-2">
          {error}
        </Text>
      ) : (
        <Text variant="small" tone="muted" className="mt-2">
          {rule.dateHelper}
        </Text>
      )}
    </View>
  );
}
