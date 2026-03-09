import { useState } from 'react'
import { FiX, FiShield, FiZap, FiStar } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ mode = 'signin', onClose }) {
  const { loginWithSteam } = useAuth()
  const [tab, setTab] = useState(mode)

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#16161f', borderRadius: 16,
        width: '100%', maxWidth: 440, overflow: 'hidden',
        border: '1px solid #2a2a3d',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'fadeInUp 0.25s ease',
        position: 'relative',
      }}>
        {/* Glow accent top */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
          background: 'linear-gradient(90deg, transparent, #00e676, transparent)',
        }} />

        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'none', border: 'none', color: '#555570',
          cursor: 'pointer', padding: 6, borderRadius: 6, transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#f0f0f8'}
          onMouseLeave={e => e.currentTarget.style.color = '#555570'}
        >
          <FiX size={18} />
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2a3d', paddingTop: 4 }}>
          {[['signin','Sign In'], ['create','Create Account']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '14px', background: 'none', border: 'none',
              borderBottom: tab === key ? '2px solid #00e676' : '2px solid transparent',
              color: tab === key ? '#f0f0f8' : '#555570',
              fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem' }}>
          {tab === 'signin' ? <SignInPanel onLogin={loginWithSteam} /> : <CreatePanel onLogin={loginWithSteam} />}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  )
}

function SignInPanel({ onLogin }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: '#f0f0f8', marginBottom: 8 }}>
        Welcome back
      </h2>
      <p style={{ color: '#8888aa', fontSize: 14, lineHeight: 1.6, marginBottom: '1.5rem' }}>
        Sign in with your Steam account — no password needed. One click and you're in.
      </p>

      <button onClick={onLogin} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, background: '#1b2838', color: '#c6d4df',
        fontFamily: 'Syne', fontWeight: 700, fontSize: 15,
        padding: '14px 20px', borderRadius: 10,
        border: '1px solid #3a4d5c', cursor: 'pointer',
        transition: 'all 0.2s', marginBottom: '1.5rem',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#2a475e'; e.currentTarget.style.borderColor = '#67c1f5'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#1b2838'; e.currentTarget.style.borderColor = '#3a4d5c'; e.currentTarget.style.transform = 'none' }}
      >
        <SiSteam size={22} style={{ color: '#67c1f5' }} />
        Sign in through Steam
      </button>

      <div style={{ background: '#0f0f17', borderRadius: 10, padding: '1rem', border: '1px solid #2a2a3d' }}>
        <p style={{ fontSize: 12, color: '#555570', lineHeight: 1.7 }}>
          🔒 Steam OpenID ensures your password is never shared with Fraglog. Valve handles authentication securely.
        </p>
      </div>
    </div>
  )
}

function CreatePanel({ onLogin }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: '#f0f0f8', marginBottom: 8 }}>
        Start your gaming journal
      </h2>
      <p style={{ color: '#8888aa', fontSize: 14, lineHeight: 1.6, marginBottom: '1.5rem' }}>
        Track every game you play. Write reviews. Build your profile. All tied to your Steam library.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
        {[
          [FiZap,    '#00e676', 'Your entire Steam library, synced instantly'],
          [FiStar,   '#ffd700', 'Rate & review every game you\'ve played'],
          [FiShield, '#40bcf4', 'Public profile — share your gamer identity'],
        ].map(([Icon, color, text]) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon size={16} style={{ color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#8888aa', fontFamily: 'Karla' }}>{text}</span>
          </div>
        ))}
      </div>

      <button onClick={onLogin} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, background: '#00e676', color: '#0f0f17',
        fontFamily: 'Syne', fontWeight: 800, fontSize: 15,
        padding: '14px 20px', borderRadius: 10,
        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#00ff88'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,230,118,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#00e676'; e.currentTarget.style.transform = 'none';             e.currentTarget.style.boxShadow = 'none' }}
      >
        <SiSteam size={22} />
        Connect with Steam — Free Forever
      </button>
    </div>
  )
}
