import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { Image, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandLockup } from "@/components/brand";
import { Disclaimer } from "@/components/disclaimer";
import { InfoDialog } from "@/components/info-dialog";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { TextArea } from "@/components/ui/text-area";
import { TextField } from "@/components/ui/text-field";
import { useAuth } from "@/features/auth/auth-provider";
import { useGuide } from "@/features/guide/guide-provider";
import {
  ScreenshotEditor,
  removeScreenshotImage,
} from "@/features/guide/screenshot-editor";
import {
  isStepPublishable,
  type GuideSection,
  type GuideStep,
  type StepDocument,
  type StepLink,
  type StepScreenshot,
} from "@/features/guide/types";
import { useImageUri } from "@/features/guide/use-image-uri";
import {
  deleteLocalImage,
  isLocalImagePath,
  localImageId,
} from "@/lib/local-images";
import { colors } from "@/theme/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

function IconButton({
  icon,
  label,
  onPress,
  disabled,
  danger,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className={`h-9 w-9 items-center justify-center rounded-control border border-line active:bg-surface ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <Ionicons
        name={icon}
        size={16}
        color={danger ? colors.accent : colors.muted}
      />
    </Pressable>
  );
}

function parseLinks(text: string): StepLink[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label = "", url = ""] = line.split("|").map((part) => part.trim());
      return { label, url };
    })
    .filter((link) => link.label && link.url);
}

function linksToText(links: StepLink[]) {
  return links.map((link) => `${link.label} | ${link.url}`).join("\n");
}

function parseDocuments(text: string): StepDocument[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", description = "", whereToGetIt = "", link = ""] = line
        .split("|")
        .map((part) => part.trim());
      return {
        name,
        description: description || undefined,
        whereToGetIt: whereToGetIt || undefined,
        link: link || undefined,
      };
    })
    .filter((document) => document.name);
}

function documentsToText(documents: StepDocument[]) {
  return documents
    .map((document) =>
      [
        document.name,
        document.description ?? "",
        document.whereToGetIt ?? "",
        document.link ?? "",
      ].join(" | "),
    )
    .join("\n");
}

function ScreenshotThumb({ screenshot }: { screenshot: StepScreenshot }) {
  const uri = useImageUri(screenshot.storagePath);

  return (
    <View className="h-14 w-20 overflow-hidden rounded-control border border-line bg-surface">
      {uri ? (
        <Image
          source={{ uri }}
          resizeMode="cover"
          accessible
          accessibilityLabel={screenshot.altText}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="image-outline" size={18} color={colors.muted} />
        </View>
      )}
    </View>
  );
}

function StepEditor({
  step,
  onSave,
  onCancel,
}: {
  step: GuideStep;
  onSave: (step: GuideStep) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(step.title);
  const [instruction, setInstruction] = useState(step.instruction);
  const [pageName, setPageName] = useState(step.officialPageName ?? "");
  const [pageUrl, setPageUrl] = useState(step.officialUrl ?? "");
  const [fieldLabel, setFieldLabel] = useState(
    step.fieldLabelOnOfficialPage ?? "",
  );
  const [sourceUrl, setSourceUrl] = useState(step.sourceUrl ?? "");
  const [lastVerified, setLastVerified] = useState(step.lastVerified ?? "");
  const [status, setStatus] = useState<"draft" | "ready">(step.status);
  const [boostTip, setBoostTip] = useState(step.boostTip ?? "");
  const [personalizationKey, setPersonalizationKey] = useState(
    step.personalizationKey ?? "",
  );
  const [links, setLinks] = useState(linksToText(step.extraLinks));
  const [documents, setDocuments] = useState(
    documentsToText(step.requiredDocuments),
  );
  const [mistakes, setMistakes] = useState(step.commonMistakes.join("\n"));
  const [screenshots, setScreenshots] = useState<StepScreenshot[]>(
    step.screenshots,
  );
  const [shotEditorOpen, setShotEditorOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalScreenshots = useRef(step.screenshots);
  const addedLocalIds = useRef<string[]>([]);
  const savedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (savedRef.current) return;
      for (const id of addedLocalIds.current) {
        void deleteLocalImage(id);
      }
    };
  }, []);

  function addScreenshot(screenshot: StepScreenshot) {
    setScreenshots((current) => [
      ...current,
      { ...screenshot, position: current.length },
    ]);
    if (isLocalImagePath(screenshot.storagePath)) {
      addedLocalIds.current.push(localImageId(screenshot.storagePath));
    }
    setShotEditorOpen(false);
  }

  function cancel() {
    for (const id of addedLocalIds.current) {
      void deleteLocalImage(id);
    }
    addedLocalIds.current = [];
    onCancel();
  }

  function save() {
    if (!title.trim()) {
      setError("Add a step title first.");
      return;
    }
    if (!sourceUrl.trim() || !lastVerified.trim()) {
      if (status === "ready") {
        setError(
          "A ready step needs a source URL and a last-checked date. It stays a draft until both are filled in.",
        );
        return;
      }
    }

    const kept = new Set(screenshots.map((screenshot) => screenshot.id));
    for (const removed of originalScreenshots.current) {
      if (!kept.has(removed.id)) {
        void removeScreenshotImage(removed.storagePath);
      }
    }

    savedRef.current = true;
    onSave({
      ...step,
      title: title.trim(),
      instruction: instruction.trim(),
      officialPageName: pageName.trim() || null,
      officialUrl: pageUrl.trim() || null,
      fieldLabelOnOfficialPage: fieldLabel.trim() || null,
      sourceUrl: sourceUrl.trim() || null,
      lastVerified: lastVerified.trim() || null,
      status,
      boostTip: boostTip.trim() || null,
      personalizationKey: personalizationKey.trim() || null,
      extraLinks: parseLinks(links),
      requiredDocuments: parseDocuments(documents),
      commonMistakes: mistakes
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      screenshots: screenshots.map((screenshot, position) => ({
        ...screenshot,
        position,
      })),
    });
  }

  return (
    <>
    <View className="border-t border-line bg-surface px-3 py-4">
      <View className="gap-4">
        <TextField
          plainLabel
          label="Step title"
          value={title}
          onChangeText={setTitle}
          placeholder="A short plain verb phrase"
        />
        <TextArea
          label="Instruction"
          value={instruction}
          onChangeText={setInstruction}
          placeholder="One action per step, short sentences."
          helper="Only write what you have confirmed on the official page."
        />
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[220px] flex-1">
            <TextField
              plainLabel
              label="Official page name"
              value={pageName}
              onChangeText={setPageName}
              placeholder="The page heading the user should be on"
            />
          </View>
          <View className="min-w-[220px] flex-1">
            <TextField
              plainLabel
              label="Official page URL"
              value={pageUrl}
              onChangeText={setPageUrl}
              placeholder="https://…"
              autoCapitalize="none"
            />
          </View>
        </View>
        <TextField
          plainLabel
          label="Field label on the official page"
          value={fieldLabel}
          onChangeText={setFieldLabel}
          placeholder="Only if this step refers to one field"
        />
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[220px] flex-1">
            <TextField
              plainLabel
              label="Source URL"
              value={sourceUrl}
              onChangeText={setSourceUrl}
              placeholder="https://www.canada.ca/…"
              autoCapitalize="none"
              helper="Required before a step can be ready."
            />
          </View>
          <View className="min-w-[160px] flex-1">
            <TextField
              plainLabel
              label="Last checked"
              value={lastVerified}
              onChangeText={setLastVerified}
              placeholder="YYYY-MM-DD"
              helper="Use the date you checked the official page."
            />
          </View>
        </View>

        <View>
          <Text className="text-[14px] font-inter-medium text-ink">
            Visibility
          </Text>
          <View className="mt-2 flex-row gap-2">
            {(["draft", "ready"] as const).map((value) => {
              const selected = status === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setStatus(value);
                    setError(null);
                  }}
                  className={`min-h-[46px] flex-1 justify-center rounded-control border px-3 ${
                    selected
                      ? "border-accent bg-danger-surface"
                      : "border-control-line bg-canvas"
                  }`}
                >
                  <Text
                    variant="small"
                    className={selected ? "font-inter-semibold" : ""}
                  >
                    {value === "draft"
                      ? "Draft — admins only"
                      : "Ready — visible to users"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {status === "ready" && (!sourceUrl.trim() || !lastVerified.trim()) ? (
            <Text variant="small" className="mt-2 text-accent">
              Add a source URL and a last-checked date before this can be ready.
            </Text>
          ) : null}
        </View>

        <TextField
          plainLabel
          label="Boost tip"
          value={boostTip}
          onChangeText={setBoostTip}
          placeholder="One short optional tip"
        />
        <TextField
          plainLabel
          label="Personalisation key"
          value={personalizationKey}
          onChangeText={setPersonalizationKey}
          placeholder="education, firstLanguage, canadianWorkYears…"
          autoCapitalize="none"
          helper="Optional. Shows a hint based on the user's own CRS answers."
        />

        <TextArea
          label="Extra links"
          value={links}
          onChangeText={setLinks}
          placeholder={"Label | https://…\nLabel | https://…"}
          helper="One per line, separated by a pipe."
        />
        <TextArea
          label="Documents"
          value={documents}
          onChangeText={setDocuments}
          placeholder={"Name | Why it is needed | Where to get it | https://…"}
          helper="One per line. Leave parts empty if you don't have them."
          minHeight={76}
        />
        <TextArea
          label="Common mistakes"
          value={mistakes}
          onChangeText={setMistakes}
          placeholder={"One mistake per line"}
          minHeight={76}
        />

        <View className="rounded-control bg-canvas px-4 py-3.5">
          <Text variant="small" className="font-inter-semibold">
            Screenshots
          </Text>
          <Text variant="small" tone="muted" className="mt-1">
            Public pages only. Blur anything personal before saving. The guide
            shares one copy, so never include your own account details. The
            first screenshot is the one shown in the step.
          </Text>

          {screenshots.length > 0 ? (
            <View className="mt-3 gap-2">
              {screenshots.map((screenshot) => (
                <View
                  key={screenshot.id}
                  className="flex-row items-center gap-3 rounded-control border border-line bg-surface p-2"
                >
                  <ScreenshotThumb screenshot={screenshot} />
                  <View className="flex-1">
                    <Text variant="small" numberOfLines={2}>
                      {screenshot.altText}
                    </Text>
                    <Text variant="small" tone="muted" className="mt-0.5">
                      {isLocalImagePath(screenshot.storagePath)
                        ? "Saved on this device"
                        : "Uploaded"}
                      {screenshot.highlights.length
                        ? ` · ${screenshot.highlights.length} ${
                            screenshot.highlights.length === 1
                              ? "highlight"
                              : "highlights"
                          }`
                        : ""}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove this screenshot"
                    hitSlop={8}
                    onPress={() =>
                      setScreenshots((current) =>
                        current.filter((item) => item.id !== screenshot.id),
                      )
                    }
                    className="h-9 w-9 items-center justify-center rounded-control border border-line active:bg-canvas"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      color={colors.accent}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <View className="mt-3">
            <Button
              variant="secondary"
              label="Add screenshot"
              disabled={Platform.OS !== "web"}
              onPress={() => setShotEditorOpen(true)}
            />
            {Platform.OS !== "web" ? (
              <Text variant="small" tone="muted" className="mt-2">
                Screenshots can be added from the web version.
              </Text>
            ) : null}
          </View>
        </View>

        {error ? (
          <Text variant="small" className="text-accent">
            {error}
          </Text>
        ) : null}

        <View className="flex-row gap-3">
          <Button className="flex-1" label="Save step" onPress={save} />
          <Button
            className="flex-1"
            variant="secondary"
            label="Cancel"
            onPress={cancel}
          />
        </View>
      </View>
    </View>

    <ScreenshotEditor
      visible={shotEditorOpen}
      stepId={step.id}
      stepTitle={title.trim() || step.title}
      nextPosition={screenshots.length}
      onSave={addScreenshot}
      onClose={() => setShotEditorOpen(false)}
    />
    </>
  );
}

function SectionEditor({
  section,
  onSave,
  onCancel,
}: {
  section: GuideSection;
  onSave: (section: GuideSection) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(section.title);
  const [summary, setSummary] = useState(section.summary ?? "");
  const [minutes, setMinutes] = useState(
    section.estimatedMinutes?.toString() ?? "",
  );
  const [cost, setCost] = useState(section.estimatedCostText ?? "");

  return (
    <View className="mt-3 rounded-card border border-line bg-surface p-4">
      <View className="gap-4">
        <TextField
          plainLabel
          label="Section title"
          value={title}
          onChangeText={setTitle}
        />
        <TextArea
          label="Summary"
          value={summary}
          onChangeText={setSummary}
          placeholder="One calm sentence about this section."
          minHeight={72}
        />
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[160px] flex-1">
            <TextField
              plainLabel
              label="Estimated minutes"
              value={minutes}
              onChangeText={setMinutes}
              placeholder="20"
              keyboardType="number-pad"
            />
          </View>
          <View className="min-w-[200px] flex-1">
            <TextField
              plainLabel
              label="Cost line"
              value={cost}
              onChangeText={setCost}
              placeholder="e.g. the official fee, if any"
            />
          </View>
        </View>
        <View className="flex-row gap-3">
          <Button
            className="flex-1"
            label="Save section"
            onPress={() =>
              onSave({
                ...section,
                title: title.trim() || "Untitled section",
                summary: summary.trim() || null,
                estimatedMinutes: minutes.trim() ? Number(minutes) || null : null,
                estimatedCostText: cost.trim() || null,
              })
            }
          />
          <Button
            className="flex-1"
            variant="secondary"
            label="Cancel"
            onPress={onCancel}
          />
        </View>
      </View>
    </View>
  );
}

export default function AdminGuideScreen() {
  const { hydrated, isAdmin, guide, updateStep, addStep, deleteStep, moveStep, updateSection, addSection, deleteSection, moveSection, markSectionVerifiedToday, resetContent, importGuide, exportGuide } = useGuide();
  const { configured } = useAuth();

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [confirmDeleteStep, setConfirmDeleteStep] = useState<string | null>(null);
  const [confirmDeleteSection, setConfirmDeleteSection] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonMode, setJsonMode] = useState<"import" | "export">("export");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace("/");
  }, [hydrated, isAdmin]);

  if (!hydrated || !isAdmin) return <LoadingScreen />;

  function openExport() {
    setJsonMode("export");
    setJsonText(JSON.stringify(exportGuide(), null, 2));
    setJsonError(null);
    setCopied(false);
    setJsonOpen(true);
  }

  function openImport() {
    setJsonMode("import");
    setJsonText("");
    setJsonError(null);
    setJsonOpen(true);
  }

  function runImport() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setJsonError("That isn't valid JSON. Check for a missing comma or quote.");
      return;
    }
    if (!importGuide(parsed)) {
      setJsonError(
        "The JSON is missing a sections array. Export the current guide to see the shape.",
      );
      return;
    }
    setJsonOpen(false);
    setNotice("Guide imported on this device.");
  }

  async function copyExport() {
    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined") {
        await navigator.clipboard.writeText(jsonText);
        setCopied(true);
      }
    } catch {
      setCopied(false);
    }
  }

  const readyCount = guide.sections
    .flatMap((section) => section.steps)
    .filter(isStepPublishable).length;
  const stepCount = guide.sections.reduce(
    (sum, section) => sum + section.steps.length,
    0,
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View className="mx-auto w-full max-w-[1040px] px-6 pt-4">
          <View className="flex-row items-center justify-between">
            <BrandLockup />
            <View className="flex-row items-center gap-2">
              <Button
                variant="secondary"
                label="Open the guide"
                onPress={() => router.push("/express-entry")}
              />
              <Button
                variant="secondary"
                label="Back to settings"
                onPress={() => router.push("/settings")}
              />
            </View>
          </View>

          <View className="mt-8">
            <Text variant="label" tone="accent">
              Admin
            </Text>
            <Text variant="title" className="mt-2">
              Guide content
            </Text>
            <Text variant="body" tone="muted" className="mt-2">
              {guide.sections.length} sections · {stepCount} steps ·{" "}
              {readyCount} ready for users
            </Text>
          </View>

          <Card variant="muted" className="mt-5 px-4 py-3.5">
            <Text variant="small" className="font-inter-semibold">
              Write only what you have checked on the official page
            </Text>
            <Text variant="small" tone="muted" className="mt-1">
              A step with no source URL or last-checked date can&apos;t be set to
              ready. Draft steps are only visible to admins.
              {configured
                ? " Changes save on this device and publish when the content sync is wired up."
                : " Supabase isn't connected yet, so changes save on this device only."}
            </Text>
          </Card>

          <View className="mt-4 flex-row flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              label="Export JSON"
              onPress={openExport}
            />
            <Button
              variant="secondary"
              label="Import JSON"
              onPress={openImport}
            />
            <Button
              variant="secondary"
              label={confirmReset ? "Tap again to reset" : "Reset to outline"}
              onPress={() => {
                if (!confirmReset) {
                  setConfirmReset(true);
                  return;
                }
                resetContent();
                setConfirmReset(false);
                setNotice("Guide reset to the seed outline.");
              }}
            />
            <Button
              variant="secondary"
              label="Add section"
              onPress={() => {
                const id = addSection();
                setEditingSectionId(id);
                setNotice("Section added. Give it a title.");
              }}
            />
          </View>

          {notice ? (
            <View className="mt-3 flex-row items-center justify-between gap-3 rounded-control bg-success-surface px-4 py-2.5">
              <Text variant="small" className="flex-1">
                {notice}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss message"
                onPress={() => setNotice(null)}
                className="h-7 w-7 items-center justify-center"
              >
                <Ionicons name="close" size={15} color={colors.muted} />
              </Pressable>
            </View>
          ) : null}

          {guide.sections.map((section, sectionIndex) => {
            const ready = section.steps.filter(isStepPublishable).length;
            return (
              <Card key={section.id} className="mt-4 p-5">
                <View className="flex-row items-start gap-3">
                  <View className="flex-1">
                    <Text variant="small" tone="muted">
                      Section {sectionIndex + 1}
                    </Text>
                    <Text variant="heading" className="mt-1">
                      {section.title}
                    </Text>
                    <Text variant="small" tone="muted" className="mt-1">
                      {section.steps.length} steps · {ready} ready
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap justify-end gap-1.5">
                    <IconButton
                      icon="chevron-up"
                      label={`Move ${section.title} up`}
                      disabled={sectionIndex === 0}
                      onPress={() => moveSection(section.id, -1)}
                    />
                    <IconButton
                      icon="chevron-down"
                      label={`Move ${section.title} down`}
                      disabled={sectionIndex === guide.sections.length - 1}
                      onPress={() => moveSection(section.id, 1)}
                    />
                    <IconButton
                      icon="create-outline"
                      label={`Edit ${section.title}`}
                      onPress={() => {
                        setEditingSectionId(
                          editingSectionId === section.id ? null : section.id,
                        );
                        setEditingStepId(null);
                      }}
                    />
                    <IconButton
                      icon="trash-outline"
                      label={
                        confirmDeleteSection === section.id
                          ? `Confirm deleting ${section.title}`
                          : `Delete ${section.title}`
                      }
                      danger
                      onPress={() => {
                        if (confirmDeleteSection !== section.id) {
                          setConfirmDeleteSection(section.id);
                          return;
                        }
                        deleteSection(section.id);
                        setConfirmDeleteSection(null);
                        setNotice("Section deleted on this device.");
                      }}
                    />
                  </View>
                </View>

                {confirmDeleteSection === section.id ? (
                  <Text variant="small" className="mt-2 text-accent">
                    Tap the bin again to delete this section and its steps.
                  </Text>
                ) : null}

                {editingSectionId === section.id ? (
                  <SectionEditor
                    section={section}
                    onSave={(next) => {
                      updateSection(next);
                      setEditingSectionId(null);
                      setNotice("Section saved on this device.");
                    }}
                    onCancel={() => setEditingSectionId(null)}
                  />
                ) : null}

                <View className="mt-3 flex-row flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    label="Mark all as verified today"
                    onPress={() => {
                      const result = markSectionVerifiedToday(section.id);
                      setNotice(
                        `${result.updated} ${
                          result.updated === 1 ? "step" : "steps"
                        } dated today${
                          result.skipped
                            ? `. ${result.skipped} skipped because ${
                                result.skipped === 1 ? "it has" : "they have"
                              } no source URL`
                            : ""
                        }.`,
                      );
                    }}
                  />
                  <Button
                    variant="secondary"
                    label="Add step"
                    onPress={() => {
                      const id = addStep(section.id);
                      setEditingStepId(id);
                      setEditingSectionId(null);
                      setNotice("Step added. Fill in the details, then save.");
                    }}
                  />
                </View>

                <View className="mt-3 overflow-hidden rounded-card border border-line">
                  {section.steps.length === 0 ? (
                    <Text variant="small" tone="muted" className="px-4 py-4">
                      No steps yet. Add one when you have checked the official
                      page.
                    </Text>
                  ) : (
                    section.steps.map((step, stepIndex) => (
                      <View
                        key={step.id}
                        className={stepIndex > 0 ? "border-t border-line" : ""}
                      >
                        <View className="flex-row items-center gap-2 px-3 py-2.5">
                          <View
                            className={`h-2 w-2 rounded-full ${
                              isStepPublishable(step)
                                ? "bg-success"
                                : "bg-warning"
                            }`}
                          />
                          <Text
                            variant="small"
                            numberOfLines={2}
                            className="flex-1 font-inter-medium"
                          >
                            {step.title}
                          </Text>
                          <Text variant="small" tone="muted">
                            {isStepPublishable(step) ? "Ready" : "Draft"}
                          </Text>
                          <IconButton
                            icon="chevron-up"
                            label={`Move ${step.title} up`}
                            disabled={stepIndex === 0}
                            onPress={() => moveStep(step.id, -1)}
                          />
                          <IconButton
                            icon="chevron-down"
                            label={`Move ${step.title} down`}
                            disabled={stepIndex === section.steps.length - 1}
                            onPress={() => moveStep(step.id, 1)}
                          />
                          <IconButton
                            icon="create-outline"
                            label={`Edit ${step.title}`}
                            onPress={() =>
                              setEditingStepId(
                                editingStepId === step.id ? null : step.id,
                              )
                            }
                          />
                          <IconButton
                            icon="trash-outline"
                            label={
                              confirmDeleteStep === step.id
                                ? `Confirm deleting ${step.title}`
                                : `Delete ${step.title}`
                            }
                            danger
                            onPress={() => {
                              if (confirmDeleteStep !== step.id) {
                                setConfirmDeleteStep(step.id);
                                return;
                              }
                              deleteStep(step.id);
                              setConfirmDeleteStep(null);
                              setNotice("Step deleted on this device.");
                            }}
                          />
                        </View>
                        {confirmDeleteStep === step.id ? (
                          <Text
                            variant="small"
                            className="px-3 pb-2 text-accent"
                          >
                            Tap the bin again to delete this step.
                          </Text>
                        ) : null}
                        {editingStepId === step.id ? (
                          <StepEditor
                            key={step.id}
                            step={step}
                            onSave={(next) => {
                              updateStep(next);
                              setEditingStepId(null);
                              setNotice(
                                next.status === "ready"
                                  ? "Step saved and published to users on this device."
                                  : "Step saved as a draft.",
                              );
                            }}
                            onCancel={() => setEditingStepId(null)}
                          />
                        ) : null}
                      </View>
                    ))
                  )}
                </View>
              </Card>
            );
          })}

          <View className="mt-6 flex-row flex-wrap gap-2">
            <Button
              variant="secondary"
              label="Add section"
              onPress={() => {
                const id = addSection();
                setEditingSectionId(id);
                setNotice("Section added. Give it a title.");
              }}
            />
          </View>

          <Disclaimer className="mt-10" />
        </View>
      </ScrollView>

      <InfoDialog
        visible={jsonOpen}
        title={jsonMode === "export" ? "Export guide JSON" : "Import guide JSON"}
        onClose={() => setJsonOpen(false)}
      >
        <TextArea
          label={jsonMode === "export" ? "Guide JSON" : "Paste guide JSON"}
          value={jsonText}
          onChangeText={setJsonText}
          editable={jsonMode === "export"}
          minHeight={280}
          helper={
            jsonMode === "export"
              ? "Copy this into a file if you want to keep a backup."
              : "Importing replaces the guide on this device."
          }
        />
        {jsonError ? (
          <Text variant="small" className="mt-2 text-accent">
            {jsonError}
          </Text>
        ) : null}
        <View className="mt-3 flex-row gap-2">
          {jsonMode === "export" ? (
            <>
              <Button
                label={copied ? "Copied" : "Copy JSON"}
                onPress={() => void copyExport()}
              />
              <Button
                variant="secondary"
                label="Close"
                onPress={() => setJsonOpen(false)}
              />
            </>
          ) : (
            <>
              <Button
                label="Import guide"
                disabled={!jsonText.trim()}
                onPress={runImport}
              />
              <Button
                variant="secondary"
                label="Cancel"
                onPress={() => setJsonOpen(false)}
              />
            </>
          )}
        </View>
      </InfoDialog>
    </SafeAreaView>
  );
}
