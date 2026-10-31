import { router } from "expo-router";
import { useMemo } from "react";
import { Platform, Pressable, View } from "react-native";

import { BrandLockup } from "@/components/brand";
import { BAND_LABELS, CrsBandChip, CrsScoreBadge, CrsScoreBar } from "@/components/crs-score-badge";
import { Disclaimer } from "@/components/disclaimer";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useIsWideWeb } from "@/components/web-nav";
import { useAuth } from "@/features/auth/auth-provider";
import { useCrs } from "@/features/crs/crs-provider";
import { useGuide } from "@/features/guide/guide-provider";
import { checkedCount, visibleSteps } from "@/features/guide/types";
import { downloadCheckInIcs, formatCheckInDate } from "@/features/retention/check-in";
import { useCheckInReminder } from "@/features/retention/use-check-in-reminder";
import {
  GUIDE_UPDATES,
  formatUpdateDate,
  unseenUpdates,
} from "@/features/updates/guide-updates";
import { useSeenUpdates } from "@/features/updates/use-seen-updates";

const JOURNEY: {
  title: string;
  detail: string;
  href?: "/crs" | "/express-entry";
}[] = [
  { title: "CRS check", detail: "See where you stand", href: "/crs" },
  {
    title: "Express Entry profile",
    detail: "Create and submit your profile",
    href: "/express-entry",
  },
  { title: "Invitation to apply", detail: "Get picked from the pool" },
  { title: "PR application", detail: "Documents, biometrics, medicals" },
  { title: "Flight ready", detail: "COPR in hand, landing planned" },
];

export default function HomeScreen() {
  const { accountEmail, previewMode, isLocalAccount } = useAuth();
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
  const isWideWeb = useIsWideWeb();

  const name = accountEmail?.split("@")[0]?.replace(/[._-]+/g, " ");
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
  const currentStep = started ? 1 : 0;

  const unreadUpdates = updatesReady
    ? unseenUpdates(GUIDE_UPDATES, seenId).length
    : 0;
  const latestUpdate = GUIDE_UPDATES[0];
  const dueLabel = dueDate ? formatCheckInDate(dueDate) : "";

  const guideDetail = !hydrated
    ? "Loading your progress…"
    : doneSteps === 0
      ? `Start with the first step. ${totalSteps} steps, one page at a time.`
      : doneSteps === totalSteps
        ? "Every step is ticked. Re-read anything that may have changed on canada.ca."
        : resumeStep
          ? `${doneSteps} of ${totalSteps} steps done. Pick up at “${resumeStep.step.title}”.`
          : nextOpen
            ? `${doneSteps} of ${totalSteps} steps done. Next: “${nextOpen.step.title}”.`
            : `${doneSteps} of ${totalSteps} steps done.`;

  return (
    <Screen>
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

      {previewMode ? (
        <View className="mt-4 rounded-control bg-warning-surface px-3.5 py-2.5">
          <Text variant="small" tone="muted">
            Preview mode — your score stays on this device. Connect Supabase and
            sign in to keep it with your account.
          </Text>
        </View>
      ) : isLocalAccount ? (
        <View className="mt-4 rounded-control bg-surface px-3.5 py-2.5">
          <Text variant="small" tone="muted">
            Signed in as {accountEmail ?? "a device account"}. This account lives
            on this device until Supabase is connected.
          </Text>
        </View>
      ) : null}

      <View className="mt-10">
        <Text variant="label" tone="accent">
          {started ? "Your route" : "Start here"}
        </Text>
        <Text variant="title" className="mt-2.5">
          {started
            ? name
              ? `Welcome back, ${name}.`
              : "Welcome back."
            : "First, let's see where you stand."}
        </Text>
        <Text variant="body" tone="muted" className="mt-3">
          {doneSteps > 0
            ? doneSteps === totalSteps
              ? "Every step is ticked. Come back when something changes, or re-read the parts you want to double-check."
              : `You're ${doneSteps} ${doneSteps === 1 ? "step" : "steps"} into the guide. Pick up where you left off, and keep your answers current as things change.`
            : latest
              ? "Your CRS score is the starting point. Next comes your Express Entry guide — 53 official steps, one page at a time."
              : "A CRS check takes about five minutes. It sets the path for every step after it, from your Express Entry profile to your flight to Canada."}
        </Text>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          {started ? "Next action" : "First step"}
        </Text>
        {started ? (
          <Card className="mt-3 p-5">
            <Text variant="heading">
              {totalSteps > 0 && doneSteps === totalSteps
                ? "Re-check your Express Entry guide"
                : doneSteps === 0
                  ? "Start your Express Entry guide"
                  : "Continue your Express Entry guide"}
            </Text>
            <Text variant="small" tone="muted" className="mt-2">
              {guideDetail}
            </Text>
            <Button
              className="mt-4"
              label={doneSteps === 0 ? "Start the guide" : "Continue the guide"}
              onPress={() => router.push("/express-entry")}
            />
            <Button
              className="mt-3"
              variant="secondary"
              label={latest ? "Review my CRS answers" : "Get my CRS score"}
              onPress={() => router.push("/crs")}
            />
          </Card>
        ) : (
          <Card className="mt-3 p-5">
            <Text variant="heading">Get your CRS score</Text>
            <Text variant="small" tone="muted" className="mt-2">
              Answer the questions about your age, education, language and work.
              You'll get your score out of 1,200 and see how it compares with the
              latest draw.
            </Text>
            <Button
              className="mt-4"
              label="Get my CRS score"
              onPress={() => router.push("/crs")}
            />
          </Card>
        )}
      </View>

      {latest ? (
        <View className="mt-8">
          <Text variant="label" tone="muted">
            Your score
          </Text>
          <Card className="mt-3 p-5">
            <View className="flex-row items-end justify-between">
              <View>
                <Text className="font-inter-bold text-[40px] leading-[44px] tracking-[-1.4px] text-ink">
                  {latest.score.toLocaleString()}
                </Text>
                <Text variant="small" tone="muted">
                  out of 1,200
                </Text>
              </View>
              <CrsBandChip band={latest.band} />
            </View>
            <View className="mt-4">
              <CrsScoreBar score={latest.score} band={latest.band} />
            </View>
            <Text variant="small" tone="muted" className="mt-3">
              {BAND_LABELS[latest.band]}. Latest CEC draw:{" "}
              {latest.result.benchmark.score} on{" "}
              {new Date(
                `${latest.result.benchmark.drawDate}T12:00:00`,
              ).toLocaleDateString("en-CA", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              .
            </Text>
          </Card>
        </View>
      ) : null}

      <View className="mt-8">
        <Text variant="label" tone="muted">
          Your journey
        </Text>
        <Card className="mt-3 p-5">
          {JOURNEY.map((step, index) => {
            const done = index < currentStep;
            const current = index === currentStep;
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
                    className={`h-4 w-4 rounded-full ${
                      done
                        ? "bg-accent"
                        : current
                          ? "border-2 border-accent bg-canvas"
                          : "border border-line bg-canvas"
                    }`}
                  />
                  {!last ? (
                    <View
                      className={`w-px flex-1 ${done ? "bg-accent" : "bg-line"}`}
                    />
                  ) : null}
                </View>
                <View className={`flex-1 ${last ? "" : "pb-6"}`}>
                  <Text
                    variant="body"
                    className={
                      current
                        ? "font-inter-semibold"
                        : done
                          ? "text-ink"
                          : "text-muted"
                    }
                  >
                    {step.title}
                  </Text>
                  <Text variant="small" tone="muted" className="mt-0.5">
                    {step.detail}
                  </Text>
                </View>
                {current ? (
                  <Text variant="label" tone="accent">
                    Now
                  </Text>
                ) : done ? (
                  <Text variant="label" tone="muted">
                    Done
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          Guide updates
        </Text>
        <Card className="mt-3 p-5">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text variant="heading">{latestUpdate.title}</Text>
              <Text variant="small" tone="muted" className="mt-1">
                {formatUpdateDate(latestUpdate.date)}
              </Text>
            </View>
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
          <Text variant="small" tone="muted" className="mt-2">
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
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          Check-in
        </Text>
        <Card className="mt-3 p-5">
          <Text variant="heading">
            {!reminderReady
              ? "Keep your answers current"
              : reminderDue
                ? "Time to check in"
                : dueDate
                  ? "You're set to check back"
                  : "Keep your answers current"}
          </Text>
          <Text variant="small" tone="muted" className="mt-2">
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
              <View className="mt-3 flex-row items-center justify-between gap-3">
                <Text variant="small" tone="muted">
                  Done for now?
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Snooze the reminder for 7 days"
                  onPress={() => setInDays(7)}
                  className="min-h-[36px] justify-center active:opacity-70"
                >
                  <Text
                    variant="small"
                    tone="accent"
                    className="font-inter-medium"
                  >
                    Snooze 7 days
                  </Text>
                </Pressable>
              </View>
            </>
          ) : dueDate ? (
            <View className="mt-3 flex-row flex-wrap items-center gap-x-5 gap-y-2">
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

      <Disclaimer className="mt-8" />
    </Screen>
  );
}
