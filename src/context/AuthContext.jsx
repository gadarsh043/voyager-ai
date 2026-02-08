import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import * as auth from '@/lib/auth'

const AuthContext = createContext(null)

const MAX_LOAD_MS = 1200

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadingRef = useRef(false)
  const load = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    try {
      const session = await auth.getSession()
      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }
      const profile = await auth.getProfile()
      setUser(profile ?? auth.profileFromAuth(session.user))
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), MAX_LOAD_MS)
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') load()
      else if (event === 'SIGNED_OUT') setUser(null)
      setLoading(false)
    })
    return () => {
      clearTimeout(t)
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
