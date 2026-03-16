import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

const USER_KEY  = 'fraglog_user'
const TOKEN_KEY = 'fraglog_token'

export default function AuthCallback() {
  const [params]  = useSearchParams()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true
    const token = params.get('token')
    const user  = params.get('user')
    const error = params.get('error')

    if (error) { window.location.replace('/?error=' + error); return }
    if (!token || !user) { window.location.replace('/'); return }

    try {
      const userData = JSON.parse(atob(user))
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      window.location.replace('/profile/' + userData.steamId)
    } catch { window.location.replace('/') }
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', gap: 20 }}>
      <span style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: '0.06em', color: '#F0F0F0' }}>
        FRAG<span style={{ color: '#9EFF00' }}>LOG</span>
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 6, height: 6, background: '#9EFF00', borderRadius: '50%', animation: `pulse 1s ease ${i*0.2}s infinite` }} />
        ))}
      </div>
      <p style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444' }}>
        Signing you in...
      </p>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.8)}}`}</style>
    </div>
  )
}
