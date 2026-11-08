export type GuideStatus = "draft" | "ready";

export type StepLink = {
  label: string;
  url: string;
};

export type StepDocument = {
  name: string;
  description?: string;
  whereToGetIt?: string;
  link?: string;
  optional?: boolean;
};

export type StepHighlight = {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
};

export type StepScreenshot = {
  id: string;
  storagePath: string;
  altText: string;
  position: number;
  highlights: StepHighlight[];
};

export type GuideStep = {
  id: string;
  sectionId: string;
  position: number;
  title: string;
  instruction: string;
  fieldLabelOnOfficialPage: string | null;
  officialPageName: string | null;
  officialUrl: string | null;
  extraLinks: StepLink[];
  requiredDocuments: StepDocument[];
  commonMistakes: string[];
  boostTip: string | null;
  personalizationKey: string | null;
  status: GuideStatus;
  sourceUrl: string | null;
  lastVerified: string | null;
  verifiedBy: string | null;
  screenshots: StepScreenshot[];
};

export type GuideSection = {
  id: string;
  position: number;
  title: string;
  summary: string | null;
  estimatedMinutes: number | null;
  estimatedCostText: string | null;
  steps: GuideStep[];
};

export type Guide = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  version: string;
  status: GuideStatus;
  sections: GuideSection[];
};

export type StepProgress = {
  checked: boolean;
  checkedAt: string | null;
};

export type GuidePosition = {
  sectionId: string;
  stepId: string | null;
};

export type StepReport = {
  id: string;
  stepId: string;
  note: string;
  createdAt: string;
};

export type VisibleStep = {
  section: GuideSection;
  step: GuideStep;
};

export function isStepPublishable(step: GuideStep) {
  return (
    step.status === "ready" &&
    Boolean(step.sourceUrl?.trim()) &&
    Boolean(step.lastVerified?.trim())
  );
}

export function stepsVisibleTo(section: GuideSection, isAdmin: boolean) {
  if (isAdmin) return section.steps;
  return section.steps.filter(isStepPublishable);
}

export function visibleSteps(guide: Guide, isAdmin: boolean): VisibleStep[] {
  return guide.sections.flatMap((section) =>
    stepsVisibleTo(section, isAdmin)
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((step) => ({ section, step })),
  );
}

export function checkedCount(
  steps: GuideStep[],
  progress: Record<string, StepProgress>,
) {
  return steps.filter((step) => progress[step.id]?.checked).length;
}

export function sourceDomain(url: string | null | undefined) {
  if (!url) return null;
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] || null;
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isRemoteId(id: string) {
  return UUID_PATTERN.test(id);
}
