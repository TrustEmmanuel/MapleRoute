import { CRS_MAX } from "@/features/crs/rules";

export type SharePlan = {
  done: number;
  total: number;
  score: number | null;
};

const MAX_STEPS = 500;

export function normalizePlan(input: {
  done: number;
  total: number;
  score?: number | null;
}): SharePlan | null {
  if (!Number.isFinite(input.total)) return null;
  const total = Math.round(input.total);
  if (total < 1 || total > MAX_STEPS) return null;

  const done = Math.min(
    Math.max(Math.round(Number.isFinite(input.done) ? input.done : 0), 0),
    total,
  );
  const roundedScore =
    input.score !== null &&
    input.score !== undefined &&
    Number.isFinite(input.score)
      ? Math.round(input.score)
      : null;
  const score =
    roundedScore !== null && roundedScore >= 0 && roundedScore <= CRS_MAX
      ? roundedScore
      : null;

  return { done, total, score };
}

type ParamValue = string | string[] | undefined;

function toNumber(value: ParamValue): number | null {
  const raw = (Array.isArray(value) ? value[0] : value)?.trim();
  if (!raw || !/^\d{1,4}$/.test(raw)) return null;
  return Number(raw);
}

export function parseSharePlan(params: {
  done?: ParamValue;
  total?: ParamValue;
  score?: ParamValue;
}): SharePlan | null {
  const total = toNumber(params.total);
  if (total === null) return null;
  return normalizePlan({
    done: toNumber(params.done) ?? 0,
    total,
    score: toNumber(params.score),
  });
}

export function shareText(plan: SharePlan) {
  const steps = `${plan.done} of ${plan.total} steps`;
  return plan.score === null
    ? `My Express Entry plan — ${steps}`
    : `My Express Entry plan — ${steps}, CRS ${plan.score}`;
}

export function shareUrl(plan: SharePlan) {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";
  const query = new URLSearchParams({
    done: String(plan.done),
    total: String(plan.total),
  });
  if (plan.score !== null) query.set("score", String(plan.score));
  return `${origin}/share?${query.toString()}`;
}

export function shareMessage(plan: SharePlan) {
  return `${shareText(plan)}.\n${shareUrl(plan)}`;
}

export function whatsappUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
