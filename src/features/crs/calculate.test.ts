import { describe, expect, it } from "vitest";

import { calculateCrs } from "./calculate";
import {
  CANADIAN_WORK_POINTS,
  HIGH_WAGE_JOB_OFFER_POINTS,
  HIGH_WAGE_WORK_POINTS,
  type CrsInputs,
  type HighWageTier,
} from "./rules";

function baseInputs(overrides: Partial<CrsInputs> = {}): CrsInputs {
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
    foreignWorkYears: "none",
    certificateOfQualification: false,
    spouseEducation: null,
    spouseFirstLanguage: null,
    spouseCanadianWorkYears: null,
    siblingInCanada: false,
    frenchNclb7: false,
    canadianEducation: "none",
    provincialNomination: false,
    ...overrides,
  };
}

function corePoints(inputs: CrsInputs) {
  const result = calculateCrs(inputs);
  return result.sections.find((section) => section.key === "core")!.points;
}

const TIERS: HighWageTier[] = ["twice", "onePointFive", "onePointThree"];

describe("Labour Market Integration factor", () => {
  it("leaves the score unchanged when there is no high-wage experience or job offer", () => {
    const result = calculateCrs(baseInputs());
    const core = result.sections.find((section) => section.key === "core")!;
    const labels = core.items.map((item) => item.label);

    expect(labels).toContain("Canadian work experience");
    expect(labels).not.toContain("High-wage occupation experience");
    expect(labels).not.toContain("High-wage job offer");
    expect(
      core.items.find((item) => item.label === "Canadian work experience")
        ?.points,
    ).toBe(CANADIAN_WORK_POINTS["1"][1]);
  });

  it("adds each high-wage work tier once the experience reaches 12 months", () => {
    const baseline = corePoints(baseInputs({ canadianWorkYears: "5plus" }));

    for (const tier of TIERS) {
      const withExperience = corePoints(
        baseInputs({
          canadianWorkYears: "5plus",
          highWageExperience: true,
          highWageTier: tier,
          highWageLength: "12plus",
        }),
      );
      expect(withExperience - baseline).toBe(HIGH_WAGE_WORK_POINTS[tier]);
    }
  });

  it("awards no high-wage work points below 12 months", () => {
    const baseline = corePoints(baseInputs({ canadianWorkYears: "5plus" }));
    const short = corePoints(
      baseInputs({
        canadianWorkYears: "5plus",
        highWageExperience: true,
        highWageTier: "twice",
        highWageLength: "under12",
      }),
    );

    expect(short).toBe(baseline);
  });

  it("uses each job offer tier when it beats Canadian work experience", () => {
    const baseline = corePoints(baseInputs({ canadianWorkYears: "none" }));

    for (const tier of TIERS) {
      const withOffer = corePoints(
        baseInputs({
          canadianWorkYears: "none",
          jobOffer: true,
          jobOfferTier: tier,
        }),
      );
      expect(withOffer - baseline).toBe(HIGH_WAGE_JOB_OFFER_POINTS[tier]);
    }
  });

  it("uses whichever option scores higher, never both", () => {
    const workWins = calculateCrs(
      baseInputs({
        canadianWorkYears: "5plus",
        highWageExperience: true,
        highWageTier: "twice",
        highWageLength: "12plus",
        jobOffer: true,
        jobOfferTier: "twice",
      }),
    );
    const workCore = workWins.sections.find(
      (section) => section.key === "core",
    )!;
    expect(workCore.items.map((item) => item.label)).not.toContain(
      "High-wage job offer",
    );

    const offerWins = calculateCrs(
      baseInputs({
        canadianWorkYears: "none",
        jobOffer: true,
        jobOfferTier: "twice",
      }),
    );
    const offerCore = offerWins.sections.find(
      (section) => section.key === "core",
    )!;
    expect(
      offerCore.items.find((item) => item.label === "High-wage job offer")
        ?.points,
    ).toBe(HIGH_WAGE_JOB_OFFER_POINTS.twice);
    expect(offerCore.items.map((item) => item.label)).not.toContain(
      "Canadian work experience",
    );

    const baseline = corePoints(baseInputs({ canadianWorkYears: "none" }));
    expect(offerCore.points - baseline).toBe(HIGH_WAGE_JOB_OFFER_POINTS.twice);
    expect(
      workCore.points - corePoints(baseInputs({ canadianWorkYears: "5plus" })),
    ).toBe(HIGH_WAGE_WORK_POINTS.twice);
  });
});
