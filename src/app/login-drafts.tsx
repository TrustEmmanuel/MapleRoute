import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Platform, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandLockup, MapleLeaf } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { cardShadow } from "@/theme/shadow";
import { colors } from "@/theme/theme";

type Concept = "ledger" | "atlas" | "passage";
type Mode = "signIn" | "signUp";

const CONCEPTS: { id: Concept; label: string }[] = [
  { id: "ledger", label: "Ledger" },
  { id: "atlas", label: "Atlas" },
  { id: "passage", label: "Passage" },
];

const DISCLAIMER =
  "MapleRoute is an independent guide. It is not legal or immigration advice and is not affiliated with IRCC or the Government of Canada.";

export default function LoginDraftsScreen() {
  const [concept, setConcept] = useState<Concept>("ledger");
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { width } = useWindowDimensions();
  const wide = width >= 960;

  const fields = { mode, setMode, email, setEmail, password, setPassword };

  return (
    <View className="flex-1 bg-canvas">
      {concept === "ledger" ? <Ledger wide={wide} {...fields} /> : null}
      {concept === "atlas" ? <Atlas wide={wide} {...fields} /> : null}
      {concept === "passage" ? <Passage wide={wide} {...fields} /> : null}
      <ConceptSwitch concept={concept} onChange={setConcept} />
    </View>
  );
}

type Fields = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
};

function EmailPassword({
  email,
  setEmail,
  password,
  setPassword,
  mode,
}: Fields) {
  return (
    <View className="gap-4">
      <TextField
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
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder={mode === "signUp" ? "At least 8 characters" : "Your password"}
        secure
        autoCapitalize="none"
        autoComplete={mode === "signUp" ? "new-password" : "current-password"}
      />
    </View>
  );
}

function SocialRow({ sideBySide = false }: { sideBySide?: boolean }) {
  return (
    <View className={sideBySide ? "flex-row gap-3" : "gap-3"}>
      <Button
        variant="secondary"
        className={sideBySide ? "flex-1" : ""}
        label="Google"
        icon={<Ionicons name="logo-google" size={18} color={colors.ink} />}
      />
      <Button
        variant="secondary"
        className={sideBySide ? "flex-1" : ""}
        label="Apple"
        icon={<Ionicons name="logo-apple" size={18} color={colors.ink} />}
      />
    </View>
  );
}

function ModeLink({ mode, setMode }: Pick<Fields, "mode" | "setMode">) {
  const creating = mode === "signUp";
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-1">
      <Text variant="small" tone="muted">
        {creating ? "Already have an account?" : "New to MapleRoute?"}
      </Text>
      <Text
        variant="small"
        className="font-inter-semibold text-ink"
        accessibilityRole="button"
        onPress={() => setMode(creating ? "signIn" : "signUp")}
      >
        {creating ? "Sign in" : "Create an account"}
      </Text>
    </View>
  );
}

function Ledger({ wide, ...fields }: Fields & { wide: boolean }) {
  const creating = fields.mode === "signUp";

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mx-auto w-full max-w-[1120px] flex-1 px-6">
          <View className="flex-row items-center justify-between pt-2">
            <BrandLockup />
            <Text variant="small" tone="muted">
              Express Entry guide
            </Text>
          </View>

          <View
            className="flex-1 justify-center py-16"
            style={{ paddingBottom: wide ? 96 : 120 }}
          >
            <View className="mx-auto w-full max-w-[400px]">
              <Text variant="display">
                {creating ? "Create your account" : "Sign in"}
              </Text>
              <Text variant="body" tone="muted" className="mt-3">
                Your CRS score stays on this account. The walkthrough begins
                on the next screen.
              </Text>

              <View className="mt-8">
                <EmailPassword {...fields} />
              </View>

              <View className="mt-3 items-end">
                <Text variant="small" tone="muted">
                  Forgot password?
                </Text>
              </View>

              <Button
                className="mt-5"
                label={creating ? "Create account" : "Sign in"}
              />

              <View className="my-6 flex-row items-center gap-3">
                <View className="h-px flex-1 bg-line" />
                <Text variant="small" tone="muted">
                  or
                </Text>
                <View className="h-px flex-1 bg-line" />
              </View>

              <SocialRow />
              <View className="mt-6">
                <ModeLink mode={fields.mode} setMode={fields.setMode} />
              </View>
              <Text variant="small" tone="muted" className="mt-10">
                {DISCLAIMER}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Atlas({ wide, ...fields }: Fields & { wide: boolean }) {
  const creating = fields.mode === "signUp";

  const story = (
    <View className={wide ? "flex-1 justify-between px-14 py-12" : "px-6 pb-8 pt-4"}>
      <View>
        <BrandLockup />
        <Text variant="display" className={wide ? "mt-16 max-w-[460px]" : "mt-8"}>
          The next action is always obvious.
        </Text>
        <Text
          variant="body"
          tone="muted"
          className={wide ? "mt-4 max-w-[420px]" : "mt-3"}
        >
          Sign in, see your CRS score, then open the exact IRCC page for the
          step you are on.
        </Text>
        <View className="mt-8 gap-5">
          <AtlasStep
            index="01"
            title="CRS score"
            body="Colour-coded against the latest Express Entry draw."
          />
          <AtlasStep
            index="02"
            title="One page at a time"
            body="The official URL, the field to fill, and what to expect."
          />
          <AtlasStep
            index="03"
            title="Nothing sensitive"
            body="No IRCC password, UCI, or passport number."
          />
        </View>
      </View>
      {wide ? (
        <Text variant="small" tone="muted" className="mt-10 max-w-[420px]">
          {DISCLAIMER}
        </Text>
      ) : null}
    </View>
  );

  const form = (
    <View className={wide ? "w-full max-w-[380px]" : "w-full"}>
      <Text variant="label" tone="muted">
        {creating ? "Create account" : "Welcome back"}
      </Text>
      <Text variant="title" className="mt-2">
        {creating ? "Start with your score." : "Sign in to MapleRoute."}
      </Text>
      <View className="mt-8">
        <EmailPassword {...fields} />
      </View>
      <Button
        className="mt-5"
        label={creating ? "Create account" : "Continue"}
      />
      <Text variant="small" tone="muted" className="mt-4 text-center">
        or continue with
      </Text>
      <View className="mt-3">
        <SocialRow sideBySide />
      </View>
      <View className="mt-6">
        <ModeLink mode={fields.mode} setMode={fields.setMode} />
      </View>
    </View>
  );

  if (!wide) {
    return (
      <SafeAreaView className="flex-1 bg-canvas">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="bg-surface">{story}</View>
          <View className="px-6 pt-8">{form}</View>
          <Text variant="small" tone="muted" className="mt-8 px-6">
            {DISCLAIMER}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <View className="flex-1 flex-row">
        <View className="w-[46%] bg-surface">{story}</View>
        <View className="flex-1 items-center justify-center px-12" style={{ paddingBottom: 72 }}>
          {form}
        </View>
      </View>
    </SafeAreaView>
  );
}

function AtlasStep({
  index,
  title,
  body,
}: {
  index: string;
  title: string;
  body: string;
}) {
  return (
    <View className="flex-row gap-4">
      <Text variant="label" tone="accent" className="w-8 pt-1">
        {index}
      </Text>
      <View className="flex-1">
        <Text variant="heading">{title}</Text>
        <Text variant="small" tone="muted" className="mt-1">
          {body}
        </Text>
      </View>
    </View>
  );
}

function Passage({ wide, ...fields }: Fields & { wide: boolean }) {
  const creating = fields.mode === "signUp";

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mx-auto w-full max-w-[1080px] flex-1 px-5">
          <View className="flex-row items-center justify-between pt-2">
            <BrandLockup />
            <Text variant="small" tone="muted">
              Independent guide
            </Text>
          </View>

          <View className="flex-1 items-center justify-center py-10">
            <View className="w-full max-w-[440px]">
              <View className="mb-4 flex-row items-center justify-center gap-2">
                <MapleLeaf size={18} />
                <Text variant="label" tone="muted">
                  Step 1 of 3
                </Text>
              </View>

              <View className="rounded-card border border-line bg-canvas p-6" style={cardShadow}>
                <View className="flex-row rounded-control bg-surface p-1">
                  <Segment
                    label="Sign in"
                    active={!creating}
                    onPress={() => fields.setMode("signIn")}
                  />
                  <Segment
                    label="Create account"
                    active={creating}
                    onPress={() => fields.setMode("signUp")}
                  />
                </View>

                <Text variant="title" className="mt-6">
                  {creating ? "Start with your CRS score." : "Pick up where you left off."}
                </Text>
                <Text variant="small" tone="muted" className="mt-2">
                  Account, then your score, then the Express Entry pages in
                  order.
                </Text>

                <View className="mt-6">
                  <EmailPassword {...fields} />
                </View>
                <Button
                  className="mt-5"
                  label={creating ? "Create account" : "Sign in"}
                />

                <View className="my-5 flex-row items-center gap-3">
                  <View className="h-px flex-1 bg-line" />
                  <Text variant="small" tone="muted">
                    or
                  </Text>
                  <View className="h-px flex-1 bg-line" />
                </View>
                <SocialRow />
              </View>

              <View className={`mt-5 flex-row ${wide ? "gap-3" : "gap-2"}`}>
                <RouteBeat label="Account" active />
                <RouteBeat label="CRS check" />
                <RouteBeat label="Express Entry" />
              </View>

              <Text variant="small" tone="muted" className="mt-6 text-center">
                {DISCLAIMER}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Segment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`h-10 flex-1 items-center justify-center rounded-[10px] ${
        active ? "bg-canvas" : ""
      }`}
    >
      <Text
        variant="small"
        className={active ? "font-inter-semibold text-ink" : "text-muted"}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RouteBeat({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View
      className={`flex-1 items-center rounded-control px-2 py-2.5 ${
        active ? "bg-canvas" : "bg-transparent"
      }`}
    >
      <View
        className={`mb-2 h-1.5 w-1.5 rounded-full ${active ? "bg-accent" : "bg-line"}`}
      />
      <Text
        variant="small"
        className={`text-center ${active ? "font-inter-semibold text-ink" : "text-muted"}`}
      >
        {label}
      </Text>
    </View>
  );
}

function ConceptSwitch({
  concept,
  onChange,
}: {
  concept: Concept;
  onChange: (concept: Concept) => void;
}) {
  return (
    <View
      className="absolute bottom-5 left-0 right-0 z-20 items-center px-4"
      style={Platform.OS === "web" ? { position: "fixed" } : undefined}
    >
      <View
        className="flex-row items-center rounded-full border border-line bg-canvas p-1"
        style={cardShadow}
      >
        {CONCEPTS.map((item) => {
          const active = item.id === concept;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(item.id)}
              className={`h-9 items-center justify-center rounded-full px-4 ${
                active ? "bg-ink" : ""
              }`}
            >
              <Text
                variant="small"
                tone={active ? "white" : "muted"}
                className={active ? "font-inter-semibold" : ""}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
