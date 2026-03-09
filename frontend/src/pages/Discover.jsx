import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { FiSearch, FiTrendingUp } from 'react-icons/fi'
import api from '../utils/api'
import { PageLoader, SkeletonCard } from '../components/LoadingSpinner'

export default function Discover() {
  const [params]   = useSearchParams()
  const [query,    setQuery]   = useState(params.get('q') || '')
  const [input,    setInput]   = useState(params.get('q') || '')
  const [results,  setResults] = useState([])
  const [trending, setTrending]= useState([])
  const [loading,  setLoading] = useState(false)
  const navigate   = useNavigate()

  useEffect(() => {
    api.get('/games/trending').then(r => setTrending(r.data.games || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(() => {
      api.get(`/games/search?q=${encodeURIComponent(query)}`)
        .then(r => setResults(r.data.games || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  const handleSubmit = e => {
    e.preventDefault()
    setQuery(input)
    navigate(`/discover?q=${encodeURIComponent(input)}`, { replace: true })
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: '#f0f0f8', marginBottom: 8 }}>
          Discover Games
        </h1>
        <p style={{ fontFamily: 'Karla', fontSize: 15, color: '#8888aa' }}>
          Search any game on Steam. Read reviews, see ratings, log your status.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative', maxWidth: 600 }}>
          <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#555570', pointerEvents: 'none', fontSize: 16 }} />
          <input
            value={input}
            onChange={e => { setInput(e.target.value); setQuery(e.target.value) }}
            placeholder="Search Steam games..."
            autoFocus
            style={{
              width: '100%', background: '#1c1c28', border: '1px solid #2a2a3d', borderRadius: 12,
              paddingLeft: 46, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
              fontSize: 16, color: '#f0f0f8', fontFamily: 'Karla', outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#00e676'}
            onBlur={e  => e.target.style.borderColor = '#2a2a3d'}
          />
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : query && results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#555570' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
          <p style={{ fontFamily: 'Karla', fontSize: 15 }}>No games found for "{query}"</p>
        </div>
      ) : query && results.length > 0 ? (
        <div>
          <p style={{ fontFamily: 'Karla', fontSize: 13, color: '#555570', marginBottom: '1rem' }}>
            {results.length} results for "{query}"
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {results.map(g => (
              <Link key={g.id} to={`/game/${g.id}`} style={{ textDecoration: 'none' }}>
                <div className="game-card-hover" style={{
                  background: '#1c1c28', borderRadius: 12, overflow: 'hidden', border: '1px solid #2a2a3d',
                }}>
                  <div style={{ paddingTop: '46.7%', position: 'relative', background: '#0f0f17' }}>
                    <img src={g.tiny_image || `https://cdn.akamai.steamstatic.com/steam/apps/${g.id}/header.jpg`}
                      alt={g.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                  </div>
                  <div style={{ padding: '0.6rem 0.75rem' }}>
                    <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, color: '#f0f0f8',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.name}
                    </p>
                    {g.price && (
                      <p style={{ fontFamily: 'Karla', fontSize: 11, color: '#00e676', marginTop: 2 }}>
                        {g.price.final_formatted || 'Free'}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* Trending */
        trending.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
              <FiTrendingUp style={{ color: '#00e676' }} />
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#f0f0f8' }}>
                Trending on Fraglog
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {trending.map(g => (
                <Link key={g._id} to={`/game/${g._id}`} style={{ textDecoration: 'none' }}>
                  <div className="game-card-hover" style={{
                    background: '#1c1c28', borderRadius: 12, overflow: 'hidden', border: '1px solid #2a2a3d',
                  }}>
                    <div style={{ paddingTop: '46.7%', position: 'relative', background: '#0f0f17' }}>
                      <img
                        src={g.headerImage || `https://cdn.akamai.steamstatic.com/steam/apps/${g._id}/header.jpg`}
                        alt={g.gameName}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => e.target.style.display = 'none'}
                      />
                    </div>
                    <div style={{ padding: '0.6rem 0.75rem' }}>
                      <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, color: '#f0f0f8',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {g.gameName}
                      </p>
                      <p style={{ fontFamily: 'Karla', fontSize: 11, color: '#555570', marginTop: 2 }}>
                        {g.count} review{g.count !== 1 ? 's' : ''}
                      </p>
                    </div>
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
