import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiExternalLink, FiMessageSquare, FiPlus, FiEdit2, FiTag, FiUsers } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import ReviewCard from '../components/ReviewCard'
import WriteReviewModal from '../components/WriteReviewModal'
import LogGameModal from '../components/LogGameModal'
import { StarRatingDisplay } from '../components/StarRating'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import { STATUS_LABELS, STATUS_COLORS, steamStoreUrl } from '../utils/helpers'
import toast from 'react-hot-toast'

const REVIEW_SORTS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'top', label: 'Most Liked' },
  { value: 'rating_high', label: 'Highest Rated' },
  { value: 'rating_low', label: 'Lowest Rated' },
]

export default function GamePage() {
  const { appId } = useParams()
  const { user } = useAuth()

  const [game, setGame] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewTotal, setReviewTotal] = useState(0)
  const [reviewSort, setReviewSort] = useState('recent')
  const [loading, setLoading] = useState(true)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const [userLog, setUserLog] = useState(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAllScreenshots, setShowAllScreenshots] = useState(false)

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/games/${appId}`)
        setGame(res.data)
      } catch (err) {
        setGame(null)
      } finally {
        setLoading(false)
      }
    }
    fetchGame()
  }, [appId])

  useEffect(() => {
    if (!game) return
    const fetchReviews = async () => {
      setReviewLoading(true)
      try {
        const res = await api.get(`/games/${appId}/reviews?sort=${reviewSort}&page=${reviewPage}&limit=10`)
        setReviews((prev) => (reviewPage === 1 ? res.data.reviews : [...prev, ...res.data.reviews]))
        setReviewTotal(res.data.total)
        setTotalPages(res.data.totalPages)
      } catch {}
      finally { setReviewLoading(false) }
    }
    fetchReviews()
  }, [game, appId, reviewSort, reviewPage])

  // Check user's log and review
  useEffect(() => {
    if (!user || !game) return
    Promise.all([
      api.get(`/logs/check/${appId}`).catch(() => ({ data: { log: null } })),
    ]).then(([logRes]) => {
      setUserLog(logRes.data.log)
    })

    // Check if user already reviewed
    api.get(`/users/${user.steamId}/reviews?limit=100`).then((res) => {
      const found = res.data.reviews.find((r) => r.appId === appId)
      setUserReview(found || null)
    }).catch(() => {})
  }, [user, game, appId])

  const handleSortChange = (s) => {
    setReviewSort(s)
    setReviewPage(1)
    setReviews([])
  }

  const handleReviewSaved = (review) => {
    setUserReview(review)
    setReviewPage(1)
    setReviews([])
    // Refresh
    api.get(`/games/${appId}/reviews?sort=${reviewSort}&page=1&limit=10`).then((res) => {
      setReviews(res.data.reviews)
      setReviewTotal(res.data.total)
    })
    // Refresh fraglog stats
    api.get(`/games/${appId}`).then((res) => setGame(res.data)).catch(() => {})
  }

  if (loading) return <PageLoader />
  if (!game) {
    return (
      <div className="page-container">
        <EmptyState title="Game not found" description="This Steam app ID doesn't exist or the store API is unavailable." />
      </div>
    )
  }

  const priceStr = game.isFree ? 'Free to Play' : game.price?.formatted || 'N/A'

  return (
    <div>
      {/* Hero */}
      <div className="relative min-h-64 overflow-hidden">
        {game.background && (
          <img
            src={game.background}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        )}
        <div className="absolute inset-0 game-header-overlay" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-end gap-6">
            {/* Header image */}
            <img
              src={game.headerImage}
              alt={game.name}
              className="w-48 rounded-lg border border-border shadow-2xl flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-black text-3xl sm:text-4xl text-text-primary leading-tight mb-2">
                {game.name}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-3 flex-wrap mb-3">
                {game.developers?.[0] && (
                  <span className="text-xs font-mono text-text-muted">{game.developers[0]}</span>
                )}
                {game.releaseDate && (
                  <span className="text-xs font-mono text-text-muted">· {game.releaseDate}</span>
                )}
                <span className="text-xs font-mono text-accent-green">{priceStr}</span>
              </div>

              {/* Ratings row */}
              <div className="flex items-center gap-6 mb-4 flex-wrap">
                {game.fraglog.reviewCount > 0 && (
                  <div>
                    <div className="flex items-center gap-2">
                      <StarRatingDisplay value={game.fraglog.avgRating} size={16} showValue />
                      <span className="text-xs font-mono text-text-muted">
                        {game.fraglog.reviewCount} Fraglog review{game.fraglog.reviewCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
                {game.metacritic && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-muted">Metacritic</span>
                    <span
                      className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                        game.metacritic.score >= 75
                          ? 'bg-accent-green/20 text-accent-green'
                          : game.metacritic.score >= 50
                          ? 'bg-accent-gold/20 text-accent-gold'
                          : 'bg-accent-red/20 text-accent-red'
                      }`}
                    >
                      {game.metacritic.score}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                {user && (
                  <>
                    <button
                      onClick={() => setShowWriteModal(true)}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      {userReview ? <FiEdit2 size={13} /> : <FiPlus size={13} />}
                      {userReview ? 'Edit Review' : 'Write Review'}
                    </button>
                    <button
                      onClick={() => setShowLogModal(true)}
                      className={`flex items-center gap-2 text-sm ${
                        userLog ? 'btn-ghost border-accent-green/50 text-accent-green' : 'btn-ghost'
                      }`}
                    >
                      {userLog ? `✓ ${STATUS_LABELS[userLog.status]}` : '+ Add to Log'}
                    </button>
                  </>
                )}
                <a
                  href={steamStoreUrl(appId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost flex items-center gap-2 text-sm"
                >
                  <SiSteam size={13} />
                  Steam Store
                  <FiExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: description + reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {game.shortDescription && (
              <div>
                <h2 className="section-title mb-3">About</h2>
                <p className="text-sm text-text-secondary font-body leading-relaxed">
                  {game.shortDescription}
                </p>
              </div>
            )}

            {/* Screenshots */}
            {game.screenshots?.length > 0 && (
              <div>
                <h2 className="section-title mb-3">Screenshots</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(showAllScreenshots ? game.screenshots : game.screenshots.slice(0, 3)).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full rounded aspect-video object-cover hover:opacity-90 transition-opacity bg-bg-elevated"
                      />
                    </a>
                  ))}
                </div>
                {game.screenshots.length > 3 && (
                  <button
                    onClick={() => setShowAllScreenshots(!showAllScreenshots)}
                    className="text-xs text-text-muted hover:text-accent-green transition-colors font-mono mt-2"
                  >
                    {showAllScreenshots ? '− Show less' : `+ ${game.screenshots.length - 3} more`}
                  </button>
                )}
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <FiMessageSquare className="text-accent-green" />
                  <h2 className="section-title">
                    Community Reviews
                    {reviewTotal > 0 && (
                      <span className="ml-2 text-sm font-mono text-text-muted font-normal">({reviewTotal})</span>
                    )}
                  </h2>
                </div>
                <select
                  value={reviewSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="input w-auto text-xs py-1.5"
                >
                  {REVIEW_SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {!user && (
                <div className="card p-4 mb-4 border-accent-green/20 flex items-center justify-between gap-3">
                  <p className="text-sm text-text-muted font-body">Sign in to write a review</p>
                  <Link to="/" className="btn-primary text-sm flex items-center gap-2 flex-shrink-0">
                    <SiSteam size={13} /> Sign In
                  </Link>
                </div>
              )}

              {reviewLoading && reviews.length === 0 ? (
                <PageLoader />
              ) : reviews.length === 0 ? (
                <EmptyState
                  icon={FiMessageSquare}
                  title="No reviews yet"
                  description="Be the first to review this game!"
                  action={user ? (
                    <button onClick={() => setShowWriteModal(true)} className="btn-primary text-sm">
                      Write First Review
                    </button>
                  ) : null}
                />
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      showGame={false}
                      onUpdate={(r) => { setUserReview(r); setShowWriteModal(true) }}
                    />
                  ))}

                  {reviewPage < totalPages && (
                    <button
                      onClick={() => setReviewPage((p) => p + 1)}
                      disabled={reviewLoading}
                      className="btn-ghost w-full"
                    >
                      {reviewLoading ? 'Loading…' : 'Load More Reviews'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: game info */}
          <div className="space-y-5">
            <div className="card p-4 space-y-3">
              <h3 className="label">Game Info</h3>

              {game.genres?.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted font-mono mb-1.5 flex items-center gap-1">
                    <FiTag size={11} /> Genres
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {game.genres.map((g) => (
                      <span key={g} className="tag">{g}</span>
                    ))}
                  </div>
                </div>
              )}

              {game.developers?.length > 0 && (
                <InfoRow label="Developer" value={game.developers.join(', ')} />
              )}
              {game.publishers?.length > 0 && (
                <InfoRow label="Publisher" value={game.publishers.join(', ')} />
              )}
              {game.releaseDate && (
                <InfoRow label="Release Date" value={game.releaseDate} />
              )}
              {game.price && !game.isFree && (
                <InfoRow label="Price" value={game.price.formatted} />
              )}
              {game.isFree && (
                <InfoRow label="Price" value="Free to Play" highlight />
              )}
            </div>

            {/* Fraglog community stats */}
            {game.fraglog.reviewCount > 0 && (
              <div className="card p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <FiUsers size={13} className="text-accent-green" />
                  <h3 className="label">Fraglog Community</h3>
                </div>
                <div className="flex items-center justify-between">
                  <StarRatingDisplay value={game.fraglog.avgRating} size={18} showValue />
                  <span className="text-xs font-mono text-text-muted">
                    {game.fraglog.reviewCount} review{game.fraglog.reviewCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showWriteModal && (
        <WriteReviewModal
          game={{ appId, name: game.name, headerImage: game.headerImage }}
          existingReview={userReview}
          onClose={() => setShowWriteModal(false)}
          onSaved={handleReviewSaved}
        />
      )}
      {showLogModal && (
        <LogGameModal
          game={{ appId, name: game.name, headerImage: game.headerImage }}
          existingLog={userLog}
          onClose={() => setShowLogModal(false)}
          onSaved={(updated) => setUserLog(updated)}
        />
      )}
    </div>
  )
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs font-mono text-text-muted flex-shrink-0">{label}</span>
      <span className={`text-xs font-body text-right ${highlight ? 'text-accent-green' : 'text-text-secondary'}`}>
        {value}
      </span>
    </div>
  )
}
