import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

type InstallOutcome = "accepted" | "dismissed" | "unavailable";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PwaContextValue = {
  isWeb: boolean;
  canInstall: boolean;
  installed: boolean;
  iosInstall: boolean;
  offlineReady: boolean;
  promptInstall: () => Promise<InstallOutcome>;
};

const PwaContext = createContext<PwaContextValue | null>(null);

const PRODUCTION_WEB =
  Platform.OS === "web" && process.env.NODE_ENV === "production";

function isStandalone() {
  if (typeof window === "undefined") return false;
  const displayMode = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (
    window.navigator as Navigator & { standalone?: boolean }
  ).standalone;
  return Boolean(displayMode || iosStandalone === true);
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function addLink(rel: string, href: string) {
  if (document.head.querySelector(`link[rel="${rel}"]`)) return;
  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  document.head.appendChild(link);
}

function addMeta(name: string, content: string) {
  if (document.head.querySelector(`meta[name="${name}"]`)) return;
  const meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
}

// Expo's single-page web output does not read app/+html.tsx, so the install
// metadata is added to the live document instead.
function ensurePwaHead() {
  if (typeof document === "undefined") return;

  addLink("manifest", "/manifest.webmanifest");
  addLink("apple-touch-icon", "/icons/apple-touch-icon.png");
  addMeta("theme-color", "#D52B1E");
  addMeta(
    "description",
    "A step-by-step Express Entry guide with a CRS calculator, document dates and offline reading.",
  );
  addMeta("mobile-web-app-capable", "yes");
  addMeta("apple-mobile-web-app-capable", "yes");
  addMeta("apple-mobile-web-app-status-bar-style", "default");
  addMeta("apple-mobile-web-app-title", "MapleRoute");
}

function loadedResources() {
  if (typeof window === "undefined" || typeof performance === "undefined") {
    return { assets: [] as string[], images: [] as string[] };
  }

  const origin = window.location.origin;
  const assets = new Set<string>();
  const images = new Set<string>();

  for (const entry of performance.getEntriesByType("resource")) {
    if (!entry.name.startsWith(origin)) continue;
    const path = entry.name.slice(origin.length);
    if (path.startsWith("/guide/")) images.add(path);
    else if (path.startsWith("/_expo/") || path.startsWith("/assets/")) {
      assets.add(path);
    }
  }

  return { assets: [...assets], images: [...images] };
}

function postToWorker(worker: ServiceWorker | null, data: unknown) {
  worker?.postMessage(data);
}

function registerServiceWorker(onReady: () => void) {
  if (!PRODUCTION_WEB) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  const register = () => {
    void navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        await navigator.serviceWorker.ready;
        onReady();

        const worker =
          navigator.serviceWorker.controller ?? registration.active;
        const { assets, images } = loadedResources();
        postToWorker(worker, { type: "CACHE_PAGE_ASSETS", urls: assets });
        postToWorker(worker, { type: "CACHE_GUIDE_IMAGES", urls: images });
      })
      .catch(() => {
        // Offline reading is an enhancement; the app still works online.
      });
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

export function prefetchGuideImages(paths: string[]) {
  if (!PRODUCTION_WEB) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  const urls = [
    ...new Set(
      paths.filter((path) => typeof path === "string" && path.startsWith("/")),
    ),
  ];
  if (urls.length === 0) return;

  const controller = navigator.serviceWorker.controller;
  if (controller) {
    controller.postMessage({ type: "CACHE_GUIDE_IMAGES", urls });
    return;
  }

  void navigator.serviceWorker.ready
    .then((registration) =>
      postToWorker(registration.active, {
        type: "CACHE_GUIDE_IMAGES",
        urls,
      }),
    )
    .catch(() => {});
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const installEvent = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(isStandalone);
  const [offlineReady, setOfflineReady] = useState(false);
  const iosInstall = Platform.OS === "web" && isIosDevice() && !installed;

  useEffect(() => {
    if (Platform.OS !== "web") return;

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      installEvent.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    }

    function handleInstalled() {
      installEvent.current = null;
      setCanInstall(false);
      setInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    ensurePwaHead();

    const displayMode = window.matchMedia?.("(display-mode: standalone)");
    function handleDisplayMode() {
      if (displayMode?.matches) setInstalled(true);
    }
    displayMode?.addEventListener?.("change", handleDisplayMode);

    registerServiceWorker(() => setOfflineReady(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      displayMode?.removeEventListener?.("change", handleDisplayMode);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    const event = installEvent.current;
    if (!event) return "unavailable";

    installEvent.current = null;
    setCanInstall(false);

    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    return choice.outcome;
  }, []);

  const value = useMemo<PwaContextValue>(
    () => ({
      isWeb: Platform.OS === "web",
      canInstall,
      installed,
      iosInstall,
      offlineReady,
      promptInstall,
    }),
    [canInstall, installed, iosInstall, offlineReady, promptInstall],
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  const value = useContext(PwaContext);
  if (!value) {
    throw new Error("usePwa must be used inside PwaProvider");
  }
  return value;
}
