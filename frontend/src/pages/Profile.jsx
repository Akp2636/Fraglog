import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiEdit2, FiCheck, FiX, FiExternalLink, FiGrid, FiList } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import WriteReviewModal from '../components/WriteReviewModal'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import { StarRatingDisplay } from '../components/StarRating'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

const S = {
  wrap    : { minHeight: '100vh', background: '#0A0A0A' },
  maxW    : { maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' },
  label   : { fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444' },
  heading : { fontFamily: 'Oswald', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#F0F0F0' },
  body    : { fontFamily: 'Manrope', fontWeight: 300, fontSize: 13, color: '#666', lineHeight: 1.65 },
}

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
      setProfile(pRes.data.user)
      setStats(pRes.data.stats)
      setBio(pRes.data.user.bio || '')
      setReviews(rRes.data.reviews || [])
      setLogs(lRes.data.logs || [])
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
      setEditBio(false)
      toast.success('Bio saved')
    } catch { toast.error('Failed') }
  }

  const handleDeleteReview = async (id) => {
    if (!confirm('Delete this review?')) return
    try {
      await api.delete(`/reviews/${id}`)
      setReviews(r => r.filter(x => x._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  if (loading) return <PageLoader />
  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <p style={{ ...S.heading, fontSize: 18, color: '#444' }}>User not found</p>
    </div>
  )

  const STATS = [
    { label: 'Games Logged', value: stats?.logCount    || 0,   color: '#9EFF00' },
    { label: 'Reviews',      value: stats?.reviewCount || 0,   color: '#40BCF4' },
    { label: 'Completed',    value: stats?.statusCounts?.completed  || 0, color: '#FFD700' },
    { label: 'Playing',      value: stats?.statusCounts?.playing    || 0, color: '#9EFF00' },
    { label: 'Dropped',      value: stats?.statusCounts?.dropped    || 0, color: '#FF3B3B' },
    { label: 'Avg Rating',   value: stats?.avgRating ? `${stats.avgRating}` : '—', color: '#9EFF00' },
  ]

  return (
    <div style={S.wrap}>

      {/* ── Cinematic Banner (fixed height, no overlap) ── */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#0d0d0d', borderBottom: '1px solid #1A1A1A' }}>
        <img
          src="https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'brightness(0.15) saturate(0.4)', transform: 'scale(1.05)' }}
          onError={e => e.target.style.display = 'none'}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #0A0A0A 100%)' }} />
      </div>

      {/* ── Profile Header (fully below banner, no negative margin) ── */}
      <div style={{ background: '#0A0A0A', borderBottom: '1px solid #1A1A1A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 24 }}>

            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ border: '4px solid #0A0A0A', background: '#111', display: 'inline-block' }}>
                <img
                  src={profile.avatar} alt={profile.username}
                  style={{ width: 96, height: 96, objectFit: 'cover', display: 'block' }}
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div style={{ width: 96, height: 96, display: 'none', alignItems: 'center', justifyContent: 'center', background: '#161616' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 40, color: '#333' }}>
                    {profile.username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              </div>
            </div>

            {/* Name + bio */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 34, letterSpacing: '0.04em', color: '#F0F0F0', lineHeight: 1 }}>
                  {profile.username}
                </h1>
                {profile.countryCode && (
                  <span style={{ fontSize: 18 }}>
                    {String.fromCodePoint(...[...profile.countryCode.toUpperCase()].map(c => c.charCodeAt(0) + 127397))}
                  </span>
                )}
              </div>

              {editBio ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', maxWidth: 480 }}>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={500} rows={2}
                    className="inp" style={{ flex: 1, resize: 'none', fontSize: 13 }} autoFocus />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                    <button onClick={handleSaveBio} style={{ background: '#9EFF00', border: 'none', padding: '7px 9px', cursor: 'pointer' }}>
                      <FiCheck size={12} color="#0A0A0A" />
                    </button>
                    <button onClick={() => { setEditBio(false); setBio(profile.bio || '') }} style={{ background: '#1C1C1C', border: '1px solid #222', padding: '7px 9px', cursor: 'pointer' }}>
                      <FiX size={12} color="#888" />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={S.body}>
                    {profile.bio || (isOwn ? 'Add a bio...' : 'No bio yet.')}
                  </p>
                  {isOwn && (
                    <button onClick={() => setEditBio(true)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 3, transition: 'color 0.15s', flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#9EFF00'}
                      onMouseLeave={e => e.currentTarget.style.color = '#333'}>
                      <FiEdit2 size={11} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Steam button */}
            <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#1b2838', border: '1px solid #2a3f52',
                padding: '9px 14px', color: '#c6d4df',
                fontFamily: 'Oswald', fontWeight: 500, fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                transition: 'border-color 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#67c1f5'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a3f52'}>
              <SiSteam size={13} style={{ color: '#67c1f5' }} />
              Steam Profile
              <FiExternalLink size={10} />
            </a>
          </div>

          {/* ── Stat bar (Letterboxd style inline stats) ── */}
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #1A1A1A' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{
                flex: 1, textAlign: 'center', padding: '14px 8px',
                borderRight: i < STATS.length - 1 ? '1px solid #1A1A1A' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#111'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: s.color, lineHeight: 1, letterSpacing: '0.02em' }}>
                  {s.value}
                </p>
                <p style={{ ...S.label, fontSize: 9, marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs + Content ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #1A1A1A', marginBottom: 28 }}>
          {[['reviews','Reviews'],['games','Game Log'],['stats','Stats']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '14px 20px', marginBottom: -1,
              borderBottom: tab === key ? '2px solid #9EFF00' : '2px solid transparent',
              color: tab === key ? '#F0F0F0' : '#444',
              fontFamily: 'Oswald', fontWeight: 600, fontSize: 13,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'color 0.15s',
            }}>
              {label}
            </button>
          ))}
          <button onClick={fetchAll} style={{
            marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#333', padding: '8px 12px',
            transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: 5,
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#9EFF00'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}>
            ↻ Refresh
          </button>
        </div>

        {/* ── Reviews tab ── */}
        {tab === 'reviews' && (
          reviews.length === 0
            ? <EmptyState title="No reviews yet" description={isOwn ? 'Go to a game page and write your first review.' : 'Nothing written yet.'} />
            : <div>
                {reviews.map(r => (
                  <ReviewCard key={r._id} review={r}
                    onEdit={isOwn ? () => setEditModal(r) : undefined}
                    onDelete={isOwn ? handleDeleteReview : undefined}
                  />
                ))}
              </div>
        )}

        {/* ── Game Log tab (Letterboxd poster grid) ── */}
        {tab === 'games' && (
          logs.length === 0
            ? <EmptyState title="No games logged" description={isOwn ? 'Start logging games from the Library or a game page.' : 'Nothing logged yet.'} />
            : (
              <div>
                {/* Group by status */}
                {Object.entries(STATUS_LABELS).map(([statusKey, statusLabel]) => {
                  const group = logs.filter(l => l.status === statusKey)
                  if (group.length === 0) return null
                  return (
                    <div key={statusKey} style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 3, height: 16, background: STATUS_COLORS[statusKey], flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: STATUS_COLORS[statusKey] }}>
                          {statusLabel}
                        </span>
                        <span style={{ fontFamily: 'Manrope', fontSize: 12, color: '#444' }}>({group.length})</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 6 }}>
                        {group.map(log => (
                          <Link key={log._id} to={`/game/${log.appId}`} style={{ textDecoration: 'none' }}>
                            <div className="card-lift" style={{ background: '#111', border: '1px solid #1A1A1A', overflow: 'hidden', cursor: 'pointer' }}>
                              <div style={{ paddingTop: '46.7%', position: 'relative', background: '#0d0d0d' }}>
                                <img
                                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${log.appId}/header.jpg`}
                                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={e => e.target.style.display = 'none'}
                                />
                              </div>
                              <div style={{ padding: '7px 8px', borderTop: '1px solid #1A1A1A' }}>
                                <p style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {log.gameName}
                                </p>
                                {log.rating && <StarRatingDisplay value={log.rating} size={9} />}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
        )}

        {/* ── Stats tab (IMDb / Codeforces style) ── */}
        {tab === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

            {/* Left: status breakdown bars */}
            <div style={{ background: '#111', border: '1px solid #1A1A1A', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 3, height: 18, background: '#9EFF00' }} />
                <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#F0F0F0' }}>Status Breakdown</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {Object.entries(STATUS_LABELS).map(([key, label]) => {
                  const count = stats.statusCounts?.[key] || 0
                  const pct   = stats.logCount ? Math.round(count / stats.logCount * 100) : 0
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                        <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: STATUS_COLORS[key] }}>
                          {label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#444' }}>{pct}%</span>
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: '#F0F0F0', letterSpacing: '0.04em', minWidth: 28, textAlign: 'right' }}>{count}</span>
                        </div>
                      </div>
                      <div style={{ height: 3, background: '#1A1A1A', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: STATUS_COLORS[key], borderRadius: 2, transition: 'width 0.7s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: rating distribution (Codeforces bar chart style) */}
            <div style={{ background: '#111', border: '1px solid #1A1A1A', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 3, height: 18, background: '#9EFF00' }} />
                <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#F0F0F0' }}>Quick Stats</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['Total Logged',  stats.logCount    || 0,   '#9EFF00'],
                  ['Total Reviews', stats.reviewCount || 0,   '#40BCF4'],
                  ['Avg Rating',    stats.avgRating   ? `${stats.avgRating} / 5` : 'N/A', '#FFD700'],
                  ['Completed',     stats.statusCounts?.completed || 0, '#FFD700'],
                  ['Playing Now',   stats.statusCounts?.playing   || 0, '#9EFF00'],
                  ['Dropped',       stats.statusCounts?.dropped   || 0, '#FF3B3B'],
                ].map(([label, val, color], i, arr) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '13px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid #1A1A1A' : 'none',
                  }}>
                    <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555' }}>
                      {label}
                    </span>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 26, color, letterSpacing: '0.04em', lineHeight: 1 }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {editModal && (
        <WriteReviewModal
          game={{ steam_appid: editModal.appId, name: editModal.gameName }}
          existing={editModal}
          onClose={() => setEditModal(null)}
          onSave={updated => setReviews(r => r.map(x => x._id === updated._id ? updated : x))}
        />
      )}
    </div>
  )
}
