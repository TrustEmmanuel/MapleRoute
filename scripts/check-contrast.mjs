import { readFileSync } from "node:fs";

const tokens = JSON.parse(
  readFileSync(new URL("../src/theme/tokens.json", import.meta.url), "utf8"),
).colors;

function luminance(hex) {
  const channels = hex
    .replace("#", "")
    .match(/../g)
    .map((part) => parseInt(part, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );

  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
}

function contrast(foreground, background) {
  const [lighter, darker] = [
    luminance(foreground),
    luminance(background),
  ].sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
}

const checks = [
  ["ink", "canvas", 4.5, "Body text on canvas"],
  ["muted", "canvas", 4.5, "Muted text on canvas"],
  ["muted", "surface", 4.5, "Muted text on surface"],
  ["muted", "dangerSurface", 4.5, "Muted text on selected surface"],
  ["accent", "canvas", 4.5, "Accent text on canvas"],
  ["accent", "surface", 4.5, "Accent text on surface"],
  ["accent", "dangerSurface", 4.5, "Accent text on selected surface"],
  ["canvas", "accent", 4.5, "Button label on accent"],
  ["canvas", "accentPressed", 4.5, "Button label on pressed accent"],
  ["success", "canvas", 4.5, "Success text on canvas"],
  ["success", "successSurface", 4.5, "Success text on success surface"],
  ["warning", "warningSurface", 4.5, "Warning text on warning surface"],
  ["canvas", "success", 4.5, "Badge label on success"],
  ["canvas", "warning", 4.5, "Badge label on warning"],
  ["controlLine", "canvas", 3, "Control boundary on canvas"],
  ["controlLine", "surface", 3, "Control boundary on surface"],
  ["accent", "canvas", 3, "Keyboard focus ring"],
];

let failed = false;

for (const [foreground, background, minimum, label] of checks) {
  const ratio = contrast(tokens[foreground], tokens[background]);
  const pass = ratio >= minimum;
  if (!pass) failed = true;
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${ratio.toFixed(2)}:1  ${label} (${foreground} on ${background}, needs ${minimum}:1)`,
  );
}

if (failed) {
  console.error("\nContrast check failed.");
  process.exit(1);
}

console.log("\nAll WCAG AA contrast checks passed.");
