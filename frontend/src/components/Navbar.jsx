import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiBookOpen, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import toast from 'react-hot-toast'

const NAV = [
  ['/', 'Home'],
  ['/discover', 'Games'],
  ['/lists', 'Lists'],
  ['/activity', 'Activity'],
]

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const [search,      setSearch]     = useState('')
  const [searchOpen,  setSearchOpen] = useState(false)
  const [dropdown,    setDropdown]   = useState(false)
  const [mobile,      setMobile]     = useState(false)
  const [modal,       setModal]      = useState(null)
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleSearch = e => {
    e.preventDefault()
    if (!search.trim()) return
    navigate(`/discover?q=${encodeURIComponent(search.trim())}`)
    setSearch(''); setSearchOpen(false); setMobile(false)
  }

  const handleLogout = async () => {
    await logout(); setDropdown(false)
    toast.success('Signed out'); navigate('/')
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      <nav className="glass" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid #1A1A1A', height: 60,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 32 }}>

          {/* Logo */}
          <Link to="/" style={{ flexShrink: 0 }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: '0.06em', color: '#F0F0F0' }}>
              FRAG<span style={{ color: '#9EFF00' }}>LOG</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1 }} className="d-nav">
            {NAV.map(([path, label]) => (
              <Link key={path} to={path} className={`nav-link ${isActive(path) ? 'active' : ''}`}>{label}</Link>
            ))}
            {user && <>
              <Link to={`/profile/${user.steamId}`} className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>Profile</Link>
              <Link to={`/library/${user.steamId}`} className={`nav-link ${isActive('/library') ? 'active' : ''}`}>Library</Link>
            </>}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="d-nav">
            {/* Search */}
            <div style={{ position: 'relative' }}>
              {searchOpen ? (
                <form onSubmit={handleSearch}>
                  <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search games..."
                    onBlur={() => { if (!search) setSearchOpen(false) }}
                    style={{
                      background: 'transparent', border: 'none', borderBottom: '1px solid #9EFF00',
                      color: '#F0F0F0', fontFamily: 'Manrope', fontSize: 13,
                      outline: 'none', padding: '4px 28px 4px 0', width: 200,
                    }}
                  />
                  <button type="submit" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9EFF00' }}>
                    <FiSearch size={14} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#888'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
                  <FiSearch size={16} />
                </button>
              )}
            </div>

            {/* Auth */}
            {loading ? (
              <div style={{ width: 32, height: 32, background: '#111', borderRadius: '50%' }} />
            ) : user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setDropdown(!dropdown)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  <img src={user.avatar} alt={user.username}
                    style={{ width: 30, height: 30, objectFit: 'cover', border: '1px solid #222' }}
                    onError={e => e.target.style.display='none'}
                  />
                  <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#888' }}>
                    {user.username.slice(0, 14)}
                  </span>
                  <FiChevronDown size={12} style={{ color: '#444', transition: 'transform 0.2s', transform: dropdown ? 'rotate(180deg)' : 'none' }} />
                </button>

                {dropdown && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setDropdown(false)} />
                    <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 12px)', background: '#111', border: '1px solid #222', width: 200, zIndex: 20 }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1A1A1A' }}>
                        <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#F0F0F0' }}>{user.username}</p>
                        <p style={{ fontFamily: 'Manrope', fontSize: 11, color: '#444', marginTop: 2 }}>Steam Account</p>
                      </div>
                      {[
                        [FiUser,     `/profile/${user.steamId}`, 'Profile'],
                        [FiGrid,     `/library/${user.steamId}`, 'Library'],
                        [FiBookOpen, '/discover',                'Discover'],
                      ].map(([Icon, to, label]) => (
                        <Link key={to} to={to} onClick={() => setDropdown(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#888', fontFamily: 'Oswald', fontWeight: 500, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #1A1A1A', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background='#161616'; e.currentTarget.style.color='#F0F0F0' }}
                          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#888' }}>
                          <Icon size={12} />{label}
                        </Link>
                      ))}
                      <button onClick={handleLogout} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '11px 16px', background: 'none', border: 'none', color: '#FF3B3B',
                        fontFamily: 'Oswald', fontWeight: 500, fontSize: 13, letterSpacing: '0.06em',
                        textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background='#1a0a0a'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <FiLogOut size={12} />Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button onClick={() => setModal('signin')} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>
                  Sign In
                </button>
                <button onClick={() => setModal('create')} className="btn-primary" style={{ padding: '8px 18px', fontSize: 12 }}>
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobile(!mobile)} className="m-nav"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'none' }}>
            {mobile ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile */}
        {mobile && (
          <div style={{ background: '#0A0A0A', borderTop: '1px solid #1A1A1A', padding: '16px 24px' }}>
            <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search games..."
                className="inp" style={{ fontSize: 13 }} />
            </form>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {user ? <>
                {[['/', 'Home'],['/discover','Games'],[`/profile/${user.steamId}`,'Profile'],[`/library/${user.steamId}`,'Library']].map(([path, label]) => (
                  <Link key={path} to={path} onClick={() => setMobile(false)}
                    style={{ padding: '12px 0', fontFamily: 'Oswald', fontWeight: 500, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #1A1A1A' }}>
                    {label}
                  </Link>
                ))}
                <button onClick={handleLogout} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#FF3B3B', fontFamily: 'Oswald', fontWeight: 500, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 0', cursor: 'pointer' }}>
                  Sign Out
                </button>
              </> : <>
                <button onClick={() => { setModal('signin'); setMobile(false) }} className="btn-ghost" style={{ marginBottom: 8, justifyContent: 'center' }}>Sign In</button>
                <button onClick={() => { setModal('create'); setMobile(false) }} className="btn-primary" style={{ justifyContent: 'center' }}>Get Started</button>
              </>}
            </div>
          </div>
        )}

        <style>{`
          @media (max-width: 768px) { .d-nav { display: none !important; } .m-nav { display: flex !important; } }
          @media (min-width: 769px) { .d-nav { display: flex !important; } .m-nav { display: none !important; } }
        `}</style>
      </nav>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}
    </>
  )
}
