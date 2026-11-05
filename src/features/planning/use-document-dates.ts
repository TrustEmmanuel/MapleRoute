import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/auth-provider";
import { readLocalValue, writeLocalValue } from "@/lib/device-storage";

import {
  DOCUMENT_RULES,
  isValidBandScore,
  isValidDateInput,
  type DocumentDates,
  type DocumentHave,
  type DocumentKey,
  type DocumentScores,
} from "./documents";

const STORE_KEY = "mapleroute.documents.dates";
const HAVE_KEY = "mapleroute.documents.have";
const SCORE_KEY = "mapleroute.documents.scores";

function sanitizeHave(value: unknown): DocumentHave {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  const have: DocumentHave = {};
  for (const rule of DOCUMENT_RULES) {
    if (source[rule.key] === true) {
      have[rule.key] = true;
    }
  }
  return have;
}

function sanitizeScores(value: unknown): DocumentScores {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  const scores: DocumentScores = {};
  for (const rule of DOCUMENT_RULES) {
    const score = source[rule.key];
    if (typeof score === "string" && isValidBandScore(score)) {
      scores[rule.key] = score;
    }
  }
  return scores;
}

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
  const haveStorageKey = `${HAVE_KEY}.${accountKey ?? "preview"}`;
  const scoreStorageKey = `${SCORE_KEY}.${accountKey ?? "preview"}`;
  const [dates, setDates] = useState<DocumentDates>({});
  const [have, setHave] = useState<DocumentHave>({});
  const [scores, setScores] = useState<DocumentScores>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadedHaveKey, setLoadedHaveKey] = useState<string | null>(null);
  const [loadedScoreKey, setLoadedScoreKey] = useState<string | null>(null);

  useEffect(() => {
    setDates(sanitize(readLocalValue<unknown>(storageKey)));
    setHave(sanitizeHave(readLocalValue<unknown>(haveStorageKey)));
    setScores(sanitizeScores(readLocalValue<unknown>(scoreStorageKey)));
    setLoadedKey(storageKey);
    setLoadedHaveKey(haveStorageKey);
    setLoadedScoreKey(scoreStorageKey);
  }, [storageKey, haveStorageKey, scoreStorageKey]);

  useEffect(() => {
    if (loadedKey !== storageKey) return;
    writeLocalValue(storageKey, dates);
  }, [dates, loadedKey, storageKey]);

  useEffect(() => {
    if (loadedHaveKey !== haveStorageKey) return;
    writeLocalValue(haveStorageKey, have);
  }, [have, loadedHaveKey, haveStorageKey]);

  useEffect(() => {
    if (loadedScoreKey !== scoreStorageKey) return;
    writeLocalValue(scoreStorageKey, scores);
  }, [scores, loadedScoreKey, scoreStorageKey]);

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

  const toggleHave = useCallback((key: DocumentKey) => {
    setHave((previous) => {
      const next = { ...previous };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  }, []);

  const saveScore = useCallback((key: DocumentKey, value: string | null) => {
    setScores((previous) => {
      const next = { ...previous };
      if (value && isValidBandScore(value)) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
  }, []);

  return {
    dates,
    have,
    scores,
    ready:
      loadedKey === storageKey &&
      loadedHaveKey === haveStorageKey &&
      loadedScoreKey === scoreStorageKey,
    saveDate,
    clearDate,
    toggleHave,
    saveScore,
  };
}
