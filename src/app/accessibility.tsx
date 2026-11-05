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

export default function AccessibilityScreen() {
  return (
    <LegalPage title="Accessibility">
      <LegalSection title="Our target">
        <LegalParagraph>
          MapleRoute aims to meet WCAG 2.1 Level AA on the web. This page
          describes what we check and where the app still falls short.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="What we check">
        <LegalBullets
          items={[
            "Text and interface colors are checked against WCAG AA contrast ratios with a script in the project.",
            "Buttons, links, inputs and checkboxes have accessible names, and checked or selected states are exposed to screen readers.",
            "Keyboard focus is visible, while mouse clicks do not leave a focus ring.",
            "The app respects your system’s reduced-motion setting.",
            "Status is never shown by color alone: each badge also has a word.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Known limitations">
        <LegalBullets
          items={[
            "Screenshots of official IRCC pages are images. Each has a text description, but we cannot change the contrast or layout of the original page.",
            "Date fields use your browser’s date picker, so the format and controls depend on your browser and system language.",
            "The iOS and Android builds have not been separately audited yet. This page covers the web app.",
            "Pages on canada.ca that open from the guide are outside our control.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Assessment approach">
        <LegalParagraph>
          This is a self-assessment using automated contrast checks and
          keyboard and screen-reader spot checks. It is a statement of effort,
          not a certification.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Feedback">
        <LegalParagraph>
          Found a barrier? Open an issue with the page, what you were trying to
          do, and your browser or device. Please don’t include personal or
          immigration details.
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
