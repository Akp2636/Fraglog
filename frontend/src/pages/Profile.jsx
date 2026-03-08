import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiExternalLink, FiBook, FiMessageSquare, FiClock, FiEdit2 } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import ReviewCard from '../components/ReviewCard'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import { formatPlaytime, STATUS_LABELS, STATUS_COLORS, formatDate } from '../utils/helpers'
import { StarRatingDisplay } from '../components/StarRating'
import toast from 'react-hot-toast'

const TAB_REVIEWS = 'reviews'
const TAB_LOGS = 'logs'

export default function Profile() {
  const { steamId } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(TAB_REVIEWS)
  const [reviews, setReviews] = useState([])
  const [logs, setLogs] = useState([])
  const [logStatus, setLogStatus] = useState('all')
  const [contentLoading, setContentLoading] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [bioInput, setBioInput] = useState('')

  const isOwnProfile = user?.steamId === steamId

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/users/${steamId}`)
        setProfile(res.data)
        setBioInput(res.data.bio || '')
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [steamId])

  useEffect(() => {
    if (!profile) return
    const fetchContent = async () => {
      setContentLoading(true)
      try {
        if (tab === TAB_REVIEWS) {
          const res = await api.get(`/users/${steamId}/reviews?limit=20`)
          setReviews(res.data.reviews)
        } else {
          const params = logStatus !== 'all' ? `?status=${logStatus}` : ''
          const res = await api.get(`/users/${steamId}/logs${params}`)
          setLogs(res.data.logs)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setContentLoading(false)
      }
    }
    fetchContent()
  }, [profile, tab, steamId, logStatus])

  const saveBio = async () => {
    try {
      await api.patch('/users/me/bio', { bio: bioInput })
      setProfile((p) => ({ ...p, bio: bioInput }))
      setEditingBio(false)
      toast.success('Bio updated!')
    } catch {
      toast.error('Failed to update bio')
    }
  }

  if (loading) return <PageLoader />
  if (!profile) {
    return (
      <div className="page-container">
        <EmptyState
          title="User not found"
          description="This Steam profile hasn't been registered on Fraglog yet."
        />
      </div>
    )
  }

  const totalPlaytimeHours = Math.floor((profile.totalPlaytimeMinutes || 0) / 60)

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-bg-secondary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-24 h-24 rounded-xl border-2 border-border"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-green rounded-full border-2 border-bg-secondary" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-display font-black text-2xl text-text-primary">
                    {profile.username}
                  </h1>
                  {profile.realName && (
                    <p className="text-sm text-text-muted font-body">{profile.realName}</p>
                  )}
                  <a
                    href={profile.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-blue transition-colors mt-1"
                  >
                    <SiSteam size={11} />
                    Steam Profile
                    <FiExternalLink size={10} />
                  </a>
                </div>
                {isOwnProfile && (
                  <Link to={`/library/${steamId}`} className="btn-ghost text-sm flex items-center gap-2">
                    <FiBook size={14} />
                    My Library
                  </Link>
                )}
              </div>

              {/* Bio */}
              <div className="mt-3">
                {editingBio ? (
                  <div className="space-y-2">
                    <textarea
                      className="textarea text-sm"
                      rows={2}
                      maxLength={300}
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      placeholder="Write something about yourself…"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveBio} className="btn-primary text-xs py-1.5">Save</button>
                      <button onClick={() => setEditingBio(false)} className="btn-ghost text-xs py-1.5">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-text-secondary font-body">
                      {profile.bio || (isOwnProfile ? <span className="text-text-muted italic">Add a bio…</span> : null)}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => setEditingBio(true)}
                        className="text-text-muted hover:text-accent-green transition-colors flex-shrink-0 mt-0.5"
                      >
                        <FiEdit2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-5 mt-4 flex-wrap">
                <Stat value={profile.logCount || 0} label="Logged" />
                <Stat value={profile.reviewCount || 0} label="Reviews" />
                <Stat value={profile.totalGamesOwned || 0} label="Games Owned" />
                <Stat
                  value={totalPlaytimeHours.toLocaleString() + 'h'}
                  label="Total Playtime"
                  icon={<FiClock size={11} />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto scrollbar-hide">
          <TabBtn active={tab === TAB_REVIEWS} onClick={() => setTab(TAB_REVIEWS)}>
            <FiMessageSquare size={13} /> Reviews ({profile.reviewCount || 0})
          </TabBtn>
          <TabBtn active={tab === TAB_LOGS} onClick={() => setTab(TAB_LOGS)}>
            <FiBook size={13} /> Game Log ({profile.logCount || 0})
          </TabBtn>
        </div>

        {/* Reviews */}
        {tab === TAB_REVIEWS && (
          <div className="space-y-4">
            {contentLoading ? (
              <PageLoader />
            ) : reviews.length === 0 ? (
              <EmptyState
                icon={FiMessageSquare}
                title="No reviews yet"
                description={isOwnProfile ? "You haven't written any reviews. Find a game and share your thoughts!" : `${profile.username} hasn't written any reviews yet.`}
                action={isOwnProfile ? <Link to="/discover" className="btn-primary text-sm">Discover Games</Link> : null}
              />
            ) : (
              reviews.map((review) => (
                <ReviewCard key={review._id} review={review} showGame />
              ))
            )}
          </div>
        )}

        {/* Logs */}
        {tab === TAB_LOGS && (
          <div>
            {/* Status filter */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {['all', ...Object.keys(STATUS_LABELS)].map((s) => (
                <button
                  key={s}
                  onClick={() => setLogStatus(s)}
                  className={`text-xs font-mono px-3 py-1.5 rounded border transition-colors ${
                    logStatus === s
                      ? 'border-accent-green text-accent-green bg-accent-green/10'
                      : 'border-border text-text-muted hover:border-border-light'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_LABELS[s]}
                  {s !== 'all' && profile.statusCounts?.[s]
                    ? ` (${profile.statusCounts[s]})`
                    : ''}
                </button>
              ))}
            </div>

            {contentLoading ? (
              <PageLoader />
            ) : logs.length === 0 ? (
              <EmptyState
                icon={FiBook}
                title="No games logged"
                description={isOwnProfile ? 'Head to your library to start logging games.' : `${profile.username} hasn't logged any games here.`}
                action={isOwnProfile ? <Link to={`/library/${steamId}`} className="btn-primary text-sm">Go to Library</Link> : null}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {logs.map((log) => <LogCard key={log._id} log={log} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ value, label, icon }) {
  return (
    <div className="flex flex-col">
      <span className="font-display font-bold text-lg text-text-primary leading-none flex items-center gap-1">
        {icon}{value}
      </span>
      <span className="text-xs text-text-muted font-mono">{label}</span>
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-body border-b-2 -mb-px transition-colors whitespace-nowrap ${
        active
          ? 'border-accent-green text-accent-green'
          : 'border-transparent text-text-muted hover:text-text-secondary'
      }`}
    >
      {children}
    </button>
  )
}

function LogCard({ log }) {
  return (
    <Link to={`/game/${log.appId}`} className="card group hover:border-border-light transition-all">
      <div className="relative aspect-[460/215] overflow-hidden bg-bg-elevated">
        <img
          src={log.gameHeaderImage}
          alt={log.gameName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className={`absolute top-2 left-2 status-badge ${STATUS_COLORS[log.status]}`}>
          {STATUS_LABELS[log.status]}
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-body font-medium text-text-primary truncate group-hover:text-accent-green transition-colors">
          {log.gameName}
        </p>
        <div className="flex items-center justify-between mt-1">
          <StarRatingDisplay value={log.rating} size={11} />
          {log.hoursLogged > 0 && (
            <span className="text-xs font-mono text-text-muted">{log.hoursLogged}h</span>
          )}
        </div>
      </div>
    </Link>
  )
}
