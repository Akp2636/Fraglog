import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiFilter, FiLock, FiGrid, FiList } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { PageLoader, EmptyState, ErrorState } from '../components/LoadingSpinner'
import { formatPlaytime } from '../utils/helpers'
import LogGameModal from '../components/LogGameModal'
import { StarRatingDisplay } from '../components/StarRating'

const SORT_OPTIONS = [
  { value: 'playtime', label: 'Most Played' },
  { value: 'recent', label: 'Recently Played' },
  { value: 'name', label: 'Name (A–Z)' },
]

export default function Library() {
  const { steamId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [games, setGames] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('playtime')
  const [view, setView] = useState('grid')
  const [logModal, setLogModal] = useState(null) // { game }
  const [userLogs, setUserLogs] = useState({}) // appId -> log
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const LIMIT = 60

  const isOwnLibrary = user?.steamId === steamId

  const fetchLibrary = useCallback(async (resetOffset = true) => {
    const currentOffset = resetOffset ? 0 : offset
    if (resetOffset) {
      setLoading(true)
      setOffset(0)
    } else {
      setLoadingMore(true)
    }
    setError(null)

    try {
      const res = await api.get(`/users/${steamId}/library?sort=${sort}&limit=${LIMIT}&offset=${currentOffset}`)
      const newGames = res.data.games

      if (resetOffset) {
        setGames(newGames)
      } else {
        setGames((prev) => [...prev, ...newGames])
        setOffset(currentOffset + newGames.length)
      }
      setTotal(res.data.total)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load library'
      setError(msg)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [steamId, sort, offset])

  useEffect(() => {
    fetchLibrary(true)
  }, [steamId, sort])

  // Fetch current user's logs to show status badges
  useEffect(() => {
    if (!user) return
    api.get('/logs/my').then((res) => {
      const map = {}
      res.data.forEach((log) => { map[log.appId] = log })
      setUserLogs(map)
    }).catch(() => {})
  }, [user])

  const filtered = games.filter((g) =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <PageLoader />

  if (error) {
    return (
      <div className="page-container">
        {error.includes('private') ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center mx-auto mb-4">
              <FiLock size={24} className="text-accent-gold" />
            </div>
            <h2 className="font-display font-bold text-text-primary text-xl mb-2">Private Library</h2>
            <p className="text-text-muted font-body text-sm mb-4">{error}</p>
            <a
              href="https://steamcommunity.com/my/edit/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              Open Steam Privacy Settings
            </a>
          </div>
        ) : (
          <ErrorState message={error} onRetry={() => fetchLibrary(true)} />
        )}
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-text-primary">
            {isOwnLibrary ? 'My Library' : 'Steam Library'}
          </h1>
          <p className="text-sm text-text-muted font-mono mt-0.5">
            {total.toLocaleString()} games{search ? ` · ${filtered.length} matching` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <FiFilter size={13} className="text-text-muted" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input py-1.5 text-xs w-auto"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex border border-border rounded overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`p-2 transition-colors ${view === 'grid' ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <FiGrid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 transition-colors ${view === 'list' ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <FiList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
        <input
          type="text"
          placeholder={`Search ${total.toLocaleString()} games…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Games */}
      {filtered.length === 0 ? (
        <EmptyState title="No games found" description="Try a different search term." />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((game, i) => (
            <LibraryGameCard
              key={game.appId}
              game={game}
              log={userLogs[game.appId]}
              isOwnLibrary={isOwnLibrary}
              onLog={(g) => setLogModal({ game: g })}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((game) => (
            <LibraryGameRow
              key={game.appId}
              game={game}
              log={userLogs[game.appId]}
              isOwnLibrary={isOwnLibrary}
              onLog={(g) => setLogModal({ game: g })}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {!search && games.length < total && (
        <div className="text-center mt-8">
          <button
            onClick={() => fetchLibrary(false)}
            disabled={loadingMore}
            className="btn-ghost"
          >
            {loadingMore ? 'Loading…' : `Load More (${total - games.length} remaining)`}
          </button>
        </div>
      )}

      {/* Log modal */}
      {logModal && (
        <LogGameModal
          game={logModal.game}
          existingLog={userLogs[logModal.game.appId]}
          onClose={() => setLogModal(null)}
          onSaved={(updatedLog) => {
            setUserLogs((prev) => {
              const next = { ...prev }
              if (updatedLog) next[logModal.game.appId] = updatedLog
              else delete next[logModal.game.appId]
              return next
            })
          }}
        />
      )}
    </div>
  )
}

function LibraryGameCard({ game, log, isOwnLibrary, onLog, index }) {
  return (
    <div
      className="group relative animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 0.02, 0.4)}s`, opacity: 0 }}
    >
      <Link to={`/game/${game.appId}`}>
        <div className="aspect-[460/215] overflow-hidden rounded-lg bg-bg-elevated border border-border group-hover:border-border-light transition-colors">
          <img
            src={game.headerImage}
            alt={game.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
        <p className="text-xs font-body text-text-secondary mt-1.5 truncate px-0.5 group-hover:text-accent-green transition-colors">
          {game.name}
        </p>
        <p className="text-xs font-mono text-text-muted px-0.5">
          {formatPlaytime(game.playtimeMinutes)}
        </p>
      </Link>

      {/* Log button overlay */}
      {isOwnLibrary && (
        <button
          onClick={() => onLog(game)}
          className={`absolute top-1.5 right-1.5 text-xs font-mono px-1.5 py-0.5 rounded border transition-all ${
            log
              ? 'bg-accent-green/90 border-accent-green text-bg-primary'
              : 'bg-bg-card/80 border-border text-text-muted opacity-0 group-hover:opacity-100 hover:border-accent-green hover:text-accent-green'
          }`}
        >
          {log ? '✓' : '+'}
        </button>
      )}
    </div>
  )
}

function LibraryGameRow({ game, log, isOwnLibrary, onLog }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded hover:bg-bg-elevated transition-colors group">
      <Link to={`/game/${game.appId}`} className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={game.headerImage}
          alt={game.name}
          className="w-20 h-10 object-cover rounded flex-shrink-0 bg-bg-elevated"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-body text-text-primary truncate group-hover:text-accent-green transition-colors">
            {game.name}
          </p>
          <p className="text-xs font-mono text-text-muted">{formatPlaytime(game.playtimeMinutes)}</p>
        </div>
      </Link>

      {log?.rating && <StarRatingDisplay value={log.rating} size={12} />}

      {isOwnLibrary && (
        <button
          onClick={() => onLog(game)}
          className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors flex-shrink-0 ${
            log
              ? 'border-accent-green/50 text-accent-green bg-accent-green/10'
              : 'border-border text-text-muted hover:border-accent-green hover:text-accent-green'
          }`}
        >
          {log ? 'Logged' : '+ Log'}
        </button>
      )}
    </div>
  )
}
