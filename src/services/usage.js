const KEY = 'webai_usage'
const LIMIT = 25

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function getUsage() {
  const raw = localStorage.getItem(KEY)
  const data = raw ? JSON.parse(raw) : null
  if (!data || data.date !== today()) return { date: today(), count: 0 }
  return data
}

export function canTranslate(premium) {
  if (premium) return true
  return getUsage().count < LIMIT
}

export function addUsage(panelCount) {
  const usage = getUsage()
  usage.count += panelCount
  localStorage.setItem(KEY, JSON.stringify(usage))
}

export const DAILY_LIMIT = LIMIT
