import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { createSeedGuide } from "../src/features/guide/seed.ts";

const SNAPSHOT = resolve("data/guide-sources.json");
const REPORT = resolve("data/guide-freshness.md");
const STALE_DAYS = 90;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

const guide = createSeedGuide();
const write = process.argv.includes("--write");
const now = new Date();

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi, " ")
    .replace(/\bdate modified\b\s*:?\s*\d{4}-\d{2}-\d{2}/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 250_000);
}

// Only the page content is hashed. The surrounding canada.ca navigation and
// footer change site-wide, which would otherwise flag every page at once.
function mainContentOf(html) {
  const match = html.match(/<main\b[\s\S]*?<\/main>/i);
  return match ? match[0] : html;
}

function titleOf(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

async function loadSnapshot() {
  try {
    return JSON.parse(await readFile(SNAPSHOT, "utf8"));
  } catch {
    return {};
  }
}

async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        "accept-language": "en-CA,en;q=0.9",
        accept: "text/html,application/xhtml+xml",
      },
    });
    if (!response.ok) return { status: response.status };
    const html = await response.text();
    const text = textOf(mainContentOf(html));
    if (text.length < 200) {
      return { status: response.status, error: "page content looked empty" };
    }
    return {
      status: response.status,
      finalUrl: response.url,
      title: titleOf(html),
      hash: createHash("sha256").update(text).digest("hex"),
      characters: text.length,
    };
  } catch (error) {
    return {
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

function roleLabel(roles) {
  if (roles.has("source") && roles.has("official")) {
    return "Official page and verification source";
  }
  return roles.has("source") ? "Verification source" : "Official page";
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysSince(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((now.getTime() - date.getTime()) / 86_400_000);
}

const targets = new Map();
for (const section of guide.sections) {
  for (const step of section.steps) {
    const pages = [
      ["source", step.sourceUrl],
      ["official", step.officialUrl],
    ];
    for (const [role, url] of pages) {
      if (!url) continue;
      let parsed;
      try {
        parsed = new URL(url);
      } catch {
        continue;
      }
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") continue;
      parsed.hash = "";
      const normalized = parsed.toString();
      const entry = targets.get(normalized) ?? {
        url: normalized,
        roles: new Set(),
        steps: [],
      };
      entry.roles.add(role);
      entry.steps.push({
        id: step.id,
        title: step.title,
        section: section.title,
        lastVerified: step.lastVerified,
      });
      targets.set(normalized, entry);
    }
  }
}

const targetList = [...targets.values()];
const results = [];
for (let i = 0; i < targetList.length; i += 4) {
  const batch = targetList.slice(i, i + 4);
  results.push(
    ...(await Promise.all(
      batch.map(async (target) => ({ ...target, ...(await check(target.url)) })),
    )),
  );
}

const snapshot = await loadSnapshot();
const changed = [];
const failed = [];
let unchanged = 0;
let added = 0;

for (const result of results) {
  const previous = snapshot[result.url]?.hash;
  if (result.error || result.status >= 400) {
    failed.push(result);
    console.log(`FAIL  ${result.status || result.error}  ${result.url}`);
    continue;
  }
  if (!previous) {
    added += 1;
    console.log(`NEW   ${result.url}`);
  } else if (previous !== result.hash) {
    changed.push(result);
    console.log(`DIFF  ${result.url}  review ${result.steps.length} step(s)`);
  } else {
    unchanged += 1;
    console.log(`SAME  ${result.url}`);
  }
}

const steps = guide.sections.flatMap((section) =>
  section.steps.map((step) => ({
    section: section.title,
    ...step,
    age: step.lastVerified ? daysSince(step.lastVerified) : null,
  })),
);
const stale = steps
  .filter((step) => step.age !== null && step.age > STALE_DAYS)
  .sort((a, b) => (b.age ?? 0) - (a.age ?? 0));
const undated = steps.filter((step) => !step.lastVerified);
const unsourced = steps.filter((step) => !step.sourceUrl);

const stamp = now
  .toISOString()
  .replace("T", " ")
  .replace(/\.\d+Z$/, " UTC");

const lines = [
  "# Guide freshness report",
  "",
  `Run: ${stamp}`,
  `Guide: ${guide.title} (version ${guide.version})`,
  `${results.length} pages · ${changed.length} changed · ${failed.length} failed · ${unchanged} unchanged · ${added} new`,
  `${steps.length} steps · ${stale.length} older than ${STALE_DAYS} days`,
  "",
  "This report detects that an official page changed. It does not decide whether the guide is still correct — open each page and compare it with the step text.",
  "",
];

if (changed.length > 0) {
  lines.push("## Pages that changed", "");
  for (const result of changed) {
    lines.push(`### ${result.title || result.url}`, "");
    lines.push(`<${result.url}>`, "");
    if (result.finalUrl && result.finalUrl !== result.url) {
      lines.push(`Redirects to <${result.finalUrl}>`, "");
    }
    lines.push(`Used as: ${roleLabel(result.roles)}`, "");
    for (const step of result.steps) {
      lines.push(
        `- [ ] ${step.section} → ${step.title} — last verified ${
          step.lastVerified ? formatDate(step.lastVerified) : "never"
        }`,
      );
    }
    lines.push(
      "",
      "If the guide still matches, bump `lastVerified` on those steps and run `npm run guide:sources -- --write`. If it changed, update the step and add an entry to `GUIDE_UPDATES`.",
      "",
    );
  }
} else {
  lines.push("## Pages that changed", "", "None since the last baseline.", "");
}

if (failed.length > 0) {
  lines.push("## Pages that could not be checked", "");
  for (const result of failed) {
    lines.push(`- <${result.url}> — ${result.error || `HTTP ${result.status}`}`);
    for (const step of result.steps) {
      lines.push(`  - ${step.section} → ${step.title}`);
    }
  }
  lines.push("");
}

if (stale.length > 0) {
  lines.push(`## Steps older than ${STALE_DAYS} days`, "");
  lines.push("| Section | Step | Last verified | Age |", "| --- | --- | --- | --- |");
  for (const step of stale) {
    lines.push(
      `| ${step.section} | ${step.title} | ${formatDate(step.lastVerified)} | ${step.age} days |`,
    );
  }
  lines.push("");
}

if (undated.length > 0) {
  lines.push("## Steps with no verification date", "");
  for (const step of undated) {
    lines.push(`- ${step.section} → ${step.title} (${step.id})`);
  }
  lines.push("");
}

if (unsourced.length > 0) {
  lines.push("## Steps with no source page", "");
  for (const step of unsourced) {
    lines.push(`- ${step.section} → ${step.title} (${step.id})`);
  }
  lines.push("");
}

await mkdir(dirname(REPORT), { recursive: true });
await writeFile(REPORT, `${lines.join("\n")}\n`);

if (write) {
  const next = {};
  for (const result of results) {
    if (result.hash) {
      next[result.url] = {
        hash: result.hash,
        title: result.title,
        checkedAt: now.toISOString(),
      };
    }
  }
  await mkdir(dirname(SNAPSHOT), { recursive: true });
  await writeFile(SNAPSHOT, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`\nWrote ${SNAPSHOT}`);
}

console.log(`\nWrote ${REPORT}`);
console.log(
  `${results.length} pages checked, ${changed.length} changed, ${failed.length} failed, ${stale.length} stale steps.`,
);
if (failed.length > 0) process.exitCode = 1;
else if (changed.length > 0 && !write) process.exitCode = 1;
