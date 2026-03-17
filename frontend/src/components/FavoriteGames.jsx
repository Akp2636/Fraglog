import { useState } from 'react'
import { FiPlus, FiX, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function FavoriteGames({ games = [], isOwn = false, onSave }) {
  const [editing,   setEditing]   = useState(false)
  const [slots,     setSlots]     = useState(games.slice(0, 4))
  const [search,    setSearch]    = useState('')
  const [results,   setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [saving,    setSaving]    = useState(false)

  const handleSearch = async (q) => {
    setSearch(q)
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const r = await api.get(`/games/search?q=${encodeURIComponent(q)}`)
      setResults((r.data.games || []).slice(0, 6))
    } catch {}
    finally { setSearching(false) }
  }

  const addGame = (g) => {
    if (slots.length >= 4) { toast.error('Max 4 favorites'); return }
    if (slots.find(s => String(s.appId) === String(g.id))) { toast.error('Already added'); return }
    setSlots(prev => [...prev, { appId: String(g.id), name: g.name, headerImage: g.tiny_image || `https://cdn.akamai.steamstatic.com/steam/apps/${g.id}/header.jpg` }])
    setSearch(''); setResults([])
  }

  const removeGame = (appId) => setSlots(s => s.filter(g => g.appId !== appId))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/users/me/favorites', { games: slots })
      toast.success('Favorites saved!')
      onSave?.(slots)
      setEditing(false)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 16, background: '#9EFF00' }} />
          <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#F0F0F0' }}>
            Top Games
          </span>
        </div>
        {isOwn && !editing && (
          <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color='#9EFF00'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
            Edit
          </button>
        )}
      </div>

      {/* Display / Edit grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {[0,1,2,3].map(i => {
          const game = slots[i]
          return (
            <div key={i} style={{ position: 'relative' }}>
              {game ? (
                <Link to={`/game/${game.appId}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div style={{ paddingTop: '46.7%', position: 'relative', background: '#111', border: '1px solid #1A1A1A', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='#9EFF00'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='#1A1A1A'}>
                    <img src={game.headerImage || `https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/header.jpg`}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => e.target.style.display='none'} />
                  </div>
                </Link>
              ) : (
                <div style={{ paddingTop: '46.7%', position: 'relative', background: '#111', border: '1px dashed #222', cursor: editing ? 'pointer' : 'default' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiPlus size={16} style={{ color: '#333' }} />
                  </div>
                </div>
              )}
              {editing && game && (
                <button onClick={() => removeGame(game.appId)} style={{
                  position: 'absolute', top: 3, right: 3, width: 18, height: 18,
                  background: 'rgba(0,0,0,0.85)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                }}>
                  <FiX size={10} color="#FF3B3B" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Edit panel */}
      {editing && (
        <div style={{ marginTop: 12, background: '#111', border: '1px solid #1A1A1A', padding: '14px' }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none', fontSize: 12 }} />
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Search a game to add..."
              className="inp" style={{ paddingLeft: 30, fontSize: 12 }} />
          </div>
          {searching && <p style={{ fontFamily: 'Manrope', fontSize: 11, color: '#444', marginBottom: 8 }}>Searching...</p>}
          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1A1A1A', marginBottom: 10 }}>
              {results.map(g => (
                <button key={g.id} onClick={() => addGame(g)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, background: '#0A0A0A',
                  border: 'none', padding: '8px 10px', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='#161616'}
                  onMouseLeave={e => e.currentTarget.style.background='#0A0A0A'}>
                  <img src={g.tiny_image || `https://cdn.akamai.steamstatic.com/steam/apps/${g.id}/header.jpg`}
                    style={{ width: 48, height: 22, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                  <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888' }}>{g.name}</span>
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
              {saving ? 'Saving...' : 'Save Favorites'}
            </button>
            <button onClick={() => { setEditing(false); setSlots(games.slice(0, 4)) }} className="btn-ghost" style={{ fontSize: 12 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
