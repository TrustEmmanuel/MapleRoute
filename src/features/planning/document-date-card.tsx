import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { openExternal } from "@/lib/links";
import { colors } from "@/theme/theme";

import {
  deadlineLine,
  documentStatus,
  formatDocumentDate,
  isValidDateInput,
  statusBadge,
  statusDetail,
  type DocumentRule,
  type DocumentStatus,
} from "./documents";
import { DateField } from "./date-field";

const PILL_TONES: Record<
  Exclude<DocumentStatus["state"], "empty">,
  { surface: string; color: string }
> = {
  ok: { surface: "bg-success-surface", color: colors.success },
  soon: { surface: "bg-warning-surface", color: colors.warning },
  expired: { surface: "bg-danger-surface", color: colors.accent },
};

export function StatusPill({
  rule,
  status,
}: {
  rule: DocumentRule;
  status: DocumentStatus;
}) {
  const label = statusBadge(rule, status);
  if (!label || status.state === "empty") return null;
  const tone = PILL_TONES[status.state];

  return (
    <View className={`rounded-full px-2.5 py-1 ${tone.surface}`}>
      <Text
        variant="small"
        className="text-[11px] leading-[15px] font-inter-semibold"
        style={{ color: tone.color }}
      >
        {label}
      </Text>
    </View>
  );
}

export function DocumentDateCard({
  rule,
  date,
  today,
  onSave,
  onClear,
}: {
  rule: DocumentRule;
  date: string | undefined;
  today: string;
  onSave: (value: string) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState(date ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(date ?? "");
    setError(null);
  }, [date]);

  const status = documentStatus(rule, date, today);
  const dirty = draft !== (date ?? "");
  const canSave = dirty && draft.length > 0;

  function handleSave() {
    if (!isValidDateInput(draft)) {
      setError("Enter a real date in YYYY-MM-DD form, like 2026-04-30.");
      return;
    }
    setError(null);
    onSave(draft);
  }

  return (
    <Card className="mb-3 p-5">
      <View className="flex-row items-start justify-between gap-3">
        <Text variant="heading" className="flex-1">
          {rule.title}
        </Text>
        <StatusPill rule={rule} status={status} />
      </View>

      {status.state !== "empty" ? (
        <View className="mt-3">
          <Text variant="body" className="font-inter-medium">
            {date ? deadlineLine(rule, date, status) : ""}
          </Text>
          <Text variant="small" tone="muted" className="mt-1">
            {statusDetail(rule, date, status)}
          </Text>
        </View>
      ) : null}

      <View className="mt-3 rounded-control bg-surface p-3.5">
        <Text variant="small" tone="muted">
          {rule.quote}
        </Text>
        <View className="mt-1 flex-row flex-wrap items-center gap-x-3">
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open the canada.ca source for ${rule.title}`}
            onPress={() => openExternal(rule.sourceUrl)}
            className="min-h-[36px] flex-row items-center gap-1.5 active:opacity-70"
          >
            <Text variant="small" tone="accent" className="font-inter-medium">
              {rule.sourceName}
            </Text>
            <Ionicons name="open-outline" size={13} color={colors.accent} />
          </Pressable>
          <Text variant="small" tone="muted">
            Checked {formatDocumentDate(rule.checkedOn)}
          </Text>
        </View>
      </View>

      <View className="mt-4">
        <DateField rule={rule} value={draft} onChange={setDraft} error={error} />
      </View>

      {date || dirty ? (
        <View className="mt-3 flex-row items-center justify-between gap-3">
          {dirty ? (
            <Button
              className="flex-1"
              label="Save date"
              disabled={!canSave}
              onPress={handleSave}
            />
          ) : date ? (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text variant="small" tone="muted">
                Date saved
              </Text>
            </View>
          ) : (
            <View />
          )}
          {date ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove the ${rule.title} date`}
              onPress={onClear}
              className="min-h-[44px] justify-center active:opacity-70"
            >
              <Text variant="small" tone="muted">
                Remove
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
