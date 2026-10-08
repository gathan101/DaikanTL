const USERS_KEY = 'webai_users'
const CURRENT_KEY = 'webai_current_user'

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function register({ name, email, password }) {
  const users = getUsers()
  if (users.some((u) => u.email === email)) {
    return { ok: false, message: 'Email sudah terdaftar' }
  }
  users.push({ name, email, password, premium: false })
  saveUsers(users)
  return { ok: true }
}

export function login({ email, password }) {
  const users = getUsers()
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) return { ok: false, message: 'Email atau password salah' }
  localStorage.setItem(CURRENT_KEY, JSON.stringify({ name: user.name, email: user.email, premium: user.premium }))
  return { ok: true }
}

export function logout() {
  localStorage.removeItem(CURRENT_KEY)
}

export function currentUser() {
  const raw = localStorage.getItem(CURRENT_KEY)
  return raw ? JSON.parse(raw) : null
}

export function upgradeToPremium() {
  const user = currentUser()
  if (!user) return { ok: false, message: 'Harus login dulu' }
  const users = getUsers()
  const target = users.find((u) => u.email === user.email)
  if (target) {
    target.premium = true
    saveUsers(users)
  }
  user.premium = true
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user))
  return { ok: true }
}
