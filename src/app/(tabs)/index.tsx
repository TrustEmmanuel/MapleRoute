import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { BrandLockup } from "@/components/brand";
import { CrsScoreBadge } from "@/components/crs-score-badge";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useIsWideWeb } from "@/components/web-nav";
import { useAuth } from "@/features/auth/auth-provider";
import { useCrs } from "@/features/crs/crs-provider";
import { latestDrawNote, LATEST_DRAW } from "@/features/crs/draws";
import { CRS_MAX, CRS_RULES } from "@/features/crs/rules";
import { useGuide } from "@/features/guide/guide-provider";
import { checkedCount, visibleSteps } from "@/features/guide/types";
import {
  deadlineLine,
  nextDeadline,
  todayIso,
} from "@/features/planning/documents";
import { useDocumentDates } from "@/features/planning/use-document-dates";
import { InstallCard } from "@/features/pwa/install-card";
import { downloadCheckInIcs, formatCheckInDate } from "@/features/retention/check-in";
import { useCheckInReminder } from "@/features/retention/use-check-in-reminder";
import { ShareProgressButton } from "@/features/share/share-progress";
import {
  GUIDE_UPDATES,
  formatUpdateDate,
  unseenUpdates,
} from "@/features/updates/guide-updates";
import { useSeenUpdates } from "@/features/updates/use-seen-updates";
import { colors } from "@/theme/theme";

const JOURNEY: {
  title: string;
  detail: string;
  href?: "/crs" | "/express-entry";
}[] = [
  { title: "CRS check", detail: "See where you stand", href: "/crs" },
  {
    title: "Express Entry profile",
    detail: "Create and submit",
    href: "/express-entry",
  },
  { title: "Invitation to apply", detail: "Get picked from the pool" },
  { title: "PR application", detail: "Documents, biometrics, medicals" },
  { title: "Flight ready", detail: "COPR in hand" },
];

const WAYS: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  isNew?: boolean;
  onPress: () => void;
}[] = [
  {
    icon: "chatbox-ellipses-outline",
    title: "Improve your language scores",
    detail: "Usually the biggest lever",
    onPress: () => router.push("/guide/skill-transferability"),
  },
  {
    icon: "time-outline",
    title: "Add French",
    detail: "Can add bonus points",
    onPress: () => router.push("/guide/additional-points"),
  },
  {
    icon: "school-outline",
    title: "Get your education assessed",
    detail: "Needed for foreign degrees",
    onPress: () => router.push("/express-entry"),
  },
  {
    icon: "briefcase-outline",
    title: "Check high-wage job offer points",
    detail: "From Nov 3, 2026",
    isNew: true,
    onPress: () => openExternal(CRS_RULES.highWageUrl),
  },
];

function formatDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function openExternal(url: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  void Linking.openURL(url);
}

function ScoreRing({ score }: { score: number | null }) {
  const size = 198;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = score
    ? Math.min(1, Math.max(0, score / CRS_MAX)) * circumference
    : 0;

  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}
      accessibilityRole="text"
      accessibilityLabel={
        score
          ? `CRS score ${score} out of ${CRS_MAX}`
          : "CRS score not checked"
      }
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ECECEF"
          strokeWidth={stroke}
          fill="none"
        />
        {filled > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference - filled}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            fill="none"
          />
        ) : null}
      </Svg>
      <Text
        style={{
          fontSize: 44,
          lineHeight: 50,
          letterSpacing: -1.6,
          fontFamily: "Inter_700Bold",
        }}
      >
        {score ? score.toLocaleString() : "—"}
      </Text>
      <Text variant="small" tone="muted">
        out of {CRS_MAX.toLocaleString()}
      </Text>
    </View>
  );
}

function SourceRow({
  title,
  verified,
  url,
}: {
  title: string;
  verified: string;
  url: string;
}) {
  return (
    <View className="flex-row items-center justify-between border-t border-line py-4">
      <View className="flex-1 pr-4">
        <Text variant="body" className="font-inter-semibold">
          {title}
        </Text>
        <Text variant="small" tone="muted" className="mt-0.5">
          canada.ca · verified {formatDate(verified)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open ${title} on canada.ca`}
        hitSlop={8}
        onPress={() => openExternal(url)}
        className="min-h-[44px] flex-row items-center gap-1"
      >
        <Text variant="small" tone="accent" className="font-inter-semibold">
          Open
        </Text>
        <Ionicons name="open-outline" size={14} color={colors.accent} />
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const { accountEmail, accountFirstName, previewMode, isLocalAccount } = useAuth();
  const { latest, loading } = useCrs();
  const { guide, hydrated, isAdmin, progress, position } = useGuide();
  const { seenId, ready: updatesReady } = useSeenUpdates();
  const {
    dueDate,
    ready: reminderReady,
    due: reminderDue,
    setInDays,
    clear: clearReminder,
  } = useCheckInReminder();
  const { dates: documentDates, ready: documentsReady } = useDocumentDates();
  const isWideWeb = useIsWideWeb();

  const name = accountFirstName;
  const allSteps = useMemo(() => visibleSteps(guide, isAdmin), [guide, isAdmin]);
  const totalSteps = allSteps.length;
  const doneSteps = useMemo(
    () => checkedCount(allSteps.map((item) => item.step), progress),
    [allSteps, progress],
  );
  const nextOpen =
    allSteps.find((item) => !progress[item.step.id]?.checked) ?? null;
  const resumeStep = position
    ? (allSteps.find(
        (item) =>
          item.section.id === position.sectionId &&
          item.step.id === position.stepId,
      ) ?? null)
    : null;
  const openSteps = Math.max(totalSteps - doneSteps, 0);
  const started = Boolean(latest) || doneSteps > 0;
  const allDone = totalSteps > 0 && doneSteps === totalSteps;
  const currentStage = started ? 1 : 0;
  const stepNumber = currentStage + 1;

  const unreadUpdates = updatesReady
    ? unseenUpdates(GUIDE_UPDATES, seenId).length
    : 0;
  const latestUpdate = GUIDE_UPDATES[0];
  const dueLabel = dueDate ? formatCheckInDate(dueDate) : "";

  const nextDocument = nextDeadline(documentDates, todayIso());
  const documentDetail = !documentsReady
    ? "Add the dates on your passport, language test, ECA, police certificate and medical exam."
    : nextDocument
      ? `${deadlineLine(nextDocument.rule, nextDocument.date, nextDocument.status)}.${
          nextDocument.status.state === "expired"
            ? " This one is past its window."
            : nextDocument.status.state === "soon"
              ? " This one needs attention."
              : ""
        }`
      : "Add the dates on your documents and this card will show what comes due first.";

  const heroSection = nextOpen?.section ?? null;
  const heroStepCount = heroSection
    ? allSteps.filter((item) => item.section.id === heroSection.id).length
    : 0;
  const heroTitle = !started
    ? "Get your CRS score"
    : allDone
      ? "Re-check your Express Entry guide"
      : (heroSection?.title ?? "Continue your Express Entry guide");
  const heroCopy = !started
    ? "A few questions about your age, education, language and work. You'll see exactly where you stand before the guide begins."
    : allDone
      ? "Every step is ticked. Re-read anything that may have changed on canada.ca, then keep your answers current."
      : "Open the official page in another tab, then follow our guide and tick each step as you finish it.";
  const heroPill = !started
    ? "First step · about 5 minutes"
    : heroSection
      ? `Next step · ${heroStepCount} ${heroStepCount === 1 ? "step" : "steps"}`
      : "Next step";

  const comparison = latest
    ? LATEST_DRAW.score - latest.score > 0
      ? `${(LATEST_DRAW.score - latest.score).toLocaleString()} points below the latest Express Entry draw`
      : "At or above the latest Express Entry draw"
    : "";
  const drawNote = latestDrawNote();

  const accountNote = previewMode
    ? "Preview mode — your score stays on this device. Connect Supabase and sign in to keep it with your account."
    : isLocalAccount
      ? `Signed in as ${accountEmail ?? "a device account"}. This account lives on this device until Supabase is connected.`
      : null;

  const scoreCard = (
    <Card className="p-6">
      <Text variant="heading">Your CRS score</Text>
      {latest ? (
        <>
          <View className="items-center pt-4">
            <ScoreRing score={latest.score} />
            <View className="mt-4 rounded-full bg-[#F1F1F3] px-4 py-1.5">
              <Text variant="small" className="font-inter-semibold">
                {comparison}
              </Text>
            </View>
            <View className="mt-4 flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1">
              {[
                { color: colors.success, label: "At or above" },
                { color: colors.warning, label: "Within 49" },
                { color: colors.accent, label: "50+ below" },
              ].map((item) => (
                <View key={item.label} className="flex-row items-center gap-1.5">
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: item.color,
                    }}
                  />
                  <Text variant="small" tone="muted">
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
            <Text variant="small" tone="muted" className="mt-3 text-center">
              Latest draw: {LATEST_DRAW.drawName} — {LATEST_DRAW.score} on{" "}
              {formatDate(LATEST_DRAW.drawDate)}
            </Text>
            {drawNote ? (
              <Text variant="small" tone="muted" className="mt-1 text-center">
                {drawNote}
              </Text>
            ) : null}
          </View>
          <Button
            className="mt-5"
            variant="secondary"
            label="See score breakdown"
            onPress={() => router.push("/crs")}
          />
        </>
      ) : (
        <>
          <View className="items-center pt-4">
            <ScoreRing score={null} />
            <Text variant="small" tone="muted" className="mt-4 text-center">
              Answer a few questions to see your score and how it compares with
              the latest draw.
            </Text>
          </View>
          <Button
            className="mt-5"
            label="Get my CRS score"
            onPress={() => router.push("/crs")}
          />
        </>
      )}
      {started ? (
        <ShareProgressButton
          done={doneSteps}
          total={totalSteps}
          score={latest?.score ?? null}
        />
      ) : null}
    </Card>
  );

  const waysCard = (
    <Card className="p-6">
      <Text variant="heading">Ways to raise your score</Text>
      <View className="mt-2">
        {WAYS.map((way, index) => (
          <Pressable
            key={way.title}
            accessibilityRole="button"
            accessibilityLabel={`${way.title}. ${way.detail}`}
            onPress={way.onPress}
            className={`flex-row items-center gap-3 py-3.5 active:opacity-70 ${
              index > 0 ? "border-t border-line" : ""
            }`}
          >
            <View className="h-10 w-10 items-center justify-center rounded-[12px] bg-danger-surface">
              <Ionicons name={way.icon} size={19} color={colors.accent} />
            </View>
            <View className="flex-1">
              <View className="flex-row flex-wrap items-center gap-x-2">
                <Text variant="body" className="font-inter-semibold">
                  {way.title}
                </Text>
                {way.isNew ? (
                  <View className="rounded bg-danger-surface px-1.5 py-0.5">
                    <Text
                      variant="small"
                      tone="accent"
                      className="text-[10px] leading-[12px] font-inter-semibold"
                    >
                      New
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text variant="small" tone="muted" className="mt-0.5">
                {way.detail}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </Card>
  );

  return (
    <Screen wide background={isWideWeb ? "surface" : "canvas"}>
      {isWideWeb ? null : (
        <View className="flex-row items-center justify-between pt-1">
          {loading ? (
            <View className="h-8 w-24 rounded-full bg-surface" />
          ) : latest ? (
            <CrsScoreBadge score={latest.score} band={latest.band} />
          ) : (
            <View className="rounded-full border border-line px-3 py-1.5">
              <Text variant="label" tone="muted">
                CRS not checked
              </Text>
            </View>
          )}
          <BrandLockup />
        </View>
      )}

      <View
        style={
          isWideWeb
            ? { flexDirection: "row", alignItems: "flex-start", gap: 28 }
            : undefined
        }
      >
        <View style={isWideWeb ? { flex: 1, minWidth: 0 } : undefined}>
          <View className={isWideWeb ? "pt-8" : "pt-6"}>
            <Text
              variant="display"
              style={{
                fontSize: 40,
                lineHeight: 46,
                letterSpacing: -1.4,
                fontFamily: "Inter_700Bold",
              }}
            >
              {started
                ? name
                  ? `Welcome back, ${name}.`
                  : "Welcome back."
                : "First, let's see where you stand."}
            </Text>
            <Text variant="body" tone="muted" className="mt-2">
              {started
                ? `You're on step ${stepNumber} of 5. Here's exactly what to do next.`
                : "Five steps from a CRS check to your flight. Start with where you stand."}
            </Text>
            {accountNote ? (
              <Text variant="small" tone="muted" className="mt-2">
                {accountNote}
              </Text>
            ) : null}
          </View>

          <View
            className="mt-7 rounded-card border border-[#F3CFCA] bg-danger-surface p-4"
            style={
              isWideWeb
                ? { flexDirection: "row", alignItems: "center", gap: 16 }
                : { gap: 12 }
            }
          >
            <View className="flex-1 flex-row items-start gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#FBE3DF]">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={colors.accent}
                />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-[15px] leading-[21px] text-ink">
                  CRS rules changed on November 3, 2026
                </Text>
                <Text variant="small" tone="muted" className="mt-0.5">
                  {latest
                    ? "Answer 2 new questions so your score includes the new job offer and Canadian experience points."
                    : "Two new questions about high-wage work and job offers are part of the score now. Answer them when you check your score."}
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={latest ? "Update my CRS answers" : "Get my CRS score"}
              onPress={() => router.push("/crs")}
              style={isWideWeb ? { flexShrink: 0 } : undefined}
              className={`h-11 items-center justify-center rounded-control bg-accent px-5 active:bg-accent-pressed ${
                isWideWeb ? "" : "self-start"
              }`}
            >
              <Text variant="button" tone="white">
                {latest ? "Update answers" : "Get my score"}
              </Text>
            </Pressable>
          </View>

          <View
            className="mt-6 overflow-hidden rounded-panel bg-accent"
            style={{ minHeight: isWideWeb ? 336 : 320 }}
          >
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 760 360"
              preserveAspectRatio="xMaxYMax slice"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            >
              {[160, 280, 400, 520].map((r) => (
                <Circle
                  key={r}
                  cx={790}
                  cy={420}
                  r={r}
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth={1.5}
                  fill="none"
                />
              ))}
              <Path
                d="M430 355 C 505 330, 590 245, 655 118"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth={1.6}
                strokeDasharray="5 7"
                fill="none"
              />
              <Circle
                cx={430}
                cy={355}
                r={7}
                stroke="#FFFFFF"
                strokeWidth={2}
                fill="none"
              />
              <Circle cx={430} cy={355} r={2.4} fill="#FFFFFF" />
            </Svg>
            <Ionicons
              name="airplane"
              size={isWideWeb ? 40 : 28}
              color="#FFFFFF"
              style={{
                position: "absolute",
                right: isWideWeb ? 34 : 20,
                top: isWideWeb ? 54 : 18,
                opacity: 0.92,
                transform: [{ rotate: "-10deg" }],
              }}
            />
            <View className="relative p-7" style={{ zIndex: 1 }}>
              <View className="self-start rounded-full bg-white/15 px-3 py-1">
                <Text
                  variant="small"
                  tone="white"
                  className="text-[12px] leading-[16px] font-inter-semibold"
                >
                  {heroPill}
                </Text>
              </View>
              <Text
                className="mt-4 max-w-[540px] text-white"
                style={{
                  fontSize: isWideWeb ? 36 : 30,
                  lineHeight: isWideWeb ? 42 : 36,
                  letterSpacing: -1,
                  fontFamily: "Inter_700Bold",
                }}
              >
                {heroTitle}
              </Text>
              <Text className="mt-3 max-w-[470px] text-[15px] leading-[23px] text-white">
                {heroCopy}
              </Text>
              <View
                className="mt-6 flex-row flex-wrap"
                style={{ gap: 12 }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    started ? "Start this step" : "Get my CRS score"
                  }
                  onPress={() =>
                    router.push(started ? "/express-entry" : "/crs")
                  }
                  className="h-11 items-center justify-center rounded-control bg-canvas px-5 active:opacity-90"
                >
                  <Text variant="button" tone="accent">
                    {started ? "Start this step" : "Get my score"}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    latest ? "Review my CRS answers" : "Open the guide"
                  }
                  onPress={() => router.push(latest ? "/crs" : "/express-entry")}
                  className="h-11 items-center justify-center rounded-control border border-white/60 px-5 active:bg-white/10"
                >
                  <Text variant="button" tone="white">
                    {latest ? "Review my CRS answers" : "Open the guide"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {isWideWeb ? null : <View className="mt-6">{scoreCard}</View>}
          {isWideWeb ? null : <InstallCard hideWhenInstalled />}

          <Card className="mt-6 p-6">
            <Text variant="heading">Your journey</Text>
            {isWideWeb ? (
              <View className="mt-6 flex-row">
                {JOURNEY.map((step, index) => {
                  const done = index < currentStage;
                  const current = index === currentStage;
                  const last = index === JOURNEY.length - 1;

                  return (
                    <Pressable
                      key={step.title}
                      disabled={!step.href}
                      accessibilityRole={step.href ? "button" : undefined}
                      accessibilityLabel={
                        step.href ? `Open ${step.title}` : undefined
                      }
                      onPress={() => {
                        if (step.href) router.push(step.href);
                      }}
                      className="flex-1 active:opacity-70"
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`h-[18px] w-[18px] items-center justify-center rounded-full ${
                            done
                              ? "bg-accent"
                              : current
                                ? "border-2 border-accent bg-canvas"
                                : "border border-[#C9C9CF] bg-canvas"
                          }`}
                        >
                          {done ? (
                            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                          ) : current ? (
                            <View className="h-1.5 w-1.5 rounded-full bg-accent" />
                          ) : null}
                        </View>
                        {!last ? (
                          <View
                            className={`ml-1 h-[2px] flex-1 ${
                              index < currentStage ? "bg-accent" : "bg-line"
                            }`}
                          />
                        ) : null}
                      </View>
                      <View className="pr-3">
                        <Text
                          className={`mt-3 text-[15px] leading-[21px] ${
                            index <= currentStage
                              ? "font-inter-semibold text-ink"
                              : "text-muted"
                          }`}
                          numberOfLines={2}
                        >
                          {step.title}
                        </Text>
                        <Text variant="small" tone="muted" className="mt-0.5">
                          {done ? "Done" : step.detail}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View className="mt-4">
                {JOURNEY.map((step, index) => {
                  const done = index < currentStage;
                  const current = index === currentStage;
                  const last = index === JOURNEY.length - 1;

                  return (
                    <Pressable
                      key={step.title}
                      disabled={!step.href}
                      accessibilityRole={step.href ? "button" : undefined}
                      accessibilityLabel={
                        step.href ? `Open ${step.title}` : undefined
                      }
                      onPress={() => {
                        if (step.href) router.push(step.href);
                      }}
                      className="flex-row active:opacity-60"
                    >
                      <View className="w-6 items-center">
                        <View
                          className={`h-4 w-4 items-center justify-center rounded-full ${
                            done
                              ? "bg-accent"
                              : current
                                ? "border-2 border-accent bg-canvas"
                                : "border border-[#C9C9CF] bg-canvas"
                          }`}
                        >
                          {done ? (
                            <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                          ) : current ? (
                            <View className="h-1.5 w-1.5 rounded-full bg-accent" />
                          ) : null}
                        </View>
                        {!last ? (
                          <View
                            className={`w-px flex-1 ${
                              done ? "bg-accent" : "bg-line"
                            }`}
                          />
                        ) : null}
                      </View>
                      <View className={`flex-1 ${last ? "" : "pb-5"}`}>
                        <Text
                          variant="body"
                          className={
                            index <= currentStage
                              ? "font-inter-semibold"
                              : "text-muted"
                          }
                        >
                          {step.title}
                        </Text>
                        <Text variant="small" tone="muted" className="mt-0.5">
                          {done ? "Done" : step.detail}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Card>

          <Card className="mt-6 p-6">
            <Text variant="heading">Where these numbers come from</Text>
            <View className="mt-2">
              <SourceRow
                title="CRS criteria and point grid"
                verified={CRS_RULES.lastVerified}
                url={CRS_RULES.sourceUrl}
              />
              <SourceRow
                title="Latest Express Entry draws"
                verified={LATEST_DRAW.lastVerified}
                url={LATEST_DRAW.sourceUrl}
              />
              <SourceRow
                title="High-wage occupation list"
                verified={CRS_RULES.lastVerified}
                url={CRS_RULES.highWageUrl}
              />
            </View>
          </Card>

          {isWideWeb ? null : <View className="mt-6">{waysCard}</View>}
        </View>

        {isWideWeb ? (
          <View style={{ width: 400, flexShrink: 0, gap: 24 }}>
            {scoreCard}
            {waysCard}
          </View>
        ) : null}
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          Keep everything current
        </Text>
        <View
          className={isWideWeb ? "mt-3 flex-row" : "mt-3"}
          style={{ gap: isWideWeb ? 24 : 16 }}
        >
          <Card className={isWideWeb ? "flex-1 p-5" : "p-5"}>
            <Text variant="heading">
              {documentsReady && nextDocument
                ? nextDocument.rule.title
                : "Documents & dates"}
            </Text>
            <Text variant="small" tone="muted" className="mt-2 flex-1">
              {documentDetail}
            </Text>
            <Button
              className="mt-4"
              variant="secondary"
              label="Open documents & dates"
              onPress={() => router.push("/documents")}
            />
          </Card>

          <Card className={isWideWeb ? "flex-1 p-5" : "p-5"}>
            <View className="flex-row items-start justify-between gap-3">
              <Text variant="heading" className="flex-1">
                {latestUpdate.title}
              </Text>
              {unreadUpdates > 0 ? (
                <View className="rounded-full bg-accent px-2.5 py-1">
                  <Text
                    variant="small"
                    tone="white"
                    className="text-[11px] leading-[14px] font-inter-semibold"
                  >
                    {unreadUpdates} new
                  </Text>
                </View>
              ) : null}
            </View>
            <Text variant="small" tone="muted" className="mt-1">
              {formatUpdateDate(latestUpdate.date)}
            </Text>
            <Text variant="small" tone="muted" className="mt-2 flex-1">
              {unreadUpdates > 0
                ? `${unreadUpdates === 1 ? "One change" : `${unreadUpdates} changes`} since your last visit.`
                : "New steps, re-checks and fixes to the guide."}
            </Text>
            <Button
              className="mt-4"
              variant="secondary"
              label="See what changed"
              onPress={() => router.push("/updates")}
            />
          </Card>

          <Card className={isWideWeb ? "flex-1 p-5" : "p-5"}>
            <Text variant="heading">
              {!reminderReady
                ? "Keep your answers current"
                : reminderDue
                  ? "Time to check in"
                  : dueDate
                    ? "You're set to check back"
                    : "Keep your answers current"}
            </Text>
            <Text variant="small" tone="muted" className="mt-2 flex-1">
              {!reminderReady
                ? "A short check-in keeps your CRS answers, documents and guide progress current."
                : reminderDue
                  ? `You planned to check back on ${dueLabel}. ${openSteps} ${
                      openSteps === 1 ? "step is" : "steps are"
                    } still open.`
                  : dueDate
                    ? `Your next check-in is ${dueLabel}. We'll highlight it here when you return.`
                    : "IRCC pages change and your answers change with them. Set a reminder to review the guide in a week."}
            </Text>
            {!reminderReady ? null : reminderDue ? (
              <>
                <Button
                  className="mt-4"
                  label="Open the guide"
                  onPress={() => router.push("/express-entry")}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Snooze the reminder for 7 days"
                  onPress={() => setInDays(7)}
                  className="mt-3 min-h-[36px] justify-center active:opacity-70"
                >
                  <Text
                    variant="small"
                    tone="accent"
                    className="font-inter-medium"
                  >
                    Snooze 7 days
                  </Text>
                </Pressable>
              </>
            ) : dueDate ? (
              <View className="mt-4 flex-row flex-wrap items-center gap-x-5 gap-y-2">
                {Platform.OS === "web" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add the check-in to your calendar"
                    onPress={() => downloadCheckInIcs(dueDate)}
                    className="min-h-[40px] justify-center active:opacity-70"
                  >
                    <Text
                      variant="small"
                      tone="accent"
                      className="font-inter-medium"
                    >
                      Add to calendar
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear the check-in reminder"
                  onPress={clearReminder}
                  className="min-h-[40px] justify-center active:opacity-70"
                >
                  <Text variant="small" tone="muted">
                    Clear reminder
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Button
                className="mt-4"
                label="Remind me in 7 days"
                onPress={() => setInDays(7)}
              />
            )}
          </Card>
        </View>
      </View>

      <Text variant="small" tone="muted" className="mt-10 px-4 text-center">
        MapleRoute is an independent guide. It is not legal or immigration advice
        and is not affiliated with IRCC or the Government of Canada.
      </Text>
    </Screen>
  );
}
