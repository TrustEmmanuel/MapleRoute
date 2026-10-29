import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Linking, View } from "react-native";

import { BrandLockup } from "@/components/brand";
import { Disclaimer } from "@/components/disclaimer";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import {
  findPnpProgram,
  PNP_LAST_VERIFIED,
  PNP_SOURCE_URL,
} from "@/features/pnp/provinces";
import { colors } from "@/theme/theme";

const STEPS = [
  {
    title: "Check which stream fits you",
    detail:
      "Each province runs several streams — some need a job offer, some target an occupation, some reward ties to the province. Read the stream pages before you do anything else.",
  },
  {
    title: "Create or update your Express Entry profile",
    detail:
      "Most streams are linked to Express Entry. If you are not in the pool yet, build your profile first: nomination only pays off as 600 points if you are in it.",
  },
  {
    title: "Apply to the province, not to IRCC",
    detail:
      "You register on the province's own portal, submit your documents and pay its fee. Some streams work by invitation — the province picks from candidates who registered interest.",
  },
  {
    title: "Get nominated, then take the points",
    detail:
      "If the stream is Express Entry-linked, the nomination adds 600 points and you are invited to apply at the next draw. Streams outside Express Entry continue on the province's paper process.",
  },
];

const FINDING_STREAMS = [
  "The program's own website. Every province publishes a stream list with the rules, and it is the only version that counts. Ontario, for example, keeps a separate page listing which streams are open and which are closed.",
  "Program news and bulletins. Provinces announce new streams, intake windows and closures on a news or updates page before anywhere else. Check it every couple of weeks while you are applying.",
  "Draw results. Provinces that invite by score publish each draw with the cutoff and the occupations invited — that is how you learn what actually gets selected.",
  "The canada.ca provincial nominee page. It lists every program and links to each province's official site, so you can confirm you are on the right one.",
];

export default function PnpDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const program = findPnpProgram(code ?? "");

  if (!program) {
    return (
      <Screen>
        <View className="pt-4">
          <Text variant="title">Province not found</Text>
          <Text variant="body" tone="muted" className="mt-3">
            That page does not exist. Go back and pick a province or territory
            from the list.
          </Text>
          <Button
            className="mt-6"
            label="Back to additional points"
            onPress={() => router.replace("/guide/additional-points")}
          />
        </View>
      </Screen>
    );
  }

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
          Provincial nomination
        </Text>
        <Text variant="display" className="mt-3">
          {program.name}
        </Text>
        <Text variant="body" tone="muted" className="mt-4">
          {program.focus}
        </Text>
      </View>

      <Card className="mt-8 p-5">
        <Text variant="heading">{program.programName}</Text>
        <Text variant="small" tone="muted" className="mt-2">
          A nomination from {program.name} adds 600 points if the stream is
          linked to Express Entry — effectively an invitation to apply at the
          next draw. The province decides who it nominates; IRCC only applies the
          points.
        </Text>
        <Button
          className="mt-4"
          label={`Open the official ${program.name} site`}
          onPress={() => void Linking.openURL(program.url)}
        />
        {program.streamLink ? (
          <Button
            className="mt-3"
            variant="secondary"
            label={program.streamLink.label}
            onPress={() => void Linking.openURL(program.streamLink!.url)}
          />
        ) : null}
        {program.streamNote ? (
          <View className="mt-4 rounded-control bg-surface p-3.5">
            <Text variant="small" tone="muted">
              {program.streamNote}
            </Text>
          </View>
        ) : null}
      </Card>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          First, what is a stream?
        </Text>
        <Card className="mt-3 p-5">
          <Text variant="small" tone="muted">
            A nominee program is not one application — it is a set of routes
            called streams. Each stream has its own rules: who can apply, what
            job or occupation it targets, whether you need a job offer, and
            whether it connects to Express Entry. You pick one stream and apply
            through it.
          </Text>
          <Text variant="small" tone="muted" className="mt-3">
            Streams open and close. A province can pause a stream, change its
            occupation list, or replace it with a new one, often with little
            notice. That is why the stream list on the official site matters
            more than any guide — including this one.
          </Text>
          <View className="mt-4 rounded-control bg-surface p-3.5">
            <Text variant="small" tone="muted">
              Two streams can lead to the same 600 points with very different
              entry rules: one might need a job offer from a local employer,
              while another might invite Express Entry candidates who already
              work in a listed occupation.
            </Text>
          </View>
          <Text variant="small" tone="muted" className="mt-3">
            Streams linked to Express Entry give the 600 points. Streams that
            run outside Express Entry still lead to nomination, but you continue
            through the province&apos;s own paper process instead of the Express
            Entry draw.
          </Text>
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          How {program.name} selects people
        </Text>
        <Card className="mt-3 p-5">
          <Text variant="small" tone="muted">{program.model}</Text>
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          How it works
        </Text>
        <Card className="mt-3 p-5">
          {STEPS.map((step, index) => (
            <View key={step.title} className={index > 0 ? "mt-4" : ""}>
              <View className="flex-row items-start gap-2.5">
                <Text
                  variant="small"
                  className="mt-0.5 w-5 font-inter-semibold text-accent"
                >
                  {index + 1}.
                </Text>
                <View className="flex-1">
                  <Text variant="body" className="font-inter-semibold">
                    {step.title}
                  </Text>
                  <Text variant="small" tone="muted" className="mt-1">
                    {step.detail}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          How to find the latest streams
        </Text>
        <Card className="mt-3 p-5">
          {FINDING_STREAMS.map((item, index) => (
            <View
              key={item}
              className={`flex-row items-start gap-2.5 ${index > 0 ? "mt-3.5" : ""}`}
            >
              <Ionicons
                name="compass-outline"
                size={16}
                color={colors.muted}
                style={{ marginTop: 2 }}
              />
              <Text variant="small" tone="muted" className="flex-1">
                {item}
              </Text>
            </View>
          ))}
          <Text variant="small" tone="muted" className="mt-3">
            No public API publishes stream lists. Provinces publish them as web
            pages, so anything that shows you streams has to be checked against
            those pages.
          </Text>
        </Card>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="muted">
          What to have ready
        </Text>
        <Card className="mt-3 p-5">
          {[
            "Language test results — IELTS or CELPIP for English, TEF or TCF Canada for French.",
            "An educational credential assessment, if your education is from outside Canada.",
            "Reference letters and records for each job you are counting.",
            "A job offer, where the stream asks for one — with the employer ready to support the application.",
            "Proof of funds, unless the stream waives it because you are already working in Canada.",
          ].map((item, index) => (
            <View
              key={item}
              className={`flex-row items-start gap-2.5 ${index > 0 ? "mt-3" : ""}`}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={colors.muted}
                style={{ marginTop: 2 }}
              />
              <Text variant="small" tone="muted" className="flex-1">
                {item}
              </Text>
            </View>
          ))}
        </Card>
      </View>

      <Card className="mt-4 p-4">
        <Text variant="small" tone="muted">
          Streams, fees and intake numbers change every year, and a province can
          pause a stream without notice. Confirm the current rules on the
          official site before you pay anything.
        </Text>
        <Text
          variant="small"
          className="mt-2 font-inter-semibold text-ink underline"
          onPress={() => void Linking.openURL(PNP_SOURCE_URL)}
        >
          All provincial nominee programs on canada.ca
        </Text>
      </Card>

      <Card variant="muted" className="mt-4 p-4">
        <Text variant="small" tone="muted">
          Program details last checked{" "}
          {new Date(`${PNP_LAST_VERIFIED}T12:00:00`).toLocaleDateString(
            "en-CA",
            { day: "numeric", month: "short", year: "numeric" },
          )}
          .
        </Text>
      </Card>

      <Button
        className="mt-6"
        label="Back to the province list"
        onPress={() => router.back()}
      />

      <Disclaimer className="mt-8" />
    </Screen>
  );
}
