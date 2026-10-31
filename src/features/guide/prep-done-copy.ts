export type PrepDoneCopy = {
  label: string;
  description: string;
};

const COPY: Record<string, PrepDoneCopy> = {
  "step-language-test": {
    label: "I've taken an approved language test",
    description:
      "Tick once you have your official test report. Add your CLB levels below.",
  },
  "step-eca": {
    label: "I have my ECA report",
    description:
      "Tick once the report arrives, or if your education is Canadian. Record the outcome below.",
  },
  "step-find-noc": {
    label: "I've found my NOC code",
    description:
      "Tick once you've matched your job duties to a 5-digit NOC code. Add the code below.",
  },
  "step-prepare-documents": {
    label: "I've gathered my documents",
    description:
      "Tick when the files or reference numbers are nearby and ready to use.",
  },
};

export function prepDoneCopy(stepId: string): PrepDoneCopy | null {
  return COPY[stepId] ?? null;
}
