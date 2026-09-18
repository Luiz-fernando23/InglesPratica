const CACHE = 'ingles-na-mao-v2'
const CORE = ['/', '/manifest.webmanifest', '/icon-192.svg', '/icon-512.svg']

self.addEventListener('install', (e) => {
  // @ts-ignore
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  // @ts-ignore
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // Nunca cachear API
  if (url.pathname.startsWith('/api/')) return
  // @ts-ignore
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone()
      caches.open(CACHE).then((c) => c.put(req, copy))
      return res
    }).catch(() => caches.match('/')))
  )
})

self.addEventListener('push', (e) => {
  let data = { title: 'Inglês na Mão 📚', body: 'Hora de praticar!', url: '/' }
  try {
    if (e.data) data = Object.assign(data, e.data.json())
  } catch (_) { /* ignora */ }
  // @ts-ignore
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: { url: data.url || '/' },
  }))
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = (e.notification.data && e.notification.data.url) || '/'
  // @ts-ignore
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((clients) => {
    for (const c of clients) {
      if ('focus' in c) { c.focus(); return }
    }
    // @ts-ignore
    if (self.clients.openWindow) return self.clients.openWindow(url)
  }))
})
