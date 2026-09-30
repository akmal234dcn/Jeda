/* =====================================================================
   Jeda — Service Worker
   Strategi:
     • App shell di-precache saat install  → bisa offline penuh.
     • Navigasi: network-first, fallback ke cache  → offline tetap terbuka,
       tapi versi baru langsung terpakai begitu online.
     • Aset statis: cache-first + isi cache di latar belakang.
   ===================================================================== */
const VERSION = 'jeda-cache-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // biarkan request lintas origin apa adanya

  // Halaman (navigasi): network-first supaya update cepat masuk, cache saat offline.
  if (req.mode === 'navigate'){
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then(hit => hit || caches.match('./')))
    );
    return;
  }

  // Aset (ikon, manifest): cache-first, isi cache bila belum ada.
  event.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.ok){
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});

/* ---------------------------------------------------------------------
   Pengingat harian saat aplikasi tertutup (Periodic Background Sync).
   Membaca snapshot agenda yang ditulis halaman ke CacheStorage.
   --------------------------------------------------------------------- */
self.addEventListener('periodicsync', event => {
  if (event.tag !== 'jeda-daily') return;
  event.waitUntil((async () => {
    try {
      const hit = await caches.match('./agenda.json');
      if (!hit) return;
      const a = await hit.json();
      const n = (a.dueToday || []).length, ov = (a.overdue || []).length;
      if (!n && !ov) return;
      const rows = [...(a.overdue || []).slice(0,3), ...(a.dueToday || []).slice(0,3)]
        .map(x => '\u2022 ' + x.course + ' \u2014 ' + x.label).join('\n');
      const more = (n + ov) > 6 ? '\n\u2022 +' + ((n + ov) - 6) + ' lainnya' : '';
      await self.registration.showNotification(
        'Jeda \u2014 ' + (ov ? ov + ' review terlambat' + (n ? ' + ' + n + ' hari ini' : '') : n + ' review hari ini'),
        { body: rows + more, icon: './icons/icon-192.png', badge: './icons/icon-192.png',
          tag: 'jeda-daily', data: { url: './' } });
    } catch(e){}
  })());
});

/* Klik pop-up -> buka/fokus aplikasi */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
    for (const c of list){ if ('focus' in c) return c.focus(); }
    return clients.openWindow('./');
  }));
});
