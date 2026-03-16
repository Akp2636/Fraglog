import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiAlertTriangle, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { StarRatingDisplay } from './StarRating'
import { formatDate } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ReviewCard({ review, onEdit, onDelete, showGame = true }) {
  const { user }  = useAuth()
  const [spoiler, setSpoiler] = useState(false)
  const [liked,   setLiked]   = useState(review.likes?.includes(user?.steamId))
  const [likes,   setLikes]   = useState(review.likes?.length || 0)
  const isOwner = user?.steamId === review.steamId
  const author  = review.author

  const handleLike = async () => {
    if (!user) return toast.error('Sign in to like reviews')
    try {
      const r = await api.post(`/reviews/${review._id}/like`)
      setLiked(r.data.liked); setLikes(r.data.likeCount)
    } catch {}
  }

  return (
    <div style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: '1px solid #1A1A1A' }}>
      {/* Avatar */}
      <Link to={`/profile/${review.steamId}`} style={{ flexShrink: 0 }}>
        {author?.avatar
          ? <img src={author.avatar} alt={author.username} style={{ width: 38, height: 38, objectFit: 'cover', border: '1px solid #222' }} onError={e => e.target.style.display='none'} />
          : <div style={{ width: 38, height: 38, background: '#1C1C1C', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#444' }}>{(author?.username || '?')[0].toUpperCase()}</span>
            </div>
        }
      </Link>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to={`/profile/${review.steamId}`} style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, letterSpacing: '0.05em', color: '#F0F0F0' }}>
              {author?.username || review.steamId}
            </Link>
            <span style={{ fontFamily: 'Manrope', fontSize: 11, color: '#444' }}>
              {formatDate(review.createdAt)}
              {review.hoursAtReview > 0 && ` · ${review.hoursAtReview}h`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {review.rating && <StarRatingDisplay value={review.rating} size={11} />}
          </div>
        </div>

        {/* Game pill */}
        {showGame && (
          <Link to={`/game/${review.appId}`}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111', border: '1px solid #222', padding: '4px 10px', marginBottom: 10 }}>
              <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${review.appId}/header.jpg`}
                style={{ width: 40, height: 18, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
              <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.05em', color: '#9EFF00', textTransform: 'uppercase' }}>
                {review.gameName}
              </span>
            </div>
          </Link>
        )}

        {/* Review title */}
        {review.title && (
          <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.03em', color: '#F0F0F0', marginBottom: 6, textTransform: 'uppercase' }}>
            {review.title}
          </p>
        )}

        {/* Body */}
        {review.containsSpoilers && !spoiler ? (
          <div onClick={() => setSpoiler(true)} style={{ background: '#111', border: '1px solid #2a2000', padding: '10px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FiAlertTriangle size={12} style={{ color: '#FFD700', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFD700' }}>
              Spoiler Warning — Click to Reveal
            </span>
          </div>
        ) : (
          <p style={{ fontFamily: 'Manrope', fontSize: 13, color: '#888', lineHeight: 1.7 }}>
            {review.body}
          </p>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <button onClick={handleLike} style={{
            display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
            cursor: 'pointer', color: liked ? '#FF3B3B' : '#444', fontSize: 12, fontFamily: 'Manrope', transition: 'color 0.15s', padding: 0,
          }}>
            <FiHeart size={13} style={{ fill: liked ? '#FF3B3B' : 'transparent' }} />
            {likes > 0 && <span>{likes}</span>}
          </button>
          {isOwner && (
            <div style={{ display: 'flex', gap: 6 }}>
              {onEdit && (
                <button onClick={() => onEdit(review)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#9EFF00'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
                  <FiEdit2 size={12} />
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(review._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#FF3B3B'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
                  <FiTrash2 size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
