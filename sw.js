const CACHE_NAME = "fangying-portfolio-v10";
const CORE_FILES = ["./", "index.html", "styles.css", "loading.css", "loading-v3.js"];
const inFlight = new Map();

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

const fetchAndCache = (request) => {
  const key = request.url;
  if (!inFlight.has(key)) {
    inFlight.set(key, fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).finally(() => inFlight.delete(key)));
  }
  return inFlight.get(key).then((response) => response.clone());
};

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("index.html")))
    );
    return;
  }

  if (["image", "style", "script"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetchAndCache(request))
    );
  }
});
