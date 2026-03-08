import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const data = searchParams.get('data')
    const error = searchParams.get('error')

    if (error) {
      console.error('Auth error:', error)
      navigate('/?error=' + error)
      return
    }

    if (data) {
      try {
        const user = JSON.parse(atob(data))
        setUser(user)
        // Save to sessionStorage so page refreshes keep you logged in
        sessionStorage.setItem('fraglog_user', JSON.stringify(user))
        navigate('/profile/' + user.steamId)
      } catch (e) {
        console.error('Failed to parse user data:', e)
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [])

  return (
    <div style={{
      minHeight: '60vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#14181c', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #2c3440', borderTopColor: '#00b020',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#9ab', fontFamily: 'Karla, sans-serif', fontSize: 14 }}>
        Signing you in...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}