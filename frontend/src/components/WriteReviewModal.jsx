import { useState } from 'react'
import { FiX, FiAlertTriangle } from 'react-icons/fi'
import { StarRatingInput } from './StarRating'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { ratingLabel } from '../utils/helpers'

export default function WriteReviewModal({ game, existingReview, onClose, onSaved }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    body: existingReview?.body || '',
    containsSpoilers: existingReview?.containsSpoilers || false,
    playedOn: existingReview?.playedOn || 'PC',
    hoursAtReview: existingReview?.hoursAtReview || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.rating) { toast.error('Please set a rating'); return }
    if (!form.body.trim() || form.body.trim().length < 10) {
      toast.error('Review must be at least 10 characters')
      return
    }

    setLoading(true)
    try {
      const payload = {
        appId: game.appId,
        gameName: game.name,
        gameHeaderImage: game.headerImage,
        ...form,
        hoursAtReview: Number(form.hoursAtReview) || 0,
      }

      let res
      if (existingReview) {
        res = await api.put(`/reviews/${existingReview._id}`, payload)
        toast.success('Review updated!')
      } else {
        res = await api.post('/reviews', payload)
        toast.success('Review posted!')
      }

      onSaved?.(res.data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save review'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-display font-bold text-text-primary">
              {existingReview ? 'Edit Review' : 'Write a Review'}
            </h2>
            <p className="text-xs text-text-muted font-mono mt-0.5">{game.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Rating */}
          <div>
            <label className="label block mb-2">Your Rating *</label>
            <div className="flex items-center gap-3">
              <StarRatingInput
                value={form.rating}
                onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                size={28}
              />
              {form.rating > 0 && (
                <span className="text-xs text-text-muted font-body italic">
                  {ratingLabel(form.rating)}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="label block mb-1.5">Review Title (optional)</label>
            <input
              type="text"
              placeholder="Give your review a title…"
              maxLength={150}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input"
            />
          </div>

          {/* Body */}
          <div>
            <label className="label block mb-1.5">Your Review *</label>
            <textarea
              placeholder="Share your thoughts about this game…"
              required
              minLength={10}
              maxLength={5000}
              rows={5}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              className="textarea"
            />
            <p className="text-xs text-text-muted font-mono mt-1 text-right">
              {form.body.length}/5000
            </p>
          </div>

          {/* Row: Played on + Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1.5">Played On</label>
              <select
                value={form.playedOn}
                onChange={(e) => setForm((f) => ({ ...f, playedOn: e.target.value }))}
                className="input"
              >
                <option value="PC">PC</option>
                <option value="Steam Deck">Steam Deck</option>
                <option value="Remote Play">Remote Play</option>
              </select>
            </div>
            <div>
              <label className="label block mb-1.5">Hours at Review</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                max="9999"
                step="0.5"
                value={form.hoursAtReview}
                onChange={(e) => setForm((f) => ({ ...f, hoursAtReview: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          {/* Spoilers */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.containsSpoilers}
              onChange={(e) => setForm((f) => ({ ...f, containsSpoilers: e.target.checked }))}
              className="w-4 h-4 rounded border-border bg-bg-secondary accent-accent-green"
            />
            <div className="flex items-center gap-1.5">
              <FiAlertTriangle size={13} className="text-accent-gold" />
              <span className="text-sm text-text-secondary font-body group-hover:text-text-primary transition-colors">
                Contains spoilers
              </span>
            </div>
          </label>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading || !form.rating} className="btn-primary">
              {loading ? 'Saving…' : existingReview ? 'Save Changes' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
