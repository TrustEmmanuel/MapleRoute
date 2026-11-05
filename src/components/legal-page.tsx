import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Disclaimer } from "@/components/disclaimer";
import { Screen } from "@/components/screen";
import { Text } from "@/components/ui/text";
import { LEGAL_UPDATED } from "@/lib/legal";
import { colors } from "@/theme/theme";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Screen>
      <View className="flex-row items-center gap-3 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          className="h-9 w-9 items-center justify-center rounded-full border border-control-line active:bg-surface"
        >
          <Ionicons name="arrow-back" size={17} color={colors.ink} />
        </Pressable>
        <Text variant="label" tone="muted">
          Legal & accessibility
        </Text>
      </View>

      <View className="mt-6">
        <Text variant="title">{title}</Text>
        <Text variant="small" tone="muted" className="mt-2">
          Last updated {LEGAL_UPDATED}
        </Text>
      </View>

      <View className="mt-2">{children}</View>

      <View className="mt-8 flex-row flex-wrap gap-x-5 gap-y-1">
        <LegalLink href="/privacy" label="Privacy policy" />
        <LegalLink href="/terms" label="Terms of use" />
        <LegalLink href="/accessibility" label="Accessibility" />
      </View>

      <Disclaimer className="mt-6" />
    </Screen>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-7">
      <Text variant="heading">{title}</Text>
      <View className="mt-2 gap-3">{children}</View>
    </View>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return <Text variant="body">{children}</Text>;
}

export function LegalBullets({ items }: { items: string[] }) {
  return (
    <View className="gap-1.5">
      {items.map((item) => (
        <View key={item} className="flex-row gap-2">
          <Text variant="body" tone="muted">
            •
          </Text>
          <Text variant="body" className="flex-1">
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function LegalLink({ href, label }: { href: Href; label: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => router.push(href)}
      className="min-h-[44px] justify-center active:opacity-70"
    >
      <Text variant="small" tone="accent" className="font-inter-medium">
        {label}
      </Text>
    </Pressable>
  );
}
