// const STATIC_CACHE = "static-v1";
// Choose a cache name
const cacheName = 'cache-v1';

// const APP_SHELL = [
//   "/",
//   "pagina_caudalimetro.html",
//   "css/styles.css",
//   "js/main.js",
//   "js/Chart.bundle.min.js",
  
//   "images/logoFirefly400x400.png",
//   "images/Banner.png"
// ];
const precacheResources  = [
  "/",
  "pagina_caudalimetro.html",
  "css/styles.css",
  "js/main.js",
  "js/Chart.bundle.min.js",
  
  "images/logoFirefly400x400.png",
  "images/Banner.png"
];

// self.addEventListener("install", (e) => {
//   const cacheStatic = caches
//     .open(STATIC_CACHE)
//     .then((cache) => cache.addAll(APP_SHELL));

//   e.waitUntil(cacheStatic);
// });

// self.addEventListener("fetch", (e) => {
//   console.log("fetch! ", e.request);
//   e.respondWith(
//     caches
//       .match(e.request)
//       .then((res) => {
//         return res || fetch(e.request);
//       })
//       .catch(console.log)
//   );
//     e.waitUntil(response);
// });
// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', (event) => {
  console.log('Service worker install event!');
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources)));
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activate event!');
});

// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener('fetch', (event) => {
  console.log('Fetch intercepted for:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    }),
  );
});