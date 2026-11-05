import { Platform } from "react-native";

function readEnv(value: string | undefined) {
  const trimmed = (value ?? "").trim();
  // Keep telemetry off when .env.example is copied without real values.
  return trimmed.startsWith("REPLACE_WITH_") ? "" : trimmed;
}

export const UMAMI_WEBSITE_ID = readEnv(
  process.env.EXPO_PUBLIC_UMAMI_WEBSITE_ID,
);

export const UMAMI_SCRIPT_URL =
  readEnv(process.env.EXPO_PUBLIC_UMAMI_SCRIPT_URL) ||
  "https://cloud.umami.is/script.js";

export const UMAMI_DOMAINS = readEnv(
  process.env.EXPO_PUBLIC_UMAMI_DOMAINS,
);

export const SENTRY_DSN = readEnv(process.env.EXPO_PUBLIC_SENTRY_DSN);

export const TELEMETRY_ENV =
  readEnv(process.env.EXPO_PUBLIC_TELEMETRY_ENV) ||
  (process.env.NODE_ENV === "production" ? "production" : "development");

export const APP_VERSION =
  readEnv(process.env.EXPO_PUBLIC_APP_VERSION) || "0.1.0";

export function telemetryAllowed() {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return false;

  const nav = navigator as Navigator & {
    doNotTrack?: string | null;
    globalPrivacyControl?: boolean;
  };
  const windowDnt =
    typeof window === "undefined"
      ? null
      : (window as Window & { doNotTrack?: string | null }).doNotTrack;
  const dnt = nav.doNotTrack ?? windowDnt;

  if (dnt === "1" || dnt === "yes") return false;
  if (nav.globalPrivacyControl === true) return false;

  return true;
}
