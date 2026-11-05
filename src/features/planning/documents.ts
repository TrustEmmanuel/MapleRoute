export type DocumentKey = "passport" | "language" | "eca" | "police" | "medical";

export type DocumentDates = Partial<Record<DocumentKey, string>>;

export type DocumentHave = Partial<Record<DocumentKey, true>>;

export type DocumentScores = Partial<Record<DocumentKey, string>>;

type DeadlineKind = "useBefore" | "validUntil" | "submitBy" | "renewAfter";

export type DocumentRule = {
  key: DocumentKey;
  title: string;
  dateLabel: string;
  dateHelper: string;
  months: number;
  deadlineKind: DeadlineKind;
  deadlineLabel: string;
  okCopy: string;
  expiredCopy: string;
  quote: string;
  sourceUrl: string;
  sourceName: string;
  checkedOn: string;
  haveLabel?: string;
  note?: string;
  score?: { label: string; helper: string };
};

const CHECKED_ON = "2026-11-05";
const LANGUAGE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html";
const ECA_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessment.html";
const POLICE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/police-certificates.html";
const MEDICAL_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html";
const DOCUMENTS_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents.html";

export const DOCUMENT_RULES: DocumentRule[] = [
  {
    key: "passport",
    title: "Passport",
    dateLabel: "Expiry date",
    dateHelper: "The expiry date on the photo page.",
    months: 6,
    deadlineKind: "renewAfter",
    deadlineLabel: "Renew if you apply after",
    okCopy: "More than 6 months from expiry.",
    expiredCopy: "Past the expiry date on this passport.",
    quote:
      "“If your passport expires within 6 months from the day you apply, you should renew it.”",
    sourceUrl: DOCUMENTS_URL,
    sourceName: "canada.ca — Get your documents ready",
    checkedOn: CHECKED_ON,
  },
  {
    key: "language",
    title: "Language test results",
    dateLabel: "Test date",
    dateHelper: "The test date shown on your report.",
    months: 24,
    deadlineKind: "useBefore",
    deadlineLabel: "Use it before",
    okCopy: "Inside the 2-year window IRCC gives language results.",
    expiredCopy: "Past the 2-year window, so a newer test result is needed.",
    quote:
      "“Your test results must be less than 2 years old when you complete your Express Entry profile, and submit your application for permanent residence.”",
    sourceUrl: LANGUAGE_URL,
    sourceName: "canada.ca — Language testing",
    checkedOn: CHECKED_ON,
    haveLabel: "I have done this",
    note: "IELTS results expire after 2 years. IRCC only accepts them while they are less than 2 years old.",
    score: {
      label: "IELTS band score",
      helper: "Your overall band, from 1 to 9. Leave it empty if you took CELPIP, TEF or TCF.",
    },
  },
  {
    key: "eca",
    title: "Educational credential assessment (ECA)",
    dateLabel: "ECA date",
    dateHelper: "The issue date on your ECA report.",
    months: 60,
    deadlineKind: "useBefore",
    deadlineLabel: "Use it before",
    okCopy: "Inside the 5-year window IRCC gives ECAs.",
    expiredCopy: "Past the 5-year window, so a newer ECA is needed.",
    quote:
      "“Your ECA must be less than 5 years old when you: complete your Express Entry profile, and submit your application.”",
    sourceUrl: ECA_URL,
    sourceName: "canada.ca — Educational credential assessment",
    checkedOn: CHECKED_ON,
  },
  {
    key: "police",
    title: "Police certificate",
    dateLabel: "Issue date",
    dateHelper: "The issue date on the certificate for the country where you live now.",
    months: 6,
    deadlineKind: "submitBy",
    deadlineLabel: "Submit by",
    okCopy: "Issued within 6 months, as IRCC asks.",
    expiredCopy: "Older than 6 months before today, so a new certificate is needed.",
    quote:
      "“The police certificate for the country where you currently live must be issued no more than 6 months before the date you submit your application.”",
    sourceUrl: POLICE_URL,
    sourceName: "canada.ca — Police certificates",
    checkedOn: CHECKED_ON,
  },
  {
    key: "medical",
    title: "Medical exam",
    dateLabel: "Exam date",
    dateHelper: "The date of the exam, not the date the results arrived.",
    months: 12,
    deadlineKind: "validUntil",
    deadlineLabel: "Valid until",
    okCopy: "Inside the 12 months IRCC gives medical results.",
    expiredCopy: "Past the 12 months IRCC gives medical results.",
    quote: "“Your medical exam results are valid for 12 months.”",
    sourceUrl: MEDICAL_URL,
    sourceName: "canada.ca — Medical exam requirements",
    checkedOn: CHECKED_ON,
  },
];

const SOON_DAYS = 90;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function todayIso(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || year > 2100) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidBandScore(value: string) {
  return /^(?:[1-8](?:\.5)?|9(?:\.0)?)$/.test(value);
}

export function addMonthsIso(value: string, months: number) {
  const [year, month, day] = value.split("-").map(Number);
  const target = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
}

function dayNumber(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function daysUntil(deadline: string, today: string) {
  return Math.round((dayNumber(deadline) - dayNumber(today)) / 86_400_000);
}

export function formatDocumentDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type DocumentStatus =
  | { state: "empty" }
  | { state: "ok"; deadline: string; daysLeft: number }
  | { state: "soon"; deadline: string; daysLeft: number }
  | { state: "expired"; deadline: string; daysLeft: number };

export function documentDeadline(rule: DocumentRule, date: string) {
  return rule.deadlineKind === "renewAfter"
    ? addMonthsIso(date, -rule.months)
    : addMonthsIso(date, rule.months);
}

export function documentStatus(
  rule: DocumentRule,
  date: string | undefined,
  today: string,
): DocumentStatus {
  if (!date || !isValidDateInput(date)) return { state: "empty" };

  const deadline = documentDeadline(rule, date);
  const daysLeft = daysUntil(deadline, today);
  const expiresOn = rule.deadlineKind === "renewAfter" ? date : deadline;

  if (daysUntil(expiresOn, today) < 0) {
    return { state: "expired", deadline, daysLeft };
  }
  if (daysLeft <= SOON_DAYS) {
    return { state: "soon", deadline, daysLeft };
  }
  return { state: "ok", deadline, daysLeft };
}

export function statusHeadline(rule: DocumentRule, status: DocumentStatus) {
  if (status.state === "empty") return "No date yet";
  if (status.state === "expired") return "Expired";
  if (status.state === "soon") {
    return rule.deadlineKind === "renewAfter" ? "Renew before you apply" : "Due soon";
  }
  return "Good for now";
}

export function deadlineLine(
  rule: DocumentRule,
  date: string,
  status: DocumentStatus,
) {
  if (status.state === "empty") return "";
  if (rule.deadlineKind === "renewAfter") {
    if (status.state === "expired") return `Expired on ${formatDocumentDate(date)}`;
    if (status.daysLeft <= 0) return "Renew before you apply";
  }
  return `${rule.deadlineLabel} ${formatDocumentDate(status.deadline)}`;
}

export function statusDetail(
  rule: DocumentRule,
  date: string | undefined,
  status: DocumentStatus,
) {
  if (status.state === "empty" || !date) return "";
  if (status.state === "expired") return rule.expiredCopy;
  if (rule.deadlineKind === "renewAfter") {
    return `It expires on ${formatDocumentDate(date)}.`;
  }
  return rule.okCopy;
}

function countdownDays(days: number) {
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  if (days < 60) return `${days} days left`;
  if (days < 365) return `${Math.round(days / 30)} months left`;
  return `${Number((days / 365).toFixed(1))} years left`;
}

export function statusBadge(rule: DocumentRule, status: DocumentStatus) {
  if (status.state === "empty") return null;
  if (status.state === "expired") return "Expired";
  if (status.state === "soon") {
    return rule.deadlineKind === "renewAfter" ? "Renew" : countdownDays(status.daysLeft);
  }
  if (rule.deadlineKind === "renewAfter") return "Good for now";
  return countdownDays(status.daysLeft);
}

export type SavedDocument = {
  rule: DocumentRule;
  date: string;
  status: { state: "ok" | "soon" | "expired"; deadline: string; daysLeft: number };
};

export function planDocuments(dates: DocumentDates, today: string) {
  const saved: SavedDocument[] = [];
  for (const rule of DOCUMENT_RULES) {
    const date = dates[rule.key];
    const status = documentStatus(rule, date, today);
    if (date && status.state !== "empty") {
      saved.push({ rule, date, status });
    }
  }
  return saved;
}

export function nextDeadline(dates: DocumentDates, today: string): SavedDocument | null {
  const saved = planDocuments(dates, today);
  const upcoming = saved
    .filter((item) => item.status.state !== "expired")
    .sort((a, b) => a.status.deadline.localeCompare(b.status.deadline));
  return (
    upcoming[0] ??
    saved.find((item) => item.status.state === "expired") ??
    null
  );
}
