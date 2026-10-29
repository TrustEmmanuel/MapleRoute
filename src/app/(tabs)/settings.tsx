import Constants from "expo-constants";
import { router } from "expo-router";
import { useState } from "react";
import { Switch, View } from "react-native";

import { BrandLockup, MapleLeaf } from "@/components/brand";
import { Disclaimer } from "@/components/disclaimer";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DetailRow, Divider } from "@/components/ui/rows";
import { Text } from "@/components/ui/text";
import { useIsWideWeb } from "@/components/web-nav";
import { useAuth } from "@/features/auth/auth-provider";
import { useCrs } from "@/features/crs/crs-provider";
import { useGuide } from "@/features/guide/guide-provider";
import { getSupabaseHost } from "@/lib/supabase";
import { colors } from "@/theme/theme";

export default function SettingsScreen() {
  const {
    accountEmail,
    previewMode,
    isLocalAccount,
    configured,
    signOut,
    exitPreview,
  } = useAuth();
  const { latest } = useCrs();
  const { authorMode, setAuthorMode, isAdmin } = useGuide();
  const isWideWeb = useIsWideWeb();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const version = Constants.expoConfig?.version ?? "0.1.0";
  const hostedProject = getSupabaseHost();

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      if (previewMode) {
        exitPreview();
      } else {
        await signOut();
      }
      router.replace("/login");
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Could not sign out. Try again.",
      );
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between pt-1">
        {isWideWeb ? <View /> : <BrandLockup />}
        <View className="rounded-full border border-line px-2.5 py-1">
          <Text variant="label" tone="muted">
            Phase 1
          </Text>
        </View>
      </View>

      <View className="mt-10">
        <Text variant="label" tone="accent">
          About
        </Text>
        <Text variant="title" className="mt-3">
          Settings
        </Text>
        <Text variant="body" tone="muted" className="mt-3">
          Your account, app details, and the important boundaries behind
          MapleRoute.
        </Text>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          Account
        </Text>
        <Card className="mt-3 px-4">
          <DetailRow
            label="Signed in as"
            value={previewMode ? "Preview mode" : (accountEmail ?? "—")}
          />
          {isLocalAccount ? (
            <>
              <Divider />
              <DetailRow label="Account" value="On this device" />
            </>
          ) : null}
          <Divider />
          <DetailRow
            label="CRS score"
            value={latest ? `${latest.score} / 1,200` : "Not checked"}
          />
          <Divider />
          <DetailRow label="Supabase" value={hostedProject ?? "Not configured"} />
        </Card>
        {latest ? (
          <Button
            className="mt-3"
            variant="secondary"
            label="Update my CRS answers"
            onPress={() => router.push("/crs")}
          />
        ) : null}
        <Button
          className="mt-3"
          variant="secondary"
          label={previewMode ? "Exit preview" : "Sign out"}
          loading={signingOut}
          loadingLabel="Signing out…"
          onPress={() => void handleSignOut()}
        />
        {signOutError ? (
          <Text variant="small" className="mt-2 text-accent">
            {signOutError}
          </Text>
        ) : null}
      </View>

      {!configured ? (
        <View className="mt-8">
          <Text variant="label" tone="muted">
            Author tools
          </Text>
          <Card className="mt-3 px-4 py-4">
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[14px] font-inter-medium text-ink">
                  Guide author mode
                </Text>
                <Text variant="small" tone="muted" className="mt-1">
                  Preview draft steps and edit guide content on this device.
                </Text>
              </View>
              <Switch
                accessibilityLabel="Guide author mode"
                value={authorMode}
                onValueChange={setAuthorMode}
                trackColor={{ false: colors.line, true: colors.accent }}
                thumbColor={colors.canvas}
              />
            </View>
            {isAdmin ? (
              <Button
                className="mt-3"
                variant="secondary"
                label="Open guide editor"
                onPress={() => router.push("/admin/guide")}
              />
            ) : null}
          </Card>
        </View>
      ) : null}

      <View className="mt-8">
        <Text variant="label" tone="muted">
          App
        </Text>
        <Card className="mt-3 px-4">
          <DetailRow label="Version" value={`${version} · Phase 1`} />
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          Independent guide
        </Text>
        <Card className="mt-3 p-5">
          <View className="flex-row items-center gap-2.5">
            <MapleLeaf size={22} />
            <Text variant="heading">Not affiliated with IRCC</Text>
          </View>
          <Text variant="small" tone="muted" className="mt-3">
            MapleRoute is an independent guide. It is not legal or immigration
            advice and is not affiliated with IRCC or the Government of Canada.
          </Text>
          <View className="mt-4 rounded-control bg-surface p-3.5">
            <Text variant="small" tone="muted">
              Always confirm requirements, fees and deadlines on canada.ca
              before acting.
            </Text>
          </View>
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          Privacy & accounts
        </Text>
        <Card className="mt-3 p-5">
          <Text variant="small" tone="muted">
            MapleRoute never asks for your IRCC password, UCI or passport
            number. Your CRS answers and score are stored with your account so
            you can pick up where you left off. In-app account deletion will be
            added before the app is submitted to the app stores.
          </Text>
        </Card>
      </View>

      <Text variant="small" tone="muted" className="mt-10 text-center">
        © {new Date().getFullYear()} MapleRoute
      </Text>

      <Disclaimer className="mt-6" />
    </Screen>
  );
}
