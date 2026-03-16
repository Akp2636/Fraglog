import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiSearch, FiGrid, FiList } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import GameCard from '../components/GameCard'
import LogGameModal from '../components/LogGameModal'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import { formatPlaytime, STATUS_COLORS, STATUS_LABELS } from '../utils/helpers'
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

  const totalHours = games.reduce((s, g) => s + (g.playtime_forever || 0), 0)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="section-label"><span>{isOwn ? 'My Library' : 'Library'}</span></div>
          {!loading && (
            <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 13, color: '#444', marginTop: -8 }}>
              {total} games · {formatPlaytime(totalHours)} total playtime
            </p>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none', fontSize: 12 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter..."
              style={{ background: '#111', border: '1px solid #222', paddingLeft: 28, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontFamily: 'Manrope', fontSize: 12, color: '#F0F0F0', outline: 'none', width: 160, transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor='#9EFF00'} onBlur={e => e.target.style.borderColor='#222'}
            />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ background: '#111', border: '1px solid #222', padding: '8px 12px', fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', cursor: 'pointer', outline: 'none' }}>
            <option value="playtime">Most Played</option>
            <option value="recent">Recent</option>
            <option value="name">A–Z</option>
          </select>
          <div style={{ display: 'flex', border: '1px solid #222', overflow: 'hidden' }}>
            {[['grid', FiGrid], ['list', FiList]].map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)} style={{
                background: view === v ? '#222' : 'transparent', border: 'none',
                padding: '8px 12px', cursor: 'pointer', color: view === v ? '#F0F0F0' : '#444', transition: 'all 0.15s',
              }}><Icon size={13} /></button>
            ))}
          </div>
        </div>
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState title={search ? `No games matching "${search}"` : 'Library is empty'} />
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#1A1A1A' }}>
          {filtered.map(g => (
            <div key={g.appid} style={{ background: '#0A0A0A', cursor: isOwn ? 'pointer' : 'default' }}
              onClick={() => isOwn && setLogGame(g)}>
              <GameCard game={g} log={g.log} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1A1A1A' }}>
          {filtered.map(g => (
            <div key={g.appid} onClick={() => isOwn && setLogGame(g)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#0A0A0A', padding: '10px 16px', cursor: isOwn ? 'pointer' : 'default', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (isOwn) e.currentTarget.style.background='#111' }}
              onMouseLeave={e => e.currentTarget.style.background='#0A0A0A'}>
              <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`}
                style={{ width: 64, height: 30, objectFit: 'cover', flexShrink: 0, border: '1px solid #1A1A1A' }}
                onError={e => e.target.style.display='none'} />
              <p style={{ flex: 1, fontFamily: 'Oswald', fontWeight: 500, fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {g.name}
              </p>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#444', flexShrink: 0 }}>
                {formatPlaytime(g.playtime_forever)}
              </span>
              {g.log && (
                <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: STATUS_COLORS[g.log.status], padding: '2px 8px', border: `1px solid ${STATUS_COLORS[g.log.status]}44`, flexShrink: 0 }}>
                  {STATUS_LABELS[g.log.status]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {logGame && isOwn && (
        <LogGameModal game={logGame} existing={logGame.log} onClose={() => setLogGame(null)}
          onSave={log => setGames(gs => gs.map(g => String(g.appid) === String(logGame.appid) ? { ...g, log } : g))} />
      )}
    </div>
  )
}
