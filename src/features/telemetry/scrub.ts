import type { Breadcrumb, Event } from "@sentry/browser";

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const LONG_NUMBER = /\b\d{7,}\b/g;
const ABSOLUTE_URL = /https?:\/\/[^\s"'<>]+/gi;
const RELATIVE_PATH =
  /(^|[\s("'=])(\/[^\s"'<>?#]*)[?#][^\s"'<>]*/g;
const MAX_TEXT = 500;

function redactTokens(value: string) {
  return value.replace(EMAIL, "[email]").replace(LONG_NUMBER, "[number]");
}

export function scrubText(value: string) {
  const withoutUrls = value.replace(ABSOLUTE_URL, (match) => scrubUrl(match));
  const withoutSearch = withoutUrls.replace(
    RELATIVE_PATH,
    (_match, prefix: string, path: string) => `${prefix}${path}`,
  );
  return redactTokens(withoutSearch).slice(0, MAX_TEXT);
}

export function scrubUrl(value: string) {
  try {
    const url = new URL(value, "https://mapleroute.invalid");
    url.search = "";
    url.hash = "";
    url.username = "";
    url.password = "";
    const safe =
      url.origin === "https://mapleroute.invalid"
        ? url.pathname
        : url.toString();
    return redactTokens(safe).slice(0, MAX_TEXT);
  } catch {
    return redactTokens(value.split("?")[0].split("#")[0]).slice(0, MAX_TEXT);
  }
}

function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  const data = { ...(breadcrumb.data ?? {}) };
  for (const key of ["url", "from", "to"]) {
    if (typeof data[key] === "string") data[key] = scrubUrl(data[key]);
  }
  if (typeof data.message === "string") data.message = scrubText(data.message);

  return {
    ...breadcrumb,
    message: breadcrumb.message ? scrubText(breadcrumb.message) : undefined,
    data,
  };
}

export function scrubEvent<T extends Event>(event: T): T {
  if (event.request) {
    event.request = {
      url: event.request.url ? scrubUrl(event.request.url) : undefined,
    };
  }

  event.user = undefined;
  event.extra = undefined;
  if (event.contexts) {
    delete event.contexts.culture;
    delete event.contexts.trace;
  }
  event.message = event.message ? scrubText(event.message) : event.message;
  if (event.logentry?.message) {
    event.logentry.message = scrubText(event.logentry.message);
  }
  if (event.transaction) {
    event.transaction = scrubUrl(event.transaction);
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(scrubBreadcrumb);
  }
  if (event.exception?.values) {
    event.exception.values = event.exception.values.map((exception) => ({
      ...exception,
      value: exception.value ? scrubText(exception.value) : exception.value,
    }));
  }
  if (event.contexts?.react?.componentStack) {
    event.contexts.react.componentStack = scrubText(
      String(event.contexts.react.componentStack),
    );
  }

  return event;
}
