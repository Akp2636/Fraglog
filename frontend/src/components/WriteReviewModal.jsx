import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { StarRatingInput } from './StarRating'
import { ratingLabel } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function WriteReviewModal({ game, existing, onClose, onSave }) {
  const [form, setForm] = useState({
    rating          : existing?.rating           || null,
    title           : existing?.title            || '',
    body            : existing?.body             || '',
    containsSpoilers: existing?.containsSpoilers || false,
    playedOn        : existing?.playedOn         || 'PC',
    hoursAtReview   : existing?.hoursAtReview    || '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.body.trim()) return toast.error('Review body is required')
    if (!form.rating)      return toast.error('Please add a rating')
    setSaving(true)
    try {
      const payload = {
        ...form,
        appId          : String(game.steam_appid || game.appid || game.appId),
        gameName       : game.name,
        gameHeaderImage: `https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_appid || game.appid || game.appId}/header.jpg`,
      }
      const r = existing
        ? await api.put(`/reviews/${existing._id}`, payload)
        : await api.post('/reviews', payload)
      toast.success(existing ? 'Review updated!' : 'Review posted!')
      onSave?.(r.data.review); onClose()
    } catch (e) { toast.error(e.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid #222', width: '100%', maxWidth: 560, margin: 'auto' }}>
        <div style={{ height: 2, background: '#9EFF00' }} />
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="t-label" style={{ marginBottom: 3 }}>{existing ? 'Edit Review' : 'Write Review'}</p>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.04em', color: '#F0F0F0' }}>{game.name}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color='#F0F0F0'} onMouseLeave={e => e.currentTarget.style.color='#444'}>
            <FiX size={16} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Rating */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <p className="t-label">Rating</p>
              {form.rating && <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9EFF00' }}>{ratingLabel(form.rating)}</span>}
            </div>
            <StarRatingInput value={form.rating} onChange={v => set('rating', v)} size={22} />
          </div>

          {/* Title */}
          <div>
            <p className="t-label" style={{ marginBottom: 6 }}>Title (Optional)</p>
            <input className="inp" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Give your review a headline..." maxLength={120} style={{ fontSize: 13 }} />
          </div>

          {/* Body */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <p className="t-label">Review *</p>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#444' }}>{form.body.length}/5000</span>
            </div>
            <textarea className="inp" rows={5} value={form.body} onChange={e => set('body', e.target.value)}
              placeholder="Share your thoughts..." maxLength={5000} style={{ resize: 'vertical', fontSize: 13 }} />
          </div>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p className="t-label" style={{ marginBottom: 6 }}>Platform</p>
              <select className="inp" value={form.playedOn} onChange={e => set('playedOn', e.target.value)} style={{ fontSize: 12 }}>
                {['PC','PlayStation','Xbox','Nintendo Switch','Mobile'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <p className="t-label" style={{ marginBottom: 6 }}>Hours Played</p>
              <input className="inp" type="number" min="0" value={form.hoursAtReview} onChange={e => set('hoursAtReview', e.target.value)} placeholder="0" style={{ fontSize: 13 }} />
            </div>
          </div>

          {/* Spoiler */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{
              width: 44, height: 22, background: form.containsSpoilers ? '#9EFF00' : '#222',
              borderRadius: 11, position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }} onClick={() => set('containsSpoilers', !form.containsSpoilers)}>
              <div style={{
                position: 'absolute', top: 2, left: form.containsSpoilers ? 22 : 2,
                width: 18, height: 18, background: form.containsSpoilers ? '#0A0A0A' : '#555',
                borderRadius: '50%', transition: 'left 0.2s',
              }} />
            </div>
            <span style={{ fontFamily: 'Manrope', fontSize: 12, color: '#888' }}>Contains spoilers</span>
          </label>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={saving} className="btn-primary" style={{ justifyContent: 'center', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Posting...' : existing ? 'Update Review' : 'Post Review'}
          </button>
        </div>
      </div>
    </div>
  )
}
