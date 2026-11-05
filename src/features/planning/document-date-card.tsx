import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { openExternal } from "@/lib/links";
import { colors } from "@/theme/theme";

import {
  deadlineLine,
  documentStatus,
  formatDocumentDate,
  isValidBandScore,
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
  has,
  score,
  today,
  onSave,
  onClear,
  onToggleHave,
  onSaveScore,
}: {
  rule: DocumentRule;
  date: string | undefined;
  has: boolean;
  score: string | undefined;
  today: string;
  onSave: (value: string) => void;
  onClear: () => void;
  onToggleHave: () => void;
  onSaveScore: (value: string | null) => void;
}) {
  const [draft, setDraft] = useState(date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [draftScore, setDraftScore] = useState(score ?? "");
  const [scoreError, setScoreError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(date ?? "");
    setDraftScore(score ?? "");
    setError(null);
    setScoreError(null);
  }, [date, score]);

  const status = documentStatus(rule, date, today);
  const dirty = draft !== (date ?? "") || draftScore !== (score ?? "");
  const haveLabel = rule.haveLabel ?? "I have this";

  function handleSave() {
    if (!draft) {
      setError("Add the test date too, in YYYY-MM-DD form.");
      return;
    }
    if (!isValidDateInput(draft)) {
      setError("Enter a real date in YYYY-MM-DD form, like 2026-04-30.");
      return;
    }
    const trimmedScore = draftScore.trim();
    if (trimmedScore && !isValidBandScore(trimmedScore)) {
      setScoreError("Use a band from 1 to 9, like 7.5.");
      return;
    }
    setError(null);
    setScoreError(null);
    onSave(draft);
    onSaveScore(trimmedScore || null);
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
            className="min-h-[36px] min-w-0 flex-shrink flex-row items-center gap-1.5 active:opacity-70"
          >
            <Text
              variant="small"
              tone="accent"
              className="flex-shrink font-inter-medium"
            >
              {rule.sourceName}
            </Text>
            <Ionicons name="open-outline" size={13} color={colors.accent} />
          </Pressable>
          <Text variant="small" tone="muted">
            Checked {formatDocumentDate(rule.checkedOn)}
          </Text>
        </View>
      </View>

      {rule.note ? (
        <View className="mt-3 rounded-control bg-warning-surface px-3.5 py-2.5">
          <Text variant="small" style={{ color: colors.warning }}>
            {rule.note}
          </Text>
        </View>
      ) : null}

      <View className="mt-4">
        <DateField rule={rule} value={draft} onChange={setDraft} error={error} />
      </View>

      {rule.score ? (
        <View className="mt-4">
          <TextField
            label={rule.score.label}
            helper={rule.score.helper}
            error={scoreError}
            value={draftScore}
            onChangeText={setDraftScore}
            placeholder="Enter band"
            inputMode="decimal"
            maxLength={3}
            autoCorrect={false}
            accessibilityLabel={`${rule.title} — ${rule.score.label}`}
          />
        </View>
      ) : null}

      {date || dirty ? (
        <View className="mt-3 flex-row items-center justify-between gap-3">
          {dirty ? (
            <Button className="flex-1" label="Save" onPress={handleSave} />
          ) : date ? (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text variant="small" tone="muted">
                Saved
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

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: has }}
        aria-checked={has}
        accessibilityLabel={`${haveLabel} — ${rule.title}`}
        onPress={onToggleHave}
        className="mt-4 min-h-[44px] flex-row items-center gap-2.5 self-start active:opacity-70"
      >
        <View
          className={`h-5 w-5 items-center justify-center rounded-[5px] border ${
            has ? "border-success bg-success" : "border-line bg-canvas"
          }`}
        >
          {has ? (
            <Ionicons name="checkmark" size={14} color={colors.canvas} />
          ) : null}
        </View>
        <Text
          variant="small"
          tone={has ? "ink" : "muted"}
          className="font-inter-medium"
        >
          {haveLabel}
        </Text>
      </Pressable>
    </Card>
  );
}
