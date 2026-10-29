import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  type ScrollViewInstance,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandLockup } from "@/components/brand";
import { Disclaimer } from "@/components/disclaimer";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useIsWideWeb } from "@/components/web-nav";
import { useCrs } from "@/features/crs/crs-provider";
import { DoneToggle } from "@/features/guide/done-toggle";
import { useGuide } from "@/features/guide/guide-provider";
import { PrepInputsPanel, hasPrepInputs } from "@/features/guide/prep-inputs";
import { ProgressRing } from "@/features/guide/progress-ring";
import { ReadinessCard } from "@/features/guide/readiness-card";
import { computeReadiness } from "@/features/guide/readiness";
import { GuideSectionList } from "@/features/guide/section-list";
import { StepCard } from "@/features/guide/step-card";
import {
  checkedCount,
  stepsVisibleTo,
  visibleSteps,
  type GuideSection,
} from "@/features/guide/types";
import { isSafeHttpUrl, openExternal } from "@/lib/links";
import { colors } from "@/theme/theme";

function SectionPendingCard({ section }: { section: GuideSection | null }) {
  return (
    <Card className="mt-6 p-6">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
          <Ionicons name="time-outline" size={20} color={colors.muted} />
        </View>
        <Text variant="heading" className="flex-1">
          {section
            ? "We're still checking this section"
            : "The guide is being checked"}
        </Text>
      </View>
      <Text variant="body" tone="muted" className="mt-3">
        {section
          ? `MapleRoute checks each step against the official IRCC page before showing it, and records the date of the check. “${section.title}” hasn't been checked yet.`
          : "MapleRoute checks each step against the official IRCC page before showing it, and records the date of the check. Nothing is guessed or written from memory."}
      </Text>
      <Text variant="small" tone="muted" className="mt-3">
        You can move on and come back — there is nothing to fill in here yet.
      </Text>
    </Card>
  );
}

export default function ExpressEntryProfileScreen() {
  const {
    guide,
    hydrated,
    isAdmin,
    progress,
    documents,
    notes,
    prep,
    setPrep,
    toggleStep,
    setDocumentReady,
    saveNote,
    reportStep,
  } = useGuide();
  const { latest } = useCrs();
  const isWide = useIsWideWeb();

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dismissedSkipFor, setDismissedSkipFor] = useState<string | null>(null);
  const scrollRef = useRef<ScrollViewInstance | null>(null);

  const allVisible = useMemo(() => visibleSteps(guide, isAdmin), [guide, isAdmin]);
  const totalSteps = allVisible.length;
  const doneSteps = useMemo(
    () => checkedCount(allVisible.map((item) => item.step), progress),
    [allVisible, progress],
  );
  const percent = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const prepSection =
    guide.sections.find((section) => section.position === 0) ?? null;
  const prepSteps = prepSection ? stepsVisibleTo(prepSection, isAdmin) : [];
  const checklistKeys = prepSteps.flatMap((step) =>
    step.requiredDocuments.map((document) => `${step.id}::${document.name}`),
  );
  const readiness = computeReadiness(prep, {
    documentsReady: checklistKeys.filter((key) => documents[key]).length,
    documentsTotal: checklistKeys.length,
    stepsDone: doneSteps,
    stepsTotal: totalSteps,
  });

  const active =
    allVisible.find((item) => item.step.id === activeStepId) ?? null;
  const activeIndex = active
    ? allVisible.findIndex((item) => item.step.id === active.step.id)
    : -1;

  const sectionForActive =
    active?.section ??
    guide.sections.find((section) => section.id === activeSectionId) ??
    null;
  const sectionIndex = sectionForActive
    ? guide.sections.findIndex((section) => section.id === sectionForActive.id)
    : -1;

  const sectionVisibleSteps = sectionForActive
    ? stepsVisibleTo(sectionForActive, isAdmin)
    : [];
  const sectionDoneCount = checkedCount(sectionVisibleSteps, progress);
  const sectionComplete =
    sectionVisibleSteps.length > 0 &&
    sectionDoneCount === sectionVisibleSteps.length;
  const sectionStepNumber = active
    ? sectionVisibleSteps.findIndex((step) => step.id === active.step.id) + 1
    : 0;

  const previousSection = sectionIndex > 0 ? guide.sections[sectionIndex - 1] : null;
  const skippedSteps = previousSection
    ? stepsVisibleTo(previousSection, isAdmin).filter(
        (step) => !progress[step.id]?.checked,
      )
    : [];
  const nextSection =
    sectionIndex >= 0 && sectionIndex < guide.sections.length - 1
      ? guide.sections[sectionIndex + 1]
      : null;
  const nextSectionFirst = nextSection
    ? stepsVisibleTo(nextSection, isAdmin)[0]
    : null;

  const hasProgress = Object.values(progress).some((entry) => entry.checked);
  const officialUrl = active?.step.officialUrl ?? null;

  useEffect(() => {
    if (!hydrated) return;

    if (activeStepId && allVisible.some((item) => item.step.id === activeStepId)) {
      const match = allVisible.find((item) => item.step.id === activeStepId);
      if (match && match.section.id !== activeSectionId) {
        setActiveSectionId(match.section.id);
      }
      return;
    }

    if (activeSectionId) {
      const section = guide.sections.find((item) => item.id === activeSectionId);
      if (section) {
        const first = stepsVisibleTo(section, isAdmin)[0];
        if (first) {
          setActiveStepId(first.id);
        } else if (activeStepId !== null) {
          setActiveStepId(null);
        }
        return;
      }
    }

    const first = allVisible[0];
    setActiveStepId(first?.step.id ?? null);
    setActiveSectionId(first?.section.id ?? guide.sections[0]?.id ?? null);
  }, [
    hydrated,
    allVisible,
    activeStepId,
    activeSectionId,
    guide.sections,
    isAdmin,
  ]);

  function scrollTop() {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function selectSection(sectionId: string) {
    setActiveSectionId(sectionId);
    const section = guide.sections.find((item) => item.id === sectionId);
    const first = section ? stepsVisibleTo(section, isAdmin)[0] : null;
    setActiveStepId(first?.id ?? null);
    setSheetOpen(false);
    scrollTop();
  }

  function selectStep(sectionId: string, stepId: string) {
    setActiveSectionId(sectionId);
    setActiveStepId(stepId);
    setSheetOpen(false);
    scrollTop();
  }

  function goRelative(direction: -1 | 1) {
    if (activeIndex < 0) return;
    const target = allVisible[activeIndex + direction];
    if (!target) return;
    setActiveSectionId(target.section.id);
    setActiveStepId(target.step.id);
    scrollTop();
  }

  if (!hydrated) return <LoadingScreen />;

  const skipPrompt =
    previousSection &&
    skippedSteps.length > 0 &&
    sectionForActive &&
    dismissedSkipFor !== sectionForActive.id ? (
      <Card variant="muted" className="mt-5 px-4 py-3.5">
        <View className="flex-row items-start gap-3">
          <Ionicons name="trail-sign-outline" size={18} color={colors.muted} />
          <View className="flex-1">
            <Text variant="small" className="font-inter-semibold">
              You skipped {skippedSteps.length}{" "}
              {skippedSteps.length === 1 ? "step" : "steps"} in “{previousSection.title}”.
              Review {skippedSteps.length === 1 ? "it" : "them"}?
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Review the skipped steps"
                onPress={() => selectStep(previousSection.id, skippedSteps[0].id)}
                className="min-h-[36px] justify-center active:opacity-70"
              >
                <Text variant="small" tone="accent" className="font-inter-semibold">
                  Review them
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss"
                onPress={() => setDismissedSkipFor(sectionForActive.id)}
                className="min-h-[36px] justify-center active:opacity-70"
              >
                <Text variant="small" tone="muted">
                  Not now
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Card>
    ) : null;

  const completionCard =
    sectionComplete && sectionForActive ? (
      <View className="mt-5 rounded-card bg-success-surface p-5">
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <Text variant="heading" className="flex-1">
            You finished “{sectionForActive.title}”
          </Text>
        </View>
        <Text variant="small" tone="muted" className="mt-2">
          {sectionVisibleSteps.length}{" "}
          {sectionVisibleSteps.length === 1 ? "step" : "steps"} done. You can
          uncheck anything you need to revisit.
        </Text>
        {nextSection ? (
          <Button
            className="mt-4"
            label={
              nextSectionFirst
                ? `Start “${nextSection.title}”`
                : `Go to “${nextSection.title}”`
            }
            onPress={() => selectSection(nextSection.id)}
          />
        ) : (
          <Button
            className="mt-4"
            label="Back to my journey"
            onPress={() => router.push("/")}
          />
        )}
      </View>
    ) : null;

  const firstVisitNote = !hasProgress ? (
    <View className="mt-5 flex-row items-start gap-2.5 rounded-control bg-surface px-4 py-3">
      <Ionicons
        name="information-circle-outline"
        size={17}
        color={colors.muted}
      />
      <Text variant="small" tone="muted" className="flex-1">
        Keep the official page open in another tab. Follow along here, tick each
        step when you've done it there.
      </Text>
    </View>
  ) : null;

  const stepCard =
    active && sectionForActive ? (
      <Card className={`mt-4 ${isWide ? "p-7" : "p-5"}`}>
        <StepCard
          key={active.step.id}
          section={sectionForActive}
          step={active.step}
          stepIndex={sectionStepNumber}
          stepCount={sectionVisibleSteps.length}
          checked={Boolean(progress[active.step.id]?.checked)}
          onToggleChecked={(checked) => toggleStep(active.step.id, checked)}
          documentsReady={documents}
          onDocumentReady={(name, ready) =>
            setDocumentReady(active.step.id, name, ready)
          }
          note={notes[active.step.id] ?? ""}
          onSaveNote={(value) => saveNote(active.step.id, value)}
          onReport={(value) => reportStep(active.step.id, value)}
          isAdmin={isAdmin}
          crsInputs={latest?.inputs ?? null}
          showDoneBlock={isWide}
          hasPrevious={activeIndex > 0}
          hasNext={activeIndex >= 0 && activeIndex < totalSteps - 1}
          onPrevious={() => goRelative(-1)}
          onNext={() => goRelative(1)}
          onOpenAdmin={() => router.push("/admin/guide")}
          prepInputs={
            hasPrepInputs(active.step.id) ? (
              <PrepInputsPanel
                stepId={active.step.id}
                prep={prep}
                teer={readiness.teer}
                checked={Boolean(progress[active.step.id]?.checked)}
                onChange={setPrep}
              />
            ) : null
          }
        />
      </Card>
    ) : sectionForActive && sectionVisibleSteps.length === 0 ? (
      <SectionPendingCard section={sectionForActive} />
    ) : (
      <SectionPendingCard section={null} />
    );

  const readinessCard =
    prepSection && sectionForActive?.id === prepSection.id ? (
      <ReadinessCard readiness={readiness} />
    ) : null;

  if (!isWide) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-canvas">
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 130 }}
        >
          <View className="px-5 pt-3">
            <View className="flex-row items-center justify-between">
              <Link href="/" aria-label="MapleRoute home">
                <BrandLockup />
              </Link>
              <View className="flex-row items-center gap-2">
                {isAdmin ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Edit guide content"
                    onPress={() => router.push("/admin/guide")}
                    className="h-9 w-9 items-center justify-center rounded-full border border-line active:bg-surface"
                  >
                    <Ionicons
                      name="construct-outline"
                      size={17}
                      color={colors.muted}
                    />
                  </Pressable>
                ) : null}
                <View className="rounded-full border border-line px-2.5 py-1">
                  <Text variant="label" tone="muted">
                    Step 2
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-6">
              <Text className="text-[12px] font-inter-semibold text-muted">
                Express Entry guide
              </Text>
              <Text variant="title" className="mt-1.5">
                {guide.title}
              </Text>
              <Text variant="small" tone="muted" className="mt-2">
                {guide.description}
              </Text>
            </View>

            <View className="mt-5">
              <View className="flex-row items-center justify-between">
                <Text variant="small" tone="muted">
                  Overall progress
                </Text>
                <Text variant="small" className="font-inter-semibold">
                  {totalSteps === 0
                    ? "Being verified"
                    : `${doneSteps} of ${totalSteps} steps`}
                </Text>
              </View>
              <View
                accessibilityRole="progressbar"
                accessibilityValue={{
                  min: 0,
                  max: totalSteps || 1,
                  now: doneSteps,
                  text: `${doneSteps} of ${totalSteps} steps done`,
                }}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface"
              >
                <View
                  className="h-1.5 rounded-full bg-accent"
                  style={{ width: `${percent}%` }}
                />
              </View>
            </View>

            <View className="mt-4 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open the section list"
                onPress={() => setSheetOpen(true)}
                className="h-11 flex-row items-center justify-center gap-2 rounded-control border border-line px-4 active:bg-surface"
              >
                <Ionicons name="list-outline" size={16} color={colors.ink} />
                <Text variant="small" className="font-inter-semibold">
                  Sections
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open the official page in a new tab"
                disabled={!isSafeHttpUrl(officialUrl)}
                onPress={() => officialUrl && openExternal(officialUrl)}
                className={`h-11 flex-1 flex-row items-center justify-center gap-2 rounded-control px-4 ${
                  isSafeHttpUrl(officialUrl)
                    ? "bg-accent active:bg-accent-pressed"
                    : "border border-line bg-canvas opacity-60"
                }`}
              >
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={
                    isSafeHttpUrl(officialUrl) ? colors.canvas : colors.muted
                  }
                />
                <Text
                  variant="small"
                  className="font-inter-semibold"
                  tone={isSafeHttpUrl(officialUrl) ? "white" : "muted"}
                >
                  Open official page
                </Text>
              </Pressable>
            </View>

            {firstVisitNote}
            {skipPrompt}
            {completionCard}
            {readinessCard}
            {stepCard}

            <View className="mt-8">
              <Button
                variant="secondary"
                label="Back to my journey"
                onPress={() => router.push("/")}
              />
            </View>
            <Disclaimer className="mt-6" />
          </View>
        </ScrollView>

        {active ? (
          <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-canvas px-5 pb-3 pt-2.5">
            <DoneToggle
              checked={Boolean(progress[active.step.id]?.checked)}
              label="Mark as done"
              description="I've done this on the official page"
              onChange={(checked) => toggleStep(active.step.id, checked)}
            />
          </View>
        ) : null}

        <Modal
          visible={sheetOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setSheetOpen(false)}
          statusBarTranslucent
        >
          <View className="flex-1 justify-end bg-black/30">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close the section list"
              className="absolute inset-0"
              onPress={() => setSheetOpen(false)}
            />
            <View className="max-h-[80%] rounded-t-panel bg-canvas px-4 pb-6 pt-3">
              <View className="items-center">
                <View className="h-1 w-10 rounded-full bg-line" />
              </View>
              <View className="mt-4 flex-row items-center justify-between px-1">
                <Text variant="heading">Sections</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close the section list"
                  onPress={() => setSheetOpen(false)}
                  className="h-9 w-9 items-center justify-center rounded-full bg-surface"
                >
                  <Ionicons name="close" size={18} color={colors.ink} />
                </Pressable>
              </View>
              <ScrollView
                className="mt-3"
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator
              >
                <GuideSectionList
                  guide={guide}
                  isAdmin={isAdmin}
                  progress={progress}
                  activeSectionId={activeSectionId}
                  activeStepId={activeStepId}
                  onSelectSection={selectSection}
                  onSelectStep={selectStep}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <View className="border-b border-line bg-canvas">
        <View className="mx-auto w-full max-w-[1240px] flex-row items-center gap-4 px-6 py-3">
          <Link href="/" aria-label="MapleRoute home">
            <BrandLockup />
          </Link>
          <View className="h-6 w-px bg-line" />
          <View className="min-w-0 flex-1">
            <Text
              variant="small"
              tone="muted"
              className="text-[12px] leading-[16px]"
            >
              Express Entry guide
            </Text>
            <Text variant="heading" numberOfLines={1} className="mt-0.5">
              {guide.title}
            </Text>
          </View>

          <View
            className="w-[170px]"
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: totalSteps || 1,
              now: doneSteps,
              text: `${doneSteps} of ${totalSteps} steps done`,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text variant="small" tone="muted" className="text-[12px]">
                Overall
              </Text>
              <Text variant="small" className="text-[12px] font-inter-semibold">
                {percent}%
              </Text>
            </View>
            <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
              <View
                className="h-1.5 rounded-full bg-accent"
                style={{ width: `${percent}%` }}
              />
            </View>
            <Text
              variant="small"
              tone="muted"
              className="mt-1 text-[12px] leading-[16px]"
            >
              {totalSteps === 0
                ? "Being verified"
                : activeIndex >= 0
                  ? `Step ${activeIndex + 1} of ${totalSteps}`
                  : `${doneSteps} of ${totalSteps} done`}
            </Text>
          </View>

          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Open the official page in a new tab"
            disabled={!isSafeHttpUrl(officialUrl)}
            onPress={() => officialUrl && openExternal(officialUrl)}
            className={`h-10 flex-row items-center gap-2 rounded-control px-4 ${
              isSafeHttpUrl(officialUrl)
                ? "bg-accent active:bg-accent-pressed"
                : "border border-line bg-canvas opacity-60"
            }`}
          >
            <Ionicons
              name="open-outline"
              size={15}
              color={isSafeHttpUrl(officialUrl) ? colors.canvas : colors.muted}
            />
            <Text variant="small" className="font-inter-semibold" tone={isSafeHttpUrl(officialUrl) ? "white" : "muted"}>
              Open official page
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mx-auto w-full max-w-[1240px] flex-1 flex-row">
        <View
          className={`border-r border-line bg-canvas ${
            collapsed ? "w-[68px]" : "w-[286px]"
          }`}
        >
          <View
            className={`flex-row items-center py-4 ${
              collapsed ? "justify-center px-2" : "justify-between px-4"
            }`}
          >
            {collapsed ? null : (
              <Text variant="small" className="font-inter-semibold">
                Guide sections
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                collapsed ? "Expand the section list" : "Collapse the section list"
              }
              onPress={() => setCollapsed((value) => !value)}
              className="h-8 w-8 items-center justify-center rounded-full active:bg-surface"
            >
              <Ionicons
                name={collapsed ? "chevron-forward" : "chevron-back"}
                size={17}
                color={colors.muted}
              />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {collapsed ? (
              <View className="items-center gap-1">
                {guide.sections.map((section) => {
                  const steps = stepsVisibleTo(section, isAdmin);
                  const done = checkedCount(steps, progress);
                  const complete = steps.length > 0 && done === steps.length;
                  return (
                    <Pressable
                      key={section.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${section.title}, ${
                        steps.length > 0
                          ? `${done} of ${steps.length} done`
                          : "being verified"
                      }`}
                      onPress={() => selectSection(section.id)}
                      className={`h-10 w-10 items-center justify-center rounded-control active:bg-surface ${
                        section.id === activeSectionId ? "bg-surface" : ""
                      }`}
                    >
                      {complete ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={colors.accent}
                        />
                      ) : (
                        <ProgressRing done={done} total={steps.length} size={22} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <GuideSectionList
                guide={guide}
                isAdmin={isAdmin}
                progress={progress}
                activeSectionId={activeSectionId}
                activeStepId={activeStepId}
                onSelectSection={selectSection}
                onSelectStep={selectStep}
              />
            )}

            {isAdmin ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit guide content"
                onPress={() => router.push("/admin/guide")}
                className="mt-4 min-h-[44px] flex-row items-center gap-2 rounded-control px-2.5 active:bg-surface"
              >
                <Ionicons
                  name="construct-outline"
                  size={16}
                  color={colors.muted}
                />
                {collapsed ? null : (
                  <Text variant="small" tone="muted">
                    Edit guide content
                  </Text>
                )}
              </Pressable>
            ) : null}
          </ScrollView>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        >
          <View className="w-full max-w-[760px] px-8 py-7">
            {firstVisitNote}
            {skipPrompt}
            {completionCard}
            {readinessCard}
            {stepCard}
            <Disclaimer className="mt-10" />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
