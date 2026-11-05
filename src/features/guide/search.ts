import {
  stepsVisibleTo,
  type Guide,
  type GuideSection,
  type GuideStep,
} from "./types";

export type GuideSearchResult = {
  section: GuideSection;
  step: GuideStep;
  sectionIndex: number;
  stepIndex: number;
  stepCount: number;
  score: number;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function fieldsFor(section: GuideSection, step: GuideStep) {
  return {
    title: normalize(step.title),
    section: normalize(section.title),
    instruction: normalize(step.instruction),
    fieldLabel: normalize(step.fieldLabelOnOfficialPage ?? ""),
    pageName: normalize(step.officialPageName ?? ""),
    documents: normalize(
      step.requiredDocuments
        .map((document) => `${document.name} ${document.description ?? ""}`)
        .join(" "),
    ),
    mistakes: normalize(step.commonMistakes.join(" ")),
    boost: normalize(step.boostTip ?? ""),
  };
}

export function searchGuideSteps(
  guide: Guide,
  isAdmin: boolean,
  query: string,
): GuideSearchResult[] {
  const normalizedQuery = normalize(query).trim().replace(/\s+/g, " ");
  if (!normalizedQuery) return [];

  const tokens = normalizedQuery.split(" ");
  const results: GuideSearchResult[] = [];

  guide.sections.forEach((section, sectionIndex) => {
    const sectionSteps = stepsVisibleTo(section, isAdmin)
      .slice()
      .sort((a, b) => a.position - b.position);
    sectionSteps.forEach((step, stepIndex) => {
      const fields = fieldsFor(section, step);
      const haystack = Object.values(fields).join(" ");
      if (!tokens.every((token) => haystack.includes(token))) return;

      let score = 0;
      if (fields.title === normalizedQuery) score += 120;
      else if (fields.title.startsWith(normalizedQuery)) score += 80;
      else if (fields.title.includes(normalizedQuery)) score += 60;
      if (fields.pageName.includes(normalizedQuery)) score += 20;
      if (fields.documents.includes(normalizedQuery)) score += 15;
      if (fields.section.includes(normalizedQuery)) score += 12;
      if (fields.fieldLabel.includes(normalizedQuery)) score += 10;
      if (fields.instruction.includes(normalizedQuery)) score += 6;
      if (fields.mistakes.includes(normalizedQuery)) score += 4;
      if (fields.boost.includes(normalizedQuery)) score += 2;
      for (const token of tokens) {
        if (fields.title.includes(token)) score += 8;
      }

      results.push({
        section,
        step,
        sectionIndex,
        stepIndex,
        stepCount: sectionSteps.length,
        score,
      });
    });
  });

  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.sectionIndex - b.sectionIndex || a.stepIndex - b.stepIndex;
  });
}
