import { View } from "react-native";

import { ChoiceGroup } from "@/components/ui/choice-group";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { colors } from "@/theme/theme";

import {
  ECA_EQUIVALENCY_OPTIONS,
  EDUCATION_ROUTE_OPTIONS,
  LANGUAGE_ABILITIES,
  LANGUAGE_TEST_OPTIONS,
  type PrepInputs,
} from "./readiness";

const PREP_STEP_IDS = new Set([
  "step-language-test",
  "step-eca",
  "step-find-noc",
]);

export function hasPrepInputs(stepId: string) {
  return PREP_STEP_IDS.has(stepId);
}

export function PrepInputsPanel({
  stepId,
  prep,
  teer,
  checked,
  onChange,
}: {
  stepId: string;
  prep: PrepInputs;
  teer: string | null;
  checked: boolean;
  onChange: (next: PrepInputs) => void;
}) {
  if (!hasPrepInputs(stepId)) return null;

  const nocInvalid = prep.noc.length > 0 && prep.noc.length !== 5;

  return (
    <View className="mt-7 rounded-card border border-line bg-surface p-4">
      <Text variant="heading">Add what you have so far</Text>
      <Text variant="small" tone="muted" className="mt-1">
        {checked
          ? "Step ticked. Add your result here and the score updates."
          : "Done on the official side? Tick the step first, then add your result here."}
      </Text>

      {stepId === "step-language-test" ? (
        <View className="mt-4">
          <SelectField
            label="Which test did you take?"
            value={prep.languageTest}
            options={LANGUAGE_TEST_OPTIONS}
            onChange={(languageTest) => onChange({ ...prep, languageTest })}
            helper="Pick the test printed on your report."
          />
          <View className="mt-4 flex-row flex-wrap gap-3">
            {LANGUAGE_ABILITIES.map((ability) => (
              <View key={ability.key} className="min-w-[140px] flex-1">
                <TextField
                  label={`${ability.label} CLB`}
                  value={prep.clb[ability.key]}
                  onChangeText={(value) =>
                    onChange({
                      ...prep,
                      clb: {
                        ...prep.clb,
                        [ability.key]: value.replace(/\D/g, "").slice(0, 2),
                      },
                    })
                  }
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="7"
                />
              </View>
            ))}
          </View>
          <Text variant="small" tone="muted" className="mt-2">
            Use the CLB level printed next to each ability on your report.
            Missing an ability? Leave it blank.
          </Text>
        </View>
      ) : null}

      {stepId === "step-eca" ? (
        <View className="mt-4">
          <ChoiceGroup
            label="Where are you with your education assessment?"
            value={prep.educationRoute}
            options={EDUCATION_ROUTE_OPTIONS}
            onChange={(educationRoute) =>
              onChange({
                ...prep,
                educationRoute,
                ecaEquivalency:
                  educationRoute === "eca" ? prep.ecaEquivalency : "",
              })
            }
          />
          {prep.educationRoute === "eca" ? (
            <View className="mt-4">
              <SelectField
                label="What does the ECA say?"
                value={prep.ecaEquivalency}
                options={ECA_EQUIVALENCY_OPTIONS}
                onChange={(ecaEquivalency) =>
                  onChange({ ...prep, ecaEquivalency })
                }
                helper="Pick the Canadian equivalent printed on your ECA report."
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {stepId === "step-find-noc" ? (
        <View className="mt-4">
          <TextField
            label="Your 5-digit NOC 2021 code"
            value={prep.noc}
            onChangeText={(value) =>
              onChange({ ...prep, noc: value.replace(/\D/g, "").slice(0, 5) })
            }
            keyboardType="number-pad"
            maxLength={5}
            placeholder="21232"
            error={nocInvalid ? "A NOC 2021 code has exactly 5 digits." : null}
            helper="Example: 21232. The second digit is the TEER level."
          />
          {teer !== null ? (
            <View
              className="mt-3 flex-row items-center gap-2.5 rounded-control px-3.5 py-3"
              style={{
                backgroundColor:
                  Number(teer) <= 3 ? colors.successSurface : colors.warningSurface,
              }}
            >
              <View
                className="rounded-full px-2 py-0.5"
                style={{
                  backgroundColor:
                    Number(teer) <= 3 ? colors.success : colors.warning,
                }}
              >
                <Text
                  variant="small"
                  className="font-inter-semibold"
                  style={{ color: "#FFFFFF", fontSize: 11, lineHeight: 15 }}
                >
                  TEER {teer}
                </Text>
              </View>
              <Text variant="small" className="flex-1">
                {Number(teer) <= 3
                  ? "This is skilled work for Federal Skilled Worker and Canadian Experience Class."
                  : "TEER 4 or 5 doesn't count as skilled work for FSW or CEC."}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
