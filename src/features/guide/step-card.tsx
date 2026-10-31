import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState, type ReactNode } from "react";
import { Pressable, View, type HostInstance } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { TextArea } from "@/components/ui/text-area";
import type { CrsInputs } from "@/features/crs/rules";
import { isSafeHttpUrl, openExternal } from "@/lib/links";
import { colors } from "@/theme/theme";

import { DoneToggle, ReadyToggle } from "./done-toggle";
import { personalizedHint } from "./personalize";
import { prepDoneCopy } from "./prep-done-copy";
import { ScreenshotViewer } from "./screenshot-viewer";
import {
  isStepPublishable,
  sourceDomain,
  type GuideSection,
  type GuideStep,
} from "./types";

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StepCard({
  section,
  step,
  stepIndex,
  stepCount,
  checked,
  onToggleChecked,
  documentsReady,
  onDocumentReady,
  note,
  onSaveNote,
  onReport,
  isAdmin,
  crsInputs,
  showDoneBlock,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onOpenAdmin,
  prepInputs,
}: {
  section: GuideSection;
  step: GuideStep;
  stepIndex: number;
  stepCount: number;
  checked: boolean;
  onToggleChecked: (checked: boolean) => void;
  documentsReady: Record<string, boolean>;
  onDocumentReady: (name: string, ready: boolean) => void;
  note: string;
  onSaveNote: (note: string) => void;
  onReport: (note: string) => void;
  isAdmin: boolean;
  crsInputs: CrsInputs | null;
  showDoneBlock: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onOpenAdmin: () => void;
  prepInputs?: ReactNode;
}) {
  const [mistakesOpen, setMistakesOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(note);
  const [noteSaved, setNoteSaved] = useState(false);
  const nextRef = useRef<HostInstance | null>(null);

  const screenshot = step.screenshots
    .slice()
    .sort((a, b) => a.position - b.position)[0];
  const hint = personalizedHint(step.personalizationKey, crsInputs);
  const domain = sourceDomain(step.sourceUrl);
  const published = isStepPublishable(step);
  const prepDone = prepDoneCopy(step.id);

  const links = [
    ...(isSafeHttpUrl(step.officialUrl)
      ? [{ label: "Open the official page", url: step.officialUrl }]
      : []),
    ...step.extraLinks.filter((link) => isSafeHttpUrl(link.url)),
  ];

  function focusNext() {
    setTimeout(() => {
      (
        nextRef.current as unknown as { focus?: () => void } | null
      )?.focus?.();
    }, 180);
  }

  return (
    <View>
      {isAdmin && !published ? (
        <View className="mb-4 flex-row items-start gap-3 rounded-card bg-warning-surface px-4 py-3.5">
          <Ionicons name="eye-outline" size={18} color={colors.warning} />
          <View className="flex-1">
            <Text variant="small" className="font-inter-semibold">
              Draft — only admins can see this
            </Text>
            <Text variant="small" tone="muted" className="mt-0.5">
              Add a source and a last-checked date, then set the step to ready
              before normal users see it.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit this step"
            onPress={onOpenAdmin}
            className="min-h-[32px] justify-center"
          >
            <Text variant="small" tone="accent" className="font-inter-semibold">
              Edit
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
        <Text variant="small" tone="muted">
          {section.title} · Step {stepIndex} of {stepCount}
        </Text>
        {isAdmin ? (
          <View
            className={`rounded-full px-2 py-0.5 ${
              published ? "bg-success-surface" : "bg-warning-surface"
            }`}
          >
            <Text
              variant="small"
              style={{
                color: published ? colors.success : colors.warning,
                fontSize: 11,
                lineHeight: 15,
              }}
              className="font-inter-semibold"
            >
              {published ? "Ready" : "Draft"}
            </Text>
          </View>
        ) : null}
      </View>

      <Text variant="title" className="mt-2.5">
        {step.title}
      </Text>

      {step.officialPageName ? (
        <View className="mt-3 flex-row items-center gap-2 self-start rounded-full border border-line bg-surface px-3 py-2">
          <Ionicons name="navigate-outline" size={14} color={colors.muted} />
          <Text variant="small" tone="muted">
            Where you are:{" "}
            <Text variant="small" className="font-inter-semibold text-ink">
              {step.officialPageName}
            </Text>
          </Text>
        </View>
      ) : null}

      {step.fieldLabelOnOfficialPage ? (
        <Text variant="small" tone="muted" className="mt-3">
          Look for:{" "}
          <Text variant="small" className="font-inter-medium text-ink">
            {step.fieldLabelOnOfficialPage}
          </Text>
        </Text>
      ) : null}

      {step.instruction
        ? step.instruction.split("\n").map((paragraph, index) =>
            paragraph.trim() ? (
              <Text key={index} variant="body" className="mt-4">
                {paragraph.trim()}
              </Text>
            ) : null,
          )
        : null}

      {prepInputs}

      <ScreenshotViewer screenshot={screenshot ?? null} showEmpty={isAdmin} />

      {step.requiredDocuments.length > 0 ? (
        <View className="mt-8">
          <Text variant="heading">Documents you need</Text>
          {section.position <= 11 ? (
            <Text variant="small" tone="muted" className="mt-1">
              Nothing is uploaded while you build the profile — just keep these
              handy. You upload them later, when you apply for permanent
              residence.
            </Text>
          ) : null}
          {step.requiredDocuments.map((document) => {
            const key = `${step.id}::${document.name}`;
            return (
              <View
                key={document.name}
                className="mt-3 rounded-card border border-line bg-canvas p-4"
              >
                <Text className="text-[15px] font-inter-semibold">
                  {document.name}
                </Text>
                {document.description ? (
                  <Text variant="small" tone="muted" className="mt-1">
                    {document.description}
                  </Text>
                ) : null}
                {document.whereToGetIt ? (
                  <Text variant="small" tone="muted" className="mt-2">
                    Where to get it: {document.whereToGetIt}
                  </Text>
                ) : null}
                <View className="mt-3 flex-row items-center justify-between gap-3">
                  {isSafeHttpUrl(document.link) ? (
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`Open link for ${document.name}`}
                      onPress={() => openExternal(document.link!)}
                      className="min-h-[44px] flex-row items-center gap-1.5 active:opacity-70"
                    >
                      <Text
                        variant="small"
                        tone="accent"
                        className="font-inter-medium"
                      >
                        Open link
                      </Text>
                      <Ionicons
                        name="open-outline"
                        size={14}
                        color={colors.accent}
                      />
                    </Pressable>
                  ) : (
                    <View />
                  )}
                  <ReadyToggle
                    checked={Boolean(documentsReady[key])}
                    onChange={(ready) => onDocumentReady(document.name, ready)}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {step.commonMistakes.length > 0 ? (
        <View className="mt-8 overflow-hidden rounded-card border border-line">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: mistakesOpen }}
            accessibilityLabel="Common mistakes"
            onPress={() => setMistakesOpen((value) => !value)}
            className="min-h-[52px] flex-row items-center justify-between px-4 py-3.5 active:bg-surface"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={colors.muted}
              />
              <Text className="text-[15px] font-inter-semibold">
                Common mistakes
              </Text>
              <View className="rounded-full bg-surface px-2 py-0.5">
                <Text variant="small" tone="muted" className="text-[11px] leading-[15px]">
                  {step.commonMistakes.length}
                </Text>
              </View>
            </View>
            <Ionicons
              name={mistakesOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.muted}
            />
          </Pressable>
          {mistakesOpen ? (
            <View className="border-t border-line px-4 py-2">
              {step.commonMistakes.map((mistake, index) => (
                <View key={index} className="flex-row gap-2.5 py-2">
                  <Text variant="small" tone="muted">
                    {index + 1}.
                  </Text>
                  <Text variant="small" className="flex-1">
                    {mistake}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {step.boostTip ? (
        <View className="mt-4 flex-row gap-3 rounded-card bg-warning-surface px-4 py-3.5">
          <Ionicons name="flash-outline" size={18} color={colors.warning} />
          <View className="flex-1">
            <Text variant="small" className="font-inter-semibold">
              Boost your application
            </Text>
            <Text variant="small" tone="muted" className="mt-1">
              {step.boostTip}
            </Text>
          </View>
        </View>
      ) : null}

      {hint ? (
        <View className="mt-4 flex-row items-start gap-2.5 rounded-control bg-surface px-3.5 py-3">
          <Ionicons
            name="person-circle-outline"
            size={17}
            color={colors.muted}
          />
          <Text variant="small" tone="muted" className="flex-1">
            {hint}
          </Text>
        </View>
      ) : null}

      {links.length > 0 ? (
        <View className="mt-7">
          <Text variant="heading">Links</Text>
          {links.map((link) => (
            <Pressable
              key={`${link.label}-${link.url}`}
              accessibilityRole="link"
              accessibilityLabel={link.label}
              onPress={() => openExternal(link.url)}
              className="mt-2 min-h-[48px] flex-row items-center justify-between gap-3 rounded-control border border-line px-4 py-3 active:bg-surface"
            >
              <Text className="flex-1 text-[14px] font-inter-medium">
                {link.label}
              </Text>
              <Ionicons
                name="open-outline"
                size={16}
                color={colors.muted}
              />
            </Pressable>
          ))}
        </View>
      ) : null}

      {showDoneBlock ? (
        <View className="mt-8">
          <DoneToggle
            checked={checked}
            label={prepDone?.label ?? "I've done this on the official page"}
            description={
              checked
                ? "Saved. You can uncheck it any time."
                : prepDone?.description ??
                  "Tick this only after you finish it on the official site."
            }
            onChange={(next) => {
              onToggleChecked(next);
              if (next) focusNext();
            }}
          />
        </View>
      ) : null}

      <View className="mt-6 flex-row flex-wrap items-center justify-between gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Something looks different?"
          onPress={() => {
            setReportOpen((value) => !value);
            setReportSent(false);
          }}
          className="min-h-[44px] justify-center active:opacity-70"
        >
          <Text variant="small" tone="accent" className="font-inter-medium">
            Something looks different?
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Your private note"
          onPress={() => setNoteOpen((value) => !value)}
          className="min-h-[44px] justify-center active:opacity-70"
        >
          <Text variant="small" tone="muted" className="font-inter-medium">
            {note ? "Your note (saved)" : "Add a private note"}
          </Text>
        </Pressable>
      </View>

      {reportOpen ? (
        <View className="mt-1 rounded-card border border-line bg-surface p-4">
          {reportSent ? (
            <Text variant="small" tone="muted">
              Thanks — this step will be re-checked against the official page.
            </Text>
          ) : (
            <>
              <TextArea
                label="What looks different?"
                value={reportText}
                onChangeText={setReportText}
                placeholder="The heading or buttons on this page don't match."
                helper="Don't include names, passwords, passport numbers, UCI or other ID numbers."
                minHeight={76}
              />
              <Button
                className="mt-3"
                label="Send report"
                disabled={!reportText.trim()}
                onPress={() => {
                  onReport(reportText);
                  setReportText("");
                  setReportSent(true);
                }}
              />
            </>
          )}
        </View>
      ) : null}

      {noteOpen ? (
        <View className="mt-2 rounded-card border border-line bg-surface p-4">
          <TextArea
            label="Your private note"
            value={noteText}
            onChangeText={(value) => {
              setNoteText(value);
              setNoteSaved(false);
            }}
            placeholder="Anything you want to remember for this step."
            helper="Don't write passwords or ID numbers here."
            minHeight={76}
          />
          <View className="mt-3 flex-row items-center gap-3">
            <Button
              label={noteSaved ? "Saved" : "Save note"}
              onPress={() => {
                onSaveNote(noteText);
                setNoteSaved(true);
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear note"
              onPress={() => {
                setNoteText("");
                onSaveNote("");
                setNoteSaved(true);
              }}
              className="min-h-[44px] justify-center active:opacity-70"
            >
              <Text variant="small" tone="muted">
                Clear
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Text variant="small" tone="muted" className="mt-5 text-[12px] leading-[18px]">
        {domain ? `Source: ${domain}` : "Source: not added"} ·{" "}
        {step.lastVerified
          ? `Last checked ${formatDate(step.lastVerified)}`
          : "Not verified yet"}
      </Text>

      <View className="mt-5 flex-row gap-3">
        <Button
          className="flex-1"
          variant="secondary"
          label="Previous"
          disabled={!hasPrevious}
          onPress={onPrevious}
        />
        <Pressable
          ref={nextRef}
          accessibilityRole="button"
          accessibilityLabel="Next step"
          accessibilityState={{ disabled: !hasNext }}
          disabled={!hasNext}
          onPress={onNext}
          className={`h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-control bg-accent px-5 active:bg-accent-pressed ${
            hasNext ? "" : "opacity-60"
          }`}
        >
          <Text variant="button" tone="white">
            Next step
          </Text>
          <Ionicons name="arrow-forward" size={16} color={colors.canvas} />
        </Pressable>
      </View>

      {isAdmin ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open the guide editor"
          onPress={onOpenAdmin}
          className="mt-4 min-h-[44px] flex-row items-center justify-center gap-2 active:opacity-70"
        >
          <Ionicons name="construct-outline" size={15} color={colors.muted} />
          <Text variant="small" tone="muted">
            Edit this step
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
