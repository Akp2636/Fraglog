import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiTrendingUp, FiArrowRight } from 'react-icons/fi'
import { StarRatingDisplay } from '../components/StarRating'
import { SkeletonCard } from '../components/LoadingSpinner'
import api from '../utils/api'

export default function Discover() {
  const [params]   = useSearchParams()
  const [query,    setQuery]   = useState(params.get('q') || '')
  const [input,    setInput]   = useState(params.get('q') || '')
  const [results,  setResults] = useState([])
  const [trending, setTrending]= useState([])
  const [loading,  setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/games/trending').then(r => setTrending(r.data.games || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(() => {
      api.get(`/games/search?q=${encodeURIComponent(query)}`).then(r => setResults(r.data.games || [])).catch(() => setResults([])).finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  const handleSubmit = e => {
    e.preventDefault(); setQuery(input)
    navigate(`/discover?q=${encodeURIComponent(input)}`, { replace: true })
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-label"><span>Discover Games</span></div>
        <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 14, color: '#555', marginTop: -8 }}>
          Search any Steam game and see what the community thinks.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <div style={{ position: 'relative', maxWidth: 580 }}>
          <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none', fontSize: 14 }} />
          <input value={input} onChange={e => { setInput(e.target.value); setQuery(e.target.value) }}
            placeholder="Search games..." autoFocus
            style={{
              width: '100%', background: '#111', border: '1px solid #222', borderBottom: '2px solid #9EFF00',
              paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
              fontFamily: 'Manrope', fontSize: 14, color: '#F0F0F0', outline: 'none',
            }}
          />
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#1A1A1A' }}>
          {[...Array(8)].map((_,i) => <div key={i} style={{ background: '#0A0A0A' }}><SkeletonCard /></div>)}
        </div>
      ) : query && results.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid #1A1A1A' }}>
          <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>No results for "{query}"</p>
        </div>
      ) : query && results.length > 0 ? (
        <>
          <p className="t-label" style={{ marginBottom: 16 }}>{results.length} results</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#1A1A1A' }}>
            {results.map(g => <GameTile key={g.id} id={g.id} name={g.name} img={g.tiny_image} price={g.price?.final_formatted} />)}
          </div>
        </>
      ) : trending.length > 0 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <FiTrendingUp size={14} style={{ color: '#9EFF00' }} />
            <p className="t-label" style={{ color: '#9EFF00' }}>Trending on Fraglog</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#1A1A1A' }}>
            {trending.map(g => <GameTile key={g._id} id={g._id} name={g.gameName} count={g.count} />)}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#333' }}>
          <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Search for any game above</p>
        </div>
      )}
    </div>
  )
}

function GameTile({ id, name, img, price, count }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/game/${id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{ background: hov ? '#161616' : '#0A0A0A', transition: 'background 0.15s', cursor: 'pointer' }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        <div style={{ paddingTop: '46.7%', position: 'relative', background: '#111' }}>
          <img src={img || `https://cdn.akamai.steamstatic.com/steam/apps/${id}/header.jpg`} alt={name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => e.target.style.display='none'} />
          {hov && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiArrowRight size={20} style={{ color: '#9EFF00' }} />
            </div>
          )}
        </div>
        <div style={{ padding: '8px 10px', borderTop: '1px solid #1A1A1A' }}>
          <p style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
          {price && <p style={{ fontFamily: 'Manrope', fontSize: 11, color: '#9EFF00', marginTop: 2, fontWeight: 600 }}>{price}</p>}
          {count && <p style={{ fontFamily: 'Manrope', fontSize: 10, color: '#444', marginTop: 2 }}>{count} reviews</p>}
        </div>
      </div>
    </Link>
  )
}
