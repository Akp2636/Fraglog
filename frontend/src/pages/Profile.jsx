import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiEdit2, FiCheck, FiX, FiExternalLink } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import WriteReviewModal from '../components/WriteReviewModal'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import { StarRatingDisplay } from '../components/StarRating'
import { STATUS_LABELS, STATUS_COLORS, STATUS_ICONS } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { steamId }           = useParams()
  const { user: me, setUser } = useAuth()
  const isOwn                 = me?.steamId === steamId

  const [profile,   setProfile]   = useState(null)
  const [stats,     setStats]     = useState(null)
  const [reviews,   setReviews]   = useState([])
  const [logs,      setLogs]      = useState([])
  const [tab,       setTab]       = useState('reviews')
  const [loading,   setLoading]   = useState(true)
  const [editBio,   setEditBio]   = useState(false)
  const [bio,       setBio]       = useState('')
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
  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#555' }}>
      <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 24, textTransform: 'uppercase', letterSpacing: 2 }}>User not found</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>

      {/* ── Hero banner ── */}
      <div style={{ position: 'relative', height: 200, background: '#0a0a0a', overflow: 'hidden' }}>
        <img
          src={`https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, filter: 'blur(3px)', transform: 'scale(1.05)' }}
          onError={e => e.target.style.display = 'none'}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, #080808 100%)' }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>

        {/* ── Profile header ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 20,
          marginTop: -60, marginBottom: '2.5rem',
          flexWrap: 'wrap',
        }}>
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            <img
              src={profile.avatar}
              alt={profile.username}
              style={{ width: 96, height: 96, border: '3px solid #080808', display: 'block' }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div style={{
              width: 96, height: 96, background: '#161616', border: '3px solid #080808',
              display: 'none', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Barlow Condensed"', fontWeight: 900, fontSize: 36, color: '#333',
            }}>
              {profile.username?.[0]?.toUpperCase() || '?'}
            </div>
          </div>

          {/* Name + bio */}
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: '"Barlow Condensed"', fontWeight: 900, fontStyle: 'italic',
                fontSize: 32, textTransform: 'uppercase', color: '#fff', letterSpacing: -0.5,
              }}>
                {profile.username}
              </h1>
              {profile.countryCode && (
                <span style={{ fontSize: 20 }}>
                  {String.fromCodePoint(...[...profile.countryCode.toUpperCase()].map(c => c.charCodeAt(0) + 127397))}
                </span>
              )}
            </div>

            {editBio ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', maxWidth: 500 }}>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={500}
                  rows={2}
                  style={{
                    flex: 1, background: '#111', border: '1px solid #333',
                    color: '#fff', fontFamily: 'Barlow', fontSize: 13,
                    padding: '8px 12px', outline: 'none', resize: 'none',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={handleSaveBio} style={{ background: '#b9ff57', border: 'none', padding: '7px 8px', cursor: 'pointer' }}><FiCheck size={13} color="#080808" /></button>
                  <button onClick={() => { setEditBio(false); setBio(profile.bio || '') }} style={{ background: '#222', border: 'none', padding: '7px 8px', cursor: 'pointer' }}><FiX size={13} color="#fff" /></button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontFamily: 'Barlow', fontWeight: 300, fontSize: 14, color: '#555' }}>
                  {profile.bio || (isOwn ? 'Add a bio...' : 'No bio yet.')}
                </p>
                {isOwn && (
                  <button onClick={() => setEditBio(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 2, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#333'}>
                    <FiEdit2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Steam profile link */}
          <a
            href={profile.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#1b2838', border: '1px solid #2a3f52',
              padding: '10px 16px', textDecoration: 'none',
              color: '#c6d4df', fontFamily: '"Barlow Condensed"',
              fontWeight: 700, fontSize: 13, letterSpacing: 1.5,
              textTransform: 'uppercase', transition: 'border-color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#67c1f5'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2a3f52'}
          >
            <SiSteam size={14} style={{ color: '#67c1f5' }} />
            Steam Profile
            <FiExternalLink size={11} />
          </a>
        </div>

        {/* ── Stats bar ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 1, background: '#111', marginBottom: '2.5rem',
        }}>
          {[
            { label: 'Games Logged', value: stats?.logCount      || 0 },
            { label: 'Reviews',      value: stats?.reviewCount   || 0 },
            { label: 'Avg Rating',   value: stats?.avgRating ? `${stats.avgRating}★` : '—' },
            { label: 'Completed',    value: stats?.statusCounts?.completed || 0 },
            { label: 'Playing',      value: stats?.statusCounts?.playing   || 0 },
            { label: 'Dropped',      value: stats?.statusCounts?.dropped   || 0 },
          ].map(s => (
            <div key={s.label} style={{
              background: '#0d0d0d', padding: '1.5rem 1.25rem', textAlign: 'center',
            }}>
              <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 900, fontStyle: 'italic', fontSize: 36, color: '#fff', lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginTop: 4 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', marginBottom: '2rem' }}>
          {[['reviews','Reviews'], ['games','Game Log'], ['stats','Stats']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 20px',
              borderBottom: tab === key ? '2px solid #b9ff57' : '2px solid transparent',
              color: tab === key ? '#fff' : '#444',
              fontFamily: '"Barlow Condensed"', fontWeight: 700,
              fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
              transition: 'color 0.15s', marginBottom: -1,
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Reviews tab ── */}
        {tab === 'reviews' && (
          reviews.length === 0 ? (
            <EmptyState icon="✍️" title="No reviews yet"
              description={isOwn ? 'Go to a game page and write your first review!' : 'No reviews yet.'} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#111' }}>
              {reviews.map(r => (
                <div key={r._id} style={{ background: '#080808', padding: '1.5rem' }}>
                  <ReviewCard review={r}
                    onEdit={isOwn ? () => setEditModal(r) : undefined}
                    onDelete={isOwn ? handleDeleteReview : undefined}
                  />
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Games tab ── */}
        {tab === 'games' && (
          logs.length === 0 ? (
            <EmptyState icon="🎮" title="No games logged"
              description={isOwn ? 'Start logging games from your Library!' : 'Nothing logged yet.'} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1, background: '#111' }}>
              {logs.map(log => (
                <Link key={log._id} to={`/game/${log.appId}`} style={{ textDecoration: 'none' }}>
                  <div className="card-lift" style={{ background: '#080808', cursor: 'pointer' }}>
                    <div style={{ position: 'relative', paddingTop: '46.7%', background: '#0d0d0d' }}>
                      <img
                        src={`https://cdn.akamai.steamstatic.com/steam/apps/${log.appId}/header.jpg`}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => e.target.style.display = 'none'}
                      />
                      <div style={{
                        position: 'absolute', top: 6, left: 6,
                        background: 'rgba(0,0,0,0.85)', padding: '2px 6px',
                        fontFamily: '"Barlow Condensed"', fontWeight: 700,
                        fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
                        color: STATUS_COLORS[log.status],
                      }}>
                        {STATUS_ICONS[log.status]}
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem 0.65rem' }}>
                      <p style={{
                        fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 12,
                        textTransform: 'uppercase', letterSpacing: 0.5, color: '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {log.gameName}
                      </p>
                      {log.rating && <StarRatingDisplay value={log.rating} size={10} />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* ── Stats tab ── */}
        {tab === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1, background: '#111' }}>

            {/* Status breakdown */}
            <div style={{ background: '#0d0d0d', padding: '2rem' }}>
              <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: '1.5rem' }}>
                Status Breakdown
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(STATUS_LABELS).map(([key, label]) => {
                  const count = stats.statusCounts?.[key] || 0
                  const pct   = stats.logCount ? Math.round(count / stats.logCount * 100) : 0
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: STATUS_COLORS[key] }}>
                          {STATUS_ICONS[key]} {label}
                        </span>
                        <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 900, fontSize: 16, color: '#fff' }}>{count}</span>
                      </div>
                      <div style={{ height: 2, background: '#1a1a1a' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: STATUS_COLORS[key], transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ background: '#0d0d0d', padding: '2rem' }}>
              <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: '1.5rem' }}>
                Quick Stats
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #1a1a1a' }}>
                {[
                  ['Total Logged',  stats.logCount    || 0,   '#b9ff57'],
                  ['Total Reviews', stats.reviewCount || 0,   '#40bcf4'],
                  ['Avg Rating',    stats.avgRating ? `${stats.avgRating} / 5` : 'N/A', '#ffd700'],
                  ['Completed',     stats.statusCounts?.completed || 0, '#b9ff57'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', borderBottom: '1px solid #1a1a1a',
                  }}>
                    <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: '#444' }}>{label}</span>
                    <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 900, fontSize: 22, color }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 80 }} />
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
