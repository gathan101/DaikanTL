import localforage from 'localforage'

const KEY = 'last_manga'
const TTL = 4 * 60 * 60 * 1000 // 4 jam

export async function saveResult(panels) {
  await localforage.setItem(KEY, JSON.parse(JSON.stringify({ panels, savedAt: Date.now() })))
}

export async function loadResult() {
  const data = await localforage.getItem(KEY)
  if (!data) return null
  if (Date.now() - data.savedAt > TTL) {
    await localforage.removeItem(KEY)
    return null
  }
  return data
}

export async function clearResult() {
  await localforage.removeItem(KEY)
}
