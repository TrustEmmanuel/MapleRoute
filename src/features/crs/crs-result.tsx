import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Linking, Platform, Pressable, View } from "react-native";

import { BAND_LABELS, CrsScoreBadge, CrsScoreBar } from "@/components/crs-score-badge";
import { Disclaimer } from "@/components/disclaimer";
import { InfoDialog } from "@/components/info-dialog";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { colors } from "@/theme/theme";

import type { SavedScore } from "./crs-provider";
import { latestDrawNote } from "./draws";
import { CRS_MAX, CRS_RULES, type ScoreBand } from "./rules";

const BAND_TEXT: Record<ScoreBand, string> = {
  strong: "text-success",
  average: "text-warning",
  low: "text-accent",
};

function formatDate(value: string) {
  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00`)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";
  return date.toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CrsResultView({
  saved,
  syncNote,
  onEdit,
  onClearAnswers,
}: {
  saved: SavedScore;
  syncNote?: string | null;
  onEdit: () => void;
  onClearAnswers: () => Promise<{ ok: boolean }>;
}) {
  const { result } = saved;
  const benchmark = result.benchmark;
  const drawNote = latestDrawNote();
  const [info, setInfo] = useState<"transferability" | "additional" | null>(
    null,
  );
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  function closeClearDialog() {
    if (clearing) return;
    setConfirmClear(false);
    setClearError(null);
  }

  async function handleClearAnswers() {
    setClearing(true);
    setClearError(null);
    const outcome = await onClearAnswers();
    if (outcome.ok) return;
    setClearing(false);
    setClearError(
      "Could not clear your saved score. Check your connection and try again.",
    );
  }

  function openGuide(path: "/guide/skill-transferability" | "/guide/additional-points") {
    setInfo(null);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(path);
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between pt-1">
        <CrsScoreBadge score={saved.score} band={saved.band} />
        <View className="rounded-full border border-line px-2.5 py-1">
          <Text variant="label" tone="muted">
            CRS check
          </Text>
        </View>
      </View>

      <Card className="mt-6 p-5">
        <Text variant="label" tone="muted">
          Your estimated CRS score
        </Text>
        <View className="mt-2 flex-row items-end gap-2">
          <Text className="font-inter-bold text-[64px] leading-[68px] tracking-[-2px] text-ink">
            {saved.score.toLocaleString()}
          </Text>
          <Text variant="heading" tone="muted" className="pb-2">
            / {CRS_MAX.toLocaleString()}
          </Text>
        </View>
        <Text variant="small" className={`mt-1 font-inter-semibold ${BAND_TEXT[saved.band]}`}>
          {BAND_LABELS[saved.band]}
        </Text>
        <View className="mt-5">
          <CrsScoreBar score={saved.score} band={saved.band} />
        </View>

        <View className="mt-5 rounded-control bg-surface p-3.5">
          <Text variant="small" tone="muted">
            Colour compares your score with the latest Express Entry draw:{" "}
            {benchmark.score} points on {formatDate(benchmark.drawDate)}{" "}
            ({benchmark.drawName}). Cutoffs change with every draw.
          </Text>
          {drawNote ? (
            <Text variant="small" tone="muted" className="mt-2">
              {drawNote}
            </Text>
          ) : null}
          <Text
            variant="small"
            className="mt-2 font-inter-semibold text-ink underline"
            onPress={() => void Linking.openURL(benchmark.sourceUrl)}
          >
            See the latest rounds on canada.ca
          </Text>
        </View>

        <Text variant="small" tone="muted" className="mt-4">
          Last checked {formatDate(saved.createdAt)}
        </Text>
      </Card>

      {syncNote ? (
        <Card variant="muted" className="mt-4 p-4">
          <Text variant="small" tone="muted">
            {syncNote}
          </Text>
        </Card>
      ) : null}

      <View className="mt-8">
        <Text variant="label" tone="muted">
          How your score adds up
        </Text>

        {result.sections.map((section) => {
          const infoSection =
            section.key === "transferability" || section.key === "additional"
              ? section.key
              : null;

          return (
          <Card key={section.key} className="mt-3 p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-2 pr-3">
                <Text variant="heading">{section.label}</Text>
                {infoSection ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      infoSection === "transferability"
                        ? "How skill transferability points work"
                        : "How additional points work"
                    }
                    hitSlop={12}
                    onPress={() => setInfo(infoSection)}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color={colors.muted}
                    />
                  </Pressable>
                ) : null}
              </View>
              <Text variant="small" tone="muted">
                {section.points} / {section.max}
              </Text>
            </View>
            {section.items.length > 0 ? (
              <View className="mt-3">
                {section.items.map((item, index) => (
                  <View
                    key={`${section.key}-${item.label}`}
                    className={`flex-row items-center justify-between py-2.5 ${
                      index > 0 ? "border-t border-line" : ""
                    }`}
                  >
                    <Text variant="small" tone="muted" className="flex-1 pr-4">
                      {item.label}
                    </Text>
                    <Text
                      variant="small"
                      className={
                        item.points < 0 ? "font-inter-medium text-muted" : "font-inter-semibold"
                      }
                    >
                      {item.points > 0 ? "+" : ""}
                      {item.points}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="small" tone="muted" className="mt-2">
                No points in this section.
              </Text>
            )}
          </Card>
          );
        })}
      </View>

      <Card variant="muted" className="mt-4 p-4">
        <Text variant="small" tone="muted">
          Rules version {result.rulesVersion}, last verified{" "}
          {formatDate(result.rulesLastVerified)}. {CRS_RULES.rulesNote} A
          qualifying job offer no longer needs an LMIA.
        </Text>
        <View
          className="mt-2 flex-row flex-wrap"
          style={{ columnGap: 16, rowGap: 4 }}
        >
          <Text
            variant="small"
            className="font-inter-semibold text-ink underline"
            onPress={() => void Linking.openURL(result.rulesSourceUrl)}
          >
            Official CRS criteria
          </Text>
          <Text
            variant="small"
            className="font-inter-semibold text-ink underline"
            onPress={() => void Linking.openURL(CRS_RULES.highWageUrl)}
          >
            High-wage occupation list
          </Text>
        </View>
      </Card>

      <Button
        className="mt-6"
        label="Continue to my roadmap"
        onPress={() => router.replace("/")}
      />
      <Button
        className="mt-3"
        variant="secondary"
        label="Update my answers"
        onPress={onEdit}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Clear answers"
        onPress={() => {
          setClearError(null);
          setConfirmClear(true);
        }}
        className="mt-3 min-h-[44px] items-center justify-center active:opacity-70"
      >
        <Text variant="small" className="font-inter-medium text-accent">
          Clear answers
        </Text>
      </Pressable>

      <InfoDialog
        visible={confirmClear}
        title="Clear your CRS answers?"
        onClose={closeClearDialog}
      >
        <Text variant="body">
          This removes your saved CRS score and every answer from this account,
          so you can start the check again from the first question. This cannot
          be undone.
        </Text>
        {clearError ? (
          <Text variant="small" className="mt-3 text-accent">
            {clearError}
          </Text>
        ) : null}
        <View className="mt-5 gap-3">
          <Button
            variant="danger"
            label="Yes, clear my answers"
            loading={clearing}
            loadingLabel="Clearing…"
            onPress={() => void handleClearAnswers()}
          />
          <Button
            variant="secondary"
            label="Keep my answers"
            disabled={clearing}
            onPress={closeClearDialog}
          />
        </View>
      </InfoDialog>

      <InfoDialog
        visible={info === "transferability"}
        title="Skill transferability"
        onClose={() => setInfo(null)}
      >
        <Text variant="small" tone="muted">
          Points you earn when two parts of your profile reinforce each other —
          language plus education, for example. Each pair is worth 13–50 and the
          section is capped at 100.
        </Text>

        <Text variant="label" tone="muted" className="mt-5">
          How to earn them
        </Text>
        <View className="mt-2 gap-2.5">
          <Text variant="small" tone="muted">
            • CLB 7 in all four language abilities unlocks the language pairs.
            CLB 9 in all four roughly doubles them.
          </Text>
          <Text variant="small" tone="muted">
            • One year of skilled work in Canada unlocks both Canadian work
            pairs. Two years or more moves you to the top band.
          </Text>
          <Text variant="small" tone="muted">
            • Three years or more of skilled work abroad gives the top band in
            both foreign-work pairs.
          </Text>
          <Text variant="small" tone="muted">
            • A Canadian certificate of qualification adds 25 with CLB 5, or 50
            with CLB 7.
          </Text>
        </View>

        <Button
          className="mt-5"
          variant="secondary"
          label="Read the full guide"
          onPress={() => openGuide("/guide/skill-transferability")}
        />
      </InfoDialog>

      <InfoDialog
        visible={info === "additional"}
        title="Additional points"
        onClose={() => setInfo(null)}
      >
        <Text variant="small" tone="muted">
          Points outside your core score, worth up to 600 in total. Each one
          comes from a separate step rather than from your age, education or
          language level alone.
        </Text>

        <Text variant="label" tone="muted" className="mt-5">
          How to earn them
        </Text>
        <View className="mt-2 gap-2.5">
          <Text variant="small" tone="muted">
            • Provincial or territorial nomination: 600. Apply through the
            province&apos;s PNP stream, not to IRCC.
          </Text>
          <Text variant="small" tone="muted">
            • French: NCLB 7 or higher in all four abilities gives 50 with CLB 5
            English, or 25 with CLB 4 English or lower.
          </Text>
          <Text variant="small" tone="muted">
            • A brother or sister in Canada, 18 or older and a citizen or
            permanent resident: 15.
          </Text>
          <Text variant="small" tone="muted">
            • Post-secondary study in Canada: 15 for one or two years, 30 for
            three years or more, or a master&apos;s, professional or doctoral
            degree.
          </Text>
        </View>

        <Button
          className="mt-5"
          variant="secondary"
          label="Read the full guide"
          onPress={() => openGuide("/guide/additional-points")}
        />
      </InfoDialog>

      <Disclaimer className="mt-8" />
    </Screen>
  );
}
