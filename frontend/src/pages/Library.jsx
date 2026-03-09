import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiSearch, FiGrid, FiList } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import GameCard from '../components/GameCard'
import LogGameModal from '../components/LogGameModal'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import { formatPlaytime } from '../utils/helpers'
import api from '../utils/api'

export default function Library() {
  const { steamId }  = useParams()
  const { user: me } = useAuth()
  const isOwn        = me?.steamId === steamId

  const [games,   setGames]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [sort,    setSort]    = useState('playtime')
  const [search,  setSearch]  = useState('')
  const [view,    setView]    = useState('grid')
  const [logGame, setLogGame] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/users/${steamId}/library?sort=${sort}&limit=200`)
      .then(r => { setGames(r.data.games || []); setTotal(r.data.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [steamId, sort])

  const filtered = search.trim()
    ? games.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : games

  const totalHours = games.reduce((sum, g) => sum + (g.playtime_forever || 0), 0)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 30, color: '#f0f0f8', marginBottom: 4 }}>
            {isOwn ? 'My Library' : 'Library'}
          </h1>
          {!loading && (
            <p style={{ fontFamily: 'Karla', fontSize: 14, color: '#555570' }}>
              {total} games · {formatPlaytime(totalHours)} total played
            </p>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#555570', pointerEvents: 'none', fontSize: 13 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter games..."
              style={{
                background: '#1c1c28', border: '1px solid #2a2a3d', borderRadius: 8,
                paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                fontSize: 13, color: '#f0f0f8', fontFamily: 'Karla', outline: 'none', width: 180,
              }}
            />
          </div>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ background: '#1c1c28', border: '1px solid #2a2a3d', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#f0f0f8', fontFamily: 'Karla', cursor: 'pointer', outline: 'none' }}>
            <option value="playtime">Most Played</option>
            <option value="recent">Recently Played</option>
            <option value="name">Alphabetical</option>
          </select>

          {/* View toggle */}
          <div style={{ display: 'flex', background: '#1c1c28', border: '1px solid #2a2a3d', borderRadius: 8, overflow: 'hidden' }}>
            {[['grid', FiGrid], ['list', FiList]].map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)} style={{
                background: view === v ? '#2a2a3d' : 'transparent', border: 'none',
                padding: '8px 12px', cursor: 'pointer', color: view === v ? '#f0f0f8' : '#555570', transition: 'all 0.15s',
              }}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎮" title={search ? `No games matching "${search}"` : 'Library is empty'} />
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {filtered.map(g => (
            <div key={g.appid} style={{ position: 'relative' }} onClick={() => isOwn && setLogGame(g)}>
              <GameCard game={g} log={g.log} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map(g => (
            <div key={g.appid} onClick={() => isOwn && setLogGame(g)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#1c1c28', border: '1px solid #2a2a3d', borderRadius: 10,
              padding: '10px 14px', cursor: isOwn ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { if (isOwn) e.currentTarget.style.background = '#222232' }}
              onMouseLeave={e => e.currentTarget.style.background = '#1c1c28'}
            >
              <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`}
                style={{ width: 64, height: 30, objectFit: 'cover', borderRadius: 4 }}
                onError={e => e.target.style.display = 'none'}
              />
              <p style={{ flex: 1, fontFamily: 'Karla', fontWeight: 700, fontSize: 14, color: '#f0f0f8',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {g.name}
              </p>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#555570', flexShrink: 0 }}>
                {formatPlaytime(g.playtime_forever)}
              </span>
              {g.log && (
                <span style={{ fontSize: 11, fontFamily: 'Karla', fontWeight: 700, color: '#00e676', flexShrink: 0, background: '#00e67620', padding: '2px 8px', borderRadius: 4 }}>
                  {g.log.status.replace('_', ' ')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {logGame && isOwn && (
        <LogGameModal
          game={logGame}
          existing={logGame.log}
          onClose={() => setLogGame(null)}
          onSave={log => setGames(gs => gs.map(g => String(g.appid) === String(logGame.appid) ? { ...g, log } : g))}
        />
      )}
    </div>
  )
}
