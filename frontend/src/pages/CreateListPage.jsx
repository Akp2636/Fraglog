import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiSearch, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function CreateListPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const { id }     = useParams() // if editing
  const isEdit     = !!id

  const [title,     setTitle]     = useState('')
  const [desc,      setDesc]      = useState('')
  const [isPublic,  setIsPublic]  = useState(true)
  const [games,     setGames]     = useState([])
  const [search,    setSearch]    = useState('')
  const [results,   setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    if (!user) navigate('/')
    if (isEdit) {
      api.get(`/lists/${id}`).then(r => {
        const l = r.data.list
        if (l.steamId !== user?.steamId) { navigate('/'); return }
        setTitle(l.title); setDesc(l.description || '')
        setGames(l.games?.sort((a,b) => a.position - b.position) || [])
        setIsPublic(l.isPublic)
      }).catch(() => navigate('/lists'))
    }
  }, [id, user?.steamId])

  const handleSearch = async (q) => {
    setSearch(q)
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const r = await api.get(`/games/search?q=${encodeURIComponent(q)}`)
      setResults((r.data.games || []).slice(0, 8))
    } catch {} finally { setSearching(false) }
  }

  const addGame = (g) => {
    if (games.find(x => String(x.appId) === String(g.id))) { toast.error('Already in list'); return }
    setGames(prev => [...prev, { appId: String(g.id), name: g.name, headerImage: g.tiny_image || `https://cdn.akamai.steamstatic.com/steam/apps/${g.id}/header.jpg`, position: prev.length + 1 }])
    setSearch(''); setResults([])
  }

  const removeGame = (appId) => setGames(g => g.filter(x => x.appId !== appId).map((x,i) => ({ ...x, position: i+1 })))
  const moveUp     = (i) => { if (i === 0) return; const g = [...games]; [g[i-1],g[i]] = [g[i],g[i-1]]; setGames(g.map((x,j) => ({ ...x, position: j+1 }))) }
  const moveDown   = (i) => { if (i === games.length-1) return; const g = [...games]; [g[i],g[i+1]] = [g[i+1],g[i]]; setGames(g.map((x,j) => ({ ...x, position: j+1 }))) }

  const handleSave = async () => {
    if (!title.trim()) return toast.error('Title is required')
    if (games.length === 0) return toast.error('Add at least one game')
    setSaving(true)
    try {
      const payload = { title: title.trim(), description: desc.trim(), games, isPublic }
      const r = isEdit ? await api.put(`/lists/${id}`, payload) : await api.post('/lists', payload)
      toast.success(isEdit ? 'List updated!' : 'List created!')
      navigate(`/lists/${r.data.list._id}`)
    } catch (e) { toast.error(e.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px' }}>
      <div className="section-label"><span>{isEdit ? 'Edit List' : 'Create List'}</span></div>

      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <p className="t-label" style={{ marginBottom: 6 }}>List Title *</p>
        <input className="inp" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Top 10 RPGs of All Time" maxLength={120} style={{ fontSize: 16, fontFamily: 'Oswald', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }} />
      </div>

      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <p className="t-label" style={{ marginBottom: 6 }}>Description (Optional)</p>
        <textarea className="inp" value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="What makes this list special?" maxLength={1000} rows={3} style={{ resize: 'vertical', fontSize: 13 }} />
      </div>

      {/* Visibility */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 24 }}>
        <div style={{ width: 40, height: 20, background: isPublic ? '#9EFF00' : '#222', borderRadius: 10, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
          onClick={() => setIsPublic(!isPublic)}>
          <div style={{ position: 'absolute', top: 2, left: isPublic ? 20 : 2, width: 16, height: 16, background: isPublic ? '#0A0A0A' : '#555', borderRadius: '50%', transition: 'left 0.2s' }} />
        </div>
        <span style={{ fontFamily: 'Manrope', fontSize: 13, color: '#888' }}>{isPublic ? 'Public list' : 'Private list'}</span>
      </label>

      {/* Search + add games */}
      <p className="t-label" style={{ marginBottom: 10 }}>Games ({games.length})</p>
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none' }} />
        <input className="inp" value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="Search and add games..." style={{ paddingLeft: 36, fontSize: 13 }} />
      </div>

      {results.length > 0 && (
        <div style={{ background: '#111', border: '1px solid #222', marginBottom: 12 }}>
          {results.map(g => (
            <button key={g.id} onClick={() => addGame(g)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', borderBottom: '1px solid #1A1A1A',
              padding: '8px 12px', cursor: 'pointer', transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background='#161616'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <img src={g.tiny_image} style={{ width: 48, height: 22, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
              <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#888' }}>{g.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Game list */}
      {games.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1A1A1A', marginBottom: 24 }}>
          {games.map((g, i) => (
            <div key={g.appId} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0A0A0A', padding: '10px 14px' }}>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: '#333', minWidth: 28, textAlign: 'right' }}>{i+1}</span>
              <img src={g.headerImage} style={{ width: 64, height: 30, objectFit: 'cover', border: '1px solid #1A1A1A' }} onError={e => e.target.style.display='none'} />
              <span style={{ flex: 1, fontFamily: 'Oswald', fontWeight: 500, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#888' }}>{g.name}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => moveUp(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 4, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#888'} onMouseLeave={e => e.currentTarget.style.color='#333'}>
                  <FiArrowUp size={12} />
                </button>
                <button onClick={() => moveDown(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 4, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#888'} onMouseLeave={e => e.currentTarget.style.color='#333'}>
                  <FiArrowDown size={12} />
                </button>
                <button onClick={() => removeGame(g.appId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 4, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#FF3B3B'} onMouseLeave={e => e.currentTarget.style.color='#333'}>
                  <FiX size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create List'}
        </button>
        <button onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
      </div>
    </div>
  )
}
