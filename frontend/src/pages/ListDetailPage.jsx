import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiHeart, FiEdit2, FiTrash2, FiArrowLeft, FiPlus } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/LoadingSpinner'
import { StarRatingDisplay } from '../components/StarRating'
import { formatDate } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ListDetailPage() {
  const { id }     = useParams()
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [list,     setList]    = useState(null)
  const [loading,  setLoading] = useState(true)
  const [liked,    setLiked]   = useState(false)
  const [likes,    setLikes]   = useState(0)

  useEffect(() => {
    api.get(`/lists/${id}`)
      .then(r => {
        setList(r.data.list)
        setLikes(r.data.list.likes?.length || 0)
        setLiked(user && r.data.list.likes?.includes(user.steamId))
      })
      .catch(() => toast.error('Failed to load list'))
      .finally(() => setLoading(false))
  }, [id, user?.steamId])

  const handleLike = async () => {
    if (!user) return toast.error('Sign in to like lists')
    try {
      const r = await api.post(`/lists/${id}/like`)
      setLiked(r.data.liked); setLikes(r.data.likeCount)
    } catch {}
  }

  const handleDelete = async () => {
    if (!confirm('Delete this list?')) return
    try {
      await api.delete(`/lists/${id}`)
      toast.success('List deleted')
      navigate('/lists')
    } catch { toast.error('Failed') }
  }

  if (loading) return <PageLoader />
  if (!list) return (
    <div style={{ textAlign: 'center', padding: '6rem' }}>
      <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444' }}>List not found</p>
    </div>
  )

  const isOwner = user?.steamId === list.steamId

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Back */}
      <Link to="/lists" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', marginBottom: 24, transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color='#9EFF00'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
        <FiArrowLeft size={12} /> All Lists
      </Link>

      {/* Header */}
      <div style={{ borderLeft: '3px solid #9EFF00', paddingLeft: 16, marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: '0.03em', color: '#F0F0F0', lineHeight: 1, marginBottom: 8 }}>
          {list.title}
        </h1>
        {list.description && (
          <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 10 }}>
            {list.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link to={`/profile/${list.steamId}`} style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9EFF00', textDecoration: 'none' }}>
            {list.username}
          </Link>
          <span style={{ fontFamily: 'Manrope', fontSize: 11, color: '#444' }}>{formatDate(list.createdAt)}</span>
          <span style={{ fontFamily: 'Manrope', fontSize: 11, color: '#444' }}>{list.games?.length} games</span>

          <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#FF3B3B' : '#444', fontFamily: 'Manrope', fontSize: 12, padding: 0, transition: 'color 0.15s' }}>
            <FiHeart size={12} style={{ fill: liked ? '#FF3B3B' : 'transparent' }} /> {likes}
          </button>

          {isOwner && (
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <Link to={`/lists/${id}/edit`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color='#F0F0F0'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
                <FiEdit2 size={11} /> Edit
              </Link>
              <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', padding: 0, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color='#FF3B3B'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
                <FiTrash2 size={11} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Games */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1A1A1A' }}>
        {list.games?.sort((a,b) => a.position - b.position).map((game, i) => (
          <Link key={game.appId} to={`/game/${game.appId}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#0A0A0A', padding: '12px 16px', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='#111'}
              onMouseLeave={e => e.currentTarget.style.background='#0A0A0A'}>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: '#1A1A1A', letterSpacing: '0.04em', minWidth: 36, textAlign: 'right' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <img src={game.headerImage || `https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/header.jpg`}
                style={{ width: 80, height: 37, objectFit: 'cover', border: '1px solid #1A1A1A', flexShrink: 0 }}
                onError={e => e.target.style.display='none'} />
              <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 15, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#F0F0F0', flex: 1 }}>
                {game.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
