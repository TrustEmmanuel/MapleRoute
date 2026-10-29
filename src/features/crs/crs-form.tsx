import { useState, type ReactNode } from "react";
import { Linking, View } from "react-native";

import { BrandLockup } from "@/components/brand";
import { CrsScoreBadge } from "@/components/crs-score-badge";
import { Disclaimer } from "@/components/disclaimer";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceGroup } from "@/components/ui/choice-group";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";

import type { CrsResult } from "./calculate";
import { calculateCrs } from "./calculate";
import {
  CANADIAN_EDUCATION_OPTIONS,
  CLB_OPTIONS,
  EDUCATION_OPTIONS,
  FOREIGN_WORK_OPTIONS,
  SECOND_LANGUAGE_OPTIONS,
  SPOUSE_LANGUAGE_OPTIONS,
  WORK_YEARS_OPTIONS,
} from "./options";
import {
  ABILITIES,
  CRS_RULES,
  type Ability,
  type ClbBand,
  type CrsInputs,
  type ScoreBand,
  type SecondLanguageBand,
  type SpouseLanguageBand,
} from "./rules";

type CrsFormProps = {
  initial: CrsInputs;
  hasExistingScore: boolean;
  branchScore?: { score: number; band: ScoreBand } | null;
  onSubmit: (inputs: CrsInputs, result: CrsResult) => Promise<void>;
  onChangeDraft?: (inputs: CrsInputs) => void;
  onCancel?: () => void;
};

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

function FormSection({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="mt-4 p-5">
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Text variant="heading" className="mt-1.5">
        {title}
      </Text>
      {description ? (
        <Text variant="small" tone="muted" className="mt-1.5">
          {description}
        </Text>
      ) : null}
      <View className="mt-5 gap-5">{children}</View>
    </Card>
  );
}

export function CrsForm({
  initial,
  hasExistingScore,
  branchScore,
  onSubmit,
  onChangeDraft,
  onCancel,
}: CrsFormProps) {
  const [inputs, setInputs] = useState<CrsInputs>(() => {
    const years = initial.foreignWorkYears as string;
    if (years === "threePlus") {
      return { ...initial, foreignWorkYears: "threeToFive" };
    }
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);

  function commit(next: CrsInputs) {
    setInputs(next);
    onChangeDraft?.(next);
  }

  function update<K extends keyof CrsInputs>(key: K, value: CrsInputs[K]) {
    commit({ ...inputs, [key]: value });
  }

  function updateLanguage<B extends ClbBand | SecondLanguageBand>(
    group: "firstLanguage" | "secondLanguage",
    ability: Ability,
    band: B,
  ) {
    commit({ ...inputs, [group]: { ...inputs[group], [ability]: band } });
  }

  function updateSpouseLanguage(ability: Ability, band: SpouseLanguageBand) {
    commit({
      ...inputs,
      spouseFirstLanguage: {
        ...(inputs.spouseFirstLanguage ?? {
          reading: "below5",
          writing: "below5",
          speaking: "below5",
          listening: "below5",
        }),
        [ability]: band,
      },
    });
  }

  async function handleCalculate() {
    const age = Math.min(45, Math.max(17, Math.round(inputs.age) || 30));
    const normalized: CrsInputs = { ...inputs, age };
    const result = calculateCrs(normalized);
    commit(normalized);
    setSubmitting(true);
    try {
      await onSubmit(normalized, result);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between pt-1">
        {branchScore ? (
          <CrsScoreBadge score={branchScore.score} band={branchScore.band} />
        ) : (
          <BrandLockup />
        )}
        <View className="rounded-full border border-line px-2.5 py-1">
          <Text variant="label" tone="muted">
            CRS check
          </Text>
        </View>
      </View>

      <View className="mt-8">
        <Text variant="label" tone="accent">
          {hasExistingScore ? "Update your answers" : "First step"}
        </Text>
        <Text variant="title" className="mt-2">
          Check your CRS score
        </Text>
        <Text variant="body" tone="muted" className="mt-2">
          Your Comprehensive Ranking System score ranks you in the Express Entry
          pool. Answer every question using your real profile. We filled in
          common starting answers — change them all.
        </Text>
      </View>

      <Card variant="muted" className="mt-5 p-4">
        <Text variant="small" tone="muted">
          This estimate uses IRCC&apos;s CRS rules in force until November 2,
          2026. Job offer points are not included. IRCC adds high-wage
          occupation points on November 3, 2026.
        </Text>
        <Text
          variant="small"
          className="mt-2 font-inter-semibold text-ink underline"
          onPress={() => void Linking.openURL(CRS_RULES.sourceUrl)}
        >
          Read the official criteria
        </Text>
      </Card>

      <FormSection
        label="About you"
        title="Age, education and status"
        description="These are the largest core factors in your score."
      >
        <ChoiceGroup
          label="Spouse or common-law partner"
          value={inputs.maritalStatus}
          options={[
            { value: "single", label: "No accompanying spouse" },
            { value: "withSpouse", label: "Spouse is coming with me" },
          ]}
          onChange={(value) => update("maritalStatus", value)}
          helper="Choose the first option if you have no spouse, your spouse is a Canadian citizen or PR, or they are not coming with you."
        />
        <TextField
          label="Age"
          value={inputs.age ? String(inputs.age) : ""}
          onChangeText={(text) =>
            update("age", Number(text.replace(/[^0-9]/g, "")) || 0)
          }
          onBlur={() =>
            update("age", Math.min(45, Math.max(17, inputs.age || 30)))
          }
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={2}
          placeholder="30"
          helper="Points are highest between ages 20 and 29."
        />
        <SelectField
          label="Highest level of education"
          value={inputs.education}
          options={EDUCATION_OPTIONS}
          onChange={(value) => update("education", value)}
          helper="Count only education you completed and can prove."
        />
      </FormSection>

      <FormSection
        label="Language"
        title="Official language ability"
        description="Use the lowest result across your four abilities. This version assumes English is your first official language. CLB is the Canadian Language Benchmark."
      >
        {ABILITIES.map((ability) => (
          <SelectField
            key={`first-${ability}`}
            label={`First language — ${ability}`}
            value={inputs.firstLanguage[ability]}
            options={CLB_OPTIONS}
            onChange={(value) => updateLanguage("firstLanguage", ability, value)}
          />
        ))}

        <ChoiceGroup
          label="Second official language"
          value={inputs.hasSecondLanguage ? "yes" : "no"}
          options={[...YES_NO]}
          onChange={(value) => update("hasSecondLanguage", value === "yes")}
          helper="French or English, whichever is not your first official language."
        />

        {inputs.hasSecondLanguage
          ? ABILITIES.map((ability) => (
              <SelectField
                key={`second-${ability}`}
                label={`Second language — ${ability}`}
                value={inputs.secondLanguage[ability]}
                options={SECOND_LANGUAGE_OPTIONS}
                onChange={(value) =>
                  updateLanguage("secondLanguage", ability, value)
                }
              />
            ))
          : null}
      </FormSection>

      <FormSection
        label="Work"
        title="Work experience"
        description="Canadian work experience must be paid, skilled work in Canada within the last 10 years."
      >
        <SelectField
          label="Canadian work experience"
          value={inputs.canadianWorkYears}
          options={WORK_YEARS_OPTIONS}
          onChange={(value) => update("canadianWorkYears", value)}
        />
        <SelectField
          label="Foreign work experience"
          value={inputs.foreignWorkYears}
          options={FOREIGN_WORK_OPTIONS}
          onChange={(value) => update("foreignWorkYears", value)}
          helper="Skilled work outside Canada in the last 10 years. IRCC awards the same points for 3 or more years, so 6+ does not raise your score above 3–5."
        />
        <ChoiceGroup
          label="Certificate of qualification"
          value={inputs.certificateOfQualification ? "yes" : "no"}
          options={[...YES_NO]}
          onChange={(value) =>
            update("certificateOfQualification", value === "yes")
          }
          helper="A Canadian trade certificate issued by a provincial or territorial authority."
        />
      </FormSection>

      {inputs.maritalStatus === "withSpouse" ? (
        <FormSection
          label="Spouse"
          title="Your spouse or partner"
          description="These points count only if your spouse or partner is coming to Canada with you."
        >
          <SelectField
            label="Spouse's education"
            value={inputs.spouseEducation ?? "bachelor"}
            options={EDUCATION_OPTIONS}
            onChange={(value) => update("spouseEducation", value)}
          />
          {ABILITIES.map((ability) => (
            <SelectField
              key={`spouse-${ability}`}
              label={`Spouse's first language — ${ability}`}
              value={inputs.spouseFirstLanguage?.[ability] ?? "below5"}
              options={SPOUSE_LANGUAGE_OPTIONS}
              onChange={(value) => updateSpouseLanguage(ability, value)}
            />
          ))}
          <SelectField
            label="Spouse's Canadian work experience"
            value={inputs.spouseCanadianWorkYears ?? "none"}
            options={WORK_YEARS_OPTIONS}
            onChange={(value) => update("spouseCanadianWorkYears", value)}
          />
        </FormSection>
      ) : null}

      <FormSection
        label="Bonus points"
        title="Additional factors"
        description="These can add a large number of points. Select only what you can prove."
      >
        <ChoiceGroup
          label="Brother or sister in Canada"
          value={inputs.siblingInCanada ? "yes" : "no"}
          options={[...YES_NO]}
          onChange={(value) => update("siblingInCanada", value === "yes")}
          helper="18 or older, and a Canadian citizen or permanent resident."
        />
        <ChoiceGroup
          label="French language skills"
          value={inputs.frenchNclb7 ? "yes" : "no"}
          options={[...YES_NO]}
          onChange={(value) => update("frenchNclb7", value === "yes")}
          helper="NCLC 7 or higher in all four French abilities."
        />
        <SelectField
          label="Post-secondary education in Canada"
          value={inputs.canadianEducation}
          options={CANADIAN_EDUCATION_OPTIONS}
          onChange={(value) => update("canadianEducation", value)}
        />
        <ChoiceGroup
          label="Provincial or territorial nomination"
          value={inputs.provincialNomination ? "yes" : "no"}
          options={[...YES_NO]}
          onChange={(value) => update("provincialNomination", value === "yes")}
          helper="Only if a province or territory has already nominated you."
        />
      </FormSection>

      <Button
        className="mt-6"
        label="Calculate my score"
        loading={submitting}
        loadingLabel="Calculating…"
        onPress={() => void handleCalculate()}
      />
      {hasExistingScore && onCancel ? (
        <Button
          className="mt-3"
          variant="secondary"
          label="Back to my score"
          onPress={onCancel}
        />
      ) : null}

      <Text variant="small" tone="muted" className="mt-5">
        This is an estimate, not an official IRCC decision. Always confirm your
        score with IRCC before acting.
      </Text>

      <Disclaimer className="mt-8" />
    </Screen>
  );
}

export default CrsForm;
