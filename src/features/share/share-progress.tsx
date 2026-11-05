import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";

import { InfoDialog } from "@/components/info-dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { trackEvent } from "@/features/telemetry";
import { openExternal } from "@/lib/links";
import { colors } from "@/theme/theme";

import {
  normalizePlan,
  shareMessage,
  shareUrl,
  whatsappUrl,
} from "./share-link";

export function ShareProgressButton({
  done,
  total,
  score,
}: {
  done: number;
  total: number;
  score: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (Platform.OS !== "web") return null;

  const plan = normalizePlan({ done, total, score });
  if (!plan) return null;

  const message = shareMessage(plan);
  const url = shareUrl(plan);

  async function handlePress() {
    trackEvent("share_clicked", { source: "home" });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "My Express Entry plan",
          text: message,
        });
        return;
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return;
      }
    }
    setCopied(false);
    setOpen(true);
  }

  async function copyLink() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(url);
      trackEvent("share_copied", { source: "home" });
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share my progress"
        onPress={() => void handlePress()}
        className="mt-3 min-h-[44px] flex-row items-center justify-center gap-2 rounded-control border border-line bg-canvas px-4 active:bg-surface"
      >
        <Ionicons name="share-social-outline" size={17} color={colors.accent} />
        <Text variant="button" tone="accent">
          Share my progress
        </Text>
      </Pressable>

      <InfoDialog
        visible={open}
        title="Share your progress"
        onClose={() => setOpen(false)}
      >
        <Text variant="body" tone="muted">
          Send this card on WhatsApp. The link opens without an account.
        </Text>
        <View className="mt-4 rounded-card border border-line bg-surface p-4">
          <Text variant="small" selectable>
            {message}
          </Text>
        </View>
        <Text variant="small" tone="muted" className="mt-3">
          Only the step count and CRS score are in the link — no name, email or
          answers.
        </Text>
        <Button
          className="mt-5"
          label="Share on WhatsApp"
          onPress={() => {
            trackEvent("share_whatsapp", { source: "home" });
            setOpen(false);
            openExternal(whatsappUrl(message));
          }}
        />
        <Button
          className="mt-3"
          variant="secondary"
          label={copied ? "Link copied" : "Copy link"}
          onPress={() => void copyLink()}
        />
      </InfoDialog>
    </>
  );
}
