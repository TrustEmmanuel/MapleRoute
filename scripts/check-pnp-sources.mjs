import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { PNP_LAST_VERIFIED, PNP_PROGRAMS } from "../src/features/pnp/provinces.ts";

const SNAPSHOT = resolve("data/pnp-sources.json");
const STALE_DAYS = 30;

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200_000);
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
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        "accept-language": "en-CA,en;q=0.9",
      },
    });
    if (!response.ok) return { status: response.status };
    const hash = createHash("sha256").update(textOf(await response.text())).digest("hex");
    return { status: response.status, hash };
  } catch (error) {
    return { status: 0, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

const snapshot = await loadSnapshot();
const write = process.argv.includes("--write");
const targets = PNP_PROGRAMS.flatMap((program) =>
  [program.url, program.streamLink?.url]
    .filter(Boolean)
    .map((url) => ({ code: program.code, name: program.name, url })),
);

const results = [];
for (let i = 0; i < targets.length; i += 4) {
  const batch = targets.slice(i, i + 4);
  results.push(
    ...(await Promise.all(batch.map(async (target) => ({ ...target, ...(await check(target.url)) })))),
  );
}

const changed = [];
const failed = [];
for (const result of results) {
  const previous = snapshot[result.url]?.hash;
  if (result.error || result.status >= 400) {
    failed.push(result);
    console.log(`FAIL  ${result.code}  ${result.status || result.error}  ${result.url}`);
    continue;
  }
  if (!previous) {
    console.log(`NEW   ${result.code}  ${result.url}`);
  } else if (previous !== result.hash) {
    changed.push(result);
    console.log(`DIFF  ${result.code}  ${result.url}  review and update provinces.ts`);
  } else {
    console.log(`SAME  ${result.code}  ${result.url}`);
  }
}

if (write) {
  const next = { ...snapshot };
  for (const result of results) {
    if (result.hash) next[result.url] = { hash: result.hash, checkedAt: new Date().toISOString() };
  }
  await mkdir(dirname(SNAPSHOT), { recursive: true });
  await writeFile(SNAPSHOT, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`\nWrote ${SNAPSHOT}`);
}

const age = (Date.now() - new Date(`${PNP_LAST_VERIFIED}T12:00:00`).getTime()) / 86_400_000;
if (age > STALE_DAYS) {
  console.log(`\nPNP_LAST_VERIFIED is ${Math.floor(age)} days old. Re-verify and bump it in provinces.ts.`);
}

console.log(`\n${results.length} pages checked, ${changed.length} changed, ${failed.length} failed.`);
if (changed.length > 0) process.exitCode = 1;
