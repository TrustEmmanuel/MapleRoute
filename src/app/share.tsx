import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, Pressable, View } from "react-native";

import { BrandLockup, MapleLeaf } from "@/components/brand";
import { Disclaimer } from "@/components/disclaimer";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { CRS_MAX } from "@/features/crs/rules";
import {
  parseSharePlan,
  shareMessage,
  shareText,
  shareUrl,
  whatsappUrl,
} from "@/features/share/share-link";
import { trackEvent } from "@/features/telemetry";
import { openExternal } from "@/lib/links";
import { colors } from "@/theme/theme";

export default function ShareScreen() {
  const params = useLocalSearchParams<{
    done?: string;
    total?: string;
    score?: string;
  }>();
  const plan = parseSharePlan(params);
  const [copied, setCopied] = useState(false);

  const title = plan
    ? `${shareText(plan)} · MapleRoute`
    : "Shared Express Entry plan · MapleRoute";

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "web" || typeof document === "undefined") return;
      document.title = title;
      return () => {
        document.title = "MapleRoute";
      };
    }, [title]),
  );

  const hasPlan = Boolean(plan);
  useFocusEffect(
    useCallback(() => {
      if (hasPlan) trackEvent("share_link_opened");
    }, [hasPlan]),
  );

  async function copyLink(url: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const remaining = plan ? plan.total - plan.done : 0;
  const percent = plan ? Math.round((plan.done / plan.total) * 100) : 0;

  return (
    <Screen background="surface">
      <View className="flex-row items-center justify-between pt-1">
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="MapleRoute home"
          onPress={() => router.push("/")}
          className="rounded-control"
        >
          <BrandLockup />
        </Pressable>
        <Text variant="label" tone="muted">
          Shared plan
        </Text>
      </View>

      <View
        className="mt-8"
        style={{ width: "100%", maxWidth: 560, marginHorizontal: "auto" }}
      >
        {plan ? (
          <>
            <Card className="overflow-hidden">
              <View className="bg-accent px-6 py-5">
                <View className="flex-row items-center justify-between">
                  <Text
                    variant="label"
                    tone="white"
                    accessibilityRole="header"
                    aria-level={1}
                    className="text-[11px] tracking-[1.6px]"
                  >
                    My Express Entry plan
                  </Text>
                  <MapleLeaf size={22} color="#FFFFFF" />
                </View>
                <Text
                  className="mt-2 text-white"
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 21,
                    lineHeight: 27,
                    letterSpacing: -0.4,
                  }}
                >
                  {plan.done === 0
                    ? "Just getting started"
                    : plan.done === plan.total
                      ? "Every step ticked"
                      : "Making progress"}
                </Text>
              </View>

              <View className="p-6">
                <View className="flex-row items-end" style={{ gap: 8 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 56,
                      lineHeight: 60,
                      letterSpacing: -2,
                    }}
                  >
                    {plan.done}
                  </Text>
                  <Text
                    variant="title"
                    tone="muted"
                    style={{ paddingBottom: 4 }}
                  >
                    of {plan.total}
                  </Text>
                </View>
                <Text variant="body" tone="muted">
                  steps finished
                </Text>

                <View
                  accessibilityRole="progressbar"
                  accessibilityValue={{
                    min: 0,
                    max: plan.total,
                    now: plan.done,
                    text: `${plan.done} of ${plan.total} steps finished`,
                  }}
                  aria-valuemin={0}
                  aria-valuemax={plan.total}
                  aria-valuenow={plan.done}
                  aria-valuetext={`${plan.done} of ${plan.total} steps finished`}
                  className="mt-5 h-2 overflow-hidden rounded-full bg-surface"
                >
                  <View
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${percent}%` }}
                  />
                </View>
                <Text variant="small" tone="muted" className="mt-2">
                  {remaining === 0
                    ? "The full guide is finished."
                    : `${remaining} ${remaining === 1 ? "step" : "steps"} to go.`}
                </Text>

                {plan.score !== null ? (
                  <View className="mt-6 flex-row items-center justify-between rounded-card bg-surface px-4 py-3">
                    <View className="flex-row items-center gap-2">
                      <Ionicons
                        name="speedometer-outline"
                        size={18}
                        color={colors.accent}
                      />
                      <Text variant="body" className="font-inter-semibold">
                        CRS score
                      </Text>
                    </View>
                    <View className="flex-row items-baseline gap-1.5">
                      <Text
                        style={{
                          fontFamily: "Inter_700Bold",
                          fontSize: 22,
                          lineHeight: 26,
                        }}
                      >
                        {plan.score.toLocaleString()}
                      </Text>
                      <Text variant="small" tone="muted">
                        / {CRS_MAX.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </Card>

            <View className="mt-4 flex-row items-start gap-2 px-1">
              <Ionicons
                name="lock-closed-outline"
                size={15}
                color={colors.muted}
                style={{ marginTop: 2 }}
              />
              <Text variant="small" tone="muted" className="flex-1">
                This link only contains the numbers on the card — no name, email
                or answers.
              </Text>
            </View>

            <View className="mt-6" style={{ gap: 12 }}>
              <Button
                label="Build my own plan"
                onPress={() => router.push("/express-entry")}
              />
              <Button
                variant="secondary"
                label="Share on WhatsApp"
                onPress={() => openExternal(whatsappUrl(shareMessage(plan)))}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  copied ? "Link copied" : "Copy the link to this card"
                }
                onPress={() => void copyLink(shareUrl(plan))}
                className="min-h-[44px] items-center justify-center active:opacity-70"
              >
                <Text
                  variant="small"
                  tone="accent"
                  className="font-inter-semibold"
                >
                  {copied ? "Link copied" : "Copy link"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Card className="p-6">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-danger-surface">
              <Ionicons name="link-outline" size={22} color={colors.accent} />
            </View>
            <Text variant="title" className="mt-4">
              This progress link is incomplete
            </Text>
            <Text variant="body" tone="muted" className="mt-2">
              Progress cards include a step count. Ask your friend to share
              theirs again, or start your own plan.
            </Text>
            <Button
              className="mt-6"
              label="Build my own plan"
              onPress={() => router.push("/express-entry")}
            />
          </Card>
        )}

        {Platform.OS === "web" ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="How the 2026 CRS score works"
            onPress={() => {
              if (typeof window !== "undefined") {
                window.location.assign("/crs-2026/");
              }
            }}
            className="mt-6 min-h-[44px] items-center justify-center active:opacity-70"
          >
            <Text variant="small" tone="accent" className="font-inter-medium">
              How the 2026 CRS score works
            </Text>
          </Pressable>
        ) : null}

        <Disclaimer className="mt-8" />
      </View>
    </Screen>
  );
}
