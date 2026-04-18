const CACHE_VERSION = "v1";
const STATIC_CACHE = `election-static-${CACHE_VERSION}`;
const DATA_CACHE = `election-data-${CACHE_VERSION}`;
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.webmanifest",
  "/assets/styles.css",
  "/assets/app.js",
  "/assets/notification-register.js",
  "/assets/pwa.js",
  "/data/site-data.js",
  "/notifications/register.html",
  "/icons/app-icon.svg",
  "/icons/app-icon-maskable.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, DATA_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.pathname === "/data/site-data.js") {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }

  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  }
});

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/app-icon.svg",
      badge: "/icons/app-icon.svg",
      data: {
        url: payload.url,
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  const targetUrl = event.notification?.data?.url || "/index.html";
  event.notification.close();
  event.waitUntil(openOrFocusUrl(targetUrl));
});

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return caches.match("/offline.html");
  }
}

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  const cache = await caches.open(cacheName);
  cache.put(request, networkResponse.clone());
  return networkResponse;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cachedResponse || networkPromise || caches.match("/offline.html");
}

function parsePushPayload(event) {
  try {
    const json = event.data?.json?.();
    if (json && typeof json === "object") {
      return {
        title: json.title || "わたしの選挙",
        body: json.body || "登録地域の選挙情報を確認できます。",
        url: json.url || "/index.html",
      };
    }
  } catch {
    // Fall through to text/default handling.
  }

  const text = event.data?.text?.();
  return {
    title: "わたしの選挙",
    body: text || "登録地域の選挙情報を確認できます。",
    url: "/index.html",
  };
}

async function openOrFocusUrl(targetUrl) {
  const windowClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of windowClients) {
    const clientUrl = new URL(client.url);
    if (clientUrl.pathname === new URL(targetUrl, self.location.origin).pathname && "focus" in client) {
      return client.focus();
    }
  }

  if (clients.openWindow) {
    return clients.openWindow(targetUrl);
  }

  return undefined;
}
