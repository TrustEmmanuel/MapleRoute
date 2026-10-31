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
import { readLocalValue, writeLocalValue } from "@/lib/device-storage";
import { supabase, supabaseUrl } from "@/lib/supabase";

import { createEmptySection, createEmptyStep, createSeedGuide, GUIDE_SLUG } from "./seed";
import { EMPTY_PREP, type PrepInputs } from "./readiness";
import {
  checkedCount,
  isRemoteId,
  type Guide,
  type GuidePosition,
  type GuideSection,
  type GuideStep,
  type StepProgress,
  type StepReport,
} from "./types";

const CONTENT_KEY = "mapleroute.guide.content";
const AUTHOR_KEY = "mapleroute.guide.author";

const ADMIN_EMAILS = (process.env.EXPO_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

type GuideContextValue = {
  guide: Guide;
  hydrated: boolean;
  isAdmin: boolean;
  authorMode: boolean;
  remoteAdmin: boolean;
  setAuthorMode: (value: boolean) => void;
  progress: Record<string, StepProgress>;
  documents: Record<string, boolean>;
  notes: Record<string, string>;
  reports: StepReport[];
  prep: PrepInputs;
  setPrep: (next: PrepInputs) => void;
  position: GuidePosition | null;
  setPosition: (next: GuidePosition) => void;
  toggleStep: (stepId: string, checked: boolean) => void;
  setDocumentReady: (stepId: string, name: string, ready: boolean) => void;
  saveNote: (stepId: string, note: string) => void;
  reportStep: (stepId: string, note: string) => void;
  updateStep: (step: GuideStep) => void;
  addStep: (sectionId: string) => string;
  deleteStep: (stepId: string) => void;
  moveStep: (stepId: string, direction: -1 | 1) => void;
  updateSection: (section: GuideSection) => void;
  addSection: () => string;
  deleteSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: -1 | 1) => void;
  markSectionVerifiedToday: (sectionId: string) => {
    updated: number;
    skipped: number;
  };
  resetContent: () => void;
  importGuide: (input: unknown) => boolean;
  exportGuide: () => Guide;
  sectionCounts: (section: GuideSection) => {
    done: number;
    total: number;
  };
};

const GuideContext = createContext<GuideContextValue | null>(null);

function userKey(base: string, accountKey: string | null) {
  return accountKey ? `${base}.${accountKey}` : `${base}.preview`;
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asTextOrNull(value: unknown) {
  const text = asText(value).trim();
  return text ? text : null;
}

function asNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function pickOne<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const text = asText(value);
  return (allowed as readonly string[]).includes(text) ? (text as T) : fallback;
}

const LANGUAGE_TEST_IDS = ["", "celpip", "ielts", "pte", "tef", "tcf"] as const;
const EDUCATION_ROUTES = ["", "eca", "canadian"] as const;
const ECA_LEVELS = ["", "degree", "diploma2", "diploma1", "secondary"] as const;

function normalizePosition(value: unknown): GuidePosition | null {
  if (!isRecord(value)) return null;
  const sectionId = asText(value.sectionId).trim();
  if (!sectionId) return null;
  return { sectionId, stepId: asText(value.stepId).trim() || null };
}

function normalizePrep(value: unknown): PrepInputs {
  if (!isRecord(value)) return EMPTY_PREP;
  const clb = isRecord(value.clb) ? value.clb : {};

  return {
    languageTest: pickOne(value.languageTest, LANGUAGE_TEST_IDS, ""),
    clb: {
      listening: asText(clb.listening).slice(0, 2),
      reading: asText(clb.reading).slice(0, 2),
      writing: asText(clb.writing).slice(0, 2),
      speaking: asText(clb.speaking).slice(0, 2),
    },
    educationRoute: pickOne(value.educationRoute, EDUCATION_ROUTES, ""),
    ecaEquivalency: pickOne(value.ecaEquivalency, ECA_LEVELS, ""),
    noc: asText(value.noc).replace(/\D/g, "").slice(0, 5),
  };
}

function normalizeStep(
  value: unknown,
  sectionId: string,
  position: number,
): GuideStep | null {
  if (!isRecord(value)) return null;
  const title = asText(value.title).trim();
  if (!title) return null;

  const screenshots = Array.isArray(value.screenshots)
    ? value.screenshots.filter(isRecord).map((shot, index) => ({
        id: asText(shot.id) || newId(),
        storagePath: asText(shot.storagePath),
        altText: asText(shot.altText),
        position: asNumber(shot.position) ?? index,
        highlights: Array.isArray(shot.highlights)
          ? shot.highlights.filter(isRecord).map((box) => ({
              x: Number(box.x) || 0,
              y: Number(box.y) || 0,
              w: Number(box.w) || 0,
              h: Number(box.h) || 0,
              label: asTextOrNull(box.label) ?? undefined,
            }))
          : [],
      }))
    : [];

  return {
    id: asText(value.id) || newId(),
    sectionId,
    position,
    title,
    instruction: asText(value.instruction),
    fieldLabelOnOfficialPage: asTextOrNull(value.fieldLabelOnOfficialPage),
    officialPageName: asTextOrNull(value.officialPageName),
    officialUrl: asTextOrNull(value.officialUrl),
    extraLinks: Array.isArray(value.extraLinks)
      ? value.extraLinks.filter(isRecord).map((link) => ({
          label: asText(link.label),
          url: asText(link.url),
        }))
      : [],
    requiredDocuments: Array.isArray(value.requiredDocuments)
      ? value.requiredDocuments.filter(isRecord).map((document) => ({
          name: asText(document.name),
          description: asTextOrNull(document.description) ?? undefined,
          whereToGetIt: asTextOrNull(document.whereToGetIt) ?? undefined,
          link: asTextOrNull(document.link) ?? undefined,
        }))
      : [],
    commonMistakes: Array.isArray(value.commonMistakes)
      ? value.commonMistakes.filter((item): item is string => typeof item === "string")
      : [],
    boostTip: asTextOrNull(value.boostTip),
    personalizationKey: asTextOrNull(value.personalizationKey),
    status: value.status === "ready" ? "ready" : "draft",
    sourceUrl: asTextOrNull(value.sourceUrl),
    lastVerified: asTextOrNull(value.lastVerified),
    verifiedBy: asTextOrNull(value.verifiedBy),
    screenshots,
  };
}

function normalizeGuide(value: unknown): Guide | null {
  if (!isRecord(value) || !Array.isArray(value.sections)) return null;

  const sections: GuideSection[] = value.sections
    .filter(isRecord)
    .map((section, index) => {
      const id = asText(section.id) || newId();
      const steps = Array.isArray(section.steps)
        ? section.steps
            .filter(isRecord)
            .map((step, stepIndex) =>
              normalizeStep(step, id, asNumber(step.position) ?? stepIndex),
            )
            .filter((step): step is GuideStep => Boolean(step))
        : [];

      return {
        id,
        position: asNumber(section.position) ?? index,
        title: asText(section.title) || "Untitled section",
        summary: asTextOrNull(section.summary),
        estimatedMinutes: asNumber(section.estimatedMinutes),
        estimatedCostText: asTextOrNull(section.estimatedCostText),
        steps: steps
          .sort((a, b) => a.position - b.position)
          .map((step, stepIndex) => ({ ...step, position: stepIndex })),
      };
    })
    .sort((a, b) => a.position - b.position)
    .map((section, index) => ({ ...section, position: index }));

  return {
    id: asText(value.id) || "guide-express-entry",
    slug: asText(value.slug) || GUIDE_SLUG,
    title: asText(value.title) || "Create your Express Entry profile",
    description: asTextOrNull(value.description),
    version: asText(value.version) || "0.1.0",
    status: value.status === "ready" ? "ready" : "draft",
    sections,
  };
}

function isLegacyExampleGuide(guide: Guide | null) {
  if (!guide) return false;
  const steps = guide.sections.flatMap((section) => section.steps);
  return (
    steps.length === 1 &&
    steps[0].title.startsWith("EXAMPLE ONLY, NOT REAL CONTENT")
  );
}

// The walkthrough order changed in 0.6.0 (language test, ECA and NOC now come
// before the profile). Replace older stored seed copies so existing devices see
// the new order; per-step progress keys survive.
function isOutdatedSeedGuide(guide: Guide | null) {
  return (
    Boolean(guide) &&
    (isLegacyExampleGuide(guide) ||
      guide?.version === "0.2.0" ||
      guide?.version === "0.3.0" ||
      guide?.version === "0.4.0" ||
      guide?.version === "0.5.0" ||
      guide?.version === "0.6.0" ||
      guide?.version === "0.6.1" ||
      guide?.version === "0.6.2" ||
      guide?.version === "0.7.0" ||
      guide?.version === "0.8.0" ||
      guide?.version === "0.9.0" ||
      guide?.version === "0.10.0" ||
      guide?.version === "0.11.0" ||
      guide?.version === "0.12.0")
  );
}

type RemoteRow = Record<string, any>;

function mapRemoteGuide(row: RemoteRow): Guide | null {
  const sections = Array.isArray(row.guide_sections) ? row.guide_sections : [];

  return normalizeGuide({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    version: row.version,
    status: row.status,
    sections: sections.map((section: RemoteRow) => ({
      id: section.id,
      position: section.position,
      title: section.title,
      summary: section.summary,
      estimatedMinutes: section.estimated_minutes,
      estimatedCostText: section.estimated_cost_text,
      steps: (Array.isArray(section.guide_steps) ? section.guide_steps : []).map(
        (step: RemoteRow) => ({
          id: step.id,
          sectionId: step.section_id,
          position: step.position,
          title: step.title,
          instruction: step.instruction,
          fieldLabelOnOfficialPage: step.field_label_on_official_page,
          officialPageName: step.official_page_name,
          officialUrl: step.official_url,
          extraLinks: step.extra_links ?? [],
          requiredDocuments: step.required_documents ?? [],
          commonMistakes: step.common_mistakes ?? [],
          boostTip: step.boost_tip,
          personalizationKey: step.personalization_key,
          status: step.status,
          sourceUrl: step.source_url,
          lastVerified: step.last_verified,
          verifiedBy: step.verified_by,
          screenshots: (Array.isArray(step.step_screenshots)
            ? step.step_screenshots
            : []
          ).map((shot: RemoteRow) => ({
            id: shot.id,
            storagePath: asText(shot.storage_path).startsWith("http")
              ? shot.storage_path
              : `${supabaseUrl}/storage/v1/object/public/guide-screenshots/${shot.storage_path}`,
            altText: shot.alt_text,
            position: shot.position,
            highlights: shot.highlights ?? [],
          })),
        }),
      ),
    })),
  });
}

export function GuideProvider({ children }: { children: ReactNode }) {
  const { signedIn, accountKey, accountEmail, remoteUserId } = useAuth();

  const [guide, setGuide] = useState<Guide>(() => createSeedGuide());
  const [contentHydrated, setContentHydrated] = useState(false);
  const [userHydrated, setUserHydrated] = useState(false);
  const [remoteAdmin, setRemoteAdmin] = useState(false);
  const [authorMode, setAuthorModeState] = useState(false);
  const [progress, setProgress] = useState<Record<string, StepProgress>>({});
  const [documents, setDocuments] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [reports, setReports] = useState<StepReport[]>([]);
  const [prep, setPrepState] = useState<PrepInputs>(EMPTY_PREP);
  const [position, setPositionState] = useState<GuidePosition | null>(null);

  useEffect(() => {
    const stored = readLocalValue<unknown>(CONTENT_KEY);
    const normalized = normalizeGuide(stored);
    const replaceSeed = isOutdatedSeedGuide(normalized);
    const next = normalized && !replaceSeed ? normalized : createSeedGuide();
    if (replaceSeed) writeLocalValue(CONTENT_KEY, next);
    setGuide(next);
    setContentHydrated(true);
  }, []);

  useEffect(() => {
    setAuthorModeState(readLocalValue<boolean>(AUTHOR_KEY) ?? false);
  }, [accountKey]);

  useEffect(() => {
    if (!supabase || !remoteUserId) {
      setRemoteAdmin(false);
      return;
    }
    let active = true;
    void supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", remoteUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setRemoteAdmin(Boolean(data?.is_admin));
      });
    return () => {
      active = false;
    };
  }, [remoteUserId]);

  useEffect(() => {
    if (!contentHydrated || !supabase || !remoteUserId) return;
    let active = true;

    void (async () => {
      const { data, error } = await supabase
        .from("guides")
        .select(
          `id, slug, title, description, version, status,
           guide_sections (
             id, position, title, summary, estimated_minutes, estimated_cost_text,
             guide_steps (
               id, section_id, position, title, instruction,
               field_label_on_official_page, official_page_name, official_url,
               extra_links, required_documents, common_mistakes, boost_tip,
               personalization_key, status, source_url, last_verified, verified_by,
               step_screenshots ( id, storage_path, alt_text, position, highlights )
             )
           )`,
        )
        .eq("slug", GUIDE_SLUG)
        .maybeSingle();

      if (!active || error || !data) return;
      const remoteGuide = mapRemoteGuide(data as RemoteRow);
      if (remoteGuide && remoteGuide.sections.length > 0) {
        setGuide(remoteGuide);
      }
    })();

    return () => {
      active = false;
    };
  }, [contentHydrated, remoteUserId]);

  useEffect(() => {
    let active = true;

    if (!signedIn) {
      setProgress({});
      setDocuments({});
      setNotes({});
      setReports([]);
      setPrepState(EMPTY_PREP);
      setPositionState(null);
      setUserHydrated(true);
      return;
    }

    const progressStored =
      readLocalValue<Record<string, StepProgress>>(
        userKey("mapleroute.guide.progress", accountKey),
      ) ?? {};
    const documentsStored =
      readLocalValue<Record<string, boolean>>(
        userKey("mapleroute.guide.documents", accountKey),
      ) ?? {};
    const notesStored =
      readLocalValue<Record<string, string>>(
        userKey("mapleroute.guide.notes", accountKey),
      ) ?? {};
    const reportsStored =
      readLocalValue<StepReport[]>(
        userKey("mapleroute.guide.reports", accountKey),
      ) ?? [];
    const prepStored = normalizePrep(
      readLocalValue<unknown>(userKey("mapleroute.guide.prep", accountKey)),
    );
    const positionStored = normalizePosition(
      readLocalValue<unknown>(userKey("mapleroute.guide.position", accountKey)),
    );

    setProgress(progressStored);
    setDocuments(documentsStored);
    setNotes(notesStored);
    setReports(reportsStored);
    setPrepState(prepStored);
    setPositionState(positionStored);
    setUserHydrated(true);

    if (!supabase || !remoteUserId) return;

    void (async () => {
      const [progressResult, notesResult] = await Promise.all([
        supabase
          .from("user_step_progress")
          .select("step_id, checked, checked_at")
          .eq("user_id", remoteUserId),
        supabase
          .from("user_notes")
          .select("step_id, note")
          .eq("user_id", remoteUserId),
      ]);

      if (!active) return;

      if (!progressResult.error && progressResult.data?.length) {
        const merged = { ...progressStored };
        for (const row of progressResult.data as RemoteRow[]) {
          merged[String(row.step_id)] = {
            checked: Boolean(row.checked),
            checkedAt: row.checked_at ?? null,
          };
        }
        setProgress(merged);
        writeLocalValue(userKey("mapleroute.guide.progress", accountKey), merged);
      }

      if (!notesResult.error && notesResult.data?.length) {
        const merged = { ...notesStored };
        for (const row of notesResult.data as RemoteRow[]) {
          merged[String(row.step_id)] = asText(row.note);
        }
        setNotes(merged);
        writeLocalValue(userKey("mapleroute.guide.notes", accountKey), merged);
      }
    })();

    return () => {
      active = false;
    };
  }, [signedIn, accountKey, remoteUserId]);

  const authorEmail = accountEmail?.toLowerCase() ?? "";
  const isAdmin =
    remoteAdmin || authorMode || (authorEmail ? ADMIN_EMAILS.includes(authorEmail) : false);

  const setAuthorMode = useCallback((value: boolean) => {
    setAuthorModeState(value);
    writeLocalValue(AUTHOR_KEY, value);
  }, []);

  const mutateGuide = useCallback((mutator: (current: Guide) => Guide) => {
    setGuide((current) => {
      const next = mutator(current);
      writeLocalValue(CONTENT_KEY, next);
      return next;
    });
  }, []);

  const toggleStep = useCallback(
    (stepId: string, checked: boolean) => {
      const entry: StepProgress = {
        checked,
        checkedAt: checked ? new Date().toISOString() : null,
      };
      setProgress((current) => {
        const next = { ...current, [stepId]: entry };
        writeLocalValue(userKey("mapleroute.guide.progress", accountKey), next);
        return next;
      });

      if (supabase && remoteUserId && isRemoteId(stepId)) {
        void supabase
          .from("user_step_progress")
          .upsert(
            {
              user_id: remoteUserId,
              step_id: stepId,
              checked,
              checked_at: entry.checkedAt,
            },
            { onConflict: "user_id,step_id" },
          )
          .then(() => undefined);
      }
    },
    [accountKey, remoteUserId],
  );

  const setDocumentReady = useCallback(
    (stepId: string, name: string, ready: boolean) => {
      const key = `${stepId}::${name}`;
      setDocuments((current) => {
        const next = { ...current, [key]: ready };
        writeLocalValue(userKey("mapleroute.guide.documents", accountKey), next);
        return next;
      });
    },
    [accountKey],
  );

  const setPrep = useCallback(
    (next: PrepInputs) => {
      const safe = normalizePrep(next);
      setPrepState(safe);
      writeLocalValue(userKey("mapleroute.guide.prep", accountKey), safe);
    },
    [accountKey],
  );

  const setPosition = useCallback(
    (next: GuidePosition) => {
      setPositionState(next);
      writeLocalValue(userKey("mapleroute.guide.position", accountKey), next);
    },
    [accountKey],
  );

  const saveNote = useCallback(
    (stepId: string, note: string) => {
      const trimmed = note.trim();
      setNotes((current) => {
        const next = { ...current, [stepId]: trimmed };
        writeLocalValue(userKey("mapleroute.guide.notes", accountKey), next);
        return next;
      });

      if (supabase && remoteUserId && isRemoteId(stepId)) {
        void supabase
          .from("user_notes")
          .upsert(
            {
              user_id: remoteUserId,
              step_id: stepId,
              note: trimmed,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,step_id" },
          )
          .then(() => undefined);
      }
    },
    [accountKey, remoteUserId],
  );

  const reportStep = useCallback(
    (stepId: string, note: string) => {
      const report: StepReport = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `report-${Date.now()}`,
        stepId,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      };

      setReports((current) => {
        const next = [report, ...current].slice(0, 50);
        writeLocalValue(userKey("mapleroute.guide.reports", accountKey), next);
        return next;
      });

      if (supabase && remoteUserId && isRemoteId(stepId)) {
        void supabase
          .from("step_reports")
          .insert({ user_id: remoteUserId, step_id: stepId, note: report.note })
          .then(() => undefined);
      }
    },
    [accountKey, remoteUserId],
  );

  const updateStep = useCallback(
    (step: GuideStep) => {
      const safeStep =
        step.status === "ready" &&
        (!step.sourceUrl?.trim() || !step.lastVerified?.trim())
          ? { ...step, status: "draft" as const }
          : step;

      mutateGuide((current) => ({
        ...current,
        sections: current.sections.map((section) =>
          section.id === safeStep.sectionId
            ? {
                ...section,
                steps: section.steps.map((item) =>
                  item.id === safeStep.id ? safeStep : item,
                ),
              }
            : section,
        ),
      }));
    },
    [mutateGuide],
  );

  const addStep = useCallback(
    (sectionId: string) => {
      const currentSection = guide.sections.find(
        (section) => section.id === sectionId,
      );
      const step = createEmptyStep(sectionId, currentSection?.steps.length ?? 0);
      mutateGuide((current) => ({
        ...current,
        sections: current.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            steps: [
              ...section.steps,
              { ...step, position: section.steps.length },
            ],
          };
        }),
      }));
      return step.id;
    },
    [guide, mutateGuide],
  );

  const deleteStep = useCallback(
    (stepId: string) => {
      mutateGuide((current) => ({
        ...current,
        sections: current.sections.map((section) => ({
          ...section,
          steps: section.steps
            .filter((step) => step.id !== stepId)
            .map((step, index) => ({ ...step, position: index })),
        })),
      }));
    },
    [mutateGuide],
  );

  const moveStep = useCallback(
    (stepId: string, direction: -1 | 1) => {
      mutateGuide((current) => ({
        ...current,
        sections: current.sections.map((section) => {
          const index = section.steps.findIndex((step) => step.id === stepId);
          if (index === -1) return section;
          const target = index + direction;
          if (target < 0 || target >= section.steps.length) return section;
          const steps = [...section.steps];
          [steps[index], steps[target]] = [steps[target], steps[index]];
          return {
            ...section,
            steps: steps.map((step, stepIndex) => ({
              ...step,
              position: stepIndex,
            })),
          };
        }),
      }));
    },
    [mutateGuide],
  );

  const updateSection = useCallback(
    (section: GuideSection) => {
      mutateGuide((current) => ({
        ...current,
        sections: current.sections.map((item) =>
          item.id === section.id ? { ...section } : item,
        ),
      }));
    },
    [mutateGuide],
  );

  const addSection = useCallback(() => {
    const section = createEmptySection(guide.sections.length);
    mutateGuide((current) => ({
      ...current,
      sections: [
        ...current.sections,
        { ...section, position: current.sections.length },
      ],
    }));
    return section.id;
  }, [guide, mutateGuide]);

  const deleteSection = useCallback(
    (sectionId: string) => {
      mutateGuide((current) => ({
        ...current,
        sections: current.sections
          .filter((section) => section.id !== sectionId)
          .map((section, index) => ({ ...section, position: index })),
      }));
    },
    [mutateGuide],
  );

  const moveSection = useCallback(
    (sectionId: string, direction: -1 | 1) => {
      mutateGuide((current) => {
        const index = current.sections.findIndex(
          (section) => section.id === sectionId,
        );
        const target = index + direction;
        if (index === -1 || target < 0 || target >= current.sections.length) {
          return current;
        }
        const sections = [...current.sections];
        [sections[index], sections[target]] = [sections[target], sections[index]];
        return {
          ...current,
          sections: sections.map((section, position) => ({
            ...section,
            position,
          })),
        };
      });
    },
    [mutateGuide],
  );

  const markSectionVerifiedToday = useCallback(
    (sectionId: string) => {
      const today = new Date().toISOString().slice(0, 10);
      const section = guide.sections.find((item) => item.id === sectionId);
      const updated =
        section?.steps.filter((step) => Boolean(step.sourceUrl?.trim())).length ??
        0;
      const skipped = (section?.steps.length ?? 0) - updated;

      mutateGuide((current) => ({
        ...current,
        sections: current.sections.map((item) => {
          if (item.id !== sectionId) return item;
          return {
            ...item,
            steps: item.steps.map((step) =>
              step.sourceUrl?.trim() ? { ...step, lastVerified: today } : step,
            ),
          };
        }),
      }));

      return { updated, skipped };
    },
    [guide, mutateGuide],
  );

  const resetContent = useCallback(() => {
    const seed = createSeedGuide();
    mutateGuide(() => seed);
  }, [mutateGuide]);

  const importGuide = useCallback(
    (input: unknown) => {
      const next = normalizeGuide(input);
      if (!next) return false;
      mutateGuide(() => next);
      return true;
    },
    [mutateGuide],
  );

  const exportGuide = useCallback(() => guide, [guide]);

  const sectionCounts = useCallback(
    (section: GuideSection) => {
      const steps = isAdmin
        ? section.steps
        : section.steps.filter(
            (step) =>
              step.status === "ready" &&
              Boolean(step.sourceUrl) &&
              Boolean(step.lastVerified),
          );
      return { done: checkedCount(steps, progress), total: steps.length };
    },
    [isAdmin, progress],
  );

  const value = useMemo<GuideContextValue>(
    () => ({
      guide,
      hydrated: contentHydrated && userHydrated,
      isAdmin,
      authorMode,
      remoteAdmin,
      setAuthorMode,
      progress,
      documents,
      notes,
      reports,
      prep,
      setPrep,
      position,
      setPosition,
      toggleStep,
      setDocumentReady,
      saveNote,
      reportStep,
      updateStep,
      addStep,
      deleteStep,
      moveStep,
      updateSection,
      addSection,
      deleteSection,
      moveSection,
      markSectionVerifiedToday,
      resetContent,
      importGuide,
      exportGuide,
      sectionCounts,
    }),
    [
      guide,
      contentHydrated,
      userHydrated,
      isAdmin,
      authorMode,
      remoteAdmin,
      setAuthorMode,
      progress,
      documents,
      notes,
      reports,
      prep,
      setPrep,
      position,
      setPosition,
      toggleStep,
      setDocumentReady,
      saveNote,
      reportStep,
      updateStep,
      addStep,
      deleteStep,
      moveStep,
      updateSection,
      addSection,
      deleteSection,
      moveSection,
      markSectionVerifiedToday,
      resetContent,
      importGuide,
      exportGuide,
      sectionCounts,
    ],
  );

  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
}

export function useGuide() {
  const value = useContext(GuideContext);
  if (!value) {
    throw new Error("useGuide must be used inside GuideProvider");
  }
  return value;
}
