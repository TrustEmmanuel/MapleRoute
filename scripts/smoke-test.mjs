import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const EDGE_CANDIDATES = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const checks = [];
let server;
let cdp;
let edge;
let profile;

function pass(name) {
  checks.push({ name, ok: true });
  console.log(`PASS  ${name}`);
}

function build() {
  console.log("Building web export…");
  const result = spawnSync("npx", ["expo", "export", "-p", "web"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
  });
  assert.equal(result.status, 0, "Web export failed");
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

function startServer() {
  server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const candidate = path.join(DIST, pathname);
    let file = candidate;

    if (file.startsWith(DIST) && fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, "index.html");
    }

    if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(DIST, "index.html");
    }

    const body = fs.readFileSync(file);
    response.writeHead(200, {
      "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": "/",
    });
    response.end(body);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

async function json(url) {
  const response = await fetch(url);
  return response.json();
}

async function waitFor(check, label, timeout = 25000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await check()) return;
    await sleep(200);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

class CDP {
  constructor(ws, origin) {
    this.ws = ws;
    this.origin = origin;
    this.id = 0;
    this.pending = new Map();
    this.requests = [];
    this.consoleErrors = [];
    this.exceptions = [];
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      if (message.method === "Network.requestWillBeSent") {
        this.requests.push(message.params.request.url);
      }
      if (message.method === "Runtime.exceptionThrown") {
        this.exceptions.push(
          message.params.exceptionDetails.exception?.description ??
            message.params.exceptionDetails.text,
        );
      }
      if (
        message.method === "Runtime.consoleAPICalled" &&
        message.params.type === "error"
      ) {
        this.consoleErrors.push(
          message.params.args
            .map((arg) => arg.value ?? arg.description ?? "")
            .join(" "),
        );
      }
      if (
        message.method === "Log.entryAdded" &&
        message.params.entry.level === "error"
      ) {
        this.consoleErrors.push(message.params.entry.text);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ??
          result.exceptionDetails.text,
      );
    }
    return result.result.value;
  }

  async navigate(pathname) {
    await this.send("Page.navigate", { url: `${this.origin}${pathname}` });
    await waitFor(
      () => this.evaluate('document.readyState === "complete"'),
      `load ${pathname}`,
    );
    await sleep(1800);
  }

  async reload() {
    await this.send("Page.reload", { ignoreCache: false });
    await waitFor(
      () => this.evaluate('document.readyState === "complete"'),
      "reload",
    );
    await sleep(1800);
  }

  async waitForText(text, timeout = 20000) {
    await waitFor(
      () =>
        this.evaluate(
          `document.body && document.body.innerText.includes(${JSON.stringify(text)})`,
        ),
      `text ${text}`,
      timeout,
    );
  }

  async click(label) {
    const clicked = await this.evaluate(`(() => {
      const target = ${JSON.stringify(label)};
      const el = [...document.querySelectorAll('[aria-label], [role="button"]')].find(
        (node) =>
          node.getAttribute('aria-label') === target ||
          (node.getAttribute('role') === 'button' &&
            node.textContent.trim() === target)
      );
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      el.click();
      return true;
    })()`);
    assert.ok(clicked, `Could not click "${label}"`);
  }
}

function findEdge() {
  const found = EDGE_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  assert.ok(found, "No Edge or Chrome executable found");
  return found;
}

async function main() {
  if (process.argv.includes("--build")) build();
  assert.ok(fs.existsSync(DIST), "dist/ is missing — run with --build");
  const port = await startServer();
  const origin = `http://127.0.0.1:${port}`;
  console.log(`Serving dist on ${origin}`);

  const manifestResponse = await fetch(`${origin}/manifest.webmanifest`);
  assert.equal(manifestResponse.status, 200, "Manifest did not load");
  const manifest = await manifestResponse.json();
  assert.ok(manifest.name?.includes("MapleRoute"), "Manifest has no name");
  assert.equal(manifest.display, "standalone", "Manifest is not installable");
  pass("web manifest is served and installable");

  const landingResponse = await fetch(`${origin}/crs-2026/`);
  assert.equal(landingResponse.status, 200, "CRS 2026 landing page did not load");
  const landing = await landingResponse.text();
  assert.match(landing, /<title>CRS 2026: Express Entry score and latest draw/, "Landing page title is missing");
  assert.match(landing, /name="description"/, "Landing page description is missing");
  assert.match(landing, /rel="canonical" href="\/crs-2026\/"/, "Landing page canonical is missing");
  assert.match(landing, /"@type": "FAQPage"/, "Landing page FAQ structured data is missing");
  assert.match(landing, /477/, "Landing page is missing the latest draw");
  assert.match(landing, /November 3, 2026/, "Landing page is missing the rule date");
  assert.match(landing, /href="\/crs"/, "Landing page does not link to the calculator");
  pass("CRS 2026 landing page is static, crawlable HTML");

  profile = path.join(
    process.env.TEMP ?? "/tmp",
    `mapleroute-smoke-${Date.now()}`,
  );
  fs.rmSync(profile, { recursive: true, force: true });

  const edgePath = findEdge();
  const debugPort = 9334;
  edge = spawn(
    edgePath,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  await waitFor(async () => {
    try {
      await json(`http://127.0.0.1:${debugPort}/json/version`);
      return true;
    } catch {
      return false;
    }
  }, "Edge debugging port");

  const targets = await json(`http://127.0.0.1:${debugPort}/json/list`);
  const page = targets.find((target) => target.type === "page");
  assert.ok(page, "No browser page target");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });
  cdp = new CDP(ws, origin);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Log.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await cdp.navigate("/");
  await waitFor(
    () => cdp.evaluate('location.pathname === "/login"'),
    "home redirect to login",
  );
  await cdp.waitForText("Sign in to see your next step");
  const loginTitle = await cdp.evaluate("document.title");
  assert.ok(loginTitle.includes("MapleRoute"), "Document title is not set");
  pass("signed-out visitors are sent to sign-in");

  await cdp.navigate("/crs");
  await waitFor(
    () => cdp.evaluate('location.pathname === "/login"'),
    "CRS redirect to login",
  );
  pass("CRS route is gated behind sign-in");

  const filled = await cdp.evaluate(`(() => {
    const inputs = [...document.querySelectorAll('input')];
    if (inputs.length < 2) return false;
    const setValue = (input, value) => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      ).set;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    setValue(inputs[0], 'smoke@example.com');
    setValue(inputs[1], 'smoke-test-123');
    return true;
  })()`);
  assert.ok(filled, "Login inputs were not found");
  await cdp.click("Sign in");
  await waitFor(
    () => cdp.evaluate('location.pathname !== "/login"'),
    "leave the login page",
  );
  await cdp.navigate("/");
  await cdp.waitForText("Get my score");
  pass("local account sign-in reaches the home page");

  await cdp.navigate("/crs");
  await cdp.waitForText("Calculate my score");
  pass("CRS form opens after sign-in");

  await cdp.click("Calculate my score");
  await waitFor(
    () =>
      cdp.evaluate(
        'document.body.innerText.toLowerCase().includes("your estimated crs score")',
      ),
    "CRS result",
  );
  const score = await cdp.evaluate(`(() => {
    const match = document.body.innerText.match(
      /your estimated crs score\\s+(\\d{2,4})/i
    );
    return match ? Number(match[1]) : null;
  })()`);
  assert.ok(score !== null && score > 0 && score <= 1200, "CRS score missing");
  pass(`CRS score calculates and saves (${score})`);

  await cdp.navigate("/");
  await cdp.waitForText("MapleRoute");
  await waitFor(
    () => cdp.evaluate('location.pathname === "/"'),
    "signed-in home page",
  );
  pass("home page renders for a signed-in user");

  await cdp.navigate("/crs");
  await waitFor(
    () =>
      cdp.evaluate(
        'document.body.innerText.toLowerCase().includes("your estimated crs score")',
      ),
    "saved CRS result",
  );
  await cdp.click("Clear answers");
  await cdp.waitForText("Clear your CRS answers?");
  await cdp.click("Yes, clear my answers");
  await cdp.waitForText("Calculate my score");
  await cdp.navigate("/");
  await waitFor(
    () =>
      cdp.evaluate(
        'document.body.innerText.toLowerCase().includes("crs not checked")',
      ),
    "cleared CRS state on home",
  );
  pass("clearing answers removes the saved score and returns to the form");

  await cdp.navigate("/express-entry");
  await cdp.waitForText("Express Entry");
  await waitFor(
    () => cdp.evaluate(`Boolean(document.querySelector('[role="checkbox"]'))`),
    "guide checkboxes",
  );
  const step = await cdp.evaluate(`(() => {
    const el = [...document.querySelectorAll('[role="checkbox"]')].find(
      (node) => node.getAttribute('aria-label') !== 'I have this ready'
    );
    if (!el) return null;
    return {
      label: el.getAttribute('aria-label'),
      checked: el.getAttribute('aria-checked') === 'true'
    };
  })()`);
  assert.ok(step?.label, "No guide step checkbox found");
  if (!step.checked) {
    await cdp.evaluate(`(() => {
      const el = [...document.querySelectorAll('[role="checkbox"]')].find(
        (node) => node.getAttribute('aria-label') === ${JSON.stringify(step.label)}
      );
      el.click();
    })()`);
  }
  await waitFor(
    () =>
      cdp.evaluate(`(() => {
        const el = [...document.querySelectorAll('[role="checkbox"]')].find(
          (node) => node.getAttribute('aria-label') === ${JSON.stringify(step.label)}
        );
        return el?.getAttribute('aria-checked') === 'true';
      })()`),
    "guide step checked",
  );
  await cdp.reload();
  await waitFor(
    () =>
      cdp.evaluate(`(() => {
        const el = [...document.querySelectorAll('[role="checkbox"]')].find(
          (node) => node.getAttribute('aria-label') === ${JSON.stringify(step.label)}
        );
        return el?.getAttribute('aria-checked') === 'true';
      })()`),
    "guide progress after reload",
  );
  pass("guide step toggles and survives a reload");

  const controlled = () =>
    cdp.evaluate(
      'Boolean(navigator.serviceWorker && navigator.serviceWorker.controller)',
    );
  try {
    await waitFor(controlled, "service worker control", 15000);
  } catch {
    await cdp.reload();
    await waitFor(controlled, "service worker control after reload", 15000);
  }
  pass("service worker registers and controls the page");

  await cdp.send("Network.emulateNetworkConditions", {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });
  await cdp.reload();
  await cdp.waitForText("Express Entry", 25000);
  const offline = await cdp.evaluate(`({
    offline: !navigator.onLine,
    path: location.pathname,
    hasGuide: document.body.innerText.includes("Express Entry"),
    hasOfflinePage: document.body.innerText.includes("You're offline")
  })`);
  assert.equal(offline.offline, true, "Browser did not go offline");
  assert.equal(offline.path, "/express-entry", "Offline reload lost the guide URL");
  assert.equal(offline.hasGuide, true, "Guide text did not render offline");
  assert.equal(offline.hasOfflinePage, false, "Offline fallback page was shown");
  pass("guide opens offline after one online visit");

  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });

  await cdp.evaluate("localStorage.clear(); sessionStorage.clear(); true");
  await cdp.navigate("/share?done=12&total=53&score=512");
  await cdp.waitForText("Making progress");
  const share = await cdp.evaluate(`({
    path: location.pathname,
    text: document.body.innerText
  })`);
  assert.equal(share.path, "/share", "Share page redirected away");
  assert.ok(share.text.includes("12"), "Share page is missing the step count");
  assert.ok(share.text.includes("53"), "Share page is missing the total");
  assert.ok(share.text.includes("CRS score"), "Share page is missing the score");
  assert.ok(share.text.includes("512"), "Share page is missing the score value");
  pass("public share card opens without a login");

  await cdp.click("How the 2026 CRS score works");
  await waitFor(
    () => cdp.evaluate('location.pathname === "/crs-2026/"'),
    "link to the CRS 2026 landing page",
  );
  await cdp.waitForText("CRS 2026");
  pass("share card links to the CRS 2026 landing page");

  await cdp.navigate("/privacy");
  await cdp.waitForText("Analytics and error reports");
  const privacy = await cdp.evaluate("document.body.innerText");
  assert.ok(privacy.includes("Umami"), "Privacy page does not name Umami");
  assert.ok(privacy.includes("Sentry"), "Privacy page does not name Sentry");
  pass("privacy policy covers analytics and error reports");

  await cdp.navigate("/terms");
  await cdp.waitForText("Terms of use");
  pass("terms page renders");

  await cdp.navigate("/accessibility");
  await cdp.waitForText("Accessibility");
  pass("accessibility statement renders");

  const telemetryRequests = cdp.requests.filter((request) =>
    /umami|sentry\.io|ingest\.sentry/.test(request),
  );
  assert.deepEqual(
    telemetryRequests,
    [],
    `Telemetry request made without credentials: ${telemetryRequests.join(", ")}`,
  );
  pass("telemetry stays off without credentials");

  assert.deepEqual(cdp.exceptions, [], "Uncaught page exception");
  pass("no uncaught page exceptions");

  console.log(`\n${checks.length}/${checks.length} smoke checks passed.`);
  if (cdp.consoleErrors.length > 0) {
    console.log("\nConsole errors observed:");
    for (const message of [...new Set(cdp.consoleErrors)]) {
      console.log(`- ${message}`);
    }
  }
}

try {
  await main();
} catch (error) {
  console.error(`\nFAILED: ${error.message}`);
  try {
    if (cdp) {
      console.error(
        "PAGE STATE:",
        await cdp.evaluate(`({
          href: location.href,
          text: document.body.innerText.slice(0, 800)
        })`),
      );
    }
  } catch {
    // ignore diagnostics failures
  }
  process.exitCode = 1;
} finally {
  try {
    cdp?.ws.close();
  } catch {
    // ignore
  }
  try {
    if (edge) {
      spawnSync("taskkill", ["/PID", String(edge.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    }
  } catch {
    // ignore
  }
  await sleep(800);
  if (profile) {
    try {
      fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
    } catch {
      // Edge can keep the profile locked briefly.
    }
  }
  await new Promise((resolve) => server?.close(resolve) ?? resolve());
}
