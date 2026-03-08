import { createContext, useContext, useEffect, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'fraglog_user'

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  const setUser = (u) => {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setUserState(u)
  }

  useEffect(() => {
    // Read localStorage immediately on every mount/page load
    const cached = localStorage.getItem(STORAGE_KEY)
    console.log('🔍 AuthContext init — localStorage:', cached ? 'found user' : 'empty')

    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        console.log('✅ Loaded user from localStorage:', parsed.username)
        setUserState(parsed)
        setLoading(false)
        return
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    // No localStorage — try session cookie (localhost fallback)
    api.get('/auth/me')
      .then((res) => {
        if (res.data.authenticated) {
          console.log('✅ Loaded user from session:', res.data.user.username)
          setUser(res.data.user)
        } else {
          setUserState(null)
        }
      })
      .catch(() => setUserState(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    try { await api.get('/auth/logout') } catch {}
    setUser(null)
    console.log('👋 Logged out, localStorage cleared')
  }

  const loginWithSteam = () => {
    const url = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/auth/steam`
      : 'http://localhost:5000/api/auth/steam'
    window.location.href = url
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginWithSteam, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}