import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiBookOpen } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const [search,   setSearch]   = useState('')
  const [dropdown, setDropdown] = useState(false)
  const [mobile,   setMobile]   = useState(false)
  const [modal,    setModal]    = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = e => {
    e.preventDefault()
    if (!search.trim()) return
    navigate(`/discover?q=${encodeURIComponent(search.trim())}`)
    setSearch(''); setSearchOpen(false); setMobile(false)
  }

  const handleLogout = async () => {
    await logout()
    setDropdown(false)
    toast.success('Signed out')
    navigate('/')
  }

  const isActive = path => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,8,8,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          padding: '0 2rem',
          display: 'flex', alignItems: 'center',
          height: 64,
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', marginRight: '3rem', flexShrink: 0 }}>
            <span style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontWeight: 900, fontStyle: 'italic',
              fontSize: 28, color: '#ffffff',
              letterSpacing: -1, textTransform: 'uppercase',
            }}>
              FRAG<span style={{ color: '#b9ff57' }}>LOG</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }} className="nav-d">
            {([
              ['/', 'Home'],
              ['/discover', 'Games'],
              ...(user ? [
                [`/profile/${user.steamId}`, 'Profile'],
                [`/library/${user.steamId}`, 'Library'],
              ] : []),
            ]).map(([path, label]) => (
              <Link key={path} to={path} style={{
                fontFamily: '"Barlow Condensed", sans-serif',
                fontWeight: 700, fontSize: 13,
                letterSpacing: 2, textTransform: 'uppercase',
                color: isActive(path) && path !== '/' ? '#ffffff' : location.pathname === path ? '#ffffff' : '#555555',
                textDecoration: 'none',
                borderBottom: (isActive(path) && path !== '/') || location.pathname === path
                  ? '2px solid #b9ff57' : '2px solid transparent',
                paddingBottom: 2,
                transition: 'color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = (isActive(path) && path !== '/') || location.pathname === path ? '#ffffff' : '#555555'}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="nav-d">

            {/* Search */}
            <div style={{ position: 'relative' }}>
              {searchOpen ? (
                <form onSubmit={handleSearch}>
                  <input
                    autoFocus
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="SEARCH GAMES..."
                    onBlur={() => { if (!search) setSearchOpen(false) }}
                    style={{
                      background: 'transparent', border: 'none',
                      borderBottom: '1px solid #b9ff57',
                      color: '#ffffff', fontFamily: '"Barlow Condensed", sans-serif',
                      fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
                      outline: 'none', padding: '4px 28px 4px 0', width: 200,
                    }}
                  />
                  <button type="submit" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#b9ff57' }}>
                    <FiSearch size={14} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555555', transition: 'color 0.15s', padding: 4 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#555555'}>
                  <FiSearch size={16} />
                </button>
              )}
            </div>

            {/* Auth */}
            {loading ? (
              <div style={{ width: 32, height: 32, background: '#161616', borderRadius: '50%' }} />
            ) : user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setDropdown(!dropdown)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer',
                }}>
                  <img src={user.avatar} alt={user.username}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #222' }}
                  />
                  <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 1, color: '#888', textTransform: 'uppercase' }}>
                    {user.username.slice(0, 12)}
                  </span>
                </button>

                {dropdown && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setDropdown(false)} />
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                      background: '#111', border: '1px solid #222',
                      width: 220, zIndex: 20,
                    }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #222' }}>
                        <p style={{ fontFamily: '"Barlow Condensed"', fontSize: 10, letterSpacing: 2, color: '#444', textTransform: 'uppercase' }}>Signed in as</p>
                        <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 800, fontSize: 16, color: '#fff', textTransform: 'uppercase', marginTop: 2 }}>{user.username}</p>
                      </div>
                      {[
                        [FiUser,     `/profile/${user.steamId}`, 'My Profile'],
                        [FiGrid,     `/library/${user.steamId}`, 'My Library'],
                        [FiBookOpen, '/discover',                'Discover'],
                      ].map(([Icon, to, label]) => (
                        <Link key={to} to={to} onClick={() => setDropdown(false)} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '11px 16px', textDecoration: 'none',
                          color: '#888', fontSize: 13,
                          fontFamily: '"Barlow Condensed"', fontWeight: 700,
                          letterSpacing: 1, textTransform: 'uppercase',
                          borderBottom: '1px solid #1a1a1a', transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#fff' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888' }}
                        >
                          <Icon size={12} /> {label}
                        </Link>
                      ))}
                      <button onClick={handleLogout} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '11px 16px', background: 'none', border: 'none',
                        color: '#ff2d2d', fontSize: 13, cursor: 'pointer',
                        fontFamily: '"Barlow Condensed"', fontWeight: 700,
                        letterSpacing: 1, textTransform: 'uppercase', transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1a0000'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <FiLogOut size={12} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={() => setModal('signin')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                  fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
                  color: '#555', transition: 'color 0.15s', padding: '4px 0',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#555'}
                >
                  Sign In
                </button>
                <button onClick={() => setModal('create')} style={{
                  background: '#b9ff57', border: 'none', cursor: 'pointer',
                  fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
                  fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
                  color: '#080808', padding: '8px 18px',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#b9ff57'}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobile(!mobile)} className="nav-m"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'none' }}>
            {mobile ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobile && (
          <div style={{ background: '#0d0d0d', borderTop: '1px solid #1a1a1a', padding: '1.5rem 2rem' }}>
            <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH GAMES..."
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  borderBottom: '1px solid #333', color: '#fff',
                  fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 14,
                  letterSpacing: 2, textTransform: 'uppercase', outline: 'none', padding: '8px 0',
                }}
              />
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {user ? (
                <>
                  <MLink to={`/profile/${user.steamId}`} onClick={() => setMobile(false)}>Profile</MLink>
                  <MLink to={`/library/${user.steamId}`} onClick={() => setMobile(false)}>Library</MLink>
                  <MLink to="/discover" onClick={() => setMobile(false)}>Games</MLink>
                  <button onClick={handleLogout}
                    style={{ textAlign: 'left', background: 'none', border: 'none', color: '#ff2d2d', fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '10px 0', cursor: 'pointer' }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                  <button onClick={() => { setModal('signin'); setMobile(false) }}
                    style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '12px', fontFamily: '"Barlow Condensed"', fontWeight: 800, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>
                    Sign In
                  </button>
                  <button onClick={() => { setModal('create'); setMobile(false) }}
                    style={{ background: '#b9ff57', border: 'none', color: '#080808', padding: '12px', fontFamily: '"Barlow Condensed"', fontWeight: 800, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <style>{`
          @media (max-width: 768px) {
            .nav-d { display: none !important; }
            .nav-m { display: flex !important; }
          }
          @media (min-width: 769px) {
            .nav-d { display: flex !important; }
            .nav-m { display: none !important; }
          }
        `}</style>
      </nav>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}
    </>
  )
}

function MLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'block', color: '#888', textDecoration: 'none',
      fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 14,
      letterSpacing: 2, textTransform: 'uppercase', padding: '10px 0',
      borderBottom: '1px solid #1a1a1a',
    }}>
      {children}
    </Link>
  )
}

