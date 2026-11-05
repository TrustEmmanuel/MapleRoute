import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useRef } from "react";
import {
  Linking,
  Platform,
  Pressable,
  type ScrollViewInstance,
  View,
} from "react-native";

import { BrandLockup } from "@/components/brand";
import { Disclaimer } from "@/components/disclaimer";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/rows";
import { Text } from "@/components/ui/text";
import { PNP_PROGRAMS } from "@/features/pnp/provinces";
import { CRS_RULES } from "@/features/crs/rules";
import { colors } from "@/theme/theme";

const WAYS: {
  title: string;
  points: string;
  detail: string;
  action?: string;
}[] = [
  {
    title: "Provincial or territorial nomination",
    points: "600",
    detail:
      "A nomination through a Provincial Nominee Program stream linked to Express Entry adds 600 points — in practice, an invitation at the next draw. You apply to the province or territory directly. There are 11 programs;",
    action: "select for the steps and the official site.",
  },
  {
    title: "French language skills",
    points: "25–50",
    detail:
      "NCLB 7 or higher in all four French abilities earns 50 points when English is CLB 5 or better, or 25 points when English is CLB 4 or lower. A TEF or TCF Canada result is required.",
  },
  {
    title: "Brother or sister in Canada",
    points: "15",
    detail:
      "A sibling aged 18 or over who is a Canadian citizen or permanent resident and lives in Canada. You will need their status document and proof of your relationship.",
  },
  {
    title: "Post-secondary study in Canada",
    points: "15–30",
    detail:
      "A one or two-year credential from a Canadian school adds 15 points. Three years or more, or a master's, professional or doctoral degree, adds 30.",
  },
];

export default function AdditionalPointsGuide() {
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const pnpSectionY = useRef(0);

  function scrollToPnpList() {
    scrollRef.current?.scrollTo({
      y: Math.max(0, pnpSectionY.current + 20),
      animated: true,
    });
  }

  return (
    <Screen scrollRef={scrollRef}>
      <View className="flex-row items-center justify-between pt-1">
        <BrandLockup />
        <View className="rounded-full border border-line px-2.5 py-1">
          <Text variant="label" tone="muted">
            Guide
          </Text>
        </View>
      </View>

      <View className="mt-10">
        <Text variant="label" tone="accent">
          CRS
        </Text>
        <Text variant="display" className="mt-3">
          Additional points
        </Text>
        <Text variant="body" tone="muted" className="mt-4">
          Points that sit outside your core score, worth up to 600. They are not
          about being older, more educated or better at languages — each one
          comes from a separate step you can decide to take.
        </Text>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          The four sources
        </Text>
        <Card className="mt-3 p-5">
          {WAYS.map((way, index) => (
            <View key={way.title}>
              {index > 0 ? <Divider /> : null}
              <View className={index > 0 ? "py-3.5" : "pb-3.5"}>
                <View className="flex-row items-start justify-between gap-4">
                  <Text variant="body" className="flex-1 font-inter-semibold">
                    {way.title}
                  </Text>
                  <Text variant="small" className="font-inter-semibold">
                    {way.points}
                  </Text>
                </View>
                <Text variant="small" tone="muted" className="mt-1">
                  {way.detail}
                  {way.action ? (
                    <Text
                      variant="small"
                      className="font-inter-semibold text-ink underline"
                      accessibilityRole="link"
                      onPress={scrollToPnpList}
                    >
                      {" "}
                      {way.action}
                    </Text>
                  ) : null}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <View
        className="mt-8"
        onLayout={(event) => {
          pnpSectionY.current = event.nativeEvent.layout.y;
        }}
      >
        <Text variant="label" tone="muted">
          Where you can apply
        </Text>
        <Card className="mt-3 px-2 py-1">
          {PNP_PROGRAMS.map((program, index) => (
            <View key={program.code}>
              {index > 0 ? <Divider /> : null}
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${program.name} nominee program guide`}
                onPress={() =>
                  router.push({
                    pathname: "/guide/pnp/[code]",
                    params: { code: program.code },
                  })
                }
                className="flex-row items-center justify-between gap-3 px-3 py-3.5"
              >
                <View className="flex-1">
                  <Text variant="body" className="font-inter-semibold">
                    {program.name}
                  </Text>
                  <Text variant="small" tone="muted" className="mt-0.5">
                    {program.programName}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          ))}
        </Card>
        <Card variant="muted" className="mt-3 p-4">
          <Text variant="small" tone="muted">
            Quebec runs its own selection system outside the Provincial Nominee
            Program, and Nunavut has no nominee program. If you plan to settle in
            Quebec, look at Quebec&apos;s own programs instead.
          </Text>
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          How to go after them
        </Text>
        <Card className="mt-3 p-5">
          {[
            {
              title: "Start with a nomination if a province fits you",
              detail:
                "It is the only source worth hundreds of points. Look at the streams tied to your occupation and where you would actually settle, then apply to that province directly — not to IRCC.",
            },
            {
              title: "Book French and English tests early",
              detail:
                "French points need results in all four abilities, and the higher band needs a CLB 5 in English too. Test slots fill up, so book before you feel ready.",
            },
            {
              title: "Claim a sibling only if they can prove it",
              detail:
                "15 points, but they must be 18+, a citizen or permanent resident, living in Canada, and able to show you are siblings. Weak documents get the points removed later.",
            },
            {
              title: "Study in Canada only if it fits your plan",
              detail:
                "15–30 points rarely justify a whole program on their own. If you are already studying here, make sure your credential meets the length rule before counting on it.",
            },
          ].map((move, index) => (
            <View key={move.title} className={index > 0 ? "mt-4" : ""}>
              <View className="flex-row items-start gap-2.5">
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={colors.ink}
                  style={{ marginTop: 4 }}
                />
                <View className="flex-1">
                  <Text variant="body" className="font-inter-semibold">
                    {move.title}
                  </Text>
                  <Text variant="small" tone="muted" className="mt-1">
                    {move.detail}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <Card className="mt-4 p-4">
        <Text variant="small" tone="muted">{CRS_RULES.rulesNote}</Text>
        <Text
          variant="small"
          className="mt-2 font-inter-semibold text-ink underline"
          onPress={() => void Linking.openURL(CRS_RULES.highWageUrl)}
        >
          High-wage occupation list on canada.ca
        </Text>
      </Card>

      <Card variant="muted" className="mt-4 p-4">
        <Text variant="small" tone="muted">
          Rules version {CRS_RULES.version}, last verified{" "}
          {new Date(`${CRS_RULES.lastVerified}T12:00:00`).toLocaleDateString(
            "en-CA",
            { day: "numeric", month: "short", year: "numeric" },
          )}
          .
        </Text>
        <Text
          variant="small"
          className="mt-2 font-inter-semibold text-ink underline"
          onPress={() => void Linking.openURL(CRS_RULES.sourceUrl)}
        >
          Official CRS criteria on canada.ca
        </Text>
      </Card>

      <Button
        className="mt-6"
        label="Back to my score"
        onPress={() => {
          if (Platform.OS === "web" && typeof window !== "undefined") {
            if (window.opener) {
              window.close();
              return;
            }
            router.replace("/crs");
            return;
          }
          router.back();
        }}
      />

      <Disclaimer className="mt-8" />
    </Screen>
  );
}
