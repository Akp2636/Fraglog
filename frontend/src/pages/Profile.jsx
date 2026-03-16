import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiEdit2, FiCheck, FiX, FiExternalLink } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import WriteReviewModal from '../components/WriteReviewModal'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import { StarRatingDisplay } from '../components/StarRating'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { steamId } = useParams()
  const { user: me, setUser } = useAuth()
  const isOwn = me?.steamId === steamId

  const [profile,   setProfile]   = useState(null)
  const [stats,     setStats]     = useState(null)
  const [reviews,   setReviews]   = useState([])
  const [logs,      setLogs]      = useState([])
  const [tab,       setTab]       = useState('reviews')
  const [loading,   setLoading]   = useState(true)
  const [editBio,   setEditBio]   = useState(false)
  const [bio,       setBio]       = useState('')
  const [editModal, setEditModal] = useState(null)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      api.get(`/users/${steamId}?t=${Date.now()}`),
      api.get(`/users/${steamId}/reviews`),
      api.get(`/users/${steamId}/logs`),
    ]).then(([pRes, rRes, lRes]) => {
      setProfile(pRes.data.user); setStats(pRes.data.stats)
      setBio(pRes.data.user.bio || '')
      setReviews(rRes.data.reviews || []); setLogs(lRes.data.logs || [])
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAll()
    const onFocus = () => fetchAll()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [steamId])

  const handleSaveBio = async () => {
    try {
      await api.patch('/users/me/bio', { bio })
      setProfile(p => ({ ...p, bio }))
      if (isOwn) setUser({ ...me, bio })
      setEditBio(false); toast.success('Bio saved')
    } catch { toast.error('Failed') }
  }

  const handleDeleteReview = async (id) => {
    if (!confirm('Delete this review?')) return
    try { await api.delete(`/reviews/${id}`); setReviews(r => r.filter(x => x._id !== id)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  if (loading) return <PageLoader />
  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 20, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444' }}>User not found</p>
    </div>
  )

  const STAT_CARDS = [
    { label: 'Games Logged', value: stats?.logCount    || 0,   color: '#9EFF00' },
    { label: 'Reviews',      value: stats?.reviewCount || 0,   color: '#40BCF4' },
    { label: 'Completed',    value: stats?.statusCounts?.completed || 0, color: '#FFD700' },
    { label: 'Playing',      value: stats?.statusCounts?.playing   || 0, color: '#9EFF00' },
    { label: 'Dropped',      value: stats?.statusCounts?.dropped   || 0, color: '#FF3B3B' },
    { label: 'Avg Rating',   value: stats?.avgRating ? `${stats.avgRating}` : '—', color: '#9EFF00' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>

      {/* Banner */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#0d0d0d' }}>
        <img src="https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08, filter: 'blur(4px)', transform: 'scale(1.1)' }}
          onError={e => e.target.style.display='none'} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Profile header */}
        <div style={{ display: 'flex', gap: 20, marginTop: -56, marginBottom: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            <img src={profile.avatar} alt={profile.username}
              style={{ width: 88, height: 88, objectFit: 'cover', border: '3px solid #0A0A0A', display: 'block' }}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
            <div style={{ width: 88, height: 88, background: '#161616', border: '3px solid #0A0A0A', display: 'none', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 32, color: '#333' }}>
              {profile.username?.[0]?.toUpperCase() || '?'}
            </div>
          </div>

          {/* Name + bio */}
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: '0.04em', color: '#F0F0F0', marginBottom: 6 }}>
              {profile.username}
            </h1>
            {editBio ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', maxWidth: 480 }}>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={500} rows={2}
                  className="inp" style={{ flex: 1, resize: 'none', fontSize: 13 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={handleSaveBio} style={{ background: '#9EFF00', border: 'none', padding: '6px 8px', cursor: 'pointer' }}><FiCheck size={12} color="#0A0A0A" /></button>
                  <button onClick={() => { setEditBio(false); setBio(profile.bio || '') }} style={{ background: '#222', border: 'none', padding: '6px 8px', cursor: 'pointer' }}><FiX size={12} color="#888" /></button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 13, color: '#555' }}>
                  {profile.bio || (isOwn ? 'Add a bio...' : 'No bio yet.')}
                </p>
                {isOwn && (
                  <button onClick={() => setEditBio(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 2, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color='#888'} onMouseLeave={e => e.currentTarget.style.color='#333'}>
                    <FiEdit2 size={11} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Steam link */}
          <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1b2838',
            border: '1px solid #2a3f52', padding: '9px 14px', color: '#c6d4df',
            fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.08em',
            textTransform: 'uppercase', transition: 'border-color 0.15s', flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor='#67c1f5'}
            onMouseLeave={e => e.currentTarget.style.borderColor='#2a3f52'}>
            <SiSteam size={13} style={{ color: '#67c1f5' }} /> Steam Profile <FiExternalLink size={10} />
          </a>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 1, background: '#1A1A1A', marginBottom: 32 }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} style={{ background: '#111', padding: '20px 16px', textAlign: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='#161616'}
              onMouseLeave={e => e.currentTarget.style.background='#111'}>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: 40, color: s.color, lineHeight: 1, letterSpacing: '0.02em' }}>{s.value}</p>
              <p className="t-label" style={{ marginTop: 4, fontSize: 10 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #1A1A1A', marginBottom: 24 }}>
          {[['reviews','Reviews'],['games','Game Log'],['stats','Stats']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '11px 18px',
              borderBottom: tab === key ? '2px solid #9EFF00' : '2px solid transparent',
              color: tab === key ? '#F0F0F0' : '#444',
              fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'color 0.15s', marginBottom: -1,
            }}>{label}</button>
          ))}
          <button onClick={fetchAll} style={{
            marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#333', padding: '8px 12px', transition: 'color 0.15s',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
            onMouseEnter={e => e.currentTarget.style.color='#9EFF00'}
            onMouseLeave={e => e.currentTarget.style.color='#333'}>
            ↻ Refresh
          </button>
        </div>

        {/* Tab: Reviews */}
        {tab === 'reviews' && (
          reviews.length === 0
            ? <EmptyState title="No reviews yet" description={isOwn ? 'Go to a game page and write your first review.' : 'No reviews yet.'} />
            : reviews.map(r => (
              <ReviewCard key={r._id} review={r}
                onEdit={isOwn ? () => setEditModal(r) : undefined}
                onDelete={isOwn ? handleDeleteReview : undefined} />
            ))
        )}

        {/* Tab: Game Log */}
        {tab === 'games' && (
          logs.length === 0
            ? <EmptyState title="No games logged" description={isOwn ? 'Start logging games from your Library.' : 'Nothing logged yet.'} />
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1, background: '#1A1A1A' }}>
                {logs.map(log => (
                  <Link key={log._id} to={`/game/${log.appId}`} style={{ textDecoration: 'none' }}>
                    <div className="game-card-hover card-lift" style={{ background: '#0A0A0A', cursor: 'pointer' }}>
                      <div style={{ paddingTop: '46.7%', position: 'relative', background: '#111' }}>
                        <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${log.appId}/header.jpg`}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => e.target.style.display='none'} />
                        <div style={{ position: 'absolute', top: 6, left: 6, background: STATUS_COLORS[log.status], color: '#0A0A0A', padding: '2px 6px', fontFamily: 'Oswald', fontWeight: 600, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {STATUS_LABELS[log.status]}
                        </div>
                      </div>
                      <div style={{ padding: '7px 9px', borderTop: '1px solid #1A1A1A' }}>
                        <p style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.gameName}
                        </p>
                        {log.rating && <StarRatingDisplay value={log.rating} size={9} />}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
        )}

        {/* Tab: Stats */}
        {tab === 'stats' && stats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1A1A1A' }}>
            <div style={{ background: '#111', padding: '24px' }}>
              <p className="t-label" style={{ marginBottom: 20 }}>Status Breakdown</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(STATUS_LABELS).map(([key, label]) => {
                  const count = stats.statusCounts?.[key] || 0
                  const pct   = stats.logCount ? Math.round(count / stats.logCount * 100) : 0
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: STATUS_COLORS[key] }}>
                          {label}
                        </span>
                        <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, color: '#F0F0F0', letterSpacing: '0.04em' }}>{count}</span>
                      </div>
                      <div style={{ height: 2, background: '#1A1A1A' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: STATUS_COLORS[key], transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {editModal && (
        <WriteReviewModal game={{ steam_appid: editModal.appId, name: editModal.gameName }} existing={editModal}
          onClose={() => setEditModal(null)}
          onSave={updated => setReviews(r => r.map(x => x._id === updated._id ? updated : x))} />
      )}
    </div>
  )
}
