import { removeLocalValue } from "@/lib/device-storage";

const ACCOUNT_BASES = [
  "mapleroute.crs.account",
  "mapleroute.crs.draft",
  "mapleroute.guide.progress",
  "mapleroute.guide.documents",
  "mapleroute.guide.documents-later",
  "mapleroute.guide.notes",
  "mapleroute.guide.reports",
  "mapleroute.guide.prep",
  "mapleroute.guide.position",
  "mapleroute.documents.dates",
  "mapleroute.documents.have",
  "mapleroute.documents.scores",
  "mapleroute.checkin",
  "mapleroute.updates.seen",
];

export function clearAccountData(accountKey: string | null) {
  if (!accountKey) {
    removeLocalValue("mapleroute.crs.preview");
    removeLocalValue("mapleroute.crs.draft.preview");
    return;
  }

  for (const base of ACCOUNT_BASES) {
    removeLocalValue(`${base}.${accountKey}`);
  }
}
