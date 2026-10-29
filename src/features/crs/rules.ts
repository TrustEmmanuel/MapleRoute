export const CRS_RULES = {
  version: "2025-03-25",
  effectiveFrom: "2025-03-25",
  lastVerified: "2026-10-29",
  sourceUrl:
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html",
  nextChangeDate: "2026-11-03",
  nextChangeNote:
    "IRCC changes Canadian work experience and job offer points on November 3, 2026. This estimate uses the rules in force until November 2, 2026.",
} as const;

export type Ability = "reading" | "writing" | "speaking" | "listening";

export type ClbBand = "below4" | "4-5" | "6" | "7" | "8" | "9" | "10plus";
export type SecondLanguageBand = "below5" | "5-6" | "7-8" | "9plus";
export type SpouseLanguageBand = "below5" | "5-6" | "7-8" | "9plus";

export type EducationLevel =
  | "lessThanSecondary"
  | "secondary"
  | "oneYear"
  | "twoYear"
  | "bachelor"
  | "twoOrMoreCredentials"
  | "master"
  | "professional"
  | "doctoral";

export type WorkYears = "none" | "1" | "2" | "3" | "4" | "5plus";
export type ForeignWorkYears =
  | "none"
  | "oneToTwo"
  | "threeToFive"
  | "sixPlus";
export type MaritalStatus = "single" | "withSpouse";

export type CrsInputs = {
  maritalStatus: MaritalStatus;
  age: number;
  education: EducationLevel;
  firstLanguage: Record<Ability, ClbBand>;
  hasSecondLanguage: boolean;
  secondLanguage: Record<Ability, SecondLanguageBand>;
  canadianWorkYears: WorkYears;
  foreignWorkYears: ForeignWorkYears;
  certificateOfQualification: boolean;
  spouseEducation: EducationLevel | null;
  spouseFirstLanguage: Record<Ability, SpouseLanguageBand> | null;
  spouseCanadianWorkYears: WorkYears | null;
  siblingInCanada: boolean;
  frenchNclb7: boolean;
  canadianEducation: "none" | "oneOrTwoYears" | "threePlusYears";
  provincialNomination: boolean;
};

export const ABILITIES: Ability[] = [
  "reading",
  "writing",
  "speaking",
  "listening",
];

export const CLB_BAND_LABELS: Record<ClbBand, string> = {
  below4: "Below CLB 4",
  "4-5": "CLB 4 or 5",
  "6": "CLB 6",
  "7": "CLB 7",
  "8": "CLB 8",
  "9": "CLB 9",
  "10plus": "CLB 10 or higher",
};

export const SECOND_LANGUAGE_LABELS: Record<SecondLanguageBand, string> = {
  below5: "CLB 4 or lower",
  "5-6": "CLB 5 or 6",
  "7-8": "CLB 7 or 8",
  "9plus": "CLB 9 or higher",
};

export const SPOUSE_LANGUAGE_LABELS: Record<SpouseLanguageBand, string> = {
  below5: "CLB 4 or lower",
  "5-6": "CLB 5 or 6",
  "7-8": "CLB 7 or 8",
  "9plus": "CLB 9 or higher",
};

export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  lessThanSecondary: "Less than secondary school",
  secondary: "Secondary school diploma",
  oneYear: "One-year post-secondary credential",
  twoYear: "Two-year post-secondary credential",
  bachelor: "Bachelor's degree or 3+ year program",
  twoOrMoreCredentials: "Two or more credentials (one 3+ years)",
  master: "Master's degree",
  professional: "Entry-to-practice professional degree",
  doctoral: "Doctoral degree (PhD)",
};

export const WORK_YEARS_LABELS: Record<WorkYears, string> = {
  none: "Less than 1 year",
  "1": "1 year",
  "2": "2 years",
  "3": "3 years",
  "4": "4 years",
  "5plus": "5 years or more",
};

export const FOREIGN_WORK_LABELS: Record<ForeignWorkYears, string> = {
  none: "None",
  oneToTwo: "1 or 2 years",
  threeToFive: "3–5 years",
  sixPlus: "6+ years",
};

export const CANADIAN_EDUCATION_LABELS: Record<
  CrsInputs["canadianEducation"],
  string
> = {
  none: "None",
  oneOrTwoYears: "1 or 2-year credential",
  threePlusYears: "3+ year credential",
};

export const AGE_POINTS: Record<number, [spouse: number, single: number]> = {
  17: [0, 0],
  18: [90, 99],
  19: [95, 105],
  20: [100, 110],
  21: [100, 110],
  22: [100, 110],
  23: [100, 110],
  24: [100, 110],
  25: [100, 110],
  26: [100, 110],
  27: [100, 110],
  28: [100, 110],
  29: [100, 110],
  30: [95, 105],
  31: [90, 99],
  32: [85, 94],
  33: [80, 88],
  34: [75, 83],
  35: [70, 77],
  36: [65, 72],
  37: [60, 66],
  38: [55, 61],
  39: [50, 55],
  40: [45, 50],
  41: [35, 39],
  42: [25, 28],
  43: [15, 17],
  44: [5, 6],
  45: [0, 0],
};

export const CORE_EDUCATION_POINTS: Record<
  EducationLevel,
  [spouse: number, single: number]
> = {
  lessThanSecondary: [0, 0],
  secondary: [28, 30],
  oneYear: [84, 90],
  twoYear: [91, 98],
  bachelor: [112, 120],
  twoOrMoreCredentials: [119, 128],
  master: [126, 135],
  professional: [126, 135],
  doctoral: [140, 150],
};

export const FIRST_LANGUAGE_POINTS: Record<
  ClbBand,
  [spouse: number, single: number]
> = {
  below4: [0, 0],
  "4-5": [6, 6],
  "6": [8, 9],
  "7": [16, 17],
  "8": [22, 23],
  "9": [29, 31],
  "10plus": [32, 34],
};

export const SECOND_LANGUAGE_POINTS: Record<SecondLanguageBand, number> = {
  below5: 0,
  "5-6": 1,
  "7-8": 3,
  "9plus": 6,
};

export const SPOUSE_EDUCATION_POINTS: Record<EducationLevel, number> = {
  lessThanSecondary: 0,
  secondary: 2,
  oneYear: 6,
  twoYear: 7,
  bachelor: 8,
  twoOrMoreCredentials: 9,
  master: 10,
  professional: 10,
  doctoral: 10,
};

export const SPOUSE_LANGUAGE_POINTS: Record<SpouseLanguageBand, number> = {
  below5: 0,
  "5-6": 1,
  "7-8": 3,
  "9plus": 5,
};

export const CANADIAN_WORK_POINTS: Record<
  WorkYears,
  [spouse: number, single: number]
> = {
  none: [0, 0],
  "1": [35, 40],
  "2": [46, 53],
  "3": [56, 64],
  "4": [63, 72],
  "5plus": [70, 80],
};

export const SPOUSE_WORK_POINTS: Record<WorkYears, number> = {
  none: 0,
  "1": 5,
  "2": 7,
  "3": 8,
  "4": 9,
  "5plus": 10,
};

export const CLB_RANK: Record<ClbBand, number> = {
  below4: 0,
  "4-5": 4,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10plus": 10,
};

export type EducationTransferTier =
  | "secondary"
  | "oneYear"
  | "twoCredentials"
  | "graduate";

export function educationTransferTier(
  education: EducationLevel,
): EducationTransferTier {
  switch (education) {
    case "lessThanSecondary":
    case "secondary":
      return "secondary";
    case "twoOrMoreCredentials":
      return "twoCredentials";
    case "master":
    case "professional":
    case "doctoral":
      return "graduate";
    default:
      return "oneYear";
  }
}

export const BENCHMARK = {
  score: 519,
  drawName: "Canadian Experience Class",
  drawDate: "2026-10-15",
  invitations: 2500,
  sourceUrl:
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html",
  lastVerified: "2026-10-29",
} as const;

export type ScoreBand = "strong" | "average" | "low";

export function scoreBand(score: number): ScoreBand {
  if (score >= BENCHMARK.score) return "strong";
  if (score >= BENCHMARK.score - 49) return "average";
  return "low";
}
