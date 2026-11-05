import { LATEST_DRAW, type LatestDraw } from "./draws";
import {
  ABILITIES,
  AGE_POINTS,
  CANADIAN_WORK_POINTS,
  CLB_RANK,
  CORE_EDUCATION_POINTS,
  CRS_RULES,
  educationTransferTier,
  FIRST_LANGUAGE_POINTS,
  HIGH_WAGE_JOB_OFFER_POINTS,
  HIGH_WAGE_WORK_POINTS,
  scoreBand,
  SECOND_LANGUAGE_POINTS,
  SPOUSE_EDUCATION_POINTS,
  SPOUSE_LANGUAGE_POINTS,
  SPOUSE_WORK_POINTS,
  type Ability,
  type ClbBand,
  type CrsInputs,
  type ScoreBand,
  type WorkYears,
} from "./rules";

export type BreakdownItem = {
  label: string;
  points: number;
};

export type BreakdownSection = {
  key: "core" | "spouse" | "transferability" | "additional";
  label: string;
  points: number;
  max: number;
  items: BreakdownItem[];
};

export type CrsResult = {
  total: number;
  band: ScoreBand;
  core: number;
  spouse: number;
  transferability: number;
  additional: number;
  sections: BreakdownSection[];
  rulesVersion: string;
  rulesEffectiveFrom: string;
  rulesLastVerified: string;
  rulesSourceUrl: string;
  benchmark: LatestDraw;
};

const WORK_YEARS_VALUE: Record<WorkYears, number> = {
  none: 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5plus": 5,
};

function allFirstLanguageAtLeast(
  language: Record<Ability, ClbBand>,
  level: number,
) {
  return ABILITIES.every((ability) => CLB_RANK[language[ability]] >= level);
}

function educationLanguagePoints(
  education: CrsInputs["education"],
  languageGood: boolean,
  languageExcellent: boolean,
) {
  const tier = educationTransferTier(education);

  if (tier === "secondary") return 0;
  if (!languageGood) return 0;

  if (tier === "oneYear") return languageExcellent ? 25 : 13;
  return languageExcellent ? 50 : 25;
}

function educationWorkPoints(
  education: CrsInputs["education"],
  canadianYears: number,
) {
  const tier = educationTransferTier(education);
  if (tier === "secondary" || canadianYears < 1) return 0;

  if (tier === "oneYear") return canadianYears >= 2 ? 25 : 13;
  return canadianYears >= 2 ? 50 : 25;
}

function foreignLanguagePoints(
  foreignWork: CrsInputs["foreignWorkYears"],
  languageGood: boolean,
  languageExcellent: boolean,
) {
  if (foreignWork === "none" || !languageGood) return 0;

  if (foreignWork === "oneToTwo") return languageExcellent ? 25 : 13;
  // IRCC's top band is "3 years or more". 3–5 and 6+ award the same points.
  return languageExcellent ? 50 : 25;
}

function foreignWorkPoints(
  foreignWork: CrsInputs["foreignWorkYears"],
  canadianYears: number,
) {
  if (foreignWork === "none" || canadianYears < 1) return 0;

  if (foreignWork === "oneToTwo") return canadianYears >= 2 ? 25 : 13;
  // IRCC's top band is "3 years or more". 3–5 and 6+ award the same points.
  return canadianYears >= 2 ? 50 : 25;
}

function certificatePoints(
  hasCertificate: boolean,
  languageGood: boolean,
  languageAtLeastFive: boolean,
) {
  if (!hasCertificate) return 0;
  if (languageGood) return 50;
  if (languageAtLeastFive) return 25;
  return 0;
}

export function calculateCrs(inputs: CrsInputs): CrsResult {
  const hasSpouse = inputs.maritalStatus === "withSpouse";
  const spouseIndex = hasSpouse ? 0 : 1;

  const age = Math.min(45, Math.max(17, Math.round(inputs.age)));
  const agePoints = AGE_POINTS[age]?.[spouseIndex] ?? 0;
  const educationPoints = CORE_EDUCATION_POINTS[inputs.education][spouseIndex];
  const firstLanguagePoints = ABILITIES.reduce(
    (sum, ability) =>
      sum + FIRST_LANGUAGE_POINTS[inputs.firstLanguage[ability]][spouseIndex],
    0,
  );
  const secondLanguagePoints = inputs.hasSecondLanguage
    ? Math.min(
        ABILITIES.reduce(
          (sum, ability) =>
            sum + SECOND_LANGUAGE_POINTS[inputs.secondLanguage[ability]],
          0,
        ),
        hasSpouse ? 22 : 24,
      )
    : 0;
  const canadianWorkYearsValue = WORK_YEARS_VALUE[inputs.canadianWorkYears];
  const workLengthPoints =
    CANADIAN_WORK_POINTS[inputs.canadianWorkYears][spouseIndex];
  const highWagePoints =
    inputs.highWageExperience &&
    inputs.highWageLength === "12plus" &&
    inputs.highWageTier
      ? HIGH_WAGE_WORK_POINTS[inputs.highWageTier]
      : 0;
  const workExperiencePoints = workLengthPoints + highWagePoints;
  const jobOfferPoints =
    inputs.jobOffer && inputs.jobOfferTier
      ? HIGH_WAGE_JOB_OFFER_POINTS[inputs.jobOfferTier]
      : 0;
  // The factor scores either Canadian work experience or a qualifying job
  // offer, never both. The higher option is used.
  const labourMarketPoints = Math.min(
    hasSpouse ? 140 : 150,
    Math.max(workExperiencePoints, jobOfferPoints),
  );

  const corePoints =
    agePoints +
    educationPoints +
    firstLanguagePoints +
    secondLanguagePoints +
    labourMarketPoints;

  const coreItems: BreakdownItem[] = [
    { label: "Age", points: agePoints },
    { label: "Level of education", points: educationPoints },
    { label: "First official language", points: firstLanguagePoints },
  ];
  if (secondLanguagePoints > 0) {
    coreItems.push({
      label: "Second official language",
      points: secondLanguagePoints,
    });
  }
  if (jobOfferPoints > workExperiencePoints) {
    coreItems.push({
      label: "High-wage job offer",
      points: labourMarketPoints,
    });
  } else {
    coreItems.push({
      label: "Canadian work experience",
      points: workLengthPoints,
    });
    if (highWagePoints > 0) {
      coreItems.push({
        label: "High-wage occupation experience",
        points: highWagePoints,
      });
    }
  }

  const spouseEducationPoints = hasSpouse
    ? SPOUSE_EDUCATION_POINTS[inputs.spouseEducation ?? "lessThanSecondary"]
    : 0;
  const spouseLanguagePoints = hasSpouse
    ? Math.min(
        20,
        ABILITIES.reduce(
          (sum, ability) =>
            sum +
            SPOUSE_LANGUAGE_POINTS[
              inputs.spouseFirstLanguage?.[ability] ?? "below5"
            ],
          0,
        ),
      )
    : 0;
  const spouseWorkPoints = hasSpouse
    ? SPOUSE_WORK_POINTS[inputs.spouseCanadianWorkYears ?? "none"]
    : 0;
  const spousePoints =
    spouseEducationPoints + spouseLanguagePoints + spouseWorkPoints;

  const languageGood = allFirstLanguageAtLeast(inputs.firstLanguage, 7);
  const languageExcellent = allFirstLanguageAtLeast(inputs.firstLanguage, 9);
  const languageAtLeastFive = allFirstLanguageAtLeast(inputs.firstLanguage, 5);

  const transferItems: BreakdownItem[] = [
    {
      label: "Education + language",
      points: educationLanguagePoints(
        inputs.education,
        languageGood,
        languageExcellent,
      ),
    },
    {
      label: "Education + Canadian work",
      points: educationWorkPoints(inputs.education, canadianWorkYearsValue),
    },
    {
      label: "Foreign work + language",
      points: foreignLanguagePoints(
        inputs.foreignWorkYears,
        languageGood,
        languageExcellent,
      ),
    },
    {
      label: "Foreign work + Canadian work",
      points: foreignWorkPoints(
        inputs.foreignWorkYears,
        canadianWorkYearsValue,
      ),
    },
    {
      label: "Certificate of qualification + language",
      points: certificatePoints(
        inputs.certificateOfQualification,
        languageGood,
        languageAtLeastFive,
      ),
    },
  ].filter((item) => item.points > 0);

  const rawTransferability = transferItems.reduce(
    (sum, item) => sum + item.points,
    0,
  );
  const transferabilityPoints = Math.min(100, rawTransferability);
  if (rawTransferability > 100) {
    transferItems.push({
      label: "Skill transferability maximum",
      points: 100 - rawTransferability,
    });
  }

  const additionalItems: BreakdownItem[] = [];
  if (inputs.siblingInCanada) {
    additionalItems.push({ label: "Brother or sister in Canada", points: 15 });
  }
  if (inputs.frenchNclb7) {
    additionalItems.push({
      label: "French language skills",
      points: languageAtLeastFive ? 50 : 25,
    });
  }
  if (inputs.canadianEducation === "oneOrTwoYears") {
    additionalItems.push({
      label: "Post-secondary education in Canada",
      points: 15,
    });
  } else if (inputs.canadianEducation === "threePlusYears") {
    additionalItems.push({
      label: "Post-secondary education in Canada",
      points: 30,
    });
  }
  if (inputs.provincialNomination) {
    additionalItems.push({
      label: "Provincial or territorial nomination",
      points: 600,
    });
  }
  const rawAdditional = additionalItems.reduce(
    (sum, item) => sum + item.points,
    0,
  );
  const additionalPoints = Math.min(600, rawAdditional);
  if (rawAdditional > 600) {
    additionalItems.push({
      label: "Additional points maximum",
      points: 600 - rawAdditional,
    });
  }

  const total = corePoints + spousePoints + transferabilityPoints + additionalPoints;

  return {
    total,
    band: scoreBand(total, LATEST_DRAW.score),
    core: corePoints,
    spouse: spousePoints,
    transferability: transferabilityPoints,
    additional: additionalPoints,
    sections: [
      {
        key: "core",
        label: "Core human capital",
        points: corePoints,
        max: hasSpouse ? 530 : 570,
        items: coreItems,
      },
      ...(hasSpouse
        ? [
            {
              key: "spouse" as const,
              label: "Spouse or partner",
              points: spousePoints,
              max: 40,
              items: [
                { label: "Education", points: spouseEducationPoints },
                { label: "Official language", points: spouseLanguagePoints },
                { label: "Canadian work experience", points: spouseWorkPoints },
              ],
            },
          ]
        : []),
      {
        key: "transferability",
        label: "Skill transferability",
        points: transferabilityPoints,
        max: 100,
        items: transferItems,
      },
      {
        key: "additional",
        label: "Additional points",
        points: additionalPoints,
        max: 600,
        items: additionalItems,
      },
    ],
    rulesVersion: CRS_RULES.version,
    rulesEffectiveFrom: CRS_RULES.effectiveFrom,
    rulesLastVerified: CRS_RULES.lastVerified,
    rulesSourceUrl: CRS_RULES.sourceUrl,
    benchmark: LATEST_DRAW,
  };
}
