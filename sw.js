// Permite instalar la app y abrirla sin conexión.
// Archivos de la app: primero la red (así llegan las actualizaciones) y, si no hay internet, la copia guardada.
// Las llamadas a Supabase y a Google Fonts no pasan por aquí.
const CACHE = 'valoriza-vilos-v1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css', 'assets/logo.png', 'assets/icon-192.png',
  'js/utils.js', 'js/icons.js', 'js/data.js', 'js/cloud.js', 'js/store.js', 'js/model.js',
  'js/views/shell.js', 'js/views/auth.js', 'js/views/quotes.js', 'js/views/costs.js', 'js/views/providers.js',
  'js/views/market.js', 'js/views/theme.js', 'js/views/catalog.js', 'js/dom.js', 'js/actions.js', 'js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request)
    .then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
