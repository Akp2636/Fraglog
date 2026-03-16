import { useState } from 'react'
import { FiX, FiArrowRight } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ mode = 'signin', onClose }) {
  const { loginWithSteam } = useAuth()
  const [tab, setTab] = useState(mode)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#111', width: '100%', maxWidth: 440, border: '1px solid #222', position: 'relative' }}>
        <div style={{ height: 2, background: '#9EFF00' }} />

        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#444', cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color='#F0F0F0'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
          <FiX size={16} />
        </button>

        <div style={{ display: 'flex', borderBottom: '1px solid #1A1A1A' }}>
          {[['signin','Sign In'],['create','Join']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '14px', background: 'none', border: 'none',
              borderBottom: tab === key ? '2px solid #9EFF00' : '2px solid transparent',
              color: tab === key ? '#F0F0F0' : '#444',
              fontFamily: 'Oswald', fontWeight: 600, fontSize: 13,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        <div style={{ padding: '28px' }}>
          {tab === 'signin' ? (
            <>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: '0.04em', color: '#F0F0F0', marginBottom: 8 }}>WELCOME BACK</h2>
              <p style={{ fontFamily: 'Manrope', fontSize: 13, color: '#666', marginBottom: 24 }}>Sign in with your Steam account. No password needed.</p>
              <button onClick={loginWithSteam} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#1b2838', border: '1px solid #2a3f52', padding: '14px 18px',
                cursor: 'pointer', transition: 'border-color 0.2s', marginBottom: 12,
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#67c1f5'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#2a3f52'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <SiSteam size={20} style={{ color: '#67c1f5' }} />
                  <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c6d4df' }}>Continue with Steam</span>
                </div>
                <FiArrowRight size={14} style={{ color: '#67c1f5' }} />
              </button>
              <p style={{ fontFamily: 'Manrope', fontSize: 11, color: '#333' }}>Steam OpenID — your password is never shared.</p>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: '0.04em', color: '#F0F0F0', marginBottom: 8 }}>START YOUR <span style={{ color: '#9EFF00' }}>JOURNAL</span></h2>
              <p style={{ fontFamily: 'Manrope', fontSize: 13, color: '#666', marginBottom: 20 }}>Connect Steam. Your library syncs automatically.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
                {['Steam library synced automatically', 'Rate & review every game', 'Public gamer profile', 'Discover via community reviews'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 4, height: 4, background: '#9EFF00', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Manrope', fontSize: 12, color: '#666' }}>{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={loginWithSteam} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#9EFF00', border: 'none', padding: '14px 18px', cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background='#b5ff33'}
                onMouseLeave={e => e.currentTarget.style.background='#9EFF00'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <SiSteam size={18} style={{ color: '#0A0A0A' }} />
                  <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0A0A0A' }}>Connect with Steam</span>
                </div>
                <FiArrowRight size={14} style={{ color: '#0A0A0A' }} />
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  )
}
