import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiTrendingUp, FiArrowRight, FiUsers, FiGamepad } from 'react-icons/fi'
import { SkeletonCard } from '../components/LoadingSpinner'
import FollowButton from '../components/FollowButton'
import api from '../utils/api'

export default function Discover() {
  const [params]      = useSearchParams()
  const [query,       setQuery]      = useState(params.get('q') || '')
  const [input,       setInput]      = useState(params.get('q') || '')
  const [tab,         setTab]        = useState('games')
  const [gameResults, setGameResults]= useState([])
  const [userResults, setUserResults]= useState([])
  const [trending,    setTrending]   = useState([])
  const [loading,     setLoading]    = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/games/trending').then(r => setTrending(r.data.games || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!query.trim()) { setGameResults([]); setUserResults([]); return }
    setLoading(true)
    Promise.all([
      api.get(`/games/search?q=${encodeURIComponent(query)}`).catch(() => ({ data: { games: [] } })),
      api.get(`/users/search?q=${encodeURIComponent(query)}`).catch(() => ({ data: { users: [] } })),
    ]).then(([gRes, uRes]) => {
      setGameResults(gRes.data.games || [])
      setUserResults(uRes.data.users || [])
    }).finally(() => setLoading(false))
  }, [query])

  const handleSubmit = e => {
    e.preventDefault()
    setQuery(input)
    navigate(`/discover?q=${encodeURIComponent(input)}`, { replace: true })
  }

  const hasQuery = query.trim().length > 0

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px', minHeight: '80vh' }}>

      <div style={{ marginBottom: 32 }}>
        <div className="section-label"><span>Discover</span></div>
        <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 14, color: '#555', marginTop: -8 }}>
          Search games and find people to follow.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative', maxWidth: 600 }}>
          <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none' }} />
          <input value={input}
            onChange={e => { setInput(e.target.value); setQuery(e.target.value) }}
            placeholder={tab === 'games' ? 'Search any Steam game...' : 'Search people by username...'}
            autoFocus
            style={{
              width: '100%', background: '#111', border: '1px solid #222',
              borderBottom: '2px solid #9EFF00',
              paddingLeft: 44, paddingRight: input ? 40 : 16, paddingTop: 13, paddingBottom: 13,
              fontFamily: 'Manrope', fontSize: 14, color: '#F0F0F0', outline: 'none',
            }}
          />
          {input && (
            <button type="button" onClick={() => { setInput(''); setQuery('') }}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#444', fontSize: 20, lineHeight: 1, padding: 0 }}>
              ×
            </button>
          )}
        </div>
      </form>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1A1A1A', marginBottom: 28 }}>
        {[['games', FiGamepad, 'Games'], ['people', FiUsers, 'People']].map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '11px 18px', marginBottom: -1,
            borderBottom: tab === key ? '2px solid #9EFF00' : '2px solid transparent',
            color: tab === key ? '#F0F0F0' : '#444',
            fontFamily: 'Oswald', fontWeight: 600, fontSize: 13,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <Icon size={13} /> {label}
            {hasQuery && key === 'people' && userResults.length > 0 && (
              <span style={{ background: '#9EFF00', color: '#0A0A0A', fontFamily: 'Oswald', fontWeight: 700, fontSize: 10, padding: '1px 6px' }}>
                {userResults.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* GAMES */}
      {tab === 'games' && (
        loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#1A1A1A' }}>
            {[...Array(8)].map((_,i) => <div key={i} style={{ background: '#0A0A0A' }}><SkeletonCard /></div>)}
          </div>
        ) : hasQuery && gameResults.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid #1A1A1A' }}>
            <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>No games found for "{query}"</p>
          </div>
        ) : hasQuery ? (
          <>
            <p className="t-label" style={{ marginBottom: 16 }}>{gameResults.length} results</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#1A1A1A' }}>
              {gameResults.map(g => <GameTile key={g.id} id={g.id} name={g.name} img={g.tiny_image} price={g.price?.final_formatted} />)}
            </div>
          </>
        ) : trending.length > 0 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <FiTrendingUp size={13} style={{ color: '#9EFF00' }} />
              <p className="t-label" style={{ color: '#9EFF00' }}>Trending on Fraglog</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#1A1A1A' }}>
              {trending.map(g => <GameTile key={g._id} id={g._id} name={g.gameName} count={g.count} />)}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>Search for any Steam game above</p>
          </div>
        )
      )}

      {/* PEOPLE */}
      {tab === 'people' && (
        !hasQuery ? (
          <div style={{ textAlign: 'center', padding: '5rem', border: '1px solid #1A1A1A' }}>
            <FiUsers size={36} style={{ color: '#1A1A1A', display: 'block', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333', marginBottom: 8 }}>
              Find People to Follow
            </p>
            <p style={{ fontFamily: 'Manrope', fontSize: 13, color: '#333' }}>
              Type a username in the search box above
            </p>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1A1A1A' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: '#0A0A0A', padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="skeleton" style={{ width: 44, height: 44, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 11, width: '55%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : userResults.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid #1A1A1A' }}>
            <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>No users found for "{query}"</p>
          </div>
        ) : (
          <>
            <p className="t-label" style={{ marginBottom: 16 }}>{userResults.length} user{userResults.length !== 1 ? 's' : ''} found</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1A1A1A' }}>
              {userResults.map(u => <UserRow key={u.steamId} user={u} />)}
            </div>
          </>
        )
      )}
    </div>
  )
}

function UserRow({ user }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#0A0A0A', padding: '14px 16px', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background='#111'}
      onMouseLeave={e => e.currentTarget.style.background='#0A0A0A'}>
      <Link to={`/profile/${user.steamId}`} style={{ flexShrink: 0 }}>
        {user.avatar
          ? <img src={user.avatar} alt={user.username} style={{ width: 44, height: 44, objectFit: 'cover', border: '1px solid #222' }} onError={e => e.target.style.display='none'} />
          : <div style={{ width: 44, height: 44, background: '#161616', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 20, color: '#333' }}>
              {user.username[0].toUpperCase()}
            </div>
        }
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/profile/${user.steamId}`} style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 15, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#F0F0F0', marginBottom: 3 }}>{user.username}</p>
        </Link>
        {user.bio && (
          <p style={{ fontFamily: 'Manrope', fontSize: 12, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.bio}</p>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>
        <FollowButton targetSteamId={user.steamId} />
      </div>
    </div>
  )
}

function GameTile({ id, name, img, price, count }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/game/${id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{ background: hov ? '#161616' : '#0A0A0A', transition: 'background 0.15s' }}
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
