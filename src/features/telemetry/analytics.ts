import {
  telemetryAllowed,
  UMAMI_DOMAINS,
  UMAMI_SCRIPT_URL,
  UMAMI_WEBSITE_ID,
} from "./config";
import { scrubText } from "./scrub";

export type TelemetryEvent =
  | "checkin_set"
  | "crs_completed"
  | "guide_step_done"
  | "guide_step_undone"
  | "share_clicked"
  | "share_copied"
  | "share_link_opened"
  | "share_whatsapp";

type TelemetryPropKey =
  | "route"
  | "source"
  | "steps_done"
  | "steps_total";

export type TelemetryProps = Partial<
  Record<TelemetryPropKey, string | number | boolean>
>;

type QueuedEvent = {
  name: TelemetryEvent;
  data?: TelemetryProps;
};

type Umami = {
  track: (name: string, data?: TelemetryProps) => void;
};

declare global {
  interface Window {
    umami?: Umami;
  }
}

const MAX_QUEUE = 20;
const ALLOWED_PROPS = new Set<TelemetryPropKey>([
  "route",
  "source",
  "steps_done",
  "steps_total",
]);

let started = false;
let queue: QueuedEvent[] = [];

function allowedScriptUrl(value: string) {
  try {
    const url = new URL(value);
    const local =
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    return url.protocol === "https:" || local ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeProps(props?: TelemetryProps) {
  if (!props) return undefined;

  const safe: TelemetryProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(key as TelemetryPropKey)) continue;
    if (
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean"
    ) {
      continue;
    }
    safe[key as TelemetryPropKey] =
      typeof value === "string" ? scrubText(value) : value;
  }

  return Object.keys(safe).length > 0 ? safe : undefined;
}

function flushQueue() {
  if (typeof window === "undefined" || !window.umami) return;

  const pending = queue;
  queue = [];
  for (const event of pending) {
    try {
      window.umami.track(event.name, event.data);
    } catch {
      // Analytics must never break the app.
    }
  }
}

export function initAnalytics() {
  if (started || !UMAMI_WEBSITE_ID || !telemetryAllowed()) return;
  started = true;

  if (typeof document === "undefined") return;

  const source = allowedScriptUrl(UMAMI_SCRIPT_URL);
  if (!source) return;

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-mapleroute-analytics="umami"]',
  );
  if (existing) {
    existing.addEventListener("load", flushQueue);
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.src = source;
  script.dataset.maplerouteAnalytics = "umami";
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  script.dataset.autoTrack = "true";
  script.dataset.excludeSearch = "true";
  script.dataset.excludeHash = "true";
  script.dataset.doNotTrack = "true";
  if (UMAMI_DOMAINS) script.dataset.domains = UMAMI_DOMAINS;
  script.addEventListener("load", flushQueue);
  script.addEventListener("error", () => {
    queue = [];
  });

  document.head.appendChild(script);
}

export function trackEvent(name: TelemetryEvent, props?: TelemetryProps) {
  if (!UMAMI_WEBSITE_ID || !telemetryAllowed()) return;

  initAnalytics();
  const data = safeProps(props);

  if (typeof window !== "undefined" && window.umami) {
    try {
      window.umami.track(name, data);
    } catch {
      // Analytics must never break the app.
    }
    return;
  }

  if (queue.length < MAX_QUEUE) queue.push({ name, data });
}
