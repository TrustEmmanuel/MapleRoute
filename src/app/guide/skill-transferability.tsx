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
import { CRS_RULES } from "@/features/crs/rules";
import { colors } from "@/theme/theme";

const COMBINATIONS = [
  {
    title: "Education + language",
    condition:
      "Any CLB 7 in all four abilities. One-year credential earns the lower band; two years or more, or two credentials, earns the higher band.",
    points: "13–50",
  },
  {
    title: "Education + Canadian work",
    condition:
      "At least one year of skilled work in Canada, plus one year of post-secondary education or more.",
    points: "13–50",
  },
  {
    title: "Foreign work + language",
    condition:
      "At least one year of skilled work outside Canada, plus CLB 7 or better in all four abilities.",
    points: "13–50",
  },
  {
    title: "Foreign work + Canadian work",
    condition:
      "At least one year of skilled work outside Canada, plus at least one year of skilled work in Canada.",
    points: "13–50",
  },
  {
    title: "Certificate of qualification + language",
    condition:
      "A Canadian certificate of qualification, plus CLB 5 (25 points) or CLB 7 (50 points) in all four abilities.",
    points: "25–50",
  },
];

const MOVES = [
  {
    title: "Push every language ability to CLB 7, then CLB 9",
    detail:
      "Language appears in three of the five combinations. A CLB 9 across reading, writing, speaking and listening roughly doubles most of those points. One weak ability keeps the whole band down.",
  },
  {
    title: "Get a full year of skilled work in Canada",
    detail:
      "Canadian work experience unlocks two combinations and lifts your core points. 30 hours a week for 12 months counts as one year.",
  },
  {
    title: "Keep foreign work documented",
    detail:
      "Three years or more of skilled work outside Canada gives the top band in both foreign-work combinations. Reference letters are the strongest proof; IRCC also accepts employment contracts, pay stubs and tax slips. An offer letter on its own does not show the work was done.",
  },
  {
    title: "Add a second credential instead of waiting",
    detail:
      "A one-year credential earns half the transferability points of a two-year or longer one. A second credential only counts when one of the programs was three or more years — for example, a master's on top of a bachelor's. Short certificates and single courses usually do not count.",
  },
];

export default function SkillTransferabilityGuide() {
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
          Skill transferability points
        </Text>
        <Text variant="body" tone="muted" className="mt-4">
          These are the points you earn when two parts of your profile reinforce
          each other — strong language plus a degree, for example. They sit on
          top of your core points and can add up to 100.
        </Text>
      </View>

      <Card className="mt-8 p-5">
        <Text variant="heading">What it actually means</Text>
        <Text variant="small" tone="muted" className="mt-2">
          You do not apply for these points separately. IRCC looks at your
          education, your official language ability, your work in Canada and
          your work abroad, then rewards the pairs that are strong together.
          There is no form to fill in — the points follow from the answers you
          already give.
        </Text>
        <View className="mt-4 rounded-control bg-surface p-3.5">
          <Text variant="small" tone="muted">
            Each combination is capped at 50 points, and the whole section is
            capped at 100. If you qualify for more than 100, the extra does not
            count.
          </Text>
        </View>
      </Card>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          The five combinations
        </Text>
        <Card className="mt-3 p-5">
          {COMBINATIONS.map((combo, index) => (
            <View key={combo.title}>
              {index > 0 ? <Divider /> : null}
              <View
                className={`flex-row items-start justify-between gap-4 ${
                  index > 0 ? "py-3.5" : "pb-3.5"
                }`}
              >
                <View className="flex-1">
                  <Text variant="body" className="font-inter-semibold">
                    {combo.title}
                  </Text>
                  <Text variant="small" tone="muted" className="mt-1">
                    {combo.condition}
                  </Text>
                </View>
                <Text variant="small" className="font-inter-semibold">
                  {combo.points}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          How to get more points
        </Text>
        <Card className="mt-3 p-5">
          {MOVES.map((move, index) => (
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
