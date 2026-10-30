// Permite instalar la app y abrirla sin conexión o con mala señal.
// Archivos de la app: primero la red (así llegan las actualizaciones); si no responde en 3 s o no hay internet,
// la copia guardada, y la red la renueva por detrás. Las letras de Google Fonts no cambian: se guardan una vez.
// Las llamadas a Supabase no pasan por aquí: los datos de cada cuenta los guarda Store en el navegador.
const CACHE = 'valoriza-vilos-v2';
const FONTS = 'viloriza-fonts';
const WAIT = 3000;
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css', 'assets/logo.png', 'assets/icon-192.png',
  'js/utils.js', 'js/icons.js', 'js/data.js', 'js/cloud.js', 'js/store.js', 'js/model.js',
  'js/views/shell.js', 'js/views/auth.js', 'js/views/quotes.js', 'js/views/costs.js', 'js/views/providers.js',
  'js/views/market.js', 'js/views/theme.js', 'js/views/catalog.js', 'js/dom.js', 'js/actions.js', 'js/app.js'
];

self.addEventListener('install', (e) => {
  // cache: 'reload' salta la caché HTTP del navegador para guardar la versión recién publicada.
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONTS).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function fromNetwork(e) {
  const net = fetch(e.request).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return res;
  });
  const saved = () => caches.match(e.request, { ignoreSearch: true })
    .then((r) => r || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined));
  e.waitUntil(net.catch(() => {})); // si gana la copia guardada, la red igual termina y la actualiza
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => saved().then((r) => r && resolve(r)), WAIT);
    net.then((res) => { clearTimeout(timer); resolve(res); })
      .catch(() => { clearTimeout(timer); saved().then((r) => r ? resolve(r) : reject(new Error('offline'))); });
  });
}

function fromFonts(e) {
  return caches.open(FONTS).then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    if (res.ok || res.type === 'opaque') c.put(e.request, res.clone());
    return res;
  })));
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin) e.respondWith(fromNetwork(e));
  else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') e.respondWith(fromFonts(e));
});
