const CACHE_NAME = 'spiral-v1';
const ASSETS = [
  './spiral_android-130.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Heebo:wght@300;400;600;700;900&display=swap'
];

// התקנה — שמור את כל הקבצים בקאש
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.log('Cache partial fail:', err);
      });
    })
  );
  self.skipWaiting();
});

// הפעלה — מחק קאש ישן
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// בקשות — תחזיר מקאש אם אפשר, אחרת מהרשת
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => {
        // אם אין רשת ואין קאש — החזר את הדף הראשי
        return caches.match('./spiral_android-130.html');
      });
    })
  );
});
