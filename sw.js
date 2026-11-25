const STATIC_CACHE = "ps5ux-static-v1";
const SHELL_CACHE = "ps5ux-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(["./assets/bg_monica.jpg", "./assets/covers/brawl_stars.jpg", "./assets/covers/twitch.png"]).catch(() => {})
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/api/")) return;
  if (url.pathname.endsWith(".mp4") || req.headers.has("range")) return;

  const isStaticMedia =
    url.pathname.includes("/assets/") &&
    !url.pathname.endsWith(".json");

  if (isStaticMedia) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(req, { ignoreSearch: false });
        if (cached) {
          fetch(req).then((fresh) => {
            if (fresh && fresh.ok) cache.put(req, fresh.clone());
          }).catch(() => {});
          return cached;
        }
        const net = await fetch(req);
        if (net && net.ok) cache.put(req, net.clone());
        return net;
      })
    );
    return;
  }

  const isShellOrJson =
    req.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".json");

  if (isShellOrJson) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cleanReq = new Request(url.origin + url.pathname + (url.search && !url.search.includes("t=") ? url.search : ""));
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2500);
          const net = await fetch(req, { signal: controller.signal });
          clearTimeout(timer);
          if (net && net.ok) {
            cache.put(cleanReq, net.clone());
          }
          return net;
        } catch (_) {
          const cached = await cache.match(req) || await cache.match(cleanReq);
          if (cached) return cached;
          return fetch(req);
        }
      })
    );
  }
});
