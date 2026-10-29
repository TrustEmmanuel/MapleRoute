import {
  CANADIAN_EDUCATION_LABELS,
  CLB_BAND_LABELS,
  EDUCATION_LABELS,
  FOREIGN_WORK_LABELS,
  WORK_YEARS_LABELS,
  type CrsInputs,
} from "@/features/crs/rules";

const HINTS: Record<string, (inputs: CrsInputs) => string> = {
  education: (inputs) =>
    `you told us ${EDUCATION_LABELS[inputs.education].toLowerCase()} is your highest education.`,
  firstLanguage: (inputs) => {
    const labels = Array.from(
      new Set(Object.values(inputs.firstLanguage).map((band) => CLB_BAND_LABELS[band])),
    );
    return labels.length === 1
      ? `your first-language results are ${labels[0]} across all four abilities.`
      : `your first-language results are ${labels.join(", ")}.`;
  },
  canadianWorkYears: (inputs) =>
    `you told us you have ${WORK_YEARS_LABELS[inputs.canadianWorkYears].toLowerCase()} of Canadian work experience.`,
  foreignWorkYears: (inputs) =>
    `you told us you have ${FOREIGN_WORK_LABELS[inputs.foreignWorkYears].toLowerCase()} of foreign work experience.`,
  age: (inputs) => `you entered ${inputs.age} as your age.`,
  maritalStatus: (inputs) =>
    inputs.maritalStatus === "withSpouse"
      ? "you told us you're applying with a spouse or common-law partner."
      : "you told us you're applying without a spouse or common-law partner.",
  canadianEducation: (inputs) => {
    if (inputs.canadianEducation === "none") return "";
    return `you told us you have a ${CANADIAN_EDUCATION_LABELS[
      inputs.canadianEducation
    ].toLowerCase()} from a Canadian school.`;
  },
};

export function personalizedHint(
  key: string | null,
  inputs: CrsInputs | null | undefined,
) {
  if (!key || !inputs) return null;
  const build = HINTS[key];
  if (!build) return null;
  const hint = build(inputs).trim();
  return hint ? `Based on your CRS answers: ${hint}` : null;
}
