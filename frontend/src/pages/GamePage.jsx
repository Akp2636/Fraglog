import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiExternalLink } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import WriteReviewModal from '../components/WriteReviewModal'
import LogGameModal from '../components/LogGameModal'
import { StarRatingDisplay } from '../components/StarRating'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function GamePage() {
  const { appId }    = useParams()
  const { user }     = useAuth()
  const [game,       setGame]       = useState(null)
  const [fraglog,    setFraglog]    = useState(null)
  const [reviews,    setReviews]    = useState([])
  const [myReview,   setMyReview]   = useState(null)
  const [myLog,      setMyLog]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [showReview, setShowReview] = useState(false)
  const [showLog,    setShowLog]    = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/games/${appId}`),
      api.get(`/games/${appId}/reviews?limit=10`),
    ]).then(([gRes, rRes]) => {
      setGame(gRes.data.game)
      setFraglog(gRes.data.fraglog)
      const all = rRes.data.reviews || []
      setReviews(all)
      if (user) setMyReview(all.find(r => r.steamId === user.steamId) || null)
    }).catch(() => toast.error('Failed to load game'))
      .finally(() => setLoading(false))

    if (user) {
      api.get(`/logs/check/${appId}`).then(r => setMyLog(r.data.log)).catch(() => {})
    }
  }, [appId, user?.steamId])

  if (loading) return <PageLoader />
  if (!game)   return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#555' }}>
      <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 24, textTransform: 'uppercase', letterSpacing: 2 }}>Game not found</p>
    </div>
  )

  const headerImg = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
  const heroImg   = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg`
  const otherReviews = reviews.filter(r => r.steamId !== user?.steamId)

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>

      {/* ── Hero banner — NO overlap, just a dark strip ── */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#0a0a0a' }}>
        <img src={heroImg} alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25) blur(2px)', transform: 'scale(1.05)' }}
          onError={e => e.target.style.display = 'none'}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, #080808 100%)' }} />
      </div>

      {/* ── Page body — fully below hero, no overlap ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 4rem', overflowX: 'hidden' }}>

        {/* ── Game header row ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          gap: 20, marginBottom: '2rem',
          flexWrap: 'wrap',
        }}>
          {/* Cover image */}
          <img src={headerImg} alt={game.name}
            style={{ width: 200, height: 94, objectFit: 'cover', border: '2px solid #1a1a1a', flexShrink: 0 }}
            onError={e => e.target.style.display = 'none'}
          />

          {/* Title + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: '"Barlow Condensed"', fontWeight: 900, fontStyle: 'italic',
              fontSize: 'clamp(24px, 3.5vw, 44px)', textTransform: 'uppercase',
              color: '#fff', lineHeight: 1, letterSpacing: -1, marginBottom: 12,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {game.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
              {fraglog?.reviewCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRatingDisplay value={fraglog.avgRating} size={13} />
                  <span style={{ fontSize: 12, color: '#444', fontFamily: 'Barlow' }}>
                    ({fraglog.reviewCount} review{fraglog.reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
              {fraglog?.logCount > 0 && (
                <span style={{ fontSize: 12, color: '#444', fontFamily: 'Barlow' }}>
                  🎮 {fraglog.logCount} players logged
                </span>
              )}
              {game.metacritic && (
                <span style={{
                  background: game.metacritic.score >= 75 ? '#0a1a0a' : '#1a0a0a',
                  border: `1px solid ${game.metacritic.score >= 75 ? '#b9ff57' : '#ff2d2d'}`,
                  color: game.metacritic.score >= 75 ? '#b9ff57' : '#ff2d2d',
                  padding: '2px 8px', fontSize: 11,
                  fontFamily: '"Barlow Condensed"', fontWeight: 700, letterSpacing: 1,
                }}>
                  MC {game.metacritic.score}
                </span>
              )}
            </div>

            <a href={`https://store.steampowered.com/app/${appId}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#40bcf4', fontFamily: 'Barlow', textDecoration: 'none' }}>
              <SiSteam size={12} /> View on Steam <FiExternalLink size={10} />
            </a>
          </div>

          {/* Action buttons — always visible, right side */}
          {user && (
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
              <button onClick={() => setShowLog(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: myLog ? 'transparent' : '#b9ff57',
                border: myLog ? '1px solid #b9ff57' : 'none',
                padding: '11px 20px', cursor: 'pointer',
                fontFamily: '"Barlow Condensed"', fontWeight: 800,
                fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
                color: myLog ? '#b9ff57' : '#080808',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#b9ff57'; e.currentTarget.style.color = '#080808' }}
                onMouseLeave={e => { e.currentTarget.style.background = myLog ? 'transparent' : '#b9ff57'; e.currentTarget.style.color = myLog ? '#b9ff57' : '#080808' }}
              >
                {myLog ? <FiEdit2 size={13} /> : <FiPlus size={13} />}
                {myLog ? myLog.status.replace(/_/g, ' ') : 'Log Game'}
              </button>

              <button onClick={() => setShowReview(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent',
                border: `1px solid ${myReview ? '#40bcf4' : '#333'}`,
                padding: '11px 20px', cursor: 'pointer',
                fontFamily: '"Barlow Condensed"', fontWeight: 800,
                fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
                color: myReview ? '#40bcf4' : '#555',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = myReview ? '#40bcf4' : '#333'; e.currentTarget.style.color = myReview ? '#40bcf4' : '#555' }}
              >
                {myReview ? <FiEdit2 size={13} /> : <FiPlus size={13} />}
                {myReview ? 'Edit Review' : 'Write Review'}
              </button>
            </div>
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: 24, alignItems: 'start' }}>

          {/* Main */}
          <div>
            {/* Description */}
            {game.short_description && (
              <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '1.25rem', marginBottom: '2rem' }}>
                <p style={{ fontFamily: 'Barlow', fontWeight: 300, fontSize: 14, color: '#888', lineHeight: 1.75 }}>
                  {game.short_description}
                </p>
              </div>
            )}

            {/* Your review */}
            {myReview && (
              <div style={{ marginBottom: '2rem' }}>
                <SectionLabel>Your Review</SectionLabel>
                <div style={{ background: '#0d0d0d', padding: '1.25rem' }}>
                  <ReviewCard
                    review={{ ...myReview, author: user }}
                    showGame={false}
                    onEdit={() => setShowReview(true)}
                    onDelete={async (id) => {
                      try {
                        await api.delete(`/reviews/${id}`)
                        setMyReview(null)
                        setReviews(r => r.filter(x => x._id !== id))
                        toast.success('Review deleted')
                      } catch { toast.error('Failed') }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Community reviews */}
            <SectionLabel>Community Reviews {otherReviews.length > 0 && `(${otherReviews.length})`}</SectionLabel>
            {otherReviews.length === 0 ? (
              <EmptyState icon="✍️" title="No reviews yet" description="Be the first to review this game!" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1a1a1a' }}>
                {otherReviews.map(r => (
                  <div key={r._id} style={{ background: '#080808', padding: '1.25rem' }}>
                    <ReviewCard review={r} showGame={false} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1a1a1a' }}>

            {/* Genres */}
            {game.genres?.length > 0 && (
              <div style={{ background: '#0d0d0d', padding: '1.25rem' }}>
                <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 10 }}>Genres</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {game.genres.map(g => (
                    <span key={g.id} style={{
                      background: '#111', border: '1px solid #222',
                      padding: '3px 9px', fontSize: 11,
                      fontFamily: '"Barlow Condensed"', fontWeight: 700,
                      letterSpacing: 1, textTransform: 'uppercase', color: '#555',
                    }}>
                      {g.description}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div style={{ background: '#0d0d0d', padding: '1.25rem' }}>
              <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 10 }}>Details</p>
              {[
                ['Developer', game.developers?.[0]],
                ['Publisher', game.publishers?.[0]],
                ['Release',   game.release_date?.date],
                ['Platforms', [
                  game.platforms?.windows && 'Windows',
                  game.platforms?.mac && 'Mac',
                  game.platforms?.linux && 'Linux',
                ].filter(Boolean).join(', ')],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: '1px solid #111' }}>
                  <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#444' }}>{k}</span>
                  <span style={{ fontFamily: 'Barlow', fontSize: 12, color: '#888', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Screenshots */}
            {game.screenshots?.slice(0, 3).map(s => (
              <img key={s.id} src={s.path_thumbnail}
                style={{ width: '100%', display: 'block', border: '1px solid #1a1a1a' }}
              />
            ))}
          </div>
        </div>
      </div>

      {showReview && (
        <WriteReviewModal
          game={game}
          existing={myReview}
          onClose={() => setShowReview(false)}
          onSave={r => {
            setMyReview(r)
            setReviews(prev => {
              const idx = prev.findIndex(x => x._id === r._id)
              return idx >= 0 ? prev.map(x => x._id === r._id ? r : x) : [r, ...prev]
            })
          }}
        />
      )}

      {showLog && (
        <LogGameModal
          game={{ ...game, appid: appId, steam_appid: appId }}
          existing={myLog}
          onClose={() => setShowLog(false)}
          onSave={l => setMyLog(l)}
        />
      )}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily: '"Barlow Condensed"', fontWeight: 700,
      fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
      color: '#444', marginBottom: 12,
    }}>
      {children}
    </p>
  )
}
