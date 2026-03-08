import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiBook } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_LINK_STYLE = {
  fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
  color: '#9ab', textDecoration: 'none',
  fontFamily: 'Karla, sans-serif',
  transition: 'color 0.15s',
}

export default function Navbar() {
  const { user, loading, logout, loginWithSteam } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setDropdownOpen(false)
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <nav style={{
      background: '#14181c',
      borderBottom: '1px solid #1f2830',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 1rem',
        display: 'flex', alignItems: 'center',
        height: 50, gap: '1.5rem',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          {/* Three dots — exactly like Letterboxd */}
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#00b020', display: 'block' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#40bcf4', display: 'block' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff8000', display: 'block' }} />
          </div>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20,
            color: '#fff', letterSpacing: -0.5,
          }}>
            Fraglog
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}
          className="hidden-mobile">
          {user ? (
            <>
              <NavLink to={`/profile/${user.steamId}`} active={location.pathname.includes('/profile')}>PROFILE</NavLink>
              <NavLink to={`/library/${user.steamId}`} active={location.pathname.includes('/library')}>LIBRARY</NavLink>
              <NavLink to="/discover" active={location.pathname === '/discover'}>GAMES</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" active={location.pathname === '/'}>HOME</NavLink>
              <NavLink to="/discover" active={location.pathname === '/discover'}>GAMES</NavLink>
              <NavLink to="/discover" active={false}>MEMBERS</NavLink>
              <NavLink to="/discover" active={false}>JOURNAL</NavLink>
            </>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flexShrink: 0 }} className="hidden-mobile">
          <div style={{ position: 'relative' }}>
            <FiSearch style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: '#678', fontSize: 13, pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: '#2c3440', border: '1px solid #3a4550',
                borderRadius: 20, paddingLeft: 32, paddingRight: 14,
                paddingTop: 6, paddingBottom: 6,
                fontSize: 13, color: '#eef', fontFamily: 'Karla, sans-serif',
                outline: 'none', width: 180, transition: 'border-color 0.15s, width 0.3s',
              }}
              onFocus={e => { e.target.style.borderColor = '#00b020'; e.target.style.width = '220px' }}
              onBlur={e => { e.target.style.borderColor = '#3a4550'; e.target.style.width = '180px' }}
            />
          </div>
        </form>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}
          className="hidden-mobile">
          {loading ? (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2c3440' }} />
          ) : user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                <img
                  src={user.avatar} alt={user.username}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: '2px solid #2c3440', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#00b020'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2c3440'}
                />
                <span style={{ fontSize: 13, color: '#9ab', fontFamily: 'Karla, sans-serif' }}>
                  {user.username}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setDropdownOpen(false)} />
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: '#2c3440', border: '1px solid #3a4550',
                    borderRadius: 6, width: 180, overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 20,
                  }}>
                    <DropItem to={`/profile/${user.steamId}`} icon={<FiUser size={13} />} label="My Profile" onClick={() => setDropdownOpen(false)} />
                    <DropItem to={`/library/${user.steamId}`} icon={<FiBook size={13} />} label="My Library" onClick={() => setDropdownOpen(false)} />
                    <div style={{ borderTop: '1px solid #3a4550' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 14px', background: 'none', border: 'none',
                        color: '#9ab', fontSize: 13, cursor: 'pointer',
                        fontFamily: 'Karla, sans-serif', transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#3a4550'; e.currentTarget.style.color = '#ef4444' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9ab' }}
                    >
                      <FiLogOut size={13} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={loginWithSteam}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  ...NAV_LINK_STYLE,
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ab'}
              >
                SIGN IN
              </button>
              <button
                onClick={loginWithSteam}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  ...NAV_LINK_STYLE,
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ab'}
              >
                CREATE ACCOUNT
              </button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="show-mobile"
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: '#9ab', cursor: 'pointer',
          }}
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: '#1a2030', borderTop: '1px solid #1f2830',
          padding: '1rem',
        }}>
          <form onSubmit={handleSearch} style={{ marginBottom: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#678', fontSize: 13 }} />
              <input type="text" placeholder="Search games…" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: '#2c3440', border: '1px solid #3a4550', borderRadius: 6,
                  paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                  fontSize: 14, color: '#eef', width: '100%', outline: 'none',
                  fontFamily: 'Karla, sans-serif',
                }}
              />
            </div>
          </form>
          {user ? (
            <>
              <MobileLink to={`/profile/${user.steamId}`} onClick={() => setMobileOpen(false)}>My Profile</MobileLink>
              <MobileLink to={`/library/${user.steamId}`} onClick={() => setMobileOpen(false)}>My Library</MobileLink>
              <MobileLink to="/discover" onClick={() => setMobileOpen(false)}>Discover Games</MobileLink>
              <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#9ab', fontSize: 14, padding: '6px 0', cursor: 'pointer', fontFamily: 'Karla, sans-serif' }}>
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => { loginWithSteam(); setMobileOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#00b020', color: '#fff', border: 'none', borderRadius: 5,
                padding: '10px 20px', fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: 14, cursor: 'pointer', width: '100%', justifyContent: 'center',
              }}
            >
              <SiSteam /> Sign in with Steam
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}

function NavLink({ to, children, active }) {
  const [h, setH] = useState(false)
  return (
    <Link to={to} style={{
      ...NAV_LINK_STYLE,
      color: active ? '#fff' : h ? '#cde' : '#9ab',
    }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    >
      {children}
    </Link>
  )
}

function DropItem({ to, icon, label, onClick }) {
  const [h, setH] = useState(false)
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', textDecoration: 'none',
      color: h ? '#fff' : '#9ab', fontSize: 13,
      background: h ? '#3a4550' : 'transparent',
      fontFamily: 'Karla, sans-serif', transition: 'all 0.15s',
    }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    >
      {icon} {label}
    </Link>
  )
}

function MobileLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'block', color: '#9ab', textDecoration: 'none',
      fontSize: 14, padding: '6px 0', fontFamily: 'Karla, sans-serif',
    }}>
      {children}
    </Link>
  )
}
