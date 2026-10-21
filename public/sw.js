// Eenvoudige offline-cache: de app-shell en Doré-platen bij installatie,
// al het andere (JS/CSS-bundels, Google Fonts) zodra het één keer geladen is.
const CACHE = 'plusone-v6'
const PLATES = ['pride', 'humility', 'envy', 'kindness', 'wrath', 'patience', 'forest', 'ladder', 'greed', 'charity', 'gluttony', 'temperance', 'lust', 'rose', 'virgil', 'boat', 'gate', 'shore', 'lucifer', 'ninth', 'foulque', 'taurus', 'george', 'satan', 'oath', 'benediction']
// De lagen van de levende scène (scripts/prep-art.py), zodat de scène ook offline meteen staat
const ART = ['karakter-schim', 'karakter-verdwaalde', 'karakter-balans', 'karakter-klimmer', 'karakter-ideaal', 'achtergrond-kust-1-ver', 'item-boot', 'item-pelgrim-1', 'item-pelgrim-2', 'item-kettlebell', 'item-telefoon', 'effect-mist', 'effect-water', 'effect-veer', 'rig-ijver-basis', 'rig-ijver-arm', 'rig-traagheid-basis', 'rig-traagheid-slinger', 'achtergrond-kust-2-midden', 'achtergrond-kust-3-grond', 'achtergrond-kust-4-voorgrond', 'achtergrond-terrassen-1-ver', 'achtergrond-terrassen-2-midden', 'achtergrond-terrassen-4-voorgrond', 'item-engel', 'item-duif-omhoog', 'item-duif-omlaag', 'effect-lichtje', ...['matigheid', 'nederigheid', 'zuiverheid', 'welwillendheid'].flatMap((t) => [`rig-${t}-basis`, `rig-${t}-deel`]), 'rig-geduld-basis', 'rig-vrijgevigheid-basis']
const PRECACHE = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', ...PLATES.map((p) => `dore/${p}.jpg`), ...ART.map((a) => `art/${a}.webp`)]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  const sameOrigin = url.origin === self.location.origin
  const fonts = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com'
  if (!sameOrigin && !fonts) return

  // Pagina's: eerst netwerk (nieuwste versie), anders cache.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('index.html', copy))
          return res
        })
        .catch(() => caches.match('index.html')),
    )
    return
  }

  // Overige bestanden: eerst cache, anders netwerk en bewaren.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        }),
    ),
  )
})
