import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ mode = 'signin', onClose }) {
  const { loginWithSteam } = useAuth()
  const [tab, setTab] = useState(mode) // 'signin' | 'create'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#2c3440', borderRadius: 8,
          width: '100%', maxWidth: 420,
          overflow: 'hidden', position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          animation: 'modalIn 0.22s ease',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'none', border: 'none', color: '#678',
            cursor: 'pointer', padding: 4, borderRadius: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#678'}
        >
          <FiX size={18} />
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #3a4550' }}>
          {[['signin', 'Sign In'], ['create', 'Create Account']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '1rem', background: 'none', border: 'none',
                borderBottom: tab === key ? '2px solid #00b020' : '2px solid transparent',
                color: tab === key ? '#fff' : '#9ab',
                fontFamily: 'Karla, sans-serif', fontWeight: 700,
                fontSize: 14, cursor: 'pointer', transition: 'color 0.15s',
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '2rem' }}>
          {tab === 'signin' ? (
            <SignInPanel onLogin={loginWithSteam} />
          ) : (
            <CreatePanel onLogin={loginWithSteam} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

function SignInPanel({ onLogin }) {
  return (
    <div>
      <h2 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20,
        color: '#fff', marginBottom: '0.5rem',
      }}>
        Sign in to Fraglog
      </h2>
      <p style={{ color: '#9ab', fontSize: 14, marginBottom: '1.75rem', lineHeight: 1.5 }}>
        Fraglog uses Steam OpenID — no password needed. Sign in with your existing Steam account in one click.
      </p>

      <button
        onClick={onLogin}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, background: '#1b2838', color: '#c6d4df',
          fontFamily: 'Karla, sans-serif', fontWeight: 700,
          fontSize: 15, padding: '13px 20px', borderRadius: 4,
          border: '1px solid #3a4d5c', cursor: 'pointer',
          transition: 'background 0.15s, border-color 0.15s',
          marginBottom: '0.75rem',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#2a475e'; e.currentTarget.style.borderColor = '#67c1f5' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#1b2838'; e.currentTarget.style.borderColor = '#3a4d5c' }}
      >
        <SiSteam size={20} style={{ color: '#67c1f5' }} />
        Sign in through Steam
      </button>

      <Divider />

      <InfoBox>
        Steam OpenID lets you sign in without sharing your password with Fraglog.
        Your Steam library is fetched directly from Valve's API.
      </InfoBox>
    </div>
  )
}

function CreatePanel({ onLogin }) {
  return (
    <div>
      <h2 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20,
        color: '#fff', marginBottom: '0.5rem',
      }}>
        Create your account
      </h2>
      <p style={{ color: '#9ab', fontSize: 14, marginBottom: '1.75rem', lineHeight: 1.5 }}>
        Fraglog accounts are tied to your Steam profile — there's nothing to fill in. Just connect your Steam account and you're ready to go.
      </p>

      <button
        onClick={onLogin}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, background: '#00b020', color: '#fff',
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: 15, padding: '13px 20px', borderRadius: 4,
          border: 'none', cursor: 'pointer',
          transition: 'background 0.15s',
          marginBottom: '0.75rem',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#009918'}
        onMouseLeave={e => e.currentTarget.style.background = '#00b020'}
      >
        <SiSteam size={20} />
        Connect with Steam — it's free!
      </button>

      <Divider />

      <InfoBox>
        By creating an account you agree to Fraglog's terms. Your public Steam
        profile info (username, avatar, library) will be visible on your Fraglog profile.
      </InfoBox>
    </div>
  )
}

function Divider() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      margin: '1.25rem 0',
    }}>
      <div style={{ flex: 1, height: 1, background: '#3a4550' }} />
      <span style={{ fontSize: 12, color: '#567' }}>OR</span>
      <div style={{ flex: 1, height: 1, background: '#3a4550' }} />
    </div>
  )
}

function InfoBox({ children }) {
  return (
    <div style={{
      background: '#1f2830', borderRadius: 6,
      padding: '0.875rem 1rem',
      border: '1px solid #2e3d4a',
    }}>
      <p style={{ fontSize: 12, color: '#678', lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}