import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
  type ScrollViewInstance,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { authErrorMessage, useAuth } from "@/features/auth/auth-provider";
import { FlightPanel } from "@/features/landing/flight-panel";
import { colors } from "@/theme/theme";

type Mode = "signIn" | "signUp";

const DISCLAIMER =
  "MapleRoute is an independent guide. It is not legal or immigration advice and is not affiliated with IRCC or the Government of Canada. We never ask for your IRCC password, UCI or passport number.";

export default function LoginScreen() {
  const {
    signedIn,
    loading,
    configured,
    needsName,
    accountFirstName,
    accountLastName,
    signIn,
    signUp,
    setAccountName,
    signInWithGoogle,
    signOut,
    enterPreview,
  } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [pendingName, setPendingName] = useState(false);
  const { width } = useWindowDimensions();
  const wide = Platform.OS === "web" && width >= 1000;
  const askingName = pendingName || needsName;
  const scrollRef = useRef<ScrollViewInstance | null>(null);

  useEffect(() => {
    if (askingName) scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [askingName]);

  useEffect(() => {
    if (!askingName) return;
    setFirstName((current) => current || (accountFirstName ?? ""));
    setLastName((current) => current || (accountLastName ?? ""));
  }, [askingName, accountFirstName, accountLastName]);

  if (!loading && signedIn && !askingName) {
    return <Redirect href="/" />;
  }

  function clearMessages() {
    setError(null);
    setNotice(null);
  }

  async function handleSubmit() {
    clearMessages();

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (mode === "signUp" && !firstName.trim()) {
      setError("Enter your first name.");
      return;
    }
    if (mode === "signUp" && !lastName.trim()) {
      setError("Enter your last name.");
      return;
    }
    if (mode === "signUp" && password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (password.length === 0) {
      setError("Enter your password.");
      return;
    }

    setSubmitting(true);
    setPendingName(true);
    try {
      if (mode === "signIn") {
        const result = await signIn(email, password, { remember });
        if (result.needsName) return;
      } else {
        const result = await signUp(email, password, {
          remember,
          firstName,
          lastName,
        });
        if (result.needsConfirmation) {
          setPendingName(false);
          setNotice("Check your inbox to confirm your email, then sign in.");
          setMode("signIn");
          return;
        }
        if (result.needsName) return;
      }
      setPendingName(false);
      router.replace("/crs");
    } catch (caught) {
      setPendingName(false);
      setError(authErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNameContinue() {
    clearMessages();
    if (!firstName.trim()) {
      setError("Enter your first name.");
      return;
    }
    if (!lastName.trim()) {
      setError("Enter your last name.");
      return;
    }

    setSavingName(true);
    try {
      await setAccountName(firstName, lastName);
      setPendingName(false);
      router.replace("/crs");
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setSavingName(false);
    }
  }

  async function handleUseDifferentAccount() {
    clearMessages();
    try {
      await signOut();
      setPendingName(false);
      setFirstName("");
      setLastName("");
      setPassword("");
    } catch (caught) {
      setError(authErrorMessage(caught));
    }
  }

  async function handleGoogle() {
    clearMessages();
    if (!configured) {
      setNotice("Google sign-in needs the Supabase keys. Email and password work for now.");
      return;
    }
    try {
      await signInWithGoogle();
    } catch (caught) {
      setError(authErrorMessage(caught));
    }
  }

  function handleApple() {
    clearMessages();
    setNotice("Apple sign-in isn't available yet. Use Google or email for now.");
  }

  function handleForgot() {
    clearMessages();
    setNotice(
      configured
        ? "Password reset isn't in the app yet. It arrives with connected accounts."
        : "This account lives on this device and stores no password, so there is nothing to reset. Sign in with any password.",
    );
  }

  const creating = mode === "signUp";

  const left = (
    <View
      className={`flex-1 bg-canvas ${wide ? "px-14 py-10" : "px-6 pb-10 pt-8"}`}
    >
      <View className={`mx-auto w-full flex-1 ${wide ? "max-w-[520px]" : "max-w-[480px]"}`}>
        <BrandLockup />

        <View className={wide ? "mt-14" : "mt-9"}>
          <Text
            className={`font-inter-bold text-ink ${
              wide
                ? "text-[44px] leading-[50px] tracking-[-1.5px]"
                : "text-[32px] leading-[38px] tracking-[-1px]"
            }`}
          >
            {askingName
              ? "What should we call you?\nAdd your name to this plan."
              : creating
                ? "Create your account.\nStart with the next step."
                : "Welcome back.\nPick up where you left off."}
          </Text>
          <Text variant="body" tone="muted" className="mt-4 max-w-[400px]">
            {askingName
              ? "Your first name is what your plan greets you with. We never share it with IRCC."
              : creating
                ? "One account keeps your CRS score and every step you finish together."
                : "Sign in to see your next step toward Canadian permanent residence."}
          </Text>
        </View>

        {askingName ? (
          <View className="mt-8 gap-4">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField
                  plainLabel
                  label="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Emmanuel"
                  autoCapitalize="words"
                  autoComplete="given-name"
                  maxLength={40}
                />
              </View>
              <View className="flex-1">
                <TextField
                  plainLabel
                  label="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Udeka"
                  autoCapitalize="words"
                  autoComplete="family-name"
                  maxLength={40}
                />
              </View>
            </View>
            {error ? (
              <View className="rounded-control bg-danger-surface p-3.5">
                <Text variant="small" tone="accent">
                  {error}
                </Text>
              </View>
            ) : null}
            <Button
              label="Continue"
              loading={savingName}
              loadingLabel="Saving…"
              onPress={() => void handleNameContinue()}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Use a different account"
              onPress={() => void handleUseDifferentAccount()}
              className="min-h-[44px] items-center justify-center"
            >
              <Text variant="small" tone="muted">
                Use a different account
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View className="mt-8 gap-4">
              {creating ? (
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <TextField
                      plainLabel
                      label="First name"
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Emmanuel"
                      autoCapitalize="words"
                      autoComplete="given-name"
                      maxLength={40}
                    />
                  </View>
                  <View className="flex-1">
                    <TextField
                      plainLabel
                      label="Last name"
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Udeka"
                      autoCapitalize="words"
                      autoComplete="family-name"
                      maxLength={40}
                    />
                  </View>
                </View>
              ) : null}
              <TextField
                plainLabel
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                inputMode="email"
              />
              <TextField
                plainLabel
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder={creating ? "At least 8 characters" : "Your password"}
                secure
                autoCapitalize="none"
                autoComplete={creating ? "new-password" : "current-password"}
              />
            </View>

            <View className="mt-4 flex-row items-center justify-between">
              <Pressable
                accessibilityRole="checkbox"
                aria-checked={remember}
                accessibilityState={{ checked: remember }}
                accessibilityLabel="Keep me signed in"
                onPress={() => setRemember((value) => !value)}
                className="flex-row items-center gap-2.5"
              >
                <View
                  className={`h-[18px] w-[18px] items-center justify-center rounded-[5px] border ${
                    remember ? "border-accent bg-accent" : "border-control-line bg-canvas"
                  }`}
                >
                  {remember ? (
                    <Ionicons name="checkmark" size={13} color={colors.canvas} />
                  ) : null}
                </View>
                <Text variant="small" tone="muted">
                  Keep me signed in
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
                onPress={handleForgot}
              >
                <Text variant="small" className="font-inter-semibold text-accent">
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            {error ? (
              <View className="mt-4 rounded-control bg-danger-surface p-3.5">
                <Text variant="small" tone="accent">
                  {error}
                </Text>
              </View>
            ) : null}
            {notice ? (
              <View className="mt-4 rounded-control bg-surface p-3.5">
                <Text variant="small" tone="muted">
                  {notice}
                </Text>
              </View>
            ) : null}

            <Button
              className="mt-6"
              label={creating ? "Create account" : "Sign in"}
              loading={submitting}
              loadingLabel={creating ? "Creating account…" : "Signing in…"}
              onPress={() => void handleSubmit()}
            />

            <View className="my-6 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-line" />
              <Text variant="small" tone="muted">
                or continue with
              </Text>
              <View className="h-px flex-1 bg-line" />
            </View>

            <View className="flex-row gap-3">
              <Button
                className="flex-1"
                variant="secondary"
                label="Google"
                icon={<Ionicons name="logo-google" size={18} color={colors.ink} />}
                onPress={() => void handleGoogle()}
              />
              <Button
                className="flex-1"
                variant="secondary"
                label="Apple"
                icon={<Ionicons name="logo-apple" size={18} color={colors.ink} />}
                onPress={handleApple}
              />
            </View>

            <View className="mt-6 flex-row flex-wrap items-center justify-center gap-1">
              <Text variant="small" tone="muted">
                {creating ? "Already have an account?" : "New to MapleRoute?"}
              </Text>
              <Text
                variant="small"
                className="font-inter-semibold text-accent"
                accessibilityRole="button"
                onPress={() => {
                  clearMessages();
                  setMode(creating ? "signIn" : "signUp");
                }}
              >
                {creating ? "Sign in" : "Create an account"}
              </Text>
            </View>
          </>
        )}

        <View className="mt-6 flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Text variant="small" tone="muted">
            By continuing, you agree to the
          </Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Terms of use"
            onPress={() => router.push("/terms")}
            className="min-h-[36px] justify-center active:opacity-70"
          >
            <Text variant="small" tone="accent" className="font-inter-medium">
              Terms of use
            </Text>
          </Pressable>
          <Text variant="small" tone="muted">
            and
          </Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Privacy policy"
            onPress={() => router.push("/privacy")}
            className="min-h-[36px] justify-center active:opacity-70"
          >
            <Text variant="small" tone="accent" className="font-inter-medium">
              Privacy policy
            </Text>
          </Pressable>
        </View>

        {!configured && !askingName ? (
          <View className="mt-7 rounded-control bg-surface px-4 py-3">
            <Text variant="small" tone="muted">
              Accounts are saved on this device for now. Any email and password
              works; we never store the password.
            </Text>
            <Text
              variant="small"
              className="mt-1.5 font-inter-semibold text-ink"
              accessibilityRole="button"
              onPress={enterPreview}
            >
              Preview the CRS check without an account
            </Text>
          </View>
        ) : null}

        <View className={wide ? "mt-auto pt-10" : "mt-8"}>
          <Text variant="small" tone="muted" className="text-[12px] leading-[18px]">
            {DISCLAIMER}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      {wide ? (
        <View className="flex-1 flex-row">
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {left}
          </ScrollView>
          <View className="w-1/2">
            <FlightPanel />
          </View>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {left}
          <FlightPanel compact />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
