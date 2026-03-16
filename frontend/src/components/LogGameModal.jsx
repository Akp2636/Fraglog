import { useState } from 'react'
import { FiX, FiTrash2 } from 'react-icons/fi'
import { StarRatingInput } from './StarRating'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUSES = Object.keys(STATUS_LABELS)

export default function LogGameModal({ game, existing, onClose, onSave }) {
  const appId = String(game.steam_appid || game.appid || game.appId)
  const [form, setForm] = useState({
    status     : existing?.status      || 'want_to_play',
    rating     : existing?.rating      || null,
    hoursLogged: existing?.hoursLogged || '',
    notes      : existing?.notes       || '',
    startDate  : existing?.startDate   ? existing.startDate.slice(0,10)  : '',
    finishDate : existing?.finishDate  ? existing.finishDate.slice(0,10) : '',
  })
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const r = await api.post('/logs', { ...form, appId, gameName: game.name, headerImage: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg` })
      toast.success('Game log updated!')
      onSave?.(r.data.log); onClose()
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/logs/${appId}`)
      toast.success('Removed from log')
      onSave?.(null); onClose()
    } catch { toast.error('Failed to remove') }
    finally { setDeleting(false) }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid #222', width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <div style={{ borderTop: `2px solid ${STATUS_COLORS[form.status]}` }} />
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: 3 }}>Log Game</p>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: '0.04em', color: '#F0F0F0', textTransform: 'uppercase' }}>{game.name}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color='#F0F0F0'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
            <FiX size={16} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Status */}
          <p className="t-label" style={{ marginBottom: 10 }}>Status</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 20 }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => set('status', s)} style={{
                background: form.status === s ? `${STATUS_COLORS[s]}18` : 'transparent',
                border: `1px solid ${form.status === s ? STATUS_COLORS[s] : '#222'}`,
                padding: '9px 4px', cursor: 'pointer',
                fontFamily: 'Oswald', fontWeight: 500, fontSize: 11,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: form.status === s ? STATUS_COLORS[s] : '#555',
                transition: 'all 0.15s', textAlign: 'center',
              }}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Rating */}
          <p className="t-label" style={{ marginBottom: 10 }}>Your Rating</p>
          <div style={{ marginBottom: 20 }}>
            <StarRatingInput value={form.rating} onChange={v => set('rating', v)} size={22} />
          </div>

          {/* Hours + Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              ['Hours', 'hoursLogged', 'number', '0'],
              ['Start',  'startDate',  'date',   ''],
              ['Finish', 'finishDate', 'date',   ''],
            ].map(([label, key, type, placeholder]) => (
              <div key={key}>
                <p className="t-label" style={{ marginBottom: 6, fontSize: 10 }}>{label}</p>
                <input className="inp" type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} style={{ fontSize: 12 }} />
              </div>
            ))}
          </div>

          {/* Notes */}
          <p className="t-label" style={{ marginBottom: 6 }}>Notes (Private)</p>
          <textarea className="inp" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Personal thoughts, tips, progress notes..." maxLength={1000}
            style={{ resize: 'none', marginBottom: 20, fontSize: 13 }} />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Log'}
            </button>
            {existing && (
              <button onClick={handleDelete} disabled={deleting} style={{
                background: 'transparent', border: '1px solid #FF3B3B', padding: '11px 14px',
                color: '#FF3B3B', cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background='#1a0000'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <FiTrash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
