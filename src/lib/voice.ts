// Spraakopnames van het ochtendmoment, alleen op dit apparaat (IndexedDB). Geen server, geen cloud-sync.
// Oude opnames (ouder dan twee weken) ruimt de app zelf op.

const DB = 'plusone-voice'
const STORE = 'clips'

const open = () => new Promise<IDBDatabase>((resolve, reject) => {
  const req = indexedDB.open(DB, 1)
  req.onupgradeneeded = () => req.result.createObjectStore(STORE)
  req.onsuccess = () => resolve(req.result)
  req.onerror = () => reject(req.error)
})

const tx = async <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) => {
  const db = await open()
  return new Promise<T>((resolve, reject) => {
    const r = fn(db.transaction(STORE, mode).objectStore(STORE))
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
}

/** Of dit apparaat kan opnemen. */
export const canRecord = () => typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined' && typeof indexedDB !== 'undefined'

export const clipKey = (date: string, kind: 'dread' | 'strong') => `${date}:${kind}`

export const saveClip = async (key: string, blob: Blob) => {
  try {
    await tx('readwrite', (s) => s.put(blob, key))
    void prune()
  } catch {
    /* geen opslag */
  }
}

export const getClip = async (key: string): Promise<Blob | undefined> => {
  try {
    return await tx<Blob | undefined>('readonly', (s) => s.get(key))
  } catch {
    return undefined
  }
}

/** Opnames van meer dan 14 dagen geleden weg. */
const prune = async () => {
  const keys = await tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys())
  const cut = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10)
  await Promise.all(keys.filter((k) => String(k).slice(0, 10) < cut).map((k) => tx('readwrite', (s) => s.delete(k))))
}
