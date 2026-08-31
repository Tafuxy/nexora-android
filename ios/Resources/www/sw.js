const CACHE='nexora-v1.2.0';
const ASSETS=[
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './nexora-mark.png',
  './nexora-wordmark-dark.png',
  './nexora-wordmark-light.png',
  './nexora-icon-192.png',
  './nexora-icon-512.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
