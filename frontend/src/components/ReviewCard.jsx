import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiAlertTriangle, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { StarRatingDisplay } from './StarRating'
import { formatDate, truncate } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ReviewCard({ review, onEdit, onDelete, showGame = true }) {
  const { user }  = useAuth()
  const [spoiler, setSpoiler] = useState(false)
  const [liked,   setLiked]   = useState(review.likes?.includes(user?.steamId))
  const [likes,   setLikes]   = useState(review.likes?.length || 0)
  const isOwner   = user?.steamId === review.steamId

  const handleLike = async () => {
    if (!user) return toast.error('Sign in to like reviews')
    try {
      const r = await api.post(`/reviews/${review._id}/like`)
      setLiked(r.data.liked)
      setLikes(r.data.likeCount)
    } catch {}
  }

  const author = review.author

  return (
    <div style={{
      background: '#1c1c28', borderRadius: 12, padding: '1.25rem',
      border: '1px solid #2a2a3d', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {author?.avatar ? (
            <Link to={`/profile/${review.steamId}`}>
              <img src={author.avatar} alt={author.username}
                style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #2a2a3d' }}
              />
            </Link>
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2a3d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              🎮
            </div>
          )}
          <div>
            <Link to={`/profile/${review.steamId}`}
              style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#f0f0f8', textDecoration: 'none' }}>
              {author?.username || review.steamId}
            </Link>
            <p style={{ fontSize: 11, color: '#555570', fontFamily: 'Karla', marginTop: 1 }}>
              {formatDate(review.createdAt)}
              {review.playedOn && ` · ${review.playedOn}`}
              {review.hoursAtReview > 0 && ` · ${review.hoursAtReview}h`}
            </p>
          </div>
        </div>
        {review.rating && <StarRatingDisplay value={review.rating} size={13} />}
      </div>

      {/* Game name */}
      {showGame && (
        <Link to={`/game/${review.appId}`} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#16161f', borderRadius: 8, padding: '8px 12px' }}>
            <img
              src={`https://cdn.akamai.steamstatic.com/steam/apps/${review.appId}/header.jpg`}
              style={{ width: 48, height: 22, objectFit: 'cover', borderRadius: 4 }}
              onError={e => e.target.style.display = 'none'}
            />
            <span style={{ fontSize: 13, fontFamily: 'Syne', fontWeight: 600, color: '#40bcf4' }}>
              {review.gameName}
            </span>
          </div>
        </Link>
      )}

      {/* Title */}
      {review.title && (
        <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: '#f0f0f8' }}>
          {review.title}
        </p>
      )}

      {/* Body */}
      {review.containsSpoilers && !spoiler ? (
        <div style={{ background: '#1a1a0f', border: '1px solid #555520', borderRadius: 8, padding: '0.75rem', cursor: 'pointer' }}
          onClick={() => setSpoiler(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ffd700', fontSize: 13 }}>
            <FiAlertTriangle size={13} />
            <span style={{ fontFamily: 'Karla', fontWeight: 700 }}>Contains spoilers — click to reveal</span>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 14, color: '#ccccdd', lineHeight: 1.65, fontFamily: 'Karla' }}>
          {review.body}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
          cursor: 'pointer', color: liked ? '#ff4757' : '#555570',
          fontSize: 13, fontFamily: 'Karla', transition: 'color 0.15s', padding: 0,
        }}>
          <FiHeart size={14} style={{ fill: liked ? '#ff4757' : 'transparent' }} />
          {likes > 0 && likes}
        </button>
        {isOwner && (
          <div style={{ display: 'flex', gap: 8 }}>
            {onEdit && (
              <button onClick={() => onEdit(review)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555570', padding: 4, borderRadius: 4, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#40bcf4'}
                onMouseLeave={e => e.currentTarget.style.color = '#555570'}>
                <FiEdit2 size={13} />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(review._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555570', padding: 4, borderRadius: 4, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ff4757'}
                onMouseLeave={e => e.currentTarget.style.color = '#555570'}>
                <FiTrash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
