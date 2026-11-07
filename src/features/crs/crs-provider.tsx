import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/features/auth/auth-provider";
import { readLocalValue, removeLocalValue, writeLocalValue } from "@/lib/device-storage";
import { supabase } from "@/lib/supabase";

import type { CrsResult } from "./calculate";
import type { CrsInputs, ScoreBand } from "./rules";

export type SavedScore = {
  score: number;
  band: ScoreBand;
  result: CrsResult;
  inputs: CrsInputs;
  createdAt: string;
  source: "account" | "device";
};

type CrsContextValue = {
  latest: SavedScore | null;
  draft: CrsInputs | null;
  loading: boolean;
  hydrated: boolean;
  save: (
    result: CrsResult,
    inputs: CrsInputs,
  ) => Promise<{ synced: boolean }>;
  updateDraft: (inputs: CrsInputs) => void;
  clearDraft: () => void;
  clearAnswers: () => Promise<{ ok: boolean }>;
};

const CrsContext = createContext<CrsContextValue | null>(null);

function cacheKey(accountKey: string | null) {
  return accountKey
    ? `mapleroute.crs.account.${accountKey}`
    : "mapleroute.crs.preview";
}

function draftKey(accountKey: string | null) {
  return accountKey
    ? `mapleroute.crs.draft.${accountKey}`
    : "mapleroute.crs.draft.preview";
}

export function CrsProvider({ children }: { children: ReactNode }) {
  const { remoteUserId, accountKey, signedIn } = useAuth();
  const [latest, setLatest] = useState<SavedScore | null>(null);
  const [draft, setDraft] = useState<CrsInputs | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    if (!signedIn) {
      setLatest(null);
      setDraft(null);
      setLoading(false);
      setHydrated(true);
      return;
    }

    const fallback = readLocalValue<SavedScore>(cacheKey(accountKey));
    setDraft(readLocalValue<CrsInputs>(draftKey(accountKey)));
    setHydrated(true);

    async function load() {
      setLoading(true);

      if (remoteUserId && supabase) {
        const { data, error } = await supabase
          .from("crs_snapshots")
          .select("score, breakdown, inputs, created_at")
          .eq("user_id", remoteUserId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!active) return;

        if (!error && data) {
          const row = data as {
            score: number;
            breakdown: CrsResult;
            inputs: CrsInputs;
            created_at: string;
          };
          setLatest({
            score: row.score,
            band: row.breakdown?.band ?? fallback?.band ?? "low",
            result: row.breakdown,
            inputs: row.inputs,
            createdAt: row.created_at,
            source: "account",
          });
          setLoading(false);
          return;
        }
      }

      if (!active) return;
      setLatest(fallback);
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [remoteUserId, accountKey, signedIn]);

  const updateDraft = useCallback(
    (inputs: CrsInputs) => {
      writeLocalValue(draftKey(accountKey), inputs);
      setDraft(inputs);
    },
    [accountKey],
  );

  const clearDraft = useCallback(() => {
    removeLocalValue(draftKey(accountKey));
    setDraft(null);
  }, [accountKey]);

  const clearAnswers = useCallback(async () => {
    if (remoteUserId && supabase) {
      const { error } = await supabase
        .from("crs_snapshots")
        .delete()
        .eq("user_id", remoteUserId);

      if (error) return { ok: false };
    }

    removeLocalValue(cacheKey(accountKey));
    removeLocalValue(draftKey(accountKey));
    setLatest(null);
    setDraft(null);
    return { ok: true };
  }, [remoteUserId, accountKey]);

  const save = useCallback(
    async (result: CrsResult, inputs: CrsInputs) => {
      const entry: SavedScore = {
        score: result.total,
        band: result.band,
        result,
        inputs,
        createdAt: new Date().toISOString(),
        source: remoteUserId ? "account" : "device",
      };

      writeLocalValue(cacheKey(accountKey), entry);
      setLatest(entry);
      clearDraft();

      if (!remoteUserId || !supabase) {
        return { synced: false };
      }

      const { error } = await supabase.from("crs_snapshots").insert({
        user_id: remoteUserId,
        score: result.total,
        breakdown: result,
        inputs,
        rules_version: result.rulesVersion,
      });

      if (!error) {
        const syncedEntry: SavedScore = { ...entry, source: "account" };
        writeLocalValue(cacheKey(accountKey), syncedEntry);
        setLatest(syncedEntry);
        return { synced: true };
      }

      return { synced: false };
    },
    [remoteUserId, accountKey, clearDraft],
  );

  const value = useMemo(
    () => ({
      latest,
      draft,
      loading,
      hydrated,
      save,
      updateDraft,
      clearDraft,
      clearAnswers,
    }),
    [
      latest,
      draft,
      loading,
      hydrated,
      save,
      updateDraft,
      clearDraft,
      clearAnswers,
    ],
  );

  return <CrsContext.Provider value={value}>{children}</CrsContext.Provider>;
}

export function useCrs() {
  const value = useContext(CrsContext);
  if (!value) {
    throw new Error("useCrs must be used inside CrsProvider");
  }
  return value;
}
