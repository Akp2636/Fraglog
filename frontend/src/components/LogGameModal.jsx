import { useState } from 'react'
import { FiX, FiTrash2 } from 'react-icons/fi'
import { StarRatingInput } from './StarRating'
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUSES = Object.keys(STATUS_LABELS)

export default function LogGameModal({ game, existing, onClose, onSave }) {
  const appId = String(game.steam_appid || game.appid || game.appId)
  const [form, setForm] = useState({
    status    : existing?.status     || 'want_to_play',
    rating    : existing?.rating     || null,
    hoursLogged: existing?.hoursLogged || '',
    notes     : existing?.notes      || '',
    startDate : existing?.startDate  ? existing.startDate.slice(0,10) : '',
    finishDate: existing?.finishDate ? existing.finishDate.slice(0,10) : '',
  })
  const [saving,  setSaving]  = useState(false)
  const [deleting,setDeleting]= useState(false)
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const r = await api.post('/logs', {
        ...form,
        appId,
        gameName   : game.name,
        headerImage: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`,
      })
      toast.success('Game log updated!')
      onSave?.(r.data.log)
      onClose()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/logs/${appId}`)
      toast.success('Removed from log')
      onSave?.(null)
      onClose()
    } catch (e) {
      toast.error('Failed to remove')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#16161f', borderRadius: 16, width: '100%', maxWidth: 500,
        border: '1px solid #2a2a3d', boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #2a2a3d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#f0f0f8' }}>Log Game</h2>
            <p style={{ fontSize: 13, color: '#8888aa', fontFamily: 'Karla', marginTop: 2 }}>{game.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555570', cursor: 'pointer', padding: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0f0f8'}
            onMouseLeave={e => e.currentTarget.style.color = '#555570'}>
            <FiX size={18} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status grid */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => set('status', s)} style={{
                  background: form.status === s ? `${STATUS_COLORS[s]}22` : '#0f0f17',
                  border: `1px solid ${form.status === s ? STATUS_COLORS[s] : '#2a2a3d'}`,
                  borderRadius: 8, padding: '10px 8px', cursor: 'pointer',
                  color: form.status === s ? STATUS_COLORS[s] : '#8888aa',
                  fontFamily: 'Karla', fontWeight: 700, fontSize: 12,
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center',
                }}>
                  <span>{STATUS_ICONS[s]}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{STATUS_LABELS[s]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Your Rating</label>
            <StarRatingInput value={form.rating} onChange={v => set('rating', v)} size={26} />
          </div>

          {/* Hours + Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hours</label>
              <input className="input" type="number" min="0" value={form.hoursLogged} onChange={e => set('hoursLogged', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Start</label>
              <input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Finish</label>
              <input className="input" type="date" value={form.finishDate} onChange={e => set('finishDate', e.target.value)} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes (private)</label>
            <textarea className="textarea" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Personal thoughts, tips, progress notes..." maxLength={1000} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 1, background: '#00e676', border: 'none', borderRadius: 10, padding: '13px',
              fontFamily: 'Syne', fontWeight: 800, fontSize: 14, color: '#0f0f17',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            {existing && (
              <button onClick={handleDelete} disabled={deleting} style={{
                background: 'none', border: '1px solid #ff4757', borderRadius: 10, padding: '13px 16px',
                color: '#ff4757', cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ff475720' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
              >
                <FiTrash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
