import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiEdit2, FiCheck, FiX, FiGrid, FiBookOpen, FiStar } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import WriteReviewModal from '../components/WriteReviewModal'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import { StarRatingDisplay } from '../components/StarRating'
import { STATUS_LABELS, STATUS_COLORS, STATUS_ICONS, formatPlaytime } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

const TABS = ['reviews', 'games', 'stats']

export default function Profile() {
  const { steamId }        = useParams()
  const { user: me, setUser } = useAuth()
  const isOwn              = me?.steamId === steamId

  const [profile,  setProfile]  = useState(null)
  const [stats,    setStats]    = useState(null)
  const [reviews,  setReviews]  = useState([])
  const [logs,     setLogs]     = useState([])
  const [tab,      setTab]      = useState('reviews')
  const [loading,  setLoading]  = useState(true)
  const [editBio,  setEditBio]  = useState(false)
  const [bio,      setBio]      = useState('')
  const [editModal, setEditModal] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/users/${steamId}`),
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
  }, [steamId])

  const handleSaveBio = async () => {
    try {
      await api.patch('/users/me/bio', { bio })
      setProfile(p => ({ ...p, bio }))
      if (isOwn) setUser({ ...me, bio })
      setEditBio(false)
      toast.success('Bio updated!')
    } catch { toast.error('Failed to update bio') }
  }

  const handleDeleteReview = async (id) => {
    if (!confirm('Delete this review?')) return
    try {
      await api.delete(`/reviews/${id}`)
      setReviews(r => r.filter(x => x._id !== id))
      toast.success('Review deleted')
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return <PageLoader />
  if (!profile) return <div style={{ textAlign: 'center', padding: '4rem', color: '#8888aa' }}>User not found</div>

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: 220, background: '#0a0a12', overflow: 'hidden' }}>
        <img
          src={`https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, filter: 'blur(2px)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, #0f0f17 100%)' }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* ── Profile header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: -60, marginBottom: '2rem', flexWrap: 'wrap' }}>
          <img src={profile.avatar} alt={profile.username}
            style={{ width: 100, height: 100, borderRadius: 16, border: '4px solid #0f0f17', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 26, color: '#f0f0f8' }}>{profile.username}</h1>
              {profile.countryCode && (
                <span style={{ fontSize: 20 }}>
                  {String.fromCodePoint(...[...profile.countryCode.toUpperCase()].map(c => c.charCodeAt(0) + 127397))}
                </span>
              )}
            </div>
            {/* Bio */}
            {editBio ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', maxWidth: 500 }}>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={500}
                  className="textarea" rows={2} style={{ flex: 1, fontSize: 13 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={handleSaveBio} style={{ background: '#00e676', border: 'none', borderRadius: 6, padding: '6px', cursor: 'pointer', color: '#0f0f17' }}><FiCheck size={14} /></button>
                  <button onClick={() => { setEditBio(false); setBio(profile.bio || '') }} style={{ background: '#2a2a3d', border: 'none', borderRadius: 6, padding: '6px', cursor: 'pointer', color: '#f0f0f8' }}><FiX size={14} /></button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontFamily: 'Karla', fontSize: 14, color: '#8888aa', maxWidth: 500 }}>
                  {profile.bio || (isOwn ? 'Add a bio...' : 'No bio yet.')}
                </p>
                {isOwn && (
                  <button onClick={() => setEditBio(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555570', padding: 4 }}>
                    <FiEdit2 size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#1b2838', border: '1px solid #3a4d5c', borderRadius: 8,
            padding: '8px 14px', textDecoration: 'none', color: '#c6d4df',
            fontFamily: 'Karla', fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>
            <SiSteam size={15} style={{ color: '#67c1f5' }} /> Steam Profile
          </a>
        </div>

        {/* ── Stats bar ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12, marginBottom: '2rem',
        }}>
          {[
            { label: 'Games Logged', value: stats?.logCount || 0, icon: '🎮' },
            { label: 'Reviews',      value: stats?.reviewCount || 0, icon: '✍️' },
            { label: 'Avg Rating',   value: stats?.avgRating ? `${stats.avgRating}★` : '—', icon: '⭐' },
            { label: 'Completed',    value: stats?.statusCounts?.completed || 0, icon: '🏆' },
            { label: 'Playing',      value: stats?.statusCounts?.playing   || 0, icon: '▶️' },
            { label: 'Dropped',      value: stats?.statusCounts?.dropped   || 0, icon: '💀' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#1c1c28', border: '1px solid #2a2a3d', borderRadius: 12,
              padding: '1rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: '#f0f0f8' }}>{s.value}</p>
              <p style={{ fontFamily: 'Karla', fontSize: 12, color: '#555570', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #2a2a3d', marginBottom: '1.5rem' }}>
          {[['reviews','Reviews'], ['games','Game Log'], ['stats','Stats']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 16px',
              borderBottom: tab === key ? '2px solid #00e676' : '2px solid transparent',
              color: tab === key ? '#f0f0f8' : '#555570',
              fontFamily: 'Syne', fontWeight: 700, fontSize: 14,
              transition: 'color 0.15s', marginBottom: -1,
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {tab === 'reviews' && (
          reviews.length === 0
            ? <EmptyState icon="✍️" title="No reviews yet" description={isOwn ? 'Head to a game page and write your first review!' : 'This user hasn\'t written any reviews yet.'} />
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.map(r => (
                  <ReviewCard key={r._id} review={r}
                    onEdit={isOwn ? () => setEditModal(r) : undefined}
                    onDelete={isOwn ? handleDeleteReview : undefined}
                  />
                ))}
              </div>
        )}

        {tab === 'games' && (
          logs.length === 0
            ? <EmptyState icon="🎮" title="No games logged" description={isOwn ? 'Start logging games from your Library!' : 'Nothing here yet.'} />
            : <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                  {logs.map(log => (
                    <Link key={log._id} to={`/game/${log.appId}`} style={{ textDecoration: 'none' }}>
                      <div className="game-card-hover" style={{ background: '#1c1c28', borderRadius: 12, overflow: 'hidden', border: '1px solid #2a2a3d' }}>
                        <div style={{ paddingTop: '46.7%', position: 'relative', background: '#0f0f17' }}>
                          <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${log.appId}/header.jpg`}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => e.target.style.display = 'none'}
                          />
                          <div style={{
                            position: 'absolute', top: 6, left: 6,
                            background: 'rgba(0,0,0,0.8)', borderRadius: 4, padding: '2px 6px',
                            fontSize: 10, fontFamily: 'Karla', fontWeight: 700,
                            color: STATUS_COLORS[log.status],
                          }}>
                            {STATUS_ICONS[log.status]}
                          </div>
                        </div>
                        <div style={{ padding: '0.5rem 0.65rem' }}>
                          <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 11, color: '#f0f0f8',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.gameName}
                          </p>
                          {log.rating && <StarRatingDisplay value={log.rating} size={10} />}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
        )}

        {tab === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Status breakdown */}
            <div style={{ background: '#1c1c28', borderRadius: 16, padding: '1.5rem', border: '1px solid #2a2a3d' }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#f0f0f8', marginBottom: '1.25rem' }}>Status Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(STATUS_LABELS).map(([key, label]) => {
                  const count = stats.statusCounts?.[key] || 0
                  const pct = stats.logCount ? Math.round(count / stats.logCount * 100) : 0
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontFamily: 'Karla', color: STATUS_COLORS[key] }}>{STATUS_ICONS[key]} {label}</span>
                        <span style={{ fontSize: 12, fontFamily: 'Karla', fontWeight: 700, color: '#f0f0f8' }}>{count}</span>
                      </div>
                      <div style={{ height: 4, background: '#0f0f17', borderRadius: 2 }}>
                        <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: STATUS_COLORS[key], transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rating distribution */}
            <div style={{ background: '#1c1c28', borderRadius: 16, padding: '1.5rem', border: '1px solid #2a2a3d' }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#f0f0f8', marginBottom: '1.25rem' }}>Quick Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Total Logged',  stats.logCount      || 0, '#00e676'],
                  ['Total Reviews', stats.reviewCount   || 0, '#40bcf4'],
                  ['Avg Rating',    stats.avgRating ? `${stats.avgRating} / 5` : 'N/A', '#ffd700'],
                  ['Completed',     stats.statusCounts?.completed || 0, '#a855f7'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2a3d', paddingBottom: 10 }}>
                    <span style={{ fontFamily: 'Karla', fontSize: 14, color: '#8888aa' }}>{label}</span>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 60 }} />
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
