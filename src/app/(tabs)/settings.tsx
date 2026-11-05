import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, Switch, View } from "react-native";

import { BrandLockup, MapleLeaf } from "@/components/brand";
import { Disclaimer } from "@/components/disclaimer";
import { InfoDialog } from "@/components/info-dialog";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DetailRow, Divider } from "@/components/ui/rows";
import { Text } from "@/components/ui/text";
import { useIsWideWeb } from "@/components/web-nav";
import { useAuth } from "@/features/auth/auth-provider";
import { useCrs } from "@/features/crs/crs-provider";
import { CRS_MAX } from "@/features/crs/rules";
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
    deleteAccount,
    exitPreview,
  } = useAuth();
  const { latest } = useCrs();
  const { authorMode, setAuthorMode, isAdmin } = useGuide();
  const isWideWeb = useIsWideWeb();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      setConfirmDelete(false);
      router.replace("/login");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Could not delete your data. Try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function closeDeleteDialog() {
    if (deleting) return;
    setConfirmDelete(false);
    setDeleteError(null);
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
            value={latest ? `${latest.score} / ${CRS_MAX.toLocaleString()}` : "Not checked"}
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

      {!previewMode ? (
        <View className="mt-8">
          <Text variant="label" tone="muted">
            Your data
          </Text>
          <Card className="mt-3 p-5">
            <Text variant="small" tone="muted">
              Your CRS answers, guide progress and document dates are stored for
              this account. Deleting removes them from this device and signs you
              out. This cannot be undone.
            </Text>
            <Button
              className="mt-4"
              variant="danger"
              label="Delete my account and data"
              onPress={() => {
                setDeleteError(null);
                setConfirmDelete(true);
              }}
            />
          </Card>
        </View>
      ) : null}

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
                trackColor={{ false: colors.controlLine, true: colors.accent }}
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
          Legal & accessibility
        </Text>
        <Card className="mt-3 px-4">
          <SettingLink href="/privacy" label="Privacy policy" />
          <Divider />
          <SettingLink href="/terms" label="Terms of use" />
          <Divider />
          <SettingLink href="/accessibility" label="Accessibility statement" />
        </Card>
        <Text variant="small" tone="muted" className="mt-3">
          MapleRoute never asks for your IRCC password, UCI or passport number.
          This build keeps your account and app data on this device.
        </Text>
      </View>

      <Text variant="small" tone="muted" className="mt-10 text-center">
        © {new Date().getFullYear()} MapleRoute
      </Text>

      <InfoDialog
        visible={confirmDelete}
        title="Delete my account?"
        onClose={closeDeleteDialog}
      >
        <Text variant="body">
          This removes your email and everything MapleRoute saved for this
          account on this device: CRS answers and score, guide progress,
          document dates, band score and reminder. It signs you out and cannot
          be undone.
        </Text>
        {!isLocalAccount ? (
          <Text variant="body" className="mt-3">
            Your hosted account and saved CRS checks are deleted too.
          </Text>
        ) : null}
        {deleteError ? (
          <Text variant="small" className="mt-3 text-accent">
            {deleteError}
          </Text>
        ) : null}
        <View className="mt-5 gap-3">
          <Button
            variant="danger"
            label="Delete everything"
            loading={deleting}
            loadingLabel="Deleting…"
            onPress={() => void handleDeleteAccount()}
          />
          <Button
            variant="secondary"
            label="Keep my account"
            disabled={deleting}
            onPress={closeDeleteDialog}
          />
        </View>
      </InfoDialog>

      <Disclaimer className="mt-6" />
    </Screen>
  );
}

function SettingLink({ href, label }: { href: Href; label: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => router.push(href)}
      className="min-h-[48px] flex-row items-center justify-between gap-3 py-3 active:opacity-70"
    >
      <Text variant="body">{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );
}
