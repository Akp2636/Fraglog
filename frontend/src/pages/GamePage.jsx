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
import { STATUS_LABELS, STATUS_COLORS } from '../utils/helpers'
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
    Promise.all([api.get(`/games/${appId}`), api.get(`/games/${appId}/reviews?limit=10`)])
      .then(([gRes, rRes]) => {
        setGame(gRes.data.game); setFraglog(gRes.data.fraglog)
        const all = rRes.data.reviews || []; setReviews(all)
        if (user) setMyReview(all.find(r => r.steamId === user.steamId) || null)
      }).catch(() => toast.error('Failed to load game'))
      .finally(() => setLoading(false))
    if (user) api.get(`/logs/check/${appId}?t=${Date.now()}`).then(r => setMyLog(r.data.log)).catch(() => {})
  }, [appId, user?.steamId])

  if (loading) return <PageLoader />
  if (!game) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 22, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444' }}>Game not found</p>
    </div>
  )

  const heroImg = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg`
  const headerImg = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
  const otherReviews = reviews.filter(r => r.steamId !== user?.steamId)

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#0d0d0d' }}>
        <img src={heroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.2) saturate(0.5)', transform: 'scale(1.05)' }} onError={e => e.target.style.display='none'} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, #0A0A0A 100%)' }} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 64px', overflowX: 'hidden' }}>

        {/* Game header */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Poster */}
          <div style={{ flexShrink: 0 }}>
            <img src={headerImg} alt={game.name} style={{ width: 220, height: 103, objectFit: 'cover', border: '1px solid #222', display: 'block' }} onError={e => e.target.style.display='none'} />
          </div>

          {/* Meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '0.02em', color: '#F0F0F0', lineHeight: 1, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {game.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
              {fraglog?.reviewCount > 0 && <StarRatingDisplay value={fraglog.avgRating} size={13} />}
              {fraglog?.reviewCount > 0 && (
                <span style={{ fontFamily: 'Manrope', fontSize: 12, color: '#444' }}>
                  {fraglog.reviewCount} review{fraglog.reviewCount !== 1 ? 's' : ''}
                </span>
              )}
              {fraglog?.logCount > 0 && (
                <span style={{ fontFamily: 'Manrope', fontSize: 12, color: '#444' }}>{fraglog.logCount} logged</span>
              )}
              {game.metacritic && (
                <span style={{ background: game.metacritic.score >= 75 ? '#0a1a0a' : '#1a0a0a', border: `1px solid ${game.metacritic.score >= 75 ? '#9EFF00' : '#FF3B3B'}`, color: game.metacritic.score >= 75 ? '#9EFF00' : '#FF3B3B', padding: '2px 8px', fontFamily: 'Oswald', fontWeight: 600, fontSize: 11, letterSpacing: '0.08em' }}>
                  MC {game.metacritic.score}
                </span>
              )}
            </div>
            <a href={`https://store.steampowered.com/app/${appId}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'Manrope', fontSize: 12, color: '#40BCF4' }}>
              <SiSteam size={11} /> View on Steam <FiExternalLink size={10} />
            </a>
          </div>

          {/* Actions */}
          {user && (
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
              <button onClick={() => setShowLog(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: myLog ? `${STATUS_COLORS[myLog.status]}18` : '#9EFF00',
                border: myLog ? `1px solid ${STATUS_COLORS[myLog.status]}` : 'none',
                padding: '10px 20px', cursor: 'pointer',
                fontFamily: 'Oswald', fontWeight: 600, fontSize: 13,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: myLog ? STATUS_COLORS[myLog.status] : '#0A0A0A',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!myLog) { e.currentTarget.style.background='#b5ff33' } }}
                onMouseLeave={e => { if (!myLog) { e.currentTarget.style.background='#9EFF00' } }}>
                {myLog ? <FiEdit2 size={13} /> : <FiPlus size={13} />}
                {myLog ? STATUS_LABELS[myLog.status] : 'Log Game'}
              </button>
              <button onClick={() => setShowReview(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', border: `1px solid ${myReview ? '#40BCF4' : '#333'}`,
                padding: '10px 20px', cursor: 'pointer',
                fontFamily: 'Oswald', fontWeight: 600, fontSize: 13,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: myReview ? '#40BCF4' : '#555', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#888'; e.currentTarget.style.color='#F0F0F0' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=myReview?'#40BCF4':'#333'; e.currentTarget.style.color=myReview?'#40BCF4':'#555' }}>
                {myReview ? <FiEdit2 size={13} /> : <FiPlus size={13} />}
                {myReview ? 'Edit Review' : 'Write Review'}
              </button>
            </div>
          )}
        </div>

        {/* Two-column body */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: 32, alignItems: 'start' }}>
          <div>
            {/* Description */}
            {game.short_description && (
              <div style={{ background: '#111', border: '1px solid #1A1A1A', padding: '16px 20px', marginBottom: 32 }}>
                <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 14, color: '#888', lineHeight: 1.75 }}>{game.short_description}</p>
              </div>
            )}

            {/* Your review */}
            {myReview && (
              <div style={{ marginBottom: 32 }}>
                <div className="section-label" style={{ marginBottom: 0 }}><span>Your Review</span></div>
                <ReviewCard review={{ ...myReview, author: user }} showGame={false}
                  onEdit={() => setShowReview(true)}
                  onDelete={async (id) => {
                    try { await api.delete(`/reviews/${id}`); setMyReview(null); setReviews(r => r.filter(x => x._id !== id)); toast.success('Deleted') }
                    catch { toast.error('Failed') }
                  }}
                />
              </div>
            )}

            {/* Community reviews */}
            <div className="section-label" style={{ marginBottom: 0 }}>
              <span>Community Reviews {otherReviews.length > 0 && `(${otherReviews.length})`}</span>
            </div>
            {otherReviews.length === 0
              ? <EmptyState title="No reviews yet" description="Be the first to review this game." />
              : otherReviews.map(r => <ReviewCard key={r._id} review={r} showGame={false} />)
            }
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1A1A1A' }}>
            {game.genres?.length > 0 && (
              <div style={{ background: '#111', padding: '16px' }}>
                <p className="t-label" style={{ marginBottom: 10 }}>Genres</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {game.genres.map(g => (
                    <span key={g.id} style={{ background: '#0A0A0A', border: '1px solid #222', padding: '3px 9px', fontFamily: 'Oswald', fontWeight: 500, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555' }}>
                      {g.description}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ background: '#111', padding: '16px' }}>
              <p className="t-label" style={{ marginBottom: 12 }}>Details</p>
              {[['Developer',game.developers?.[0]],['Publisher',game.publishers?.[0]],['Release',game.release_date?.date],['Platforms',[game.platforms?.windows&&'Windows',game.platforms?.mac&&'Mac',game.platforms?.linux&&'Linux'].filter(Boolean).join(', ')]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '9px 0', borderBottom: '1px solid #1A1A1A' }}>
                  <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444' }}>{k}</span>
                  <span style={{ fontFamily: 'Manrope', fontSize: 12, color: '#888', textAlign: 'right', maxWidth: 140 }}>{v}</span>
                </div>
              ))}
            </div>
            {game.screenshots?.slice(0, 3).map(s => (
              <img key={s.id} src={s.path_thumbnail} style={{ width: '100%', display: 'block', border: '1px solid #1A1A1A' }} />
            ))}
          </div>
        </div>
      </div>

      {showReview && <WriteReviewModal game={game} existing={myReview} onClose={() => setShowReview(false)}
        onSave={r => { setMyReview(r); setReviews(prev => { const idx = prev.findIndex(x=>x._id===r._id); return idx>=0?prev.map(x=>x._id===r._id?r:x):[r,...prev] }) }} />}
      {showLog && <LogGameModal game={{ ...game, appid: appId, steam_appid: appId }} existing={myLog} onClose={() => setShowLog(false)} onSave={l => setMyLog(l)} />}
    </div>
  )
}
