import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiSearch, FiStar, FiBookOpen, FiGrid, FiHeart, FiTrendingUp, FiAward } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import AuthModal from '../components/AuthModal'
import api from '../utils/api'
import { SkeletonCard } from '../components/LoadingSpinner'

const HERO_GAMES = [
  { appid: 1172470, name: 'Apex Legends' },
  { appid: 730,     name: 'CS2' },
  { appid: 1245620, name: 'Elden Ring' },
  { appid: 252490,  name: 'Rust' },
  { appid: 1091500, name: 'Cyberpunk 2077' },
  { appid: 271590,  name: 'GTA V' },
]

export default function Home() {
  const { user, loginWithSteam } = useAuth()
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)
  const [search,   setSearch]   = useState('')
  const navigate   = useNavigate()

  useEffect(() => {
    api.get('/reviews/feed?limit=6')
      .then(r => setReviews(r.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = e => {
    e.preventDefault()
    if (search.trim()) navigate(`/discover?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f17' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Background collage */}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
          {HERO_GAMES.map(g => (
            <div key={g.appid} style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src={`https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/library_hero.jpg`}
                alt={g.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25) saturate(0.5)', transition: 'filter 0.3s' }}
                onError={e => { e.target.src = `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg` }}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,15,23,0.3) 0%, rgba(15,15,23,0.6) 50%, #0f0f17 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(15,15,23,0.8) 0%, transparent 50%, rgba(15,15,23,0.8) 100%)' }} />

        {/* Hero content */}
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
          <div style={{ maxWidth: 640, animation: 'fadeInUp 0.7s ease' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)',
              borderRadius: 20, padding: '5px 14px', marginBottom: '1.5rem',
            }}>
              <SiSteam size={13} style={{ color: '#00e676' }} />
              <span style={{ fontSize: 12, color: '#00e676', fontFamily: 'Karla', fontWeight: 700, letterSpacing: 0.5 }}>
                POWERED BY STEAM
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Syne', fontWeight: 800, lineHeight: 1.1,
              marginBottom: '1.25rem', letterSpacing: -1,
            }}>
              <span style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#f0f0f8', display: 'block' }}>
                Track every
              </span>
              <span style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                background: 'linear-gradient(135deg, #00e676, #40bcf4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', display: 'block',
              }}>
                frag you've earned
              </span>
            </h1>

            <p style={{
              fontSize: 18, color: '#8888aa', lineHeight: 1.65,
              marginBottom: '2rem', fontFamily: 'Karla', maxWidth: 520,
            }}>
              Fraglog is the gamer's journal — rate your games, write reviews,
              track your library and discover what to play next.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: 8, maxWidth: 480 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#555570', pointerEvents: 'none' }} />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search any Steam game..."
                    style={{
                      width: '100%', background: 'rgba(22,22,31,0.9)', border: '1px solid #2a2a3d',
                      borderRadius: 10, paddingLeft: 42, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
                      fontSize: 15, color: '#f0f0f8', fontFamily: 'Karla', outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#00e676'}
                    onBlur={e  => e.target.style.borderColor = '#2a2a3d'}
                  />
                </div>
                <button type="submit" style={{
                  background: '#00e676', border: 'none', borderRadius: 10, padding: '0 20px',
                  color: '#0f0f17', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  Search
                </button>
              </div>
            </form>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {!user ? (
                <>
                  <button onClick={() => setModal('create')} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#00e676', border: 'none', borderRadius: 10,
                    padding: '13px 24px', fontFamily: 'Syne', fontWeight: 800, fontSize: 15,
                    color: '#0f0f17', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#00ff88'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,230,118,0.35)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#00e676'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <SiSteam size={18} /> Get Started Free
                  </button>
                  <button onClick={() => navigate('/discover')} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'transparent', border: '1px solid #2a2a3d', borderRadius: 10,
                    padding: '13px 24px', fontFamily: 'Karla', fontWeight: 700, fontSize: 15,
                    color: '#8888aa', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#8888aa'; e.currentTarget.style.color = '#f0f0f8' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3d'; e.currentTarget.style.color = '#8888aa' }}
                  >
                    Browse Games <FiArrowRight size={15} />
                  </button>
                </>
              ) : (
                <>
                  <Link to={`/library/${user.steamId}`} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#00e676', borderRadius: 10,
                    padding: '13px 24px', fontFamily: 'Syne', fontWeight: 800, fontSize: 15,
                    color: '#0f0f17', textDecoration: 'none',
                  }}>
                    <FiGrid size={18} /> My Library
                  </Link>
                  <Link to="/discover" style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'transparent', border: '1px solid #2a2a3d', borderRadius: 10,
                    padding: '13px 24px', fontFamily: 'Karla', fontWeight: 700, fontSize: 15,
                    color: '#8888aa', textDecoration: 'none',
                  }}>
                    Discover <FiArrowRight size={15} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(22,22,31,0.9)', backdropFilter: 'blur(8px)',
          borderTop: '1px solid #2a2a3d',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', gap: '3rem', overflowX: 'auto' }}>
            {[
              ['Track Games', 'Log your status & hours'],
              ['Rate & Review', 'Half-star precision ratings'],
              ['Steam Synced', 'Your library, automatically'],
              ['Public Profile', 'Share your gamer identity'],
            ].map(([title, desc]) => (
              <div key={title} style={{ flexShrink: 0 }}>
                <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#f0f0f8', whiteSpace: 'nowrap' }}>{title}</p>
                <p style={{ fontFamily: 'Karla', fontSize: 12, color: '#555570', whiteSpace: 'nowrap', marginTop: 2 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: 12, color: '#00e676', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Everything you need</p>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: '#f0f0f8' }}>
            Your gaming life, organized
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { icon: FiGrid, color: '#00e676', title: 'Full Library Sync', desc: 'Your entire Steam collection synced automatically. Hours played, last played, all your games in one place.' },
            { icon: FiStar, color: '#ffd700', title: 'Half-Star Ratings', desc: 'Rate games from 0.5 to 5 stars with precision. From Abysmal to Masterpiece — every game deserves an honest score.' },
            { icon: FiBookOpen, color: '#40bcf4', title: 'Game Journal', desc: 'Log status for every game — Playing, Played, Want to Play, Dropped, On Hold or Completed.' },
            { icon: FiHeart, color: '#ff4757', title: 'Community Reviews', desc: 'Read and write in-depth reviews. Like your favourites, mark spoilers, share your take.' },
            { icon: FiTrendingUp, color: '#ff6b35', title: 'Profile & Stats', desc: 'Public profile showing your gaming stats, review history and game log for everyone to see.' },
            { icon: FiAward, color: '#a855f7', title: 'Discover Games', desc: 'Search any Steam game, see community ratings and read reviews before you buy.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="game-card-hover" style={{
              background: '#1c1c28', border: '1px solid #2a2a3d', borderRadius: 14, padding: '1.5rem',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, marginBottom: '1rem',
                background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${color}30`,
              }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#f0f0f8', marginBottom: 8 }}>{title}</h3>
              <p style={{ fontFamily: 'Karla', fontSize: 14, color: '#8888aa', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── RECENT REVIEWS ────────────────────────────────────────────────────── */}
      <section style={{ background: '#0a0a12', borderTop: '1px solid #1a1a2e', borderBottom: '1px solid #1a1a2e', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: 12, color: '#00e676', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Community</p>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, color: '#f0f0f8' }}>Recent Reviews</h2>
            </div>
            <Link to="/discover" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'Karla', fontWeight: 700, fontSize: 13, color: '#8888aa', textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#f0f0f8'}
              onMouseLeave={e => e.currentTarget.style.color = '#8888aa'}
            >
              Browse all <FiArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#555570', fontFamily: 'Karla' }}>
              No reviews yet. Be the first to write one!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      {!user && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#f0f0f8', marginBottom: 16 }}>
            Ready to start your gaming journal?
          </h2>
          <p style={{ fontFamily: 'Karla', fontSize: 16, color: '#8888aa', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Connect your Steam account in one click. No forms, no passwords.
          </p>
          <button onClick={() => setModal('create')} style={{
            background: '#00e676', border: 'none', borderRadius: 12,
            padding: '15px 32px', fontFamily: 'Syne', fontWeight: 800, fontSize: 16,
            color: '#0f0f17', cursor: 'pointer', transition: 'all 0.2s',
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00ff88'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,230,118,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#00e676'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <SiSteam size={20} /> Get Started — It's Free
          </button>
        </section>
      )}

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0a0a12', borderTop: '1px solid #1a1a2e', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {['#00e676','#40bcf4','#ff6b35'].map(c => (
                <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'block' }} />
              ))}
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: '#f0f0f8' }}>FRAGLOG</span>
          </div>
          <p style={{ fontSize: 12, color: '#555570', fontFamily: 'Karla' }}>
            Not affiliated with Valve or Steam. Built for gamers by gamers.
          </p>
        </div>
      </footer>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
