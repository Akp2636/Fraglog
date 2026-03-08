import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FiSearch, FiTrendingUp } from 'react-icons/fi'
import api from '../utils/api'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQ)
  const [inputVal, setInputVal] = useState(initialQ)
  const [results, setResults] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    api.get('/games/trending/now').then((res) => setTrending(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return }
    const search = async () => {
      setLoading(true)
      setSearched(true)
      try {
        const res = await api.get(`/games/search?q=${encodeURIComponent(query)}`)
        setResults(res.data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(search, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleSubmit = (e) => {
    e.preventDefault()
    setQuery(inputVal)
    setSearchParams(inputVal ? { q: inputVal } : {})
  }

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-text-primary mb-2">
          Discover Games
        </h1>
        <p className="text-sm text-text-muted font-body">
          Search the entire Steam catalog — find a game and read what the community thinks.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative mb-8">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          placeholder="Search Steam games…"
          value={inputVal}
          onChange={(e) => { setInputVal(e.target.value); setQuery(e.target.value); setSearchParams(e.target.value ? { q: e.target.value } : {}) }}
          autoFocus
          className="w-full bg-bg-secondary border border-border text-text-primary rounded-xl pl-12 pr-4 py-4 text-base placeholder:text-text-muted focus:outline-none focus:border-accent-green transition-colors font-body"
        />
      </form>

      {/* Results */}
      {loading ? (
        <PageLoader />
      ) : searched && results.length === 0 ? (
        <EmptyState
          icon={FiSearch}
          title="No games found"
          description={`No Steam games match "${query}". Try a different search.`}
        />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map((game, i) => (
            <Link
              key={game.appId}
              to={`/game/${game.appId}`}
              className="card group hover:border-border-light transition-all animate-fade-in-up flex items-center gap-3 p-2"
              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
            >
              <img
                src={game.headerImage}
                alt={game.name}
                className="w-28 h-14 object-cover rounded flex-shrink-0 bg-bg-elevated"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="min-w-0">
                <p className="font-body font-medium text-text-primary text-sm truncate group-hover:text-accent-green transition-colors">
                  {game.name}
                </p>
                {game.price && (
                  <p className="text-xs font-mono text-text-muted mt-0.5">
                    {game.price.final === 0 ? 'Free' : `$${(game.price.final / 100).toFixed(2)}`}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Trending section (when no search) */
        trending.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="text-accent-gold" />
              <h2 className="section-title">Trending on Fraglog</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {trending.map((game, i) => (
                <Link
                  key={game._id}
                  to={`/game/${game._id}`}
                  className="card group hover:border-border-light transition-all p-3 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
                >
                  <img
                    src={game.gameHeaderImage}
                    alt={game.gameName}
                    className="w-full aspect-[460/215] object-cover rounded mb-2 bg-bg-elevated group-hover:opacity-90 transition-opacity"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <p className="text-sm font-body font-medium text-text-primary truncate group-hover:text-accent-green transition-colors">
                    {game.gameName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-mono text-text-muted">
                      {game.reviewCount} review{game.reviewCount !== 1 ? 's' : ''}
                    </span>
                    {game.avgRating && (
                      <span className="text-xs font-mono text-accent-gold">★ {Number(game.avgRating).toFixed(1)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
