import raw from "../../../content/draws.json";

import { CRS_RULES } from "./rules";

export type LatestDraw = {
  score: number;
  drawName: string;
  drawDate: string;
  sourceUrl: string;
  lastVerified: string;
};

export const LATEST_DRAW: LatestDraw = {
  score: raw.score,
  drawName: raw.program,
  drawDate: raw.date,
  sourceUrl: raw.source_url,
  lastVerified: raw.last_verified,
};

export const DRAW_STALE_DAYS = 14;

export const DRAW_PAUSED_NOTE =
  "Draws were paused from Nov 3 while IRCC recalculated scores. Check the official page for the latest draw.";

export function daysSinceDraw(today = new Date()) {
  const draw = new Date(`${LATEST_DRAW.drawDate}T12:00:00`);
  const current = new Date(today);
  current.setHours(12, 0, 0, 0);
  const days = Math.floor((current.getTime() - draw.getTime()) / 86_400_000);
  return Number.isFinite(days) ? Math.max(0, days) : 0;
}

export function latestDrawNote(today = new Date()) {
  const current = new Date(today);
  current.setHours(12, 0, 0, 0);
  const draw = new Date(`${LATEST_DRAW.drawDate}T12:00:00`);
  const pauseStart = new Date(`${CRS_RULES.effectiveFrom}T12:00:00`);

  // IRCC paused rounds from the date the new rules took effect; the latest
  // draw is still the one held before the pause.
  if (current >= pauseStart && draw < pauseStart) return DRAW_PAUSED_NOTE;
  return daysSinceDraw(today) > DRAW_STALE_DAYS ? DRAW_PAUSED_NOTE : null;
}
