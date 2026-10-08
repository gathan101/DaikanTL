import { supabase } from './supabase'

const SESSION_KEY = 'webai_current_user'

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export async function register({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { ok: false, message: error.message }
  if (data.user) {
    await supabase.from('profiles').insert({ id: data.user.id, name, premium: false })
  }
  return { ok: true }
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, message: 'Email atau password salah' }
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
  saveSession({ id: data.user.id, name: profile?.name || email, email, premium: profile?.premium || false })
  return { ok: true }
}

export function logout() {
  supabase.auth.signOut()
  localStorage.removeItem(SESSION_KEY)
}

export function currentUser() {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

export async function upgradeToPremium() {
  const user = currentUser()
  if (!user) return { ok: false, message: 'Harus login dulu' }
  const { error } = await supabase.from('profiles').update({ premium: true }).eq('id', user.id)
  if (error) return { ok: false, message: error.message }
  user.premium = true
  saveSession(user)
  return { ok: true }
}

export async function saveTranslation({ mode, font, result }) {
  const user = currentUser()
  if (!user) return
  await supabase.from('translations').insert({ user_id: user.id, mode, font, result })
}
