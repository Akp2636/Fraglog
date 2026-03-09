import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiSearch, FiMenu, FiX, FiUser, FiLogOut,
  FiBookOpen, FiGrid, FiTrendingUp,
} from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const [search,   setSearch]   = useState('')
  const [dropdown, setDropdown] = useState(false)
  const [mobile,   setMobile]   = useState(false)
  const [modal,    setModal]    = useState(null) // 'signin' | 'create'
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleSearch = e => {
    e.preventDefault()
    if (!search.trim()) return
    navigate(`/discover?q=${encodeURIComponent(search.trim())}`)
    setSearch(''); setMobile(false)
  }

  const handleLogout = async () => {
    await logout()
    setDropdown(false)
    toast.success('Signed out')
    navigate('/')
  }

  const active = path =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <>
      <nav style={{
        background: '#0a0a12',
        borderBottom: '1px solid #1a1a2e',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem',
          display: 'flex', alignItems: 'center', height: 56, gap: '1.5rem',
        }}>

          {/* ── Logo ── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {['#00e676','#40bcf4','#ff6b35'].map(c => (
                <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />
              ))}
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 19, color: '#f0f0f8', letterSpacing: -0.5 }}>
              FRAGLOG
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }} className="nav-desktop">
            {user ? (
              <>
                <NavLink to={`/profile/${user.steamId}`} active={active(`/profile/${user.steamId}`)}>PROFILE</NavLink>
                <NavLink to={`/library/${user.steamId}`} active={active(`/library/${user.steamId}`)}>LIBRARY</NavLink>
                <NavLink to="/discover" active={active('/discover')}>GAMES</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" active={location.pathname === '/'}>HOME</NavLink>
                <NavLink to="/discover" active={active('/discover')}>GAMES</NavLink>
              </>
            )}
          </div>

          {/* ── Search ── */}
          <form onSubmit={handleSearch} style={{ flexShrink: 0 }} className="nav-desktop">
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#555570', fontSize: 13, pointerEvents: 'none' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search games..."
                style={{
                  background: '#16161f', border: '1px solid #2a2a3d', borderRadius: 20,
                  paddingLeft: 32, paddingRight: 14, paddingTop: 7, paddingBottom: 7,
                  fontSize: 13, color: '#f0f0f8', fontFamily: 'Karla, sans-serif',
                  outline: 'none', width: 190, transition: 'all 0.25s',
                }}
                onFocus={e => { e.target.style.borderColor = '#00e676'; e.target.style.width = '230px' }}
                onBlur={e  => { e.target.style.borderColor = '#2a2a3d'; e.target.style.width = '190px' }}
              />
            </div>
          </form>

          {/* ── Auth ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }} className="nav-desktop">
            {loading ? (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1c1c28' }} />
            ) : user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setDropdown(!dropdown)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <img src={user.avatar} alt={user.username}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #2a2a3d', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#00e676'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3d'}
                  />
                  <span style={{ fontSize: 13, color: '#8888aa', fontFamily: 'Karla, sans-serif', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.username}
                  </span>
                </button>

                {dropdown && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setDropdown(false)} />
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: '#1c1c28', border: '1px solid #2a2a3d',
                      borderRadius: 8, width: 200, overflow: 'hidden',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 20,
                    }}>
                      <div style={{ padding: '12px 14px', borderBottom: '1px solid #2a2a3d' }}>
                        <p style={{ fontSize: 12, color: '#555570', fontFamily: 'Karla' }}>Signed in as</p>
                        <p style={{ fontSize: 14, color: '#f0f0f8', fontFamily: 'Syne', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</p>
                      </div>
                      <DropItem icon={<FiUser size={13} />}   to={`/profile/${user.steamId}`} label="My Profile"  onClick={() => setDropdown(false)} />
                      <DropItem icon={<FiGrid size={13} />}   to={`/library/${user.steamId}`} label="My Library"  onClick={() => setDropdown(false)} />
                      <DropItem icon={<FiBookOpen size={13}/>} to="/discover"                  label="Discover"    onClick={() => setDropdown(false)} />
                      <div style={{ borderTop: '1px solid #2a2a3d' }}>
                        <button onClick={handleLogout} style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                          padding: '11px 14px', background: 'none', border: 'none',
                          color: '#8888aa', fontSize: 13, cursor: 'pointer',
                          fontFamily: 'Karla', transition: 'all 0.15s', textAlign: 'left',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#2a2a3d'; e.currentTarget.style.color = '#ff4757' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#8888aa' }}
                        >
                          <FiLogOut size={13} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={() => setModal('signin')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: '#8888aa', fontFamily: 'Karla', padding: '6px 10px', borderRadius: 6, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f0f0f8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8888aa'}
                >
                  SIGN IN
                </button>
                <button onClick={() => setModal('create')}
                  style={{ background: '#00e676', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: '#0f0f17', fontFamily: 'Syne', padding: '6px 14px', borderRadius: 6, transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#00ff88'}
                  onMouseLeave={e => e.currentTarget.style.background = '#00e676'}
                >
                  GET STARTED
                </button>
              </div>
            )}
          </div>

          {/* ── Mobile toggle ── */}
          <button onClick={() => setMobile(!mobile)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', display: 'none' }}
            className="nav-mobile-btn">
            {mobile ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {mobile && (
          <div style={{ background: '#0a0a12', borderTop: '1px solid #1a1a2e', padding: '1rem 1.25rem' }}>
            <form onSubmit={handleSearch} style={{ marginBottom: '0.75rem' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search games..."
                style={{ width: '100%', background: '#16161f', border: '1px solid #2a2a3d', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#f0f0f8', fontFamily: 'Karla', outline: 'none' }}
              />
            </form>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <MLink to={`/profile/${user.steamId}`} onClick={() => setMobile(false)}>My Profile</MLink>
                <MLink to={`/library/${user.steamId}`} onClick={() => setMobile(false)}>My Library</MLink>
                <MLink to="/discover"                  onClick={() => setMobile(false)}>Discover</MLink>
                <button onClick={handleLogout}
                  style={{ textAlign: 'left', background: 'none', border: 'none', color: '#ff4757', fontSize: 14, padding: '8px 0', cursor: 'pointer', fontFamily: 'Karla' }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => { setModal('signin'); setMobile(false) }}
                  style={{ background: '#16161f', border: '1px solid #2a2a3d', color: '#f0f0f8', borderRadius: 8, padding: '12px', fontFamily: 'Karla', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Sign In with Steam
                </button>
                <button onClick={() => { setModal('create'); setMobile(false) }}
                  style={{ background: '#00e676', border: 'none', color: '#0f0f17', borderRadius: 8, padding: '12px', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Get Started — It's Free
                </button>
              </div>
            )}
          </div>
        )}

        <style>{`
          @media (max-width: 768px) {
            .nav-desktop { display: none !important; }
            .nav-mobile-btn { display: flex !important; }
          }
          @media (min-width: 769px) {
            .nav-mobile-btn { display: none !important; }
            .nav-desktop { display: flex !important; }
          }
        `}</style>
      </nav>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}
    </>
  )
}

function NavLink({ to, children, active }) {
  const [h, sH] = useState(false)
  return (
    <Link to={to} style={{
      fontSize: 12, fontWeight: 700, letterSpacing: 0.8,
      color: active ? '#f0f0f8' : h ? '#ccccdd' : '#555570',
      textDecoration: 'none', fontFamily: 'Karla',
      padding: '6px 10px', borderRadius: 6,
      background: active ? '#1c1c28' : h ? '#16161f' : 'transparent',
      transition: 'all 0.15s',
    }} onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}>
      {children}
    </Link>
  )
}

function DropItem({ to, icon, label, onClick }) {
  const [h, sH] = useState(false)
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', textDecoration: 'none',
      color: h ? '#f0f0f8' : '#8888aa', fontSize: 13,
      background: h ? '#2a2a3d' : 'transparent',
      fontFamily: 'Karla', transition: 'all 0.15s',
    }} onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}>
      {icon} {label}
    </Link>
  )
}

function MLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      style={{ display: 'block', color: '#8888aa', textDecoration: 'none', fontSize: 14, padding: '8px 0', fontFamily: 'Karla' }}>
      {children}
    </Link>
  )
}
