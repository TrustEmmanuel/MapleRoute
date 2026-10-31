export type GuideUpdateKind = "added" | "improved" | "rechecked";

export type GuideUpdate = {
  id: string;
  date: string;
  title: string;
  detail: string;
  kind: GuideUpdateKind;
};

// Newest first. These describe changes to MapleRoute itself, not IRCC news.
export const GUIDE_UPDATES: GuideUpdate[] = [
  {
    id: "2026-10-31-resume",
    date: "2026-10-31",
    title: "The guide now remembers where you stopped",
    detail:
      "Close the guide and come back later — it opens on the step you were last reading instead of starting again.",
    kind: "improved",
  },
  {
    id: "2026-10-31-strip",
    date: "2026-10-31",
    title: "CRS, prep score and steps done stay in view",
    detail:
      "A slim strip at the top of the guide shows your score, preparation score and progress as you tick steps.",
    kind: "improved",
  },
  {
    id: "2026-10-31-visuals",
    date: "2026-10-31",
    title: "All 53 steps now show the official screen",
    detail:
      "Added pictures for the acknowledgement of receipt, biometrics, application tracking, the COPR and travel to Canada. No step is text-only anymore.",
    kind: "added",
  },
  {
    id: "2026-10-29-post-ita",
    date: "2026-10-29",
    title: "Post-invitation steps added",
    detail:
      "Applying for permanent residence, the bridging open work permit, and what happens after approval are now part of the guide — 16 sections, 53 steps.",
    kind: "added",
  },
  {
    id: "2026-10-29-rechecked",
    date: "2026-10-29",
    title: "Every step re-checked against IRCC",
    detail:
      "We compared each step with the official canada.ca page and recorded the date of the check on the step itself.",
    kind: "rechecked",
  },
];

export function unseenUpdates(
  updates: GuideUpdate[],
  seenId: string | null,
): GuideUpdate[] {
  if (!seenId) return updates;
  const index = updates.findIndex((update) => update.id === seenId);
  return index === -1 ? updates : updates.slice(0, index);
}

export function formatUpdateDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
