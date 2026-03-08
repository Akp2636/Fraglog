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
      navigate('/?error=' + error)
      return
    }

    if (data) {
      try {
        const user = JSON.parse(atob(data))
        // setUser saves to localStorage automatically
        setUser(user)
        navigate('/profile/' + user.steamId, { replace: true })
      } catch (e) {
        console.error('Failed to parse auth data:', e)
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [])

  return (
    <div style={{
      minHeight: '80vh', display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#14181c', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid #2c3440',
        borderTopColor: '#00b020',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        color: '#9ab', fontFamily: 'Karla, sans-serif',
        fontSize: 15,
      }}>
        Signing you in...
      </p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}