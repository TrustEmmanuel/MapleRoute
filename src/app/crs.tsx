import { Redirect } from "expo-router";
import { useState } from "react";

import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/features/auth/auth-provider";
import type { CrsResult } from "@/features/crs/calculate";
import { CrsForm } from "@/features/crs/crs-form";
import { useCrs } from "@/features/crs/crs-provider";
import { CrsResultView } from "@/features/crs/crs-result";
import { defaultCrsInputs } from "@/features/crs/options";
import type { CrsInputs } from "@/features/crs/rules";

export default function CrsScreen() {
  const {
    signedIn,
    previewMode,
    isLocalAccount,
    accountEmail,
    loading: authLoading,
  } = useAuth();
  const {
    latest,
    draft,
    loading: scoreLoading,
    hydrated,
    save,
    updateDraft,
    clearDraft,
  } = useCrs();
  const [editing, setEditing] = useState(false);
  const [synced, setSynced] = useState<boolean | null>(null);

  if (authLoading) return <LoadingScreen />;
  if (!signedIn) return <Redirect href="/login" />;
  if (!hydrated || (scoreLoading && !latest)) return <LoadingScreen />;

  const showingResult = Boolean(latest) && !editing && !draft;

  async function handleSubmit(inputs: CrsInputs, result: CrsResult) {
    const outcome = await save(result, inputs);
    setSynced(outcome.synced);
    setEditing(false);
  }

  if (showingResult && latest) {
    const syncNote = previewMode
      ? "Preview mode: this score is saved on this device only. Sign in to keep it with your account."
      : isLocalAccount
        ? `Saved to ${accountEmail ?? "this device"}. This account lives on this device until Supabase is connected.`
        : synced === false
          ? "Your score is saved on this device, but we couldn't sync it to your account yet."
          : null;

    return (
      <CrsResultView
        saved={latest}
        syncNote={syncNote}
        onEdit={() => setEditing(true)}
      />
    );
  }

  return (
    <CrsForm
      initial={draft ?? latest?.inputs ?? defaultCrsInputs()}
      hasExistingScore={Boolean(latest)}
      branchScore={
        latest ? { score: latest.score, band: latest.band } : null
      }
      onChangeDraft={updateDraft}
      onCancel={
        latest
          ? () => {
              clearDraft();
              setEditing(false);
            }
          : undefined
      }
      onSubmit={handleSubmit}
    />
  );
}
