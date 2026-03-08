import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const STORAGE_KEY = 'fraglog_user'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const data = searchParams.get('data')
    const error = searchParams.get('error')

    if (error) {
      console.error('Auth error from Steam:', error)
      navigate('/')
      return
    }

    if (!data) {
      console.error('No data param in callback URL')
      navigate('/')
      return
    }

    try {
      const decoded = atob(data)
      console.log('✅ Decoded user data:', decoded)
      const user = JSON.parse(decoded)

      // Save directly to localStorage — synchronous, guaranteed before navigate
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      console.log('✅ Saved to localStorage:', localStorage.getItem(STORAGE_KEY))

      // Small delay so localStorage write is definitely complete
      setTimeout(() => {
        window.location.href = '/profile/' + user.steamId
      }, 500)

    } catch (e) {
      console.error('❌ Failed to parse auth data:', e)
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
      <p style={{ color: '#9ab', fontFamily: 'Karla, sans-serif', fontSize: 15 }}>
        Signing you in...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}