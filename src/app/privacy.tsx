import { Pressable, View } from "react-native";

import {
  LegalBullets,
  LegalPage,
  LegalParagraph,
  LegalSection,
} from "@/components/legal-page";
import { Text } from "@/components/ui/text";
import { FEEDBACK_URL } from "@/lib/legal";
import { openExternal } from "@/lib/links";

export default function PrivacyScreen() {
  return (
    <LegalPage title="Privacy policy">
      <LegalSection title="The short version">
        <LegalParagraph>
          MapleRoute is an independent guide. We never ask for your IRCC
          password, UCI or passport number. In this build, your account and app
          data are stored in your browser on this device, not on a MapleRoute
          server. You can delete everything from Settings at any time. We also
          collect cookieless page counts and error reports, described under
          “Analytics and error reports”; they never include your answers.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="What you enter">
        <LegalBullets
          items={[
            "Your first and last name, your email address, and whether you chose to stay signed in.",
            "Your CRS answers: age, marital status, education, language test results, work experience, spouse information, and factors such as a certificate, nomination, sibling in Canada, French ability or Canadian education.",
            "Your guide progress: finished steps, where you left off, preparation answers such as your NOC code, and any notes you write.",
            "Your documents and dates: dates printed on your documents, “I have this” marks, and an IELTS band score if you add one.",
            "Your check-in reminder date, and which guide updates you have seen.",
            "If you use author mode, guide edits and images you add stay on this device.",
          ]}
        />
      </LegalSection>

      <LegalSection title="What we do not collect">
        <LegalParagraph>
          We do not ask for or store your IRCC account password, UCI, passport
          number, date of birth, SIN, banking details, precise location,
          contacts or advertising ID. The CRS check asks for your age as a
          number, not your date of birth. Please don’t type these details into
          notes or other free-text fields.
        </LegalParagraph>
        <LegalParagraph>
          For an account stored on this device, your password is not stored:
          any password unlocks the local account. For hosted accounts, Supabase
          handles the password and MapleRoute never sees it.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Where your data is stored">
        <LegalParagraph>
          This build keeps data in your browser’s local storage. If you turn
          off “Keep me signed in”, your name and email are kept in session
          storage instead. The data stays on your device and is not sent to us.
          Anyone who can use your browser profile or device may be able to read
          it, so use a device you control and sign out on shared computers.
        </LegalParagraph>
        <LegalParagraph>
          If hosted accounts are switched on in a build, your name, email and
          CRS checks are stored with Supabase, the authentication and database
          provider for that build. Guide progress, document dates and notes
          stay in your browser. Row-level security stops one account from
          reading another account’s data.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Analytics and error reports">
        <LegalParagraph>
          Two privacy-friendly services are used, and only when their keys are
          configured in the build. They are never used for advertising.
        </LegalParagraph>
        <LegalParagraph>
          Umami records cookieless, aggregate usage: which page was opened, the
          referring site, browser, operating system, country, and a visitor
          hash that changes every day. Query strings are excluded, so the step
          count and score in a shared progress link are never sent. It does not
          receive your email, CRS answers, score, notes, document dates or
          anything you type.
        </LegalParagraph>
        <LegalParagraph>
          Sentry receives error reports: the error message, stack trace,
          browser and device type, and the page path with the query string
          removed. We turn off its default personal-data collection and
          session tracking, and redact email addresses and long numbers before
          sending. Error reports are used only to find and fix faults.
        </LegalParagraph>
        <LegalParagraph>
          If your browser sends Do Not Track or Global Privacy Control, neither
          service loads. Umami sets no cookies and MapleRoute sets no
          advertising or tracking cookies.
        </LegalParagraph>
        <View className="flex-row flex-wrap gap-x-5">
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Open the Umami privacy policy"
            onPress={() => openExternal("https://umami.is/privacy")}
            className="min-h-[44px] justify-center active:opacity-70"
          >
            <Text variant="small" tone="accent" className="font-inter-medium">
              Umami privacy policy
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Open the Sentry privacy policy"
            onPress={() => openExternal("https://sentry.io/privacy/")}
            className="min-h-[44px] justify-center active:opacity-70"
          >
            <Text variant="small" tone="accent" className="font-inter-medium">
              Sentry privacy policy
            </Text>
          </Pressable>
        </View>
      </LegalSection>

      <LegalSection title="When information is shared">
        <LegalParagraph>
          We do not sell or rent your information, and we do not share it with
          advertisers or data brokers. The third parties involved are
          infrastructure providers needed to run hosted accounts, Umami and
          Sentry for the aggregate counts and error reports described above,
          and the canada.ca pages you choose to open in a new tab. Their own
          privacy policies apply.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <LegalParagraph>
          Until you delete it. Local data stays for as long as your browser
          keeps it. Hosted data stays while your account exists. Signing out
          does not delete your data.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Deleting your account and data">
        <LegalParagraph>
          Open Settings and choose “Delete my account and data”. That removes
          your name and email, CRS answers and score, guide progress and notes,
          document dates, band score and reminder from this device, then signs
          you out.
          If your account is hosted, it also asks the server to delete the
          account and its saved CRS checks. This cannot be undone. Clearing
          your browser’s site data also removes the local copy.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Email and ads">
        <LegalParagraph>
          MapleRoute does not send marketing email in this build. Check-in
          reminders are created on your device, and a calendar file is saved by
          your calendar app only if you download it. This build has no ads. If
          advertising or email is added, this policy will be updated and any
          choices required by law will be offered before they go live.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Children">
        <LegalParagraph>
          MapleRoute is for adults preparing their own immigration application.
          It is not intended for anyone under 18.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <LegalParagraph>
          If this policy changes, the date at the top will change. If a change
          materially affects what is stored, the app will ask you to review the
          updated policy before you continue.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Contact">
        <LegalParagraph>
          For a privacy question or deletion help, open an issue in the
          MapleRoute repository. Please don’t include personal or immigration
          details in a public issue; ask for a private channel instead.
        </LegalParagraph>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Open the MapleRoute issues page"
          onPress={() => openExternal(FEEDBACK_URL)}
          className="min-h-[44px] justify-center self-start active:opacity-70"
        >
          <Text variant="body" tone="accent" className="font-inter-medium">
            github.com/TrustEmmanuel/MapleRoute/issues
          </Text>
        </Pressable>
      </LegalSection>
    </LegalPage>
  );
}
