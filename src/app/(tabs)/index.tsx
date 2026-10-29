import { router } from "expo-router";
import { Pressable, View } from "react-native";

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
  const isWideWeb = useIsWideWeb();

  const name = accountEmail?.split("@")[0]?.replace(/[._-]+/g, " ");
  const currentStep = latest ? 1 : 0;

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
          {latest ? "Your route" : "Start here"}
        </Text>
        <Text variant="title" className="mt-2.5">
          {latest
            ? name
              ? `Welcome back, ${name}.`
              : "Welcome back."
            : "First, let's see where you stand."}
        </Text>
        <Text variant="body" tone="muted" className="mt-3">
          {latest
            ? "Your CRS score is the starting point. Next comes your Express Entry profile — we'll walk through it one page at a time."
            : "A CRS check takes about five minutes. It sets the path for every step after it, from your Express Entry profile to your flight to Canada."}
        </Text>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          {latest ? "Next action" : "First step"}
        </Text>
        <Card className="mt-3 p-5">
          <Text variant="heading">
            {latest ? "Build your Express Entry profile" : "Get your CRS score"}
          </Text>
          <Text variant="small" tone="muted" className="mt-2">
            {latest
              ? "The guided walkthrough opens in the next phase. Until then, keep your CRS answers accurate — your score changes as your language, work and education details change."
              : "Answer the questions about your age, education, language and work. You'll get your score out of 1,200 and see how it compares with the latest draw."}
          </Text>
          {latest ? (
            <>
              <Button
                className="mt-4"
                variant="secondary"
                label="Review my CRS answers"
                onPress={() => router.push("/crs")}
              />
              <Button
                className="mt-3"
                label="Create your Express Entry profile"
                onPress={() => router.push("/express-entry")}
              />
            </>
          ) : (
            <Button
              className="mt-4"
              label="Get my CRS score"
              onPress={() => router.push("/crs")}
            />
          )}
        </Card>
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

      <Disclaimer className="mt-8" />
    </Screen>
  );
}
