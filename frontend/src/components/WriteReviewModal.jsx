import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { StarRatingInput } from './StarRating'
import { ratingLabel } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function WriteReviewModal({ game, existing, onClose, onSave }) {
  const [form, setForm] = useState({
    title          : existing?.title           || '',
    body           : existing?.body            || '',
    rating         : existing?.rating          || null,
    containsSpoilers: existing?.containsSpoilers || false,
    playedOn       : existing?.playedOn        || 'PC',
    hoursAtReview  : existing?.hoursAtReview   || '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.body.trim()) return toast.error('Review body is required')
    setSaving(true)
    try {
      let r
      if (existing) {
        r = await api.put(`/reviews/${existing._id}`, form)
      } else {
        r = await api.post('/reviews', {
          ...form,
          appId          : String(game.steam_appid || game.appid),
          gameName       : game.name,
          gameHeaderImage: `https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_appid || game.appid}/header.jpg`,
        })
      }
      toast.success(existing ? 'Review updated!' : 'Review posted!')
      onSave?.(r.data.review)
      onClose()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save review')
    } finally {
      setSaving(false)
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
        background: '#16161f', borderRadius: 16, width: '100%', maxWidth: 560,
        border: '1px solid #2a2a3d', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #2a2a3d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#f0f0f8' }}>
              {existing ? 'Edit Review' : 'Write a Review'}
            </h2>
            <p style={{ fontSize: 13, color: '#8888aa', fontFamily: 'Karla', marginTop: 2 }}>{game.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555570', cursor: 'pointer', padding: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0f0f8'}
            onMouseLeave={e => e.currentTarget.style.color = '#555570'}>
            <FiX size={18} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Rating */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Rating {form.rating && <span style={{ color: '#ffd700', textTransform: 'none' }}>· {ratingLabel(form.rating)}</span>}
            </label>
            <StarRatingInput value={form.rating} onChange={v => set('rating', v)} size={28} />
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Title (optional)</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Give your review a headline..." maxLength={100} />
          </div>

          {/* Body */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Review *</label>
            <textarea className="textarea" rows={5} value={form.body} onChange={e => set('body', e.target.value)}
              placeholder="What did you think? Share your experience..." maxLength={5000} />
            <p style={{ fontSize: 11, color: '#555570', fontFamily: 'Karla', marginTop: 4 }}>{form.body.length}/5000</p>
          </div>

          {/* Row: Played on + Hours */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Played On</label>
              <select className="input" value={form.playedOn} onChange={e => set('playedOn', e.target.value)}
                style={{ cursor: 'pointer' }}>
                {['PC','Steam Deck','Remote Play','Other'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#555570', fontFamily: 'Karla', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hours Played</label>
              <input className="input" type="number" min="0" max="9999" value={form.hoursAtReview}
                onChange={e => set('hoursAtReview', e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* Spoiler toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div onClick={() => set('containsSpoilers', !form.containsSpoilers)} style={{
              width: 40, height: 22, borderRadius: 11, transition: 'background 0.2s',
              background: form.containsSpoilers ? '#ffd700' : '#2a2a3d', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: form.containsSpoilers ? 20 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
              }} />
            </div>
            <span style={{ fontSize: 13, color: '#8888aa', fontFamily: 'Karla' }}>Contains spoilers</span>
          </label>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={saving} style={{
            background: '#00e676', border: 'none', borderRadius: 10, padding: '13px',
            fontFamily: 'Syne', fontWeight: 800, fontSize: 15, color: '#0f0f17',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
          }}>
            {saving ? 'Saving...' : existing ? 'Update Review' : 'Post Review'}
          </button>
        </div>
      </div>
    </div>
  )
}
