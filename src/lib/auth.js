import { supabase } from './supabase'

function toAppUser(r) {
  if (!r) return null
  const full_name = [r.first_name, r.last_name].filter(Boolean).join(' ') || r.email || 'User'
  return { ...r, full_name }
}

export function profileFromAuth(u) {
  if (!u) return null
  const m = u.user_metadata || {}
  const first = m.first_name ?? m.given_name ?? (m.name || 'User').split(' ')[0] ?? 'User'
  const last = m.last_name ?? m.family_name ?? (m.name || '').split(' ').slice(1).join(' ') ?? ''
  return toAppUser({ id: u.id, email: u.email, first_name: first, last_name: last, avatar_url: m.picture ?? null, preferences: [] })
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getProfile() {
  const { data: { user: u } } = await supabase.auth.getUser()
  if (!u) return null

  const { data: row } = await supabase.from('users').select('*').eq('id', u.id).maybeSingle()
  if (row) return toAppUser(row)

  const fallback = profileFromAuth(u)
  const { data: inserted, error: insertErr } = await supabase.from('users').insert({
    id: u.id,
    email: u.email ?? '',
    first_name: fallback.first_name,
    last_name: fallback.last_name,
    avatar_url: fallback.avatar_url,
    preferences: [],
  }).select().single()

  if (inserted) return toAppUser(inserted)
  if (insertErr?.code === '23505') {
    const { data: existing } = await supabase.from('users').select('*').eq('id', u.id).maybeSingle()
    if (existing) return toAppUser(existing)
  }
  return fallback
}

export async function signUp({ email, password, first_name, last_name }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name, last_name } },
  })
  if (error) throw error
  if (!data.user) throw new Error('Sign up failed')

  const { error: insertErr } = await supabase.from('users').insert({
    id: data.user.id,
    email: data.user.email,
    first_name: first_name?.trim() || '',
    last_name: last_name?.trim() || '',
    avatar_url: null,
    preferences: [],
  })
  if (insertErr) console.warn('users insert:', insertErr.message)

  return toAppUser({ id: data.user.id, email: data.user.email, first_name: first_name?.trim() || '', last_name: last_name?.trim() || '', avatar_url: null, preferences: [] })
}

export async function signIn({ email, password }) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return getProfile()
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/',
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}
