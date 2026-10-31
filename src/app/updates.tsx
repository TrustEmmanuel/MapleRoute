import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { Disclaimer } from "@/components/disclaimer";
import { LoadingScreen } from "@/components/loading-screen";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/features/auth/auth-provider";
import {
  GUIDE_UPDATES,
  formatUpdateDate,
  unseenUpdates,
  type GuideUpdateKind,
} from "@/features/updates/guide-updates";
import { useSeenUpdates } from "@/features/updates/use-seen-updates";
import { colors } from "@/theme/theme";

const KIND_LABELS: Record<GuideUpdateKind, string> = {
  added: "Added",
  improved: "Improved",
  rechecked: "Re-checked",
};

export default function UpdatesScreen() {
  const { signedIn, loading } = useAuth();
  const { seenId, ready, markSeen } = useSeenUpdates();
  const [newIds, setNewIds] = useState<string[] | null>(null);

  useEffect(() => {
    if (!ready || newIds) return;
    setNewIds(unseenUpdates(GUIDE_UPDATES, seenId).map((update) => update.id));
    markSeen();
  }, [ready, seenId, newIds, markSeen]);

  if (loading) return <LoadingScreen />;
  if (!signedIn) return <Redirect href="/login" />;

  const newCount = newIds?.length ?? 0;

  return (
    <Screen>
      <View className="flex-row items-center gap-3 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          onPress={() => router.push("/")}
          className="h-9 w-9 items-center justify-center rounded-full border border-line active:bg-surface"
        >
          <Ionicons name="arrow-back" size={17} color={colors.ink} />
        </Pressable>
        <Text variant="label" tone="muted">
          Guide updates
        </Text>
      </View>

      <View className="mt-6">
        <Text variant="title">What changed in MapleRoute</Text>
        <Text variant="body" tone="muted" className="mt-3">
          New steps, re-checks and fixes to the guide. This is not a list of IRCC
          announcements — each step shows the date we last checked it on
          canada.ca.
        </Text>
      </View>

      {newCount > 0 ? (
        <View className="mt-5 flex-row items-center gap-2 self-start rounded-full bg-success-surface px-3 py-1.5">
          <Ionicons name="sparkles-outline" size={14} color={colors.success} />
          <Text
            variant="small"
            className="font-inter-semibold"
            style={{ color: colors.success }}
          >
            {newCount} new since your last visit
          </Text>
        </View>
      ) : null}

      <View className="mt-6">
        {GUIDE_UPDATES.map((update) => {
          const isNew = Boolean(newIds?.includes(update.id));
          return (
            <Card key={update.id} className="mb-3 p-5">
              <View className="flex-row items-center justify-between gap-3">
                <Text variant="small" tone="muted">
                  {formatUpdateDate(update.date)}
                </Text>
                <View className="rounded-full bg-surface px-2.5 py-1">
                  <Text
                    variant="small"
                    tone="muted"
                    className="text-[12px] leading-[16px] font-inter-medium"
                  >
                    {KIND_LABELS[update.kind]}
                  </Text>
                </View>
              </View>
              <View className="mt-2 flex-row items-start gap-2">
                <Text variant="heading" className="flex-1">
                  {update.title}
                </Text>
                {isNew ? (
                  <View className="rounded-full bg-accent px-2 py-1">
                    <Text
                      variant="small"
                      tone="white"
                      className="text-[11px] leading-[14px] font-inter-semibold"
                    >
                      New
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text variant="small" tone="muted" className="mt-2">
                {update.detail}
              </Text>
            </Card>
          );
        })}
      </View>

      <Button
        className="mt-3"
        label="Continue the guide"
        onPress={() => router.push("/express-entry")}
      />
      <Disclaimer className="mt-6" />
    </Screen>
  );
}
