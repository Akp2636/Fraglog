import { createContext, useContext, useEffect, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)
const KEY = 'fraglog_user'

export const AuthProvider = ({ children }) => {
  const [user, _setUser]  = useState(null)
  const [loading, setLoading] = useState(true)

  // Always sync to localStorage
  const setUser = (u) => {
    if (u) localStorage.setItem(KEY, JSON.stringify(u))
    else    localStorage.removeItem(KEY)
    _setUser(u)
  }

  useEffect(() => {
    const cached = localStorage.getItem(KEY)
    if (cached) {
      try {
        _setUser(JSON.parse(cached))
        setLoading(false)
        return
      } catch {
        localStorage.removeItem(KEY)
      }
    }
    // No localStorage — try session (works on localhost)
    api.get('/auth/me')
      .then(r => { if (r.data.authenticated) setUser(r.data.user) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    try { await api.get('/auth/logout') } catch {}
    setUser(null)
  }

  const loginWithSteam = () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    window.location.href = `${base}/api/auth/steam`
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
