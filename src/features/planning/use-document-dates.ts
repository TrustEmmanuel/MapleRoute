import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/auth-provider";
import { readLocalValue, writeLocalValue } from "@/lib/device-storage";

import {
  DOCUMENT_RULES,
  isValidDateInput,
  type DocumentDates,
  type DocumentKey,
} from "./documents";

const STORE_KEY = "mapleroute.documents.dates";

function sanitize(value: unknown): DocumentDates {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  const dates: DocumentDates = {};
  for (const rule of DOCUMENT_RULES) {
    const date = source[rule.key];
    if (typeof date === "string" && isValidDateInput(date)) {
      dates[rule.key] = date;
    }
  }
  return dates;
}

export function useDocumentDates() {
  const { accountKey } = useAuth();
  const storageKey = `${STORE_KEY}.${accountKey ?? "preview"}`;
  const [dates, setDates] = useState<DocumentDates>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    setDates(sanitize(readLocalValue<unknown>(storageKey)));
    setLoadedKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (loadedKey !== storageKey) return;
    writeLocalValue(storageKey, dates);
  }, [dates, loadedKey, storageKey]);

  const saveDate = useCallback((key: DocumentKey, value: string) => {
    if (!isValidDateInput(value)) return;
    setDates((previous) => ({ ...previous, [key]: value }));
  }, []);

  const clearDate = useCallback((key: DocumentKey) => {
    setDates((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }, []);

  return {
    dates,
    ready: loadedKey === storageKey,
    saveDate,
    clearDate,
  };
}
