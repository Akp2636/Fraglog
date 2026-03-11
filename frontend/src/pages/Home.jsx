import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiArrowDown } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import AuthModal from '../components/AuthModal'
import api from '../utils/api'
import { SkeletonCard } from '../components/LoadingSpinner'

// Big cinematic hero games
const BG_GAME = 1245620 // Elden Ring

const FEATURES = [
  { num: '01', title: 'TRACK\nEVERY GAME', desc: 'Log your status across your entire Steam library. Playing, Played, Dropped, Completed.' },
  { num: '02', title: 'RATE &\nREVIEW',    desc: 'Half-star ratings from 0.5 to 5. Write reviews, mark spoilers, share your take.' },
  { num: '03', title: 'YOUR\nPROFILE',     desc: 'A public gaming identity. Stats, reviews, game log — all in one place.' },
  { num: '04', title: 'DISCOVER\nGAMES',  desc: 'Search any Steam game. See community ratings before you buy.' },
]

export default function Home() {
  const { user, loginWithSteam } = useAuth()
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)
  const [bgLoaded, setBgLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/reviews/feed?limit=3')
      .then(r => setReviews(r.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>

      {/* ────────────────────────────────────────────────────────────
          HERO — Full viewport, massive italic type, dark photo bg
      ──────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 'calc(100vh - 64px)', minHeight: 600, overflow: 'hidden' }}>

        {/* Background image */}
        <img
          src={`https://cdn.akamai.steamstatic.com/steam/apps/${BG_GAME}/library_hero.jpg`}
          alt="hero"
          onLoad={() => setBgLoaded(true)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            filter: 'brightness(0.35) saturate(0.7)',
            transition: 'opacity 1s ease',
            opacity: bgLoaded ? 1 : 0,
          }}
        />

        {/* Dark gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.4) 60%, rgba(8,8,8,0.1) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,1) 0%, transparent 40%)' }} />

        {/* Left social strip */}
        <div style={{
          position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }} className="side-strip">
          <div style={{ width: 1, height: 60, background: '#333' }} />
          <SiSteam size={14} style={{ color: '#555' }} />
          <div style={{ width: 1, height: 60, background: '#333' }} />
        </div>

        {/* Right SCROLL strip */}
        <div style={{
          position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)',
          display: 'flex', alignItems: 'center', gap: 12,
        }} className="side-strip">
          <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 10, letterSpacing: 4, color: '#444', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 40, height: 1, background: '#333' }} />
          <FiArrowDown size={12} style={{ color: '#444', transform: 'rotate(-90deg)' }} />
        </div>

        {/* Main content */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          maxWidth: 1400, margin: '0 auto', padding: '0 5rem',
        }}>
          <div style={{ maxWidth: 820 }}>

            {/* Eyebrow */}
            <div className="animate-fadeInUp" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              marginBottom: '1.5rem',
            }}>
              <div style={{ width: 32, height: 1, background: '#b9ff57' }} />
              <span style={{
                fontFamily: '"Barlow Condensed"', fontWeight: 700,
                fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#b9ff57',
              }}>
                Your Gaming Journal
              </span>
            </div>

            {/* Giant headline */}
            <h1 className="animate-fadeInUp delay-100" style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontWeight: 900, fontStyle: 'italic',
              fontSize: 'clamp(72px, 12vw, 160px)',
              textTransform: 'uppercase',
              lineHeight: 0.88,
              letterSpacing: -2,
              color: '#ffffff',
              marginBottom: '1.5rem',
            }}>
              TRACK<br />
              <span style={{ color: '#b9ff57', WebkitTextStroke: '0px' }}>EVERY</span><br />
              FRAG.
            </h1>

            {/* Subheadline */}
            <p className="animate-fadeInUp delay-200" style={{
              fontFamily: 'Barlow, sans-serif', fontWeight: 300,
              fontSize: 18, color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6, maxWidth: 480, marginBottom: '2.5rem',
            }}>
              Rate your games, write reviews, track your library
              and discover what to play next — all synced to Steam.
            </p>

            {/* CTAs */}
            <div className="animate-fadeInUp delay-300" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {!user ? (
                <>
                  <button onClick={() => setModal('create')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: '#b9ff57', border: 'none', cursor: 'pointer',
                    fontFamily: '"Barlow Condensed"', fontWeight: 800,
                    fontSize: 14, letterSpacing: 3, textTransform: 'uppercase',
                    color: '#080808', padding: '14px 32px',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.paddingRight = '40px' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#b9ff57'; e.currentTarget.style.paddingRight = '32px' }}
                  >
                    <SiSteam size={16} /> Get Started Free <FiArrowRight size={14} />
                  </button>
                  <button onClick={() => navigate('/discover')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'transparent', cursor: 'pointer',
                    fontFamily: '"Barlow Condensed"', fontWeight: 700,
                    fontSize: 14, letterSpacing: 3, textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.4)', padding: '14px 0',
                    border: 'none', transition: 'color 0.2s',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >
                    Browse Games
                  </button>
                </>
              ) : (
                <>
                  <Link to={`/library/${user.steamId}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: '#b9ff57', fontFamily: '"Barlow Condensed"', fontWeight: 800,
                    fontSize: 14, letterSpacing: 3, textTransform: 'uppercase',
                    color: '#080808', padding: '14px 32px', textDecoration: 'none',
                  }}>
                    My Library <FiArrowRight size={14} />
                  </Link>
                  <Link to="/discover" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontFamily: '"Barlow Condensed"', fontWeight: 700,
                    fontSize: 14, letterSpacing: 3, textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.4)', padding: '14px 0',
                    textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    Discover
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom stat bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          borderTop: '1px solid #1a1a1a',
          background: 'rgba(8,8,8,0.8)', backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            maxWidth: 1400, margin: '0 auto', padding: '0 5rem',
            display: 'flex', gap: '4rem', alignItems: 'center', height: 64,
            overflowX: 'auto',
          }}>
            {[
              ['Steam Synced', 'Your library, automatic'],
              ['Half-Star Ratings', '0.5 to 5 precision'],
              ['Public Profile', 'Share your identity'],
              ['Full Reviews', 'Write, like, discover'],
            ].map(([title, sub]) => (
              <div key={title} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 4, height: 4, background: '#b9ff57', borderRadius: '50%' }} />
                <div>
                  <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 13, letterSpacing: 1, color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{title}</p>
                  <p style={{ fontFamily: 'Barlow', fontSize: 11, color: '#444', whiteSpace: 'nowrap' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .side-strip { display: none !important; }
          }
        `}</style>
      </section>

      {/* ────────────────────────────────────────────────────────────
          FEATURES — numbered grid, editorial layout
      ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '8rem 0', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 5rem' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '5rem', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <div style={{ width: 32, height: 1, background: '#b9ff57' }} />
                <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 11, letterSpacing: 4, color: '#b9ff57', textTransform: 'uppercase' }}>
                  What You Get
                </span>
              </div>
              <h2 style={{
                fontFamily: '"Barlow Condensed"', fontWeight: 900, fontStyle: 'italic',
                fontSize: 'clamp(48px, 6vw, 80px)', textTransform: 'uppercase',
                lineHeight: 0.9, color: '#fff', letterSpacing: -1,
              }}>
                BUILT FOR<br />GAMERS.
              </h2>
            </div>
            <p style={{ fontFamily: 'Barlow', fontWeight: 300, fontSize: 16, color: '#555', maxWidth: 300, lineHeight: 1.7 }}>
              Everything you need to track your gaming life in one place.
            </p>
          </div>

          {/* Feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: '#111' }}>
            {FEATURES.map(({ num, title, desc }) => (
              <div key={num} style={{
                background: '#080808', padding: '3rem 2.5rem',
                transition: 'background 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#0f0f0f'}
                onMouseLeave={e => e.currentTarget.style.background = '#080808'}
              >
                <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 900, fontSize: 60, color: '#1a1a1a', lineHeight: 1, marginBottom: '1.5rem' }}>{num}</p>
                <h3 style={{
                  fontFamily: '"Barlow Condensed"', fontWeight: 800,
                  fontSize: 28, textTransform: 'uppercase', lineHeight: 1.1,
                  color: '#fff', marginBottom: '1rem', whiteSpace: 'pre-line',
                }}>{title}</h3>
                <p style={{ fontFamily: 'Barlow', fontWeight: 300, fontSize: 14, color: '#555', lineHeight: 1.7 }}>{desc}</p>
                <div style={{ width: 24, height: 2, background: '#b9ff57', marginTop: '2rem' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          RECENT REVIEWS
      ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 0', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{ width: 24, height: 1, background: '#b9ff57' }} />
                <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 11, letterSpacing: 4, color: '#b9ff57', textTransform: 'uppercase' }}>Community</span>
              </div>
              <h2 style={{ fontFamily: '"Barlow Condensed"', fontWeight: 800, fontSize: 40, textTransform: 'uppercase', color: '#fff', letterSpacing: -0.5 }}>
                Recent Reviews
              </h2>
            </div>
            <Link to="/discover" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 12,
              letterSpacing: 3, textTransform: 'uppercase', color: '#444',
              textDecoration: 'none', transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#444'}
            >
              View All <FiArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, background: '#111' }}>
              {[1,2,3].map(i => <div key={i} style={{ background: '#080808', padding: '2rem' }}><SkeletonCard /></div>)}
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid #111' }}>
              <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 20, color: '#333', textTransform: 'uppercase', letterSpacing: 2 }}>
                No reviews yet — be the first
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, background: '#111' }}>
              {reviews.map(r => (
                <div key={r._id} style={{ background: '#080808', padding: '2rem' }}>
                  <ReviewCard review={r} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          CTA BANNER
      ──────────────────────────────────────────────────────────── */}
      {!user && (
        <section style={{ borderTop: '1px solid #111', borderBottom: '1px solid #111', background: '#0d0d0d' }}>
          <div style={{
            maxWidth: 1400, margin: '0 auto', padding: '6rem 5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 40, flexWrap: 'wrap',
          }}>
            <h2 style={{
              fontFamily: '"Barlow Condensed"', fontWeight: 900, fontStyle: 'italic',
              fontSize: 'clamp(40px, 6vw, 80px)', textTransform: 'uppercase',
              lineHeight: 0.9, letterSpacing: -1, color: '#fff',
            }}>
              START YOUR<br /><span style={{ color: '#b9ff57' }}>GAMING</span><br />JOURNAL.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
              <p style={{ fontFamily: 'Barlow', fontWeight: 300, fontSize: 16, color: '#555', maxWidth: 360, lineHeight: 1.7 }}>
                Connect your Steam account. No forms, no passwords. One click and your entire library is here.
              </p>
              <button onClick={() => setModal('create')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#b9ff57', border: 'none', cursor: 'pointer',
                fontFamily: '"Barlow Condensed"', fontWeight: 800,
                fontSize: 14, letterSpacing: 3, textTransform: 'uppercase',
                color: '#080808', padding: '14px 32px', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                onMouseLeave={e => e.currentTarget.style.background = '#b9ff57'}
              >
                <SiSteam size={16} /> Get Started Free
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ padding: '2rem 5rem', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 900, fontStyle: 'italic', fontSize: 20, color: '#fff' }}>
            FRAG<span style={{ color: '#b9ff57' }}>LOG</span>
          </span>
          <p style={{ fontFamily: 'Barlow', fontSize: 12, color: '#333' }}>
            Not affiliated with Valve. Built for gamers.
          </p>
        </div>
      </footer>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
