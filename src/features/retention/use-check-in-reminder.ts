import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/auth-provider";
import { trackEvent } from "@/features/telemetry";
import { readLocalValue, removeLocalValue, writeLocalValue } from "@/lib/device-storage";

import { addDaysIso, todayIso } from "./check-in";

const REMINDER_KEY = "mapleroute.checkin";

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function useCheckInReminder() {
  const { accountKey } = useAuth();
  const storageKey = `${REMINDER_KEY}.${accountKey ?? "preview"}`;
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readLocalValue<unknown>(storageKey);
    setDueDate(isIsoDate(stored) ? stored : null);
    setReady(true);
  }, [storageKey]);

  const setInDays = useCallback(
    (days: number) => {
      const next = addDaysIso(days);
      trackEvent("checkin_set");
      writeLocalValue(storageKey, next);
      setDueDate(next);
      return next;
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    removeLocalValue(storageKey);
    setDueDate(null);
  }, [storageKey]);

  return {
    dueDate,
    ready,
    due: Boolean(dueDate && dueDate <= todayIso()),
    setInDays,
    clear,
  };
}
