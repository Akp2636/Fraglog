import { useState } from 'react'
import { FiX, FiArrowRight } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ mode = 'signin', onClose }) {
  const { loginWithSteam } = useAuth()
  const [tab, setTab] = useState(mode)

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0d0d0d',
        width: '100%', maxWidth: 480,
        border: '1px solid #1a1a1a',
        position: 'relative',
        animation: 'fadeInUp 0.25s ease',
      }}>
        {/* Top accent line */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #b9ff57, transparent)' }} />

        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20,
          background: 'none', border: 'none', color: '#333',
          cursor: 'pointer', padding: 4, transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#333'}
        >
          <FiX size={18} />
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a' }}>
          {[['signin','Sign In'], ['create','Create Account']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '16px', background: 'none', border: 'none',
              borderBottom: tab === key ? '2px solid #b9ff57' : '2px solid transparent',
              color: tab === key ? '#ffffff' : '#333',
              fontFamily: '"Barlow Condensed"', fontWeight: 700,
              fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: '2.5rem' }}>
          {tab === 'signin' ? <SignInPanel onLogin={loginWithSteam} /> : <CreatePanel onLogin={loginWithSteam} />}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  )
}

function SignInPanel({ onLogin }) {
  return (
    <div>
      <h2 style={{ fontFamily: '"Barlow Condensed"', fontWeight: 900, fontStyle: 'italic', fontSize: 40, textTransform: 'uppercase', color: '#fff', lineHeight: 1, marginBottom: 12 }}>
        WELCOME<br />BACK.
      </h2>
      <p style={{ fontFamily: 'Barlow', fontWeight: 300, fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
        Sign in with your Steam account — no password needed.
      </p>

      <button onClick={onLogin} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#1b2838', border: '1px solid #2a3f52',
        padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1.5rem',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#243447'; e.currentTarget.style.borderColor = '#67c1f5' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#1b2838'; e.currentTarget.style.borderColor = '#2a3f52' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SiSteam size={22} style={{ color: '#67c1f5' }} />
          <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#c6d4df' }}>
            Sign in through Steam
          </span>
        </div>
        <FiArrowRight size={16} style={{ color: '#67c1f5' }} />
      </button>

      <p style={{ fontFamily: 'Barlow', fontSize: 12, color: '#333', lineHeight: 1.6 }}>
        🔒 Steam OpenID — your password is never shared with Fraglog.
      </p>
    </div>
  )
}

function CreatePanel({ onLogin }) {
  return (
    <div>
      <h2 style={{ fontFamily: '"Barlow Condensed"', fontWeight: 900, fontStyle: 'italic', fontSize: 40, textTransform: 'uppercase', color: '#fff', lineHeight: 1, marginBottom: 12 }}>
        START YOUR<br /><span style={{ color: '#b9ff57' }}>JOURNAL.</span>
      </h2>
      <p style={{ fontFamily: 'Barlow', fontWeight: 300, fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        Your entire Steam library, synced instantly. Rate games, write reviews, build your gamer profile.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '2rem' }}>
        {[
          'Your Steam library synced automatically',
          'Rate & review every game you play',
          'Public profile with stats & game log',
          'Discover games through community reviews',
        ].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 4, background: '#b9ff57', borderRadius: '50%', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Barlow', fontSize: 13, color: '#555' }}>{item}</span>
          </div>
        ))}
      </div>

      <button onClick={onLogin} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#b9ff57', border: 'none',
        padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#ffffff'}
        onMouseLeave={e => e.currentTarget.style.background = '#b9ff57'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SiSteam size={22} style={{ color: '#080808' }} />
          <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 800, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#080808' }}>
            Connect with Steam — Free
          </span>
        </div>
        <FiArrowRight size={16} style={{ color: '#080808' }} />
      </button>
    </div>
  )
}
