import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

const KEY = 'fraglog_user'
const FRONTEND = import.meta.env.VITE_API_URL
  ? window.location.origin
  : 'http://localhost:5173'

export default function AuthCallback() {
  const [params]  = useSearchParams()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      console.error('Auth error:', error)
      window.location.replace('/?error=' + error)
      return
    }

    if (!token) {
      console.error('No token in callback URL')
      window.location.replace('/')
      return
    }

    try {
      const user = JSON.parse(atob(token))
      console.log('✅ Auth success:', user.username)

      // Write directly to localStorage — synchronous, guaranteed
      localStorage.setItem(KEY, JSON.stringify(user))

      // Hard redirect (full page load) so AuthContext reads fresh localStorage
      window.location.replace('/profile/' + user.steamId)
    } catch (e) {
      console.error('Failed to decode token:', e)
      window.location.replace('/')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f0f17', gap: 20,
    }}>
      {/* Animated logo dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {['#00e676','#40bcf4','#ff6b35'].map((c, i) => (
          <div key={c} style={{
            width: 14, height: 14, borderRadius: '50%', background: c,
            animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite alternate`,
          }} />
        ))}
      </div>
      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: '#f0f0f8' }}>
        Signing you in
      </p>
      <p style={{ fontFamily: 'Karla, sans-serif', fontSize: 14, color: '#8888aa' }}>
        Verifying your Steam identity...
      </p>
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0);   opacity: 0.4; }
          to   { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
