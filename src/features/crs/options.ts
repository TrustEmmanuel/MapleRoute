import type { SelectOption } from "@/components/ui/select-field";

import {
  CANADIAN_EDUCATION_LABELS,
  CLB_BAND_LABELS,
  EDUCATION_LABELS,
  FOREIGN_WORK_LABELS,
  HIGH_WAGE_LENGTH_LABELS,
  HIGH_WAGE_TIER_LABELS,
  SECOND_LANGUAGE_LABELS,
  SPOUSE_LANGUAGE_LABELS,
  WORK_YEARS_LABELS,
  type CrsInputs,
} from "./rules";

function toOptions<T extends string>(
  labels: Record<T, string>,
): SelectOption<T>[] {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}

export const EDUCATION_OPTIONS = toOptions(EDUCATION_LABELS);
export const CLB_OPTIONS = toOptions(CLB_BAND_LABELS);
export const SECOND_LANGUAGE_OPTIONS = toOptions(SECOND_LANGUAGE_LABELS);
export const SPOUSE_LANGUAGE_OPTIONS = toOptions(SPOUSE_LANGUAGE_LABELS);
export const WORK_YEARS_OPTIONS = toOptions(WORK_YEARS_LABELS);
export const FOREIGN_WORK_OPTIONS = toOptions(FOREIGN_WORK_LABELS);
export const CANADIAN_EDUCATION_OPTIONS = toOptions(CANADIAN_EDUCATION_LABELS);
export const HIGH_WAGE_TIER_OPTIONS = toOptions(HIGH_WAGE_TIER_LABELS);
export const HIGH_WAGE_LENGTH_OPTIONS = toOptions(HIGH_WAGE_LENGTH_LABELS);

export function normalizeCrsInputs(input: CrsInputs): CrsInputs {
  return {
    ...input,
    foreignWorkYears:
      (input.foreignWorkYears as string) === "threePlus"
        ? "threeToFive"
        : input.foreignWorkYears,
    highWageExperience: input.highWageExperience ?? false,
    highWageTier: input.highWageTier ?? null,
    highWageLength: input.highWageLength ?? "under12",
    jobOffer: input.jobOffer ?? false,
    jobOfferTier: input.jobOfferTier ?? null,
  };
}

export function defaultCrsInputs(): CrsInputs {
  return {
    maritalStatus: "single",
    age: 30,
    education: "bachelor",
    firstLanguage: {
      reading: "7",
      writing: "7",
      speaking: "7",
      listening: "7",
    },
    hasSecondLanguage: false,
    secondLanguage: {
      reading: "below5",
      writing: "below5",
      speaking: "below5",
      listening: "below5",
    },
    canadianWorkYears: "1",
    highWageExperience: false,
    highWageTier: null,
    highWageLength: "under12",
    jobOffer: false,
    jobOfferTier: null,
    foreignWorkYears: "none",
    certificateOfQualification: false,
    spouseEducation: "bachelor",
    spouseFirstLanguage: {
      reading: "7-8",
      writing: "7-8",
      speaking: "7-8",
      listening: "7-8",
    },
    spouseCanadianWorkYears: "1",
    siblingInCanada: false,
    frenchNclb7: false,
    canadianEducation: "none",
    provincialNomination: false,
  };
}
