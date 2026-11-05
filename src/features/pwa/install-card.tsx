import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { colors } from "@/theme/theme";

import { usePwa } from "./pwa-provider";

export function InstallCard({
  hideWhenInstalled = false,
}: {
  hideWhenInstalled?: boolean;
}) {
  const {
    isWeb,
    canInstall,
    installed,
    iosInstall,
    offlineReady,
    promptInstall,
  } = usePwa();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isWeb) return null;
  if (installed && hideWhenInstalled) return null;

  async function handleInstall() {
    setBusy(true);
    setMessage(null);
    try {
      const outcome = await promptInstall();
      setMessage(
        outcome === "accepted"
          ? "Installed. Open MapleRoute from your home screen."
          : outcome === "dismissed"
            ? "Nothing changed. You can install any time from this section."
            : "Your browser didn't offer its own prompt. Use its Install or Add to Home Screen option.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (installed) {
    return (
      <Card className="mt-3 p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-success-surface">
            <Ionicons name="checkmark" size={20} color={colors.success} />
          </View>
          <View className="flex-1">
            <Text variant="heading">MapleRoute is installed</Text>
            <Text variant="small" tone="muted" className="mt-1">
              Open it from your home screen. The guide picks up at the step you
              left.
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card className="mt-3 p-5">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-danger-surface">
          <Ionicons name="phone-portrait-outline" size={20} color={colors.accent} />
        </View>
        <View className="flex-1">
          <Text variant="heading">Install MapleRoute</Text>
          <Text variant="small" tone="muted" className="mt-1">
            Add it to your home screen for one-tap access and offline reading.
          </Text>
        </View>
      </View>

      {iosInstall ? (
        <View className="mt-4 rounded-control bg-surface p-3.5">
          <Text variant="small">
            On iPhone or iPad, open this page in Safari, tap Share, then choose
            Add to Home Screen.
          </Text>
        </View>
      ) : canInstall ? (
        <Button
          className="mt-4"
          label="Add to home screen"
          loading={busy}
          loadingLabel="Opening install…"
          onPress={() => void handleInstall()}
        />
      ) : (
        <Text variant="small" tone="muted" className="mt-4">
          Open your browser menu and choose Install app or Add to Home Screen.
        </Text>
      )}

      {message ? (
        <Text variant="small" tone="muted" className="mt-3">
          {message}
        </Text>
      ) : null}

      <View className="mt-4 flex-row items-start gap-2.5">
        <Ionicons
          name={offlineReady ? "cloud-done-outline" : "cloud-offline-outline"}
          size={17}
          color={offlineReady ? colors.success : colors.muted}
        />
        <Text variant="small" tone="muted" className="flex-1">
          {offlineReady
            ? "Guide steps and the screenshots you open are saved for offline reading."
            : "Offline reading starts after your first online visit."}
        </Text>
      </View>
    </Card>
  );
}
