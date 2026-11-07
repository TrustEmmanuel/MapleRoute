import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Linking, Platform, View } from "react-native";

import { BrandLockup } from "@/components/brand";
import { Disclaimer } from "@/components/disclaimer";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/rows";
import { Text } from "@/components/ui/text";
import {
  CRS_RULES,
  HIGH_WAGE_JOB_OFFER_POINTS,
  HIGH_WAGE_TIER_LABELS,
  HIGH_WAGE_WORK_POINTS,
  type HighWageTier,
} from "@/features/crs/rules";
import { colors } from "@/theme/theme";

const TIERS: HighWageTier[] = ["twice", "onePointFive", "onePointThree"];

const QUALIFYING = [
  {
    title: "Full-time and continuous",
    detail:
      "The offer must be for full-time, continuous work for at least one year after you become a permanent resident.",
  },
  {
    title: "No LMIA needed",
    detail:
      "From November 3, 2026, a qualifying job offer no longer needs a Labour Market Impact Assessment.",
  },
  {
    title: "IRCC decides whether it is genuine",
    detail:
      "IRCC makes the final decision on whether the offer is genuine.",
  },
];

export default function HighWageJobOfferGuide() {
  return (
    <Screen>
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
          High-wage job offer
        </Text>
        <Text variant="body" tone="muted" className="mt-4">
          A qualifying job offer in a high-wage occupation is worth 50, 70 or
          100 points, depending on the job&apos;s level. The level does not come
          from your salary — it comes from the occupation itself.
        </Text>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          Where the level comes from
        </Text>
        <Card className="mt-3 p-5">
          <Text variant="small" tone="muted">
            IRCC sets the level from the occupation&apos;s NOC median wage
            across Canada, using its high-wage occupation list. Your own pay,
            your employer&apos;s budget and your province do not change it.
          </Text>
          <View className="mt-4 rounded-control bg-surface p-3.5">
            <Text variant="small" tone="muted">
              Points apply only to occupations on IRCC&apos;s high-wage list. If
              the job is not on the list, the offer does not earn these points.
            </Text>
          </View>
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          Points by level
        </Text>
        <Card className="mt-3 p-5">
          {TIERS.map((tier, index) => (
            <View key={tier}>
              {index > 0 ? <Divider /> : null}
              <View
                className={`flex-row items-start justify-between gap-4 ${
                  index > 0 ? "py-3.5" : "pb-3.5"
                }`}
              >
                <Text variant="body" className="flex-1 font-inter-semibold">
                  {HIGH_WAGE_TIER_LABELS[tier]}
                </Text>
                <Text variant="small" className="font-inter-semibold">
                  {HIGH_WAGE_JOB_OFFER_POINTS[tier]} pts
                </Text>
              </View>
            </View>
          ))}
        </Card>
        <Card variant="muted" className="mt-3 p-4">
          <Text variant="small" tone="muted">
            High-wage Canadian work experience at the same levels earns{" "}
            {HIGH_WAGE_WORK_POINTS.twice},{" "}
            {HIGH_WAGE_WORK_POINTS.onePointFive} or{" "}
            {HIGH_WAGE_WORK_POINTS.onePointThree}. It needs 12 months (1,560
            hours) or more in those occupations.
          </Text>
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          One factor, not two
        </Text>
        <Card className="mt-3 p-5">
          <Text variant="small" tone="muted">
            Both the offer points and the work-experience points sit inside the
            Labour Market Integration factor. IRCC awards whichever is higher —
            they are never added together.
          </Text>
          <Text variant="small" tone="muted" className="mt-3">
            A job offer therefore only lifts your score when it scores above
            your high-wage work experience. If you have both, the calculator
            compares them for you.
          </Text>
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          What makes an offer qualifying
        </Text>
        <Card className="mt-3 p-5">
          {QUALIFYING.map((item, index) => (
            <View key={item.title} className={index > 0 ? "mt-4" : ""}>
              <View className="flex-row items-start gap-2.5">
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={colors.ink}
                  style={{ marginTop: 4 }}
                />
                <View className="flex-1">
                  <Text variant="body" className="font-inter-semibold">
                    {item.title}
                  </Text>
                  <Text variant="small" tone="muted" className="mt-1">
                    {item.detail}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          Finding your level
        </Text>
        <Card className="mt-3 p-5">
          <Text variant="small" tone="muted">
            Match the job to its NOC on IRCC&apos;s high-wage occupation list,
            then use the level IRCC lists for that occupation. Use the same
            level in the calculator — not the salary you were quoted.
          </Text>
          <Text
            variant="small"
            className="mt-3 font-inter-semibold text-ink underline"
            onPress={() => void Linking.openURL(CRS_RULES.highWageUrl)}
          >
            High-wage occupation list on canada.ca
          </Text>
        </Card>
      </View>

      <Card className="mt-4 p-4">
        <Text variant="small" tone="muted">
          From November 3, 2026, IRCC updated this factor. The two official
          summaries are linked below.
        </Text>
        <Text
          variant="small"
          className="mt-2 font-inter-semibold text-ink underline"
          onPress={() => void Linking.openURL(CRS_RULES.changesUrl)}
        >
          What changed on November 3
        </Text>
        <Text
          variant="small"
          className="mt-2 font-inter-semibold text-ink underline"
          onPress={() => void Linking.openURL(CRS_RULES.sourceUrl)}
        >
          Official CRS criteria on canada.ca
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
