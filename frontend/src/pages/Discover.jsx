import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { FiSearch, FiTrendingUp } from 'react-icons/fi'
import api from '../utils/api'
import { PageLoader, SkeletonCard } from '../components/LoadingSpinner'

export default function Discover() {
  const [params]    = useSearchParams()
  const [query,     setQuery]    = useState(params.get('q') || '')
  const [input,     setInput]    = useState(params.get('q') || '')
  const [results,   setResults]  = useState([])
  const [trending,  setTrending] = useState([])
  const [loading,   setLoading]  = useState(false)
  const navigate    = useNavigate()

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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 24, height: 2, background: '#b9ff57' }} />
          <span style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 11, letterSpacing: 3, color: '#b9ff57', textTransform: 'uppercase' }}>Browse</span>
        </div>
        <h1 style={{ fontFamily: '"Barlow Condensed"', fontWeight: 900, fontStyle: 'italic', fontSize: 48, textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
          Discover Games
        </h1>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative', maxWidth: 600 }}>
          <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none' }} />
          <input
            value={input}
            onChange={e => { setInput(e.target.value); setQuery(e.target.value) }}
            placeholder="SEARCH ANY STEAM GAME..."
            autoFocus
            style={{
              width: '100%', background: '#0d0d0d', border: '1px solid #222',
              borderBottom: '2px solid #b9ff57',
              paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
              fontSize: 14, color: '#fff',
              fontFamily: '"Barlow Condensed"', fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', outline: 'none',
            }}
          />
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#111' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: '#080808', padding: '0' }}><SkeletonCard /></div>
          ))}
        </div>
      ) : query && results.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid #111' }}>
          <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 20, color: '#333', textTransform: 'uppercase', letterSpacing: 2 }}>
            No results for "{query}"
          </p>
        </div>
      ) : query && results.length > 0 ? (
        <div>
          <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 11, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: '1rem' }}>
            {results.length} Results
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#111' }}>
            {results.map(g => <GameTile key={g.id} id={g.id} name={g.name} img={g.tiny_image} price={g.price?.final_formatted} />)}
          </div>
        </div>
      ) : trending.length > 0 ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
            <FiTrendingUp style={{ color: '#b9ff57' }} />
            <p style={{ fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 11, letterSpacing: 3, color: '#b9ff57', textTransform: 'uppercase' }}>
              Trending on Fraglog
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#111' }}>
            {trending.map(g => <GameTile key={g._id} id={g._id} name={g.gameName} count={g.count} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function GameTile({ id, name, img, price, count }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/game/${id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{ background: hov ? '#111' : '#080808', transition: 'background 0.15s', cursor: 'pointer' }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      >
        <div style={{ paddingTop: '46.7%', position: 'relative', background: '#0d0d0d' }}>
          <img
            src={img || `https://cdn.akamai.steamstatic.com/steam/apps/${id}/header.jpg`}
            alt={name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => e.target.style.display = 'none'}
          />
        </div>
        <div style={{ padding: '0.6rem 0.75rem' }}>
          <p style={{
            fontFamily: '"Barlow Condensed"', fontWeight: 700, fontSize: 13,
            textTransform: 'uppercase', letterSpacing: 0.5, color: '#fff',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{name}</p>
          {price && <p style={{ fontFamily: '"Barlow Condensed"', fontSize: 12, color: '#b9ff57', marginTop: 2, fontWeight: 700 }}>{price}</p>}
          {count && <p style={{ fontFamily: '"Barlow Condensed"', fontSize: 11, color: '#444', marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' }}>{count} reviews</p>}
        </div>
      </div>
    </Link>
  )
}
