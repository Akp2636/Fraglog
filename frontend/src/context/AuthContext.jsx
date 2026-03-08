import { createContext, useContext, useEffect, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'fraglog_user'

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  // Wrapper — always sync to localStorage
  const setUser = (u) => {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setUserState(u)
  }

  const checkAuth = async () => {
    // 1. Check localStorage first (instant — no network)
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        setUserState(JSON.parse(cached))
        setLoading(false)
        return
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    // 2. Fallback — ask backend (works on localhost with cookies)
    try {
      const res = await api.get('/auth/me')
      if (res.data.authenticated) {
        setUser(res.data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const logout = async () => {
    try {
      await api.get('/auth/logout')
    } catch {}
    setUser(null)
  }

  const loginWithSteam = () => {
    const url = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/auth/steam`
      : 'http://localhost:5000/api/auth/steam'
    window.location.href = url
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginWithSteam, checkAuth, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}