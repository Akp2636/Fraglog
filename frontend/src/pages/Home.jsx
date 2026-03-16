import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import AuthModal from '../components/AuthModal'
import { SkeletonCard } from '../components/LoadingSpinner'
import { StarRatingDisplay } from '../components/StarRating'
import api from '../utils/api'

const MARQUEE_TEXT = 'Made for the love of the game  •  Track every session  •  Rate every experience  •  Discover your next obsession  •  Build your gaming identity  •  '

// Featured game IDs — cinematic games
const FEATURED = [1245620, 1086940, 730, 570, 2369390]

const FEATURES = [
  { num: '01', title: 'Track Every Game', body: 'Log status, playtime, and personal notes across your entire Steam library.' },
  { num: '02', title: 'Rate & Review', body: 'Half-star precision from 0.5 to 5. Write detailed reviews with spoiler protection.' },
  { num: '03', title: 'Your Profile', body: 'A public gaming identity. Stats, game log, reviews — all in one place.' },
  { num: '04', title: 'Discover', body: 'Search any Steam game and see community ratings before you commit.' },
]

export default function Home() {
  const { user, loginWithSteam } = useAuth()
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)
  const [bgLoaded, setBgLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/reviews/feed?limit=4')
      .then(r => setReviews(r.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>

      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section style={{ position: 'relative', height: 'calc(100vh - 60px)', minHeight: 600, overflow: 'hidden' }}>
        {/* Background */}
        <img
          src="https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg"
          alt="" onLoad={() => setBgLoaded(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.25) saturate(0.6)', transition: 'opacity 1s ease', opacity: bgLoaded ? 1 : 0 }}
        />
        {/* Gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.6) 55%, rgba(10,10,10,0.1) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0A0A 0%, transparent 40%)' }} />

        {/* Content */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', width: '100%' }}>
            <div style={{ maxWidth: 720 }}>

              {/* Eyebrow */}
              <div className="anim-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 32, height: 1, background: '#9EFF00' }} />
                <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9EFF00' }}>
                  Your Gaming Journal
                </span>
              </div>

              {/* Main headline */}
              <h1 className="anim-up d1" style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(72px, 10vw, 130px)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#F0F0F0', marginBottom: 20 }}>
                TRACK<br />
                EVERY<br />
                <span style={{ color: '#9EFF00', WebkitTextStroke: '0px' }}>FRAG.</span>
              </h1>

              {/* Subhead */}
              <p className="anim-up d2" style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 17, color: '#666', maxWidth: 480, lineHeight: 1.7, marginBottom: 32 }}>
                Rate your games, write reviews, and track your entire Steam library — all in one place.
              </p>

              {/* CTAs */}
              <div className="anim-up d3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {!user ? (
                  <>
                    <button onClick={() => setModal('create')} className="btn-primary">
                      <SiSteam size={14} /> Start Your Library
                    </button>
                    <button onClick={() => navigate('/discover')} className="btn-ghost">
                      Discover Games <FiArrowRight size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link to={`/library/${user.steamId}`} className="btn-primary">
                      My Library <FiArrowRight size={13} />
                    </Link>
                    <Link to="/discover" className="btn-ghost">
                      Discover Games
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stat strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(10px)', borderTop: '1px solid #1A1A1A' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', gap: '3rem', height: 56, alignItems: 'center', overflowX: 'auto' }}>
            {[['Steam Synced','Your library, instant'],['Half-Star Ratings','0.5 to 5 precision'],['Public Profile','Share your identity'],['Full Reviews','Write, rate, discover']].map(([t, s]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{ width: 3, height: 3, background: '#9EFF00', borderRadius: '50%' }} />
                <div>
                  <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#F0F0F0', whiteSpace: 'nowrap' }}>{t}</p>
                  <p style={{ fontFamily: 'Manrope', fontSize: 10, color: '#444', whiteSpace: 'nowrap' }}>{s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ MARQUEE ═══════════════════════ */}
      <div style={{ background: '#9EFF00', overflow: 'hidden', padding: '10px 0', borderTop: '1px solid #7ACC00', borderBottom: '1px solid #7ACC00' }}>
        <div style={{ display: 'flex', width: 'max-content' }}>
          <div className="marquee-track" style={{ display: 'flex', gap: 0 }}>
            {[...Array(4)].map((_, i) => (
              <span key={i} style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0A0A0A', whiteSpace: 'nowrap', paddingRight: 40 }}>
                {MARQUEE_TEXT}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═════════════════════ FEATURES GRID ══════════════════════ */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid #1A1A1A' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label"><span>What You Get</span></div>
              <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 15, color: '#555', maxWidth: 340, lineHeight: 1.7, marginTop: -8 }}>
                Everything you need to track your gaming life.
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1, background: '#1A1A1A' }}>
            {FEATURES.map(({ num, title, body }) => (
              <div key={num} style={{ background: '#0A0A0A', padding: '36px 28px', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='#111'}
                onMouseLeave={e => e.currentTarget.style.background='#0A0A0A'}>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: 56, color: '#1A1A1A', lineHeight: 1, marginBottom: 16 }}>{num}</p>
                <h3 style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 18, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#F0F0F0', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 13, color: '#555', lineHeight: 1.7 }}>{body}</p>
                <div style={{ width: 24, height: 2, background: '#9EFF00', marginTop: 24 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════ COMMUNITY REVIEWS ══════════════════ */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid #1A1A1A' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div className="section-label"><span>Community Reviews</span></div>
            <Link to="/discover" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color='#F0F0F0'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
              Browse All <FiArrowUpRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: '#1A1A1A' }}>
              {[1,2,3].map(i => <div key={i} style={{ background: '#0A0A0A', padding: '20px' }}><SkeletonCard /></div>)}
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid #1A1A1A' }}>
              <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>No reviews yet — be the first</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 0, background: '#111', border: '1px solid #1A1A1A' }}>
              {reviews.map(r => (
                <div key={r._id} style={{ padding: '0 20px', borderRight: '1px solid #1A1A1A' }}>
                  <ReviewCard review={r} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═════════════════════ CTA BANNER ═════════════════════════ */}
      {!user && (
        <section style={{ padding: '80px 0', background: '#0A0A0A' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(48px, 6vw, 88px)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#F0F0F0' }}>
              START YOUR<br /><span style={{ color: '#9EFF00' }}>GAMING</span><br />JOURNAL.
            </h2>
            <div style={{ maxWidth: 400 }}>
              <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 15, color: '#555', lineHeight: 1.75, marginBottom: 24 }}>
                Connect your Steam account. No forms, no passwords. One click and your entire library is ready to track.
              </p>
              <button onClick={() => setModal('create')} className="btn-primary">
                <SiSteam size={14} /> Get Started Free
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ padding: '24px', borderTop: '1px solid #1A1A1A' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: '0.06em', color: '#F0F0F0' }}>FRAG<span style={{ color: '#9EFF00' }}>LOG</span></span>
          <p style={{ fontFamily: 'Manrope', fontSize: 11, color: '#333' }}>Not affiliated with Valve. Built for gamers.</p>
        </div>
      </footer>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
