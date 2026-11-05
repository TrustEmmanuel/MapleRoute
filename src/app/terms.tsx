import { Pressable } from "react-native";

import {
  LegalBullets,
  LegalPage,
  LegalParagraph,
  LegalSection,
} from "@/components/legal-page";
import { Text } from "@/components/ui/text";
import { FEEDBACK_URL } from "@/lib/legal";
import { openExternal } from "@/lib/links";

export default function TermsScreen() {
  return (
    <LegalPage title="Terms of use">
      <LegalSection title="Using MapleRoute">
        <LegalParagraph>
          These terms cover your use of MapleRoute. By using the app, you agree
          to them. If you do not agree, please do not use the app.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="What MapleRoute is">
        <LegalParagraph>
          MapleRoute is a step-by-step guide to preparing a Canadian Express
          Entry application. It is an independent project. It is not legal,
          immigration or financial advice, and it is not affiliated with
          Immigration, Refugees and Citizenship Canada (IRCC) or the Government
          of Canada.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="No guarantee">
        <LegalParagraph>
          Your eligibility, score, invitation to apply and application outcome
          depend on IRCC’s rules and decisions. MapleRoute’s CRS calculation and
          document dates are planning estimates, not official results.
          Requirements, fees and deadlines can change. Always confirm on
          canada.ca before acting or paying.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Your account">
        <LegalBullets
          items={[
            "In this build, your account is stored on your device. Any password unlocks it, so it is not a secure online login. Keep your device secure.",
            "When hosted accounts are enabled, you are responsible for keeping your sign-in details private.",
            "Use the app for your own application. Do not impersonate another person or use someone else’s account.",
            "You must be 18 or older to use MapleRoute.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Acceptable use">
        <LegalParagraph>
          Do not use MapleRoute to break the law, interfere with the app,
          attempt to access another person’s data, scrape or resell the guide,
          or upload content you do not have the right to use.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Content and ownership">
        <LegalParagraph>
          The MapleRoute name, design and guide text belong to the project.
          Official screenshots and page names from canada.ca or IRCC belong to
          their owners and are shown so you can recognise each step. That use
          does not imply endorsement. You may not copy or resell the guide.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Links to other sites">
        <LegalParagraph>
          Some links open official canada.ca pages or other third-party sites.
          We do not control those sites, and their terms and privacy policies
          apply.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Availability and changes">
        <LegalParagraph>
          We may change, suspend or discontinue the app or any feature. We try
          to keep the guide current, but we do not guarantee that it is complete
          or up to date at all times.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="No warranty">
        <LegalParagraph>
          MapleRoute is provided “as is” and “as available”. To the extent the
          law allows, we make no warranties about accuracy, availability or
          fitness for a particular purpose.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <LegalParagraph>
          To the extent the law allows, MapleRoute is not liable for indirect or
          consequential losses, missed deadlines, refused applications, travel
          or legal costs, or decisions you make based on the app. Nothing in
          these terms limits rights that cannot be limited by law.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Ending use">
        <LegalParagraph>
          You can stop using MapleRoute at any time and delete your account and
          data in Settings. We may suspend access if these terms are broken or
          if it is needed to protect the app or other users.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <LegalParagraph>
          We may update these terms. The date at the top shows the latest
          version. Continuing to use the app after a change means you accept the
          updated terms.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Contact">
        <LegalParagraph>
          Questions about these terms? Open an issue in the MapleRoute
          repository. Please don’t include personal or immigration details in a
          public issue.
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
