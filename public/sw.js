const VERSION = "mapleroute-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const IMAGE_CACHE = `${VERSION}-images`;

const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

const OFFLINE_PAGE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MapleRoute is offline</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #ffffff; color: #1f1f23; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px; }
      main { max-width: 360px; text-align: center; }
      h1 { font-size: 22px; line-height: 1.3; margin: 0 0 12px; }
      p { color: #5c5c66; line-height: 1.5; margin: 0 0 20px; }
      button { border: 0; border-radius: 10px; background: #d52b1e; color: #fff; font-size: 16px; font-weight: 600; padding: 14px 22px; }
    </style>
  </head>
  <body>
    <main>
      <h1>You're offline</h1>
      <p>MapleRoute needs one online visit to save the guide on this device. Reconnect, open the guide once, then it will work offline.</p>
      <button type="button" onclick="location.reload()">Try again</button>
    </main>
  </body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(
        SHELL_URLS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch {
            // A missing optional file must not block installation.
          }
        }),
      );

      try {
        const shell = await cache.match("/");
        if (shell) {
          const html = await shell.text();
          const assets = new Set();
          const pattern = /(?:src|href)="([^"]+)"/g;
          let match = pattern.exec(html);
          while (match) {
            const url = match[1];
            if (
              url.startsWith("/_expo/") ||
              url.startsWith("/assets/") ||
              url.startsWith("/icons/")
            ) {
              assets.add(url);
            }
            match = pattern.exec(html);
          }
          await Promise.all(
            [...assets].map(async (url) => {
              try {
                await cache.add(new Request(url, { cache: "reload" }));
              } catch {
                // Hashed asset may have changed between deploys.
              }
            }),
          );
        }
      } catch {
        // The shell is still usable without the extra assets.
      }

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(VERSION))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put("/", response.clone()).catch(() => {});
      return response;
    }
    throw new Error(`Navigation failed with ${response.status}`);
  } catch {
    const shell = await cache.match("/");
    if (shell) return shell;
    return new Response(OFFLINE_PAGE, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function cacheUrls(urls, cacheName) {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urls.slice(0, 60).map(async (url) => {
      if (typeof url !== "string" || !url.startsWith("/")) return;
      try {
        const request = new Request(url);
        const hit = await cache.match(request);
        if (hit) return;
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response);
      } catch {
        // Skip files that are unreachable right now.
      }
    }),
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.pathname.startsWith("/guide/")) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (
    url.pathname.startsWith("/_expo/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
  }
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || !Array.isArray(data.urls)) return;

  if (data.type === "CACHE_GUIDE_IMAGES") {
    event.waitUntil(cacheUrls(data.urls, IMAGE_CACHE));
  }

  if (data.type === "CACHE_PAGE_ASSETS") {
    event.waitUntil(cacheUrls(data.urls, ASSET_CACHE));
  }
});
