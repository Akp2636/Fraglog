import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi'
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
const { steamId } = useParams()
const { user: me, setUser } = useAuth()
const isOwn = me?.steamId === steamId

const [profile, setProfile] = useState(null)
const [stats, setStats] = useState(null)
const [reviews, setReviews] = useState([])
const [logs, setLogs] = useState([])
const [tab, setTab] = useState('reviews')
const [loading, setLoading] = useState(true)
const [editBio, setEditBio] = useState(false)
const [bio, setBio] = useState('')
const [editModal, setEditModal] = useState(null)

useEffect(() => {
setLoading(true)
Promise.all([
api.get(`/users/${steamId}`),
api.get(`/users/${steamId}/reviews`),
api.get(`/users/${steamId}/logs`)
])
.then(([pRes, rRes, lRes]) => {
setProfile(pRes.data.user)
setStats(pRes.data.stats)
setBio(pRes.data.user.bio || '')
setReviews(rRes.data.reviews || [])
setLogs(lRes.data.logs || [])
})
.catch(() => toast.error('Failed to load profile'))
.finally(() => setLoading(false))
}, [steamId])

const handleSaveBio = async () => {
try {
await api.patch('/users/me/bio', { bio })
setProfile(p => ({ ...p, bio }))
if (isOwn) setUser({ ...me, bio })
setEditBio(false)
toast.success('Bio updated!')
} catch {
toast.error('Failed to update bio')
}
}

const handleDeleteReview = async id => {
if (!confirm('Delete this review?')) return
try {
await api.delete(`/reviews/${id}`)
setReviews(r => r.filter(x => x._id !== id))
toast.success('Review deleted')
} catch {
toast.error('Failed to delete')
}
}

if (loading) return <PageLoader />
if (!profile)
return (
<div style={{ textAlign: 'center', padding: '4rem', color: '#8888aa' }}>
User not found </div>
)

return (
<div style={{ minHeight: '100vh', paddingTop: 64 }}>
{/* HERO */}
<div style={{ position: 'relative', height: 220, background: '#0a0a12', overflow: 'hidden' }}>
<img
src={`https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg`}
style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, filter: 'blur(2px)' }}
/>
<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, #0f0f17 100%)' }} /> </div>

```
  <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
    {/* PROFILE HEADER */}
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: -60, marginBottom: '2rem', flexWrap: 'wrap' }}>
      <img
        src={profile.avatar}
        alt={profile.username}
        style={{ width: 100, height: 100, borderRadius: 16, border: '4px solid #0f0f17', flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 26, color: '#f0f0f8' }}>
            {profile.username}
          </h1>
        </div>

        {editBio ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', maxWidth: 500 }}>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={2}
              style={{ flex: 1, fontSize: 13 }}
            />
            <button onClick={handleSaveBio}>
              <FiCheck />
            </button>
            <button onClick={() => setEditBio(false)}>
              <FiX />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontFamily: 'Karla', fontSize: 14, color: '#8888aa', maxWidth: 500 }}>
              {profile.bio || (isOwn ? 'Add a bio...' : 'No bio yet.')}
            </p>

            {isOwn && (
              <button
                onClick={() => setEditBio(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555570' }}
              >
                <FiEdit2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      <a
        href={profile.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#1b2838',
          border: '1px solid #3a4d5c',
          borderRadius: 8,
          padding: '8px 14px',
          textDecoration: 'none',
          color: '#c6d4df',
          fontFamily: 'Karla',
          fontWeight: 700,
          fontSize: 13
        }}
      >
        <SiSteam size={15} style={{ color: '#67c1f5' }} /> Steam Profile
      </a>
    </div>

    {/* STATS */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 12,
        marginBottom: '2rem'
      }}
    >
      {[
        { label: 'Games Logged', value: stats?.logCount || 0, icon: '🎮' },
        { label: 'Reviews', value: stats?.reviewCount || 0, icon: '✍️' },
        { label: 'Avg Rating', value: stats?.avgRating ? `${stats.avgRating}★` : '—', icon: '⭐' }
      ].map(s => (
        <div
          key={s.label}
          style={{
            background: '#1c1c28',
            border: '1px solid #2a2a3d',
            borderRadius: 12,
            padding: '1rem',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 22 }}>{s.icon}</div>
          <p style={{ fontWeight: 800, fontSize: 22, color: '#f0f0f8' }}>{s.value}</p>
          <p style={{ fontSize: 12, color: '#555570' }}>{s.label}</p>
        </div>
      ))}
    </div>

    {/* TABS */}
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #2a2a3d', marginBottom: '1.5rem' }}>
      {['reviews', 'games', 'stats'].map(key => (
        <button
          key={key}
          onClick={() => setTab(key)}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 16px',
            borderBottom: tab === key ? '2px solid #00e676' : '2px solid transparent',
            color: tab === key ? '#f0f0f8' : '#555570',
            cursor: 'pointer'
          }}
        >
          {key}
        </button>
      ))}
    </div>

    {tab === 'reviews' &&
      (reviews.length === 0 ? (
        <EmptyState title="No reviews yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <ReviewCard
              key={r._id}
              review={r}
              onEdit={isOwn ? () => setEditModal(r) : undefined}
              onDelete={isOwn ? handleDeleteReview : undefined}
            />
          ))}
        </div>
      ))}

    <div style={{ height: 60 }} />
  </div>

  {editModal && (
    <WriteReviewModal
      game={{ steam_appid: editModal.appId, name: editModal.gameName }}
      existing={editModal}
      onClose={() => setEditModal(null)}
      onSave={updated => setReviews(r => r.map(x => (x._id === updated._id ? updated : x)))}
    />
  )}
</div>

)
}
