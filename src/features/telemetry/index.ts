import { initAnalytics } from "./analytics";
import { initErrorMonitoring } from "./errors";

export { trackEvent, type TelemetryEvent, type TelemetryProps } from "./analytics";
export { captureError } from "./errors";

export function initTelemetry() {
  initAnalytics();
  initErrorMonitoring();
}
