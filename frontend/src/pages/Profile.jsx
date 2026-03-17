import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiEdit2, FiCheck, FiX, FiExternalLink, FiUsers } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import WriteReviewModal from '../components/WriteReviewModal'
import FollowButton from '../components/FollowButton'
import FavoriteGames from '../components/FavoriteGames'
import ActivityFeed from '../components/ActivityFeed'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import { StarRatingDisplay } from '../components/StarRating'
import { STATUS_LABELS, STATUS_COLORS, formatDate } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { steamId } = useParams()
  const { user: me, setUser } = useAuth()
  const isOwn = me?.steamId === steamId

  const [profile,    setProfile]    = useState(null)
  const [stats,      setStats]      = useState(null)
  const [reviews,    setReviews]    = useState([])
  const [logs,       setLogs]       = useState([])
  const [activities, setActivities] = useState([])
  const [tab,        setTab]        = useState('reviews')
  const [loading,    setLoading]    = useState(true)
  const [editBio,    setEditBio]    = useState(false)
  const [bio,        setBio]        = useState('')
  const [editModal,  setEditModal]  = useState(null)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [followerList,  setFollowerList]  = useState([])
  const [followingList, setFollowingList] = useState([])

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      api.get(`/users/${steamId}?t=${Date.now()}`),
      api.get(`/users/${steamId}/reviews`),
      api.get(`/users/${steamId}/logs`),
      api.get(`/activity/user/${steamId}?limit=20`),
    ]).then(([pRes, rRes, lRes, aRes]) => {
      setProfile(pRes.data.user)
      setStats(pRes.data.stats)
      setBio(pRes.data.user.bio || '')
      setReviews(rRes.data.reviews || [])
      setLogs(lRes.data.logs || [])
      setActivities(aRes.data.activities || [])
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAll()
    const onFocus = () => fetchAll()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [steamId])

  const loadFollowers = async () => {
    const r = await api.get(`/follows/${steamId}/followers`)
    setFollowerList(r.data.users || [])
    setShowFollowers(true)
  }
  const loadFollowing = async () => {
    const r = await api.get(`/follows/${steamId}/following`)
    setFollowingList(r.data.users || [])
    setShowFollowing(true)
  }

  const handleSaveBio = async () => {
    try {
      await api.patch('/users/me/bio', { bio })
      setProfile(p => ({ ...p, bio }))
      if (isOwn) setUser({ ...me, bio })
      setEditBio(false); toast.success('Bio saved')
    } catch { toast.error('Failed') }
  }

  const handleDeleteReview = async (id) => {
    if (!confirm('Delete?')) return
    try { await api.delete(`/reviews/${id}`); setReviews(r => r.filter(x => x._id !== id)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  if (loading) return <PageLoader />
  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444' }}>User not found</p>
    </div>
  )

  const STATS = [
    { label: 'Games Logged', value: stats?.logCount    || 0, color: '#9EFF00' },
    { label: 'Reviews',      value: stats?.reviewCount || 0, color: '#40BCF4' },
    { label: 'Completed',    value: stats?.statusCounts?.completed || 0, color: '#FFD700' },
    { label: 'Playing',      value: stats?.statusCounts?.playing   || 0, color: '#9EFF00' },
    { label: 'Dropped',      value: stats?.statusCounts?.dropped   || 0, color: '#FF3B3B' },
    { label: 'Avg Rating',   value: stats?.avgRating ? `${stats.avgRating}` : '—', color: '#9EFF00' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>

      {/* Banner */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#0d0d0d', borderBottom: '1px solid #1A1A1A' }}>
        <img src="https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'brightness(0.12) saturate(0.4)', transform: 'scale(1.05)' }}
          onError={e => e.target.style.display = 'none'} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #0A0A0A)' }} />
      </div>

      {/* Profile header */}
      <div style={{ background: '#0A0A0A', borderBottom: '1px solid #1A1A1A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}>

            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ border: '3px solid #0A0A0A', background: '#111' }}>
                <img src={profile.avatar} alt={profile.username}
                  style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                <div style={{ width: 80, height: 80, display: 'none', alignItems: 'center', justifyContent: 'center', background: '#161616' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: '#333' }}>{profile.username?.[0]?.toUpperCase() || '?'}</span>
                </div>
              </div>
            </div>

            {/* Name + bio */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 30, letterSpacing: '0.04em', color: '#F0F0F0', lineHeight: 1 }}>
                  {profile.username}
                </h1>
                {profile.countryCode && (
                  <span style={{ fontSize: 16 }}>
                    {String.fromCodePoint(...[...profile.countryCode.toUpperCase()].map(c => c.charCodeAt(0) + 127397))}
                  </span>
                )}
                <FollowButton targetSteamId={steamId} onToggle={() => fetchAll()} />
              </div>

              {editBio ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', maxWidth: 480 }}>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={500} rows={2}
                    className="inp" style={{ flex: 1, resize: 'none', fontSize: 13 }} autoFocus />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button onClick={handleSaveBio} style={{ background: '#9EFF00', border: 'none', padding: '7px 8px', cursor: 'pointer' }}><FiCheck size={12} color="#0A0A0A" /></button>
                    <button onClick={() => { setEditBio(false); setBio(profile.bio || '') }} style={{ background: '#1C1C1C', border: '1px solid #222', padding: '7px 8px', cursor: 'pointer' }}><FiX size={12} color="#888" /></button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 13, color: '#666' }}>
                    {profile.bio || (isOwn ? 'Add a bio...' : 'No bio.')}
                  </p>
                  {isOwn && (
                    <button onClick={() => setEditBio(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 3, transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#9EFF00'} onMouseLeave={e => e.currentTarget.style.color = '#333'}>
                      <FiEdit2 size={11} />
                    </button>
                  )}
                </div>
              )}

              {/* Followers/Following links */}
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <button onClick={loadFollowers} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope', fontSize: 12, color: '#555', padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#F0F0F0'} onMouseLeave={e => e.currentTarget.style.color='#555'}>
                  <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: '#F0F0F0' }}>{stats?.followerCount || 0}</span>
                  <span style={{ marginLeft: 5, fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Followers</span>
                </button>
                <button onClick={loadFollowing} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope', fontSize: 12, color: '#555', padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#F0F0F0'} onMouseLeave={e => e.currentTarget.style.color='#555'}>
                  <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: '#F0F0F0' }}>{stats?.followingCount || 0}</span>
                  <span style={{ marginLeft: 5, fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Following</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#1b2838', border: '1px solid #2a3f52', padding: '8px 12px', color: '#c6d4df', fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#67c1f5'} onMouseLeave={e => e.currentTarget.style.borderColor='#2a3f52'}>
                <SiSteam size={12} style={{ color: '#67c1f5' }} /> Steam <FiExternalLink size={9} />
              </a>
              {isOwn && (
                <Link to="/lists/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'transparent', border: '1px solid #333', padding: '7px 12px', color: '#666', fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#9EFF00'; e.currentTarget.style.color='#9EFF00' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#333'; e.currentTarget.style.color='#666' }}>
                  + New List
                </Link>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', borderTop: '1px solid #1A1A1A' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRight: i < STATS.length - 1 ? '1px solid #1A1A1A' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#111'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: s.color, lineHeight: 1, letterSpacing: '0.02em' }}>{s.value}</p>
                <p style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Top 4 Favorite Games */}
        {(isOwn || profile.favoriteGames?.length > 0) && (
          <div style={{ padding: '24px 0', borderBottom: '1px solid #1A1A1A' }}>
            <FavoriteGames
              games={profile.favoriteGames || []}
              isOwn={isOwn}
              onSave={faves => setProfile(p => ({ ...p, favoriteGames: faves }))}
            />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #1A1A1A', marginBottom: 24 }}>
          {[['reviews','Reviews'],['games','Game Log'],['activity','Activity'],['stats','Stats']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '14px 16px', marginBottom: -1,
              borderBottom: tab === key ? '2px solid #9EFF00' : '2px solid transparent',
              color: tab === key ? '#F0F0F0' : '#444',
              fontFamily: 'Oswald', fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'color 0.15s',
            }}>{label}</button>
          ))}
          <button onClick={fetchAll} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#333', padding: '8px 12px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => e.currentTarget.style.color='#9EFF00'} onMouseLeave={e => e.currentTarget.style.color='#333'}>
            ↻ Refresh
          </button>
        </div>

        {/* Reviews */}
        {tab === 'reviews' && (
          reviews.length === 0
            ? <EmptyState title="No reviews yet" description={isOwn ? 'Go to a game page and write your first review.' : 'Nothing written yet.'} />
            : reviews.map(r => (
              <ReviewCard key={r._id} review={r}
                onEdit={isOwn ? () => setEditModal(r) : undefined}
                onDelete={isOwn ? handleDeleteReview : undefined} />
            ))
        )}

        {/* Game Log grouped by status */}
        {tab === 'games' && (
          logs.length === 0
            ? <EmptyState title="No games logged" description={isOwn ? 'Start logging from your Library or a game page.' : 'Nothing logged yet.'} />
            : Object.entries(STATUS_LABELS).map(([statusKey, statusLabel]) => {
                const group = logs.filter(l => l.status === statusKey)
                if (group.length === 0) return null
                return (
                  <div key={statusKey} style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 3, height: 14, background: STATUS_COLORS[statusKey] }} />
                      <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: STATUS_COLORS[statusKey] }}>
                        {statusLabel}
                      </span>
                      <span style={{ fontFamily: 'Manrope', fontSize: 11, color: '#444' }}>({group.length})</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 6 }}>
                      {group.map(log => (
                        <Link key={log._id} to={`/game/${log.appId}`} style={{ textDecoration: 'none' }}>
                          <div className="card-lift" style={{ background: '#111', border: '1px solid #1A1A1A', overflow: 'hidden' }}>
                            <div style={{ paddingTop: '46.7%', position: 'relative', background: '#0d0d0d' }}>
                              <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${log.appId}/header.jpg`}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => e.target.style.display='none'} />
                            </div>
                            <div style={{ padding: '6px 8px', borderTop: '1px solid #1A1A1A' }}>
                              <p style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.gameName}</p>
                              {log.rating && <StarRatingDisplay value={log.rating} size={9} />}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })
        )}

        {/* Activity */}
        {tab === 'activity' && <ActivityFeed activities={activities} showAvatar={false} />}

        {/* Stats */}
        {tab === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
            <div style={{ background: '#111', border: '1px solid #1A1A1A', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 3, height: 18, background: '#9EFF00' }} />
                <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#F0F0F0' }}>Status Breakdown</p>
              </div>
              {Object.entries(STATUS_LABELS).map(([key, label]) => {
                const count = stats.statusCounts?.[key] || 0
                const pct   = stats.logCount ? Math.round(count / stats.logCount * 100) : 0
                return (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: STATUS_COLORS[key] }}>{label}</span>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#444' }}>{pct}%</span>
                        <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, color: '#F0F0F0', minWidth: 24, textAlign: 'right' }}>{count}</span>
                      </div>
                    </div>
                    <div style={{ height: 2, background: '#1A1A1A' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: STATUS_COLORS[key], transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ background: '#111', border: '1px solid #1A1A1A', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 3, height: 18, background: '#9EFF00' }} />
                <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#F0F0F0' }}>Quick Stats</p>
              </div>
              {[['Games Logged',stats.logCount||0,'#9EFF00'],['Reviews',stats.reviewCount||0,'#40BCF4'],['Avg Rating',stats.avgRating?`${stats.avgRating}/5`:'N/A','#FFD700'],['Followers',stats.followerCount||0,'#9EFF00'],['Following',stats.followingCount||0,'#40BCF4']].map(([label,val,color],i,arr)=>(
                <div key={label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:i<arr.length-1?'1px solid #1A1A1A':'none' }}>
                  <span style={{ fontFamily:'Oswald',fontWeight:500,fontSize:12,letterSpacing:'0.08em',textTransform:'uppercase',color:'#555' }}>{label}</span>
                  <span style={{ fontFamily:'Bebas Neue',fontSize:24,color,letterSpacing:'0.04em' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Followers modal */}
      {(showFollowers || showFollowing) && (
        <div onClick={() => { setShowFollowers(false); setShowFollowing(false) }} style={{ position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#111',border:'1px solid #222',width:'100%',maxWidth:400,maxHeight:'70vh',overflow:'hidden',display:'flex',flexDirection:'column' }}>
            <div style={{ padding:'14px 20px',borderBottom:'1px solid #1A1A1A',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <p style={{ fontFamily:'Oswald',fontWeight:600,fontSize:14,letterSpacing:'0.08em',textTransform:'uppercase',color:'#F0F0F0' }}>{showFollowers ? 'Followers' : 'Following'}</p>
              <button onClick={()=>{setShowFollowers(false);setShowFollowing(false)}} style={{ background:'none',border:'none',cursor:'pointer',color:'#444' }}><FiX size={14}/></button>
            </div>
            <div style={{ overflowY:'auto' }}>
              {(showFollowers ? followerList : followingList).map(u=>(
                <Link key={u.steamId} to={`/profile/${u.steamId}`} onClick={()=>{setShowFollowers(false);setShowFollowing(false)}}
                  style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 20px',borderBottom:'1px solid #1A1A1A',textDecoration:'none',transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#161616'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <img src={u.avatar} style={{ width:36,height:36,objectFit:'cover',border:'1px solid #222' }} onError={e=>e.target.style.display='none'}/>
                  <div>
                    <p style={{ fontFamily:'Oswald',fontWeight:600,fontSize:14,letterSpacing:'0.04em',textTransform:'uppercase',color:'#F0F0F0' }}>{u.username}</p>
                    {u.bio&&<p style={{ fontFamily:'Manrope',fontSize:11,color:'#444' }}>{u.bio.slice(0,50)}</p>}
                  </div>
                </Link>
              ))}
              {(showFollowers ? followerList : followingList).length===0 && (
                <p style={{ padding:'2rem',textAlign:'center',fontFamily:'Oswald',fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',color:'#333' }}>None yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <WriteReviewModal game={{ steam_appid: editModal.appId, name: editModal.gameName }} existing={editModal}
          onClose={() => setEditModal(null)}
          onSave={updated => setReviews(r => r.map(x => x._id === updated._id ? updated : x))} />
      )}
    </div>
  )
}
