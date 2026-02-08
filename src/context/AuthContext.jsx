import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import * as auth from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadingRef = useRef(false)
  const load = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const session = await auth.getSession()
      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }
      try {
        const profile = await auth.getProfile()
        setUser(profile ?? auth.profileFromAuth(session.user))
      } catch {
        // Session valid but profile fetch failed (e.g. RLS) – use OAuth metadata so user stays signed in
        setUser(auth.profileFromAuth(session.user))
      }
      // Remove OAuth tokens from URL so the bar shows a clean path
      if (typeof window !== 'undefined' && window.location.hash?.includes('access_token=')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    } catch {
      setUser(null)
      supabase.auth.signOut().catch(() => {})
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    load()
    // OAuth redirect: Supabase may still be parsing the hash. Retry once after a short delay.
    const hasOAuthHash = typeof window !== 'undefined' && window.location.hash?.includes('access_token=')
    const t = hasOAuthHash ? window.setTimeout(() => load(), 100) : null
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') load()
      else if (event === 'SIGNED_OUT') setUser(null)
    })
    return () => {
      if (t) clearTimeout(t)
      subscription.unsubscribe()
    }
  }, [load])

  const register = useCallback(async (data) => {
    const profile = await auth.signUp(data)
    setUser(profile)
    return profile
  }, [])

  const login = useCallback(async (data) => {
    const profile = await auth.signIn(data)
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    auth.signOut().catch(() => {})
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        loginWithGoogle: auth.signInWithGoogle,
        logout,
        refreshUser: load,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
