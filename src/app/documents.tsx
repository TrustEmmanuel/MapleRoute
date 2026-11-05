import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, router } from "expo-router";
import { Pressable, View } from "react-native";

import { Disclaimer } from "@/components/disclaimer";
import { LoadingScreen } from "@/components/loading-screen";
import { Screen } from "@/components/screen";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/features/auth/auth-provider";
import {
  DocumentDateCard,
  StatusPill,
} from "@/features/planning/document-date-card";
import {
  DOCUMENT_RULES,
  deadlineLine,
  nextDeadline,
  planDocuments,
  statusDetail,
  todayIso,
} from "@/features/planning/documents";
import { useDocumentDates } from "@/features/planning/use-document-dates";
import { colors } from "@/theme/theme";

export default function DocumentsScreen() {
  const { signedIn, loading } = useAuth();
  const { dates, ready, saveDate, clearDate } = useDocumentDates();
  const today = todayIso();
  const saved = ready ? planDocuments(dates, today) : [];
  const next = ready ? nextDeadline(dates, today) : null;
  const expiredCount = saved.filter((item) => item.status.state === "expired").length;

  if (loading) return <LoadingScreen />;
  if (!signedIn) return <Redirect href="/login" />;

  return (
    <Screen>
      <View className="flex-row items-center gap-3 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          onPress={() => router.push("/")}
          className="h-9 w-9 items-center justify-center rounded-full border border-line active:bg-surface"
        >
          <Ionicons name="arrow-back" size={17} color={colors.ink} />
        </Pressable>
        <Text variant="label" tone="muted">
          Documents & dates
        </Text>
      </View>

      <View className="mt-6">
        <Text variant="title">Know what expires, and when</Text>
        <Text variant="body" tone="muted" className="mt-3">
          IRCC sets a window for each document. Add the date printed on yours and
          MapleRoute counts the days, so you know which one comes due first and
          when to renew.
        </Text>
      </View>

      <Card className="mt-6 p-5">
        {!ready ? (
          <Text variant="small" tone="muted">
            Loading your dates…
          </Text>
        ) : next ? (
          <>
            <View className="flex-row items-start justify-between gap-3">
              <Text variant="label" tone="muted">
                {next.status.state === "expired" || next.status.deadline < today
                  ? "Needs attention"
                  : "Next deadline"}
              </Text>
              <StatusPill rule={next.rule} status={next.status} />
            </View>
            <Text variant="heading" className="mt-2">
              {next.rule.title}
            </Text>
            <Text variant="body" className="mt-1 font-inter-medium">
              {deadlineLine(next.rule, next.date, next.status)}
            </Text>
            <Text variant="small" tone="muted" className="mt-2">
              {statusDetail(next.rule, next.date, next.status)}
            </Text>
            {expiredCount > 0 && next.status.state !== "expired" ? (
              <Text variant="small" tone="muted" className="mt-2">
                {expiredCount === 1
                  ? "One other document is past its window."
                  : `${expiredCount} other documents are past their window.`}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <Text variant="label" tone="muted">
              Up next
            </Text>
            <Text variant="heading" className="mt-2">
              No dates yet
            </Text>
            <Text variant="small" tone="muted" className="mt-2">
              Add the date on each document below. This card will then show which
              one comes due first.
            </Text>
          </>
        )}
      </Card>

      <View className="mt-6">
        {DOCUMENT_RULES.map((rule) => (
          <DocumentDateCard
            key={rule.key}
            rule={rule}
            date={dates[rule.key]}
            today={today}
            onSave={(value) => saveDate(rule.key, value)}
            onClear={() => clearDate(rule.key)}
          />
        ))}
      </View>

      <View className="rounded-control bg-surface p-4">
        <Text variant="small" tone="muted">
          Only dates are saved, on this device with your account. MapleRoute never
          asks for document numbers, your UCI or passport details.
        </Text>
      </View>

      <Disclaimer className="mt-6" />
    </Screen>
  );
}
