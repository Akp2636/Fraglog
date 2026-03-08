import { createContext, useContext, useEffect, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.authenticated ? res.data.user : null)
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
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const loginWithSteam = () => {
    const steamLoginUrl = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/auth/steam`
  : 'http://localhost:5000/api/auth/steam'
window.location.href = steamLoginUrl
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
