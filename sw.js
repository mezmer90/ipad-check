/* Offline cache: network first (so updates arrive), cache fallback when Wi-Fi is slow or gone. */
var CACHE = "ipad-check-v4";
var FILES = ["./", "./index.html", "./style.css?v=4", "./data.js?v=4", "./app.js?v=4"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(new Promise(function (resolve) {
    var settled = false;
    var fromCache = function () {
      return caches.match(req, { ignoreSearch: req.mode === "navigate" }).then(function (r) {
        return r || caches.match("./index.html");
      });
    };
    /* Slow network: after 4 s serve the cached copy if there is one. */
    var timer = setTimeout(function () {
      fromCache().then(function (r) { if (r && !settled) { settled = true; resolve(r); } });
    }, 4000);
    fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      clearTimeout(timer);
      if (!settled) { settled = true; resolve(res); }
    }).catch(function () {
      clearTimeout(timer);
      fromCache().then(function (r) { if (!settled) { settled = true; resolve(r || new Response("Offline and not cached yet.", { status: 503 })); } });
    });
  }));
});
