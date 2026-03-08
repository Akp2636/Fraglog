import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiAlertTriangle, FiClock } from 'react-icons/fi'
import { StarRatingDisplay } from './StarRating'
import { formatDate, formatPlaytime, truncate } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ReviewCard({ review, showGame = true, onUpdate }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(review.likes?.some((id) => id === user?._id || id._id === user?._id))
  const [likeCount, setLikeCount] = useState(review.likeCount || review.likes?.length || 0)
  const [spoilerRevealed, setSpoilerRevealed] = useState(false)
  const [liking, setLiking] = useState(false)

  const handleLike = async () => {
    if (!user) { toast.error('Sign in to like reviews'); return }
    if (liking) return
    setLiking(true)
    try {
      const res = await api.post(`/reviews/${review._id}/like`)
      setLiked(res.data.liked)
      setLikeCount(res.data.likeCount)
    } catch {
      toast.error('Failed to like review')
    } finally {
      setLiking(false)
    }
  }

  const author = review.userId || {}
  const isOwn = user?._id === (author._id || author)

  return (
    <div className="card p-4 space-y-3 hover:border-border-light transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {author.avatar && (
            <Link to={`/profile/${author.steamId}`}>
              <img
                src={author.avatar}
                alt={author.username}
                className="w-8 h-8 rounded-full border border-border flex-shrink-0 hover:border-accent-green transition-colors"
              />
            </Link>
          )}
          <div className="min-w-0">
            <Link
              to={`/profile/${author.steamId}`}
              className="text-sm font-body font-medium text-text-primary hover:text-accent-green transition-colors block truncate"
            >
              {author.username || 'Unknown'}
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <StarRatingDisplay value={review.rating} size={12} />
              <span className="text-xs font-mono text-text-muted">{formatDate(review.createdAt)}</span>
              {review.playedOn && review.playedOn !== 'PC' && (
                <span className="text-xs font-mono text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">
                  {review.playedOn}
                </span>
              )}
            </div>
          </div>
        </div>

        {showGame && review.gameName && (
          <Link
            to={`/game/${review.appId}`}
            className="flex-shrink-0 group/game"
          >
            <img
              src={review.gameHeaderImage || `https://cdn.cloudflare.steamstatic.com/steam/apps/${review.appId}/header.jpg`}
              alt={review.gameName}
              className="h-10 w-auto rounded border border-border group-hover/game:border-accent-green transition-colors"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </Link>
        )}
      </div>

      {/* Game name link when showing full review */}
      {showGame && review.gameName && (
        <Link
          to={`/game/${review.appId}`}
          className="text-xs font-mono text-text-muted hover:text-accent-green transition-colors uppercase tracking-wider"
        >
          {review.gameName}
        </Link>
      )}

      {/* Review title */}
      {review.title && (
        <h3 className="font-display font-semibold text-text-primary text-sm leading-snug">
          {review.title}
        </h3>
      )}

      {/* Spoiler warning */}
      {review.containsSpoilers && !spoilerRevealed ? (
        <div
          className="flex items-center gap-2 p-3 rounded bg-accent-gold/5 border border-accent-gold/20 cursor-pointer hover:bg-accent-gold/10 transition-colors"
          onClick={() => setSpoilerRevealed(true)}
        >
          <FiAlertTriangle className="text-accent-gold flex-shrink-0" size={14} />
          <p className="text-xs text-accent-gold font-body">
            This review contains spoilers.{' '}
            <span className="underline">Click to reveal</span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-text-secondary font-body leading-relaxed">
          {truncate(review.body, 280)}
          {review.body?.length > 280 && (
            <Link to={`/game/${review.appId}`} className="ml-1 text-accent-green hover:underline text-xs">
              read more
            </Link>
          )}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              liked ? 'text-accent-red' : 'text-text-muted hover:text-accent-red'
            }`}
          >
            <FiHeart className={liked ? 'fill-current' : ''} size={13} />
            <span className="font-mono">{likeCount}</span>
          </button>

          {review.hoursAtReview > 0 && (
            <span className="flex items-center gap-1 text-xs text-text-muted font-mono">
              <FiClock size={11} />
              {formatPlaytime(review.hoursAtReview * 60)}
            </span>
          )}
        </div>

        {isOwn && onUpdate && (
          <button
            onClick={() => onUpdate(review)}
            className="text-xs text-text-muted hover:text-accent-green transition-colors font-mono"
          >
            edit
          </button>
        )}
      </div>
    </div>
  )
}
