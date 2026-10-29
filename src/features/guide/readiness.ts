export type LanguageTestId = "" | "celpip" | "ielts" | "pte" | "tef" | "tcf";
export type EducationRoute = "" | "eca" | "canadian";
export type EcaEquivalency = "" | "degree" | "diploma2" | "diploma1" | "secondary";
export type LanguageAbility = "listening" | "reading" | "writing" | "speaking";

export type PrepInputs = {
  languageTest: LanguageTestId;
  clb: Record<LanguageAbility, string>;
  educationRoute: EducationRoute;
  ecaEquivalency: EcaEquivalency;
  noc: string;
};

export const EMPTY_PREP: PrepInputs = {
  languageTest: "",
  clb: { listening: "", reading: "", writing: "", speaking: "" },
  educationRoute: "",
  ecaEquivalency: "",
  noc: "",
};

export const PREP_WEIGHTS = {
  language: 40,
  education: 20,
  occupation: 20,
  documents: 10,
  steps: 10,
} as const;

export const LANGUAGE_TEST_OPTIONS: { value: LanguageTestId; label: string }[] = [
  { value: "celpip", label: "CELPIP-General" },
  { value: "ielts", label: "IELTS General Training" },
  { value: "pte", label: "PTE Core" },
  { value: "tef", label: "TEF Canada" },
  { value: "tcf", label: "TCF Canada" },
];

export const LANGUAGE_ABILITIES: { key: LanguageAbility; label: string }[] = [
  { key: "listening", label: "Listening" },
  { key: "reading", label: "Reading" },
  { key: "writing", label: "Writing" },
  { key: "speaking", label: "Speaking" },
];

export const EDUCATION_ROUTE_OPTIONS: { value: EducationRoute; label: string }[] = [
  { value: "eca", label: "I have an ECA" },
  { value: "canadian", label: "All my education is Canadian" },
  { value: "", label: "Not started yet" },
];

export const ECA_EQUIVALENCY_OPTIONS: {
  value: EcaEquivalency;
  label: string;
}[] = [
  { value: "degree", label: "Bachelor's degree or higher" },
  { value: "diploma2", label: "Two-year program" },
  { value: "diploma1", label: "One-year program" },
  { value: "secondary", label: "Secondary school" },
  { value: "", label: "Not sure yet" },
];

export type ReadinessPart = {
  key: "language" | "education" | "occupation" | "documents" | "steps";
  label: string;
  earned: number;
  max: number;
  detail: string;
  fix: string | null;
};

export type ReadinessBand = {
  id: "ready" | "close" | "work" | "start";
  title: string;
  message: string;
};

export type Readiness = {
  score: number;
  band: ReadinessBand;
  parts: ReadinessPart[];
  teer: string | null;
  nextFix: ReadinessPart | null;
  inputsEntered: number;
};

const CLB_RATIO: Record<number, number> = {
  4: 0.12,
  5: 0.3,
  6: 0.5,
  7: 0.72,
  8: 0.85,
  9: 1,
  10: 1,
  11: 1,
  12: 1,
};

const EQUIVALENCY_RATIO: Record<Exclude<EcaEquivalency, "">, number> = {
  degree: 1,
  diploma2: 0.75,
  diploma1: 0.55,
  secondary: 0.25,
};

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function clbRatio(raw: string) {
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 4) return 0;
  return CLB_RATIO[Math.min(value, 12)] ?? 0;
}

export function parseTeer(noc: string) {
  const code = noc.trim();
  if (!/^\d{5}$/.test(code)) return null;
  const teer = code[1];
  return Number(teer) >= 0 && Number(teer) <= 5 ? teer : null;
}

function languagePart(inputs: PrepInputs): ReadinessPart {
  const max = PREP_WEIGHTS.language;
  const entered = LANGUAGE_ABILITIES.filter(
    (ability) => clbRatio(inputs.clb[ability.key]) > 0,
  );
  const ratio =
    entered.length === 0
      ? 0
      : LANGUAGE_ABILITIES.reduce(
          (total, ability) => total + clbRatio(inputs.clb[ability.key]),
          0,
        ) / LANGUAGE_ABILITIES.length;

  const detail =
    !inputs.languageTest
      ? "No approved test selected yet."
      : entered.length === 0
        ? "Test selected, but no CLB levels entered."
        : entered.length < LANGUAGE_ABILITIES.length
          ? `CLB entered for ${entered.length} of 4 abilities.`
          : "CLB entered for all four abilities.";

  const lowAbility = LANGUAGE_ABILITIES.find(
    (ability) => clbRatio(inputs.clb[ability.key]) < 0.72,
  );

  return {
    key: "language",
    label: "Language test",
    earned: round(max * ratio),
    max,
    detail,
    fix:
      entered.length === 0
        ? "Take an approved language test and enter your CLB levels."
        : lowAbility
          ? `Raise your ${lowAbility.label.toLowerCase()} CLB to 7 or higher if you can.`
          : null,
  };
}

function educationPart(inputs: PrepInputs): ReadinessPart {
  const max = PREP_WEIGHTS.education;

  if (inputs.educationRoute === "canadian") {
    return {
      key: "education",
      label: "Education",
      earned: max,
      max,
      detail: "Canadian education — no ECA needed.",
      fix: null,
    };
  }

  if (inputs.educationRoute === "eca" && inputs.ecaEquivalency) {
    const ratio = EQUIVALENCY_RATIO[inputs.ecaEquivalency];
    return {
      key: "education",
      label: "Education",
      earned: round(max * ratio),
      max,
      detail: "ECA on hand.",
      fix:
        ratio < 0.75
          ? "An ECA for a higher credential adds more points."
          : null,
    };
  }

  return {
    key: "education",
    label: "Education",
    earned: 0,
    max,
    detail:
      inputs.educationRoute === "eca"
        ? "ECA started, equivalency not entered."
        : "No ECA or Canadian education recorded.",
    fix: "Get an ECA from WES, ICAS, CES, IQAS or BCIT, or record that your education is Canadian.",
  };
}

function occupationPart(inputs: PrepInputs): ReadinessPart {
  const max = PREP_WEIGHTS.occupation;
  const teer = parseTeer(inputs.noc);
  const skilled = teer !== null && Number(teer) <= 3;

  return {
    key: "occupation",
    label: "Work and NOC",
    earned: teer === null ? 0 : skilled ? max : round(max * 0.2),
    max,
    detail:
      teer === null
        ? inputs.noc.trim()
          ? "That isn't a 5-digit NOC 2021 code."
          : "No NOC code entered."
        : `NOC 2021 code, TEER ${teer}.`,
    fix: teer === null
      ? "Find your 5-digit NOC 2021 code on the official NOC search."
      : skilled
        ? null
        : "TEER 4 or 5 work doesn't count as skilled work for FSW or CEC. Check which program fits you.",
  };
}

function documentsPart(ready: number, total: number): ReadinessPart {
  const max = PREP_WEIGHTS.documents;
  return {
    key: "documents",
    label: "Documents",
    earned: total > 0 ? round(max * Math.min(ready / total, 1)) : 0,
    max,
    detail:
      total > 0 ? `${ready} of ${total} documents marked ready.` : "No documents listed.",
    fix:
      total > ready
        ? "Work through the documents checklist in this section."
        : null,
  };
}

function stepsPart(done: number, total: number): ReadinessPart {
  const max = PREP_WEIGHTS.steps;
  return {
    key: "steps",
    label: "Guide steps",
    earned: total > 0 ? round(max * Math.min(done / total, 1)) : 0,
    max,
    detail: total > 0 ? `${done} of ${total} steps ticked.` : "No steps yet.",
    fix: done < total ? "Finish the preparation steps you haven't ticked." : null,
  };
}

function bandFor(score: number): ReadinessBand {
  if (score >= 85) {
    return {
      id: "ready",
      title: "Looks good",
      message:
        "Your preparation covers the main requirements. You can start the profile.",
    };
  }
  if (score >= 65) {
    return {
      id: "close",
      title: "Almost there",
      message:
        "Most of the groundwork is done. Fix the weak spot below before you submit a profile.",
    };
  }
  if (score >= 40) {
    return {
      id: "work",
      title: "Needs work",
      message:
        "Some core requirements are still missing. Fix them before you build the profile.",
    };
  }
  return {
    id: "start",
    title: "Not ready yet",
    message:
      "Start with the language test and the education assessment, then come back.",
  };
}

export function computeReadiness(
  inputs: PrepInputs,
  extras: {
    documentsReady: number;
    documentsTotal: number;
    stepsDone: number;
    stepsTotal: number;
  },
): Readiness {
  const parts: ReadinessPart[] = [
    languagePart(inputs),
    educationPart(inputs),
    occupationPart(inputs),
    documentsPart(extras.documentsReady, extras.documentsTotal),
    stepsPart(extras.stepsDone, extras.stepsTotal),
  ];

  const score = Math.round(
    parts.reduce((total, part) => total + part.earned, 0),
  );

  const nextFix =
    parts
      .filter((part) => part.fix && part.earned < part.max)
      .sort((a, b) => a.earned / a.max - b.earned / b.max)[0] ?? null;

  const inputsEntered =
    (inputs.languageTest ? 1 : 0) +
    LANGUAGE_ABILITIES.filter((ability) => inputs.clb[ability.key].trim()).length +
    (inputs.educationRoute ? 1 : 0) +
    (inputs.noc.trim() ? 1 : 0);

  return {
    score,
    band: bandFor(score),
    parts,
    teer: parseTeer(inputs.noc),
    nextFix,
    inputsEntered,
  };
}
