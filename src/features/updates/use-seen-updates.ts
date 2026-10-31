import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/auth-provider";
import { readLocalValue, writeLocalValue } from "@/lib/device-storage";

import { GUIDE_UPDATES } from "./guide-updates";

const SEEN_KEY = "mapleroute.updates.seen";

export function useSeenUpdates() {
  const { accountKey } = useAuth();
  const storageKey = `${SEEN_KEY}.${accountKey ?? "preview"}`;
  const [seenId, setSeenId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readLocalValue<unknown>(storageKey);
    setSeenId(typeof stored === "string" ? stored : null);
    setReady(true);
  }, [storageKey]);

  const markSeen = useCallback(() => {
    const newest = GUIDE_UPDATES[0]?.id ?? null;
    if (!newest) return;
    writeLocalValue(storageKey, newest);
    setSeenId(newest);
  }, [storageKey]);

  return { seenId, ready, markSeen };
}
