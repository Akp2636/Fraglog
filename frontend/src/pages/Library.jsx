import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiSearch, FiGrid, FiList, FiAlertCircle, FiExternalLink, FiRefreshCw } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import GameCard from '../components/GameCard'
import LogGameModal from '../components/LogGameModal'
import { PageLoader } from '../components/LoadingSpinner'
import { formatPlaytime, STATUS_COLORS, STATUS_LABELS } from '../utils/helpers'
import api from '../utils/api'

export default function Library() {
  const { steamId }  = useParams()
  const { user: me } = useAuth()
  const isOwn        = me?.steamId === steamId

  const [games,      setGames]      = useState([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [sort,       setSort]       = useState('playtime')
  const [search,     setSearch]     = useState('')
  const [view,       setView]       = useState('grid')
  const [logGame,    setLogGame]    = useState(null)
  const [steamError, setSteamError] = useState(null)
  const [isPrivate,  setIsPrivate]  = useState(false)
  const [isFallback, setIsFallback] = useState(false)

  const fetchLibrary = () => {
    setLoading(true)
    setSteamError(null)
    api.get(`/users/${steamId}/library?sort=${sort}&limit=200&t=${Date.now()}`)
      .then(r => {
        setGames(r.data.games || [])
        setTotal(r.data.total || 0)
        setSteamError(r.data.steamError || null)
        setIsPrivate(r.data.isPrivate || false)
        setIsFallback(r.data.fallback || false)
      })
      .catch(err => {
        console.error('Library fetch error:', err)
        setSteamError('Failed to load library. Please try refreshing.')
        setGames([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLibrary()
  }, [steamId, sort])

  const filtered = search.trim()
    ? games.filter(g => (g.name || '').toLowerCase().includes(search.toLowerCase()))
    : games

  const totalHours = games.reduce((s, g) => s + (g.playtime_forever || 0), 0)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 3, height: 20, background: '#9EFF00' }} />
            <h1 style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#F0F0F0' }}>
              {isOwn ? 'My Library' : 'Library'}
            </h1>
          </div>
          {!loading && !steamError && (
            <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 13, color: '#444', marginLeft: 13 }}>
              {total} games · {formatPlaytime(totalHours)} total playtime
            </p>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none', fontSize: 12 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter..."
              style={{ background: '#111', border: '1px solid #222', paddingLeft: 28, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontFamily: 'Manrope', fontSize: 12, color: '#F0F0F0', outline: 'none', width: 160 }}
              onFocus={e => e.target.style.borderColor = '#9EFF00'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ background: '#111', border: '1px solid #222', padding: '8px 12px', fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', cursor: 'pointer', outline: 'none' }}>
            <option value="playtime">Most Played</option>
            <option value="recent">Recent</option>
            <option value="name">A–Z</option>
          </select>
          <div style={{ display: 'flex', border: '1px solid #222' }}>
            {[['grid', FiGrid], ['list', FiList]].map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)} style={{
                background: view === v ? '#222' : 'transparent', border: 'none',
                padding: '8px 12px', cursor: 'pointer', color: view === v ? '#F0F0F0' : '#444', transition: 'all 0.15s',
              }}><Icon size={13} /></button>
            ))}
          </div>
          <button onClick={fetchLibrary} style={{ background: 'none', border: '1px solid #222', padding: '8px 10px', cursor: 'pointer', color: '#444', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#9EFF00'; e.currentTarget.style.color='#9EFF00' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#222'; e.currentTarget.style.color='#444' }}>
            <FiRefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* ── Error / Warning banner ── */}
      {steamError && (
        <div style={{
          background: isPrivate ? '#1a1000' : '#1a0000',
          border: `1px solid ${isPrivate ? '#664400' : '#440000'}`,
          padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <FiAlertCircle size={18} style={{ color: isPrivate ? '#FFD700' : '#FF3B3B', flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: isPrivate ? '#FFD700' : '#FF3B3B', marginBottom: 4 }}>
              {isPrivate ? 'Steam Profile Is Private' : 'Could Not Load Steam Library'}
            </p>
            <p style={{ fontFamily: 'Manrope', fontSize: 12, color: '#888', lineHeight: 1.6 }}>
              {steamError}
            </p>
            {isPrivate && (
              <a
                href="https://steamcommunity.com/my/edit/settings"
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontFamily: 'Oswald', fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#67c1f5', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color='#9EFF00'}
                onMouseLeave={e => e.currentTarget.style.color='#67c1f5'}
              >
                <SiSteam size={11} /> Open Steam Privacy Settings <FiExternalLink size={10} />
              </a>
            )}
            {!isPrivate && isOwn && (
              <p style={{ fontFamily: 'Manrope', fontSize: 11, color: '#555', marginTop: 6 }}>
                Check that <strong style={{ color: '#888' }}>STEAM_API_KEY</strong> is set in Render's environment variables, then redeploy.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Fallback notice */}
      {isFallback && games.length > 0 && (
        <div style={{ background: '#111', border: '1px solid #1A1A1A', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiAlertCircle size={14} style={{ color: '#40BCF4', flexShrink: 0 }} />
          <p style={{ fontFamily: 'Manrope', fontSize: 12, color: '#555' }}>
            Showing only games you've manually logged in Fraglog. Full library requires a public Steam profile.
          </p>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <PageLoader />
      ) : games.length === 0 ? (
        <EmptyLibrary steamError={steamError} isPrivate={isPrivate} isOwn={isOwn} />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', border: '1px solid #1A1A1A' }}>
          <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>
            No games matching "{search}"
          </p>
        </div>
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
              onMouseEnter={e => { if (isOwn) e.currentTarget.style.background = '#111' }}
              onMouseLeave={e => e.currentTarget.style.background = '#0A0A0A'}>
              <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`}
                style={{ width: 64, height: 30, objectFit: 'cover', flexShrink: 0, border: '1px solid #1A1A1A' }}
                onError={e => e.target.style.display = 'none'} />
              <p style={{ flex: 1, fontFamily: 'Oswald', fontWeight: 500, fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {g.name}
              </p>
              <span style={{ fontFamily: 'Manrope', fontSize: 11, color: '#444', flexShrink: 0, minWidth: 40, textAlign: 'right' }}>
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
        <LogGameModal
          game={logGame}
          existing={logGame.log}
          onClose={() => setLogGame(null)}
          onSave={log => {
            setGames(gs => gs.map(g => String(g.appid) === String(logGame.appid) ? { ...g, log } : g))
            setLogGame(null)
          }}
        />
      )}
    </div>
  )
}

// ── Empty state with context-aware message ──────────────────────────────────
function EmptyLibrary({ steamError, isPrivate, isOwn }) {
  return (
    <div style={{ border: '1px solid #1A1A1A', padding: '5rem 2rem', textAlign: 'center' }}>
      <SiSteam size={36} style={{ color: '#1A1A1A', display: 'block', margin: '0 auto 20px' }} />
      {isPrivate ? (
        <>
          <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFD700', marginBottom: 10 }}>
            Steam Profile Is Private
          </p>
          <p style={{ fontFamily: 'Manrope', fontSize: 13, color: '#555', marginBottom: 16, lineHeight: 1.6, maxWidth: 440, margin: '0 auto 16px' }}>
            To show your library, set <strong style={{ color: '#888' }}>Game Details</strong> to <strong style={{ color: '#888' }}>Public</strong> in your Steam Privacy Settings.
          </p>
          <a href="https://steamcommunity.com/my/edit/settings" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1b2838', border: '1px solid #2a3f52', padding: '10px 18px', color: '#c6d4df', fontFamily: 'Oswald', fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#67c1f5'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2a3f52'}>
            <SiSteam size={13} style={{ color: '#67c1f5' }} /> Fix Steam Privacy <FiExternalLink size={10} />
          </a>
        </>
      ) : steamError ? (
        <>
          <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF3B3B', marginBottom: 10 }}>
            Could Not Load Library
          </p>
          <p style={{ fontFamily: 'Manrope', fontSize: 13, color: '#555', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
            {steamError}
          </p>
          {isOwn && (
            <p style={{ fontFamily: 'Manrope', fontSize: 12, color: '#444', marginTop: 12 }}>
              Make sure <strong style={{ color: '#666' }}>STEAM_API_KEY</strong> is set in Render environment variables.
            </p>
          )}
        </>
      ) : (
        <>
          <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333', marginBottom: 10 }}>
            Library Is Empty
          </p>
          <p style={{ fontFamily: 'Manrope', fontSize: 13, color: '#444' }}>
            {isOwn ? 'No games found in your Steam library.' : 'No games in this library.'}
          </p>
        </>
      )}
    </div>
  )
}
