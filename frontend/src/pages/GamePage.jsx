import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiExternalLink } from 'react-icons/fi'
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
  const [imgError,   setImgError]   = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/games/${appId}`),
      api.get(`/games/${appId}/reviews?limit=10`),
    ]).then(([gRes, rRes]) => {
      setGame(gRes.data.game)
      setFraglog(gRes.data.fraglog)
      const allReviews = rRes.data.reviews || []
      setReviews(allReviews)
      if (user) setMyReview(allReviews.find(r => r.steamId === user.steamId) || null)
    }).catch(() => toast.error('Failed to load game'))
      .finally(() => setLoading(false))

    if (user) {
      api.get(`/logs/check/${appId}`)
        .then(r => setMyLog(r.data.log))
        .catch(() => {})
    }
  }, [appId, user?.steamId])

  if (loading) return <PageLoader />
  if (!game) return <div style={{ textAlign: 'center', padding: '4rem', color: '#8888aa' }}>Game not found</div>

  const hero = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg`
  const header = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
  const otherReviews = reviews.filter(r => r.steamId !== user?.steamId)

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: 320, overflow: 'hidden', background: '#0a0a12' }}>
        <img
          src={imgError ? header : hero}
          alt={game.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }}
          onError={() => setImgError(true)}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, #0f0f17 100%)' }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* ── Game header ── */}
        <div style={{ display: 'flex', gap: 20, marginTop: -80, marginBottom: '2rem', flexWrap: 'wrap' }}>
          <img src={header} alt={game.name}
            style={{ width: 200, height: 94, objectFit: 'cover', borderRadius: 10, border: '3px solid #0f0f17', flexShrink: 0 }}
            onError={e => e.target.style.display = 'none'}
          />
          <div style={{ flex: 1, minWidth: 250, paddingTop: 50 }}>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: '#f0f0f8', marginBottom: 8 }}>{game.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {fraglog?.reviewCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRatingDisplay value={fraglog.avgRating} size={14} />
                  <span style={{ fontSize: 12, color: '#555570', fontFamily: 'Karla' }}>
                    ({fraglog.reviewCount} review{fraglog.reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
              {fraglog?.logCount > 0 && (
                <span style={{ fontSize: 12, color: '#555570', fontFamily: 'Karla' }}>
                  🎮 {fraglog.logCount} players logged
                </span>
              )}
              {game.metacritic && (
                <span style={{
                  background: game.metacritic.score >= 75 ? '#1a3a1a' : '#3a1a1a',
                  border: `1px solid ${game.metacritic.score >= 75 ? '#00e676' : '#ff4757'}`,
                  color: game.metacritic.score >= 75 ? '#00e676' : '#ff4757',
                  borderRadius: 6, padding: '2px 8px', fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 700,
                }}>
                  MC {game.metacritic.score}
                </span>
              )}
              <a href={`https://store.steampowered.com/app/${appId}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#40bcf4', fontFamily: 'Karla', textDecoration: 'none' }}>
                Steam <FiExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Action buttons */}
          {user && (
            <div style={{ display: 'flex', gap: 8, paddingTop: 50, flexShrink: 0 }}>
              <button onClick={() => setShowLog(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: myLog ? '#00e67622' : '#00e676', border: myLog ? '1px solid #00e676' : 'none',
                borderRadius: 10, padding: '10px 16px', cursor: 'pointer',
                color: myLog ? '#00e676' : '#0f0f17', fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
              }}>
                {myLog ? <FiEdit2 size={13} /> : <FiPlus size={13} />}
                {myLog ? myLog.status.replace('_', ' ') : 'Log Game'}
              </button>
              <button onClick={() => setShowReview(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: myReview ? '#40bcf422' : 'transparent', border: `1px solid ${myReview ? '#40bcf4' : '#2a2a3d'}`,
                borderRadius: 10, padding: '10px 16px', cursor: 'pointer',
                color: myReview ? '#40bcf4' : '#8888aa', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, transition: 'all 0.15s',
              }}>
                {myReview ? <FiEdit2 size={13} /> : <FiPlus size={13} />}
                {myReview ? 'Edit Review' : 'Write Review'}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
          {/* ── Main content ── */}
          <div>
            {/* Description */}
            {game.short_description && (
              <div style={{ background: '#1c1c28', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #2a2a3d' }}>
                <p style={{ fontFamily: 'Karla', fontSize: 14, color: '#aaaacc', lineHeight: 1.7 }}>
                  {game.short_description}
                </p>
              </div>
            )}

            {/* Your review */}
            {myReview && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#f0f0f8', marginBottom: 12 }}>Your Review</h2>
                <ReviewCard review={{ ...myReview, author: user }}
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
            )}

            {/* Community reviews */}
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#f0f0f8', marginBottom: 12 }}>
              Community Reviews {otherReviews.length > 0 && <span style={{ color: '#555570', fontWeight: 400 }}>({otherReviews.length})</span>}
            </h2>
            {otherReviews.length === 0 ? (
              <EmptyState icon="✍️" title="No reviews yet" description="Be the first to review this game!" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {otherReviews.map(r => <ReviewCard key={r._id} review={r} showGame={false} />)}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Genres */}
            {game.genres?.length > 0 && (
              <div style={{ background: '#1c1c28', borderRadius: 12, padding: '1rem', border: '1px solid #2a2a3d' }}>
                <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: 11, color: '#555570', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Genres</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {game.genres.map(g => (
                    <span key={g.id} style={{ background: '#0f0f17', border: '1px solid #2a2a3d', borderRadius: 6, padding: '3px 8px', fontSize: 12, fontFamily: 'Karla', color: '#8888aa' }}>
                      {g.description}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div style={{ background: '#1c1c28', borderRadius: 12, padding: '1rem', border: '1px solid #2a2a3d' }}>
              <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: 11, color: '#555570', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Details</p>
              {[
                ['Developer', game.developers?.[0]],
                ['Publisher', game.publishers?.[0]],
                ['Release',   game.release_date?.date],
                ['Platforms', [game.platforms?.windows && 'Windows', game.platforms?.mac && 'Mac', game.platforms?.linux && 'Linux'].filter(Boolean).join(', ')],
              ].filter(([,v]) => v).map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                  <span style={{ fontFamily: 'Karla', fontSize: 12, color: '#555570', flexShrink: 0 }}>{k}</span>
                  <span style={{ fontFamily: 'Karla', fontSize: 12, color: '#f0f0f8', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Screenshots */}
            {game.screenshots?.slice(0, 4).map(s => (
              <img key={s.id}
                src={s.path_thumbnail}
                style={{ width: '100%', borderRadius: 8, border: '1px solid #2a2a3d' }}
              />
            ))}
          </div>
        </div>

        <div style={{ height: 60 }} />
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
