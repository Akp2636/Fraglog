import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { StarRatingInput } from './StarRating'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { STATUS_LABELS } from '../utils/helpers'

const STATUSES = Object.keys(STATUS_LABELS)

export default function LogGameModal({ game, existingLog, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: existingLog?.status || 'played',
    rating: existingLog?.rating || 0,
    hoursLogged: existingLog?.hoursLogged || '',
    notes: existingLog?.notes || '',
    startDate: existingLog?.startDate ? existingLog.startDate.slice(0, 10) : '',
    finishDate: existingLog?.finishDate ? existingLog.finishDate.slice(0, 10) : '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        appId: game.appId,
        gameName: game.name,
        gameHeaderImage: game.headerImage,
        ...form,
        rating: form.rating || null,
        hoursLogged: Number(form.hoursLogged) || 0,
        startDate: form.startDate || null,
        finishDate: form.finishDate || null,
      }

      const res = await api.post('/logs', payload)
      toast.success(`Logged as "${STATUS_LABELS[form.status]}"!`)
      onSaved?.(res.data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save log')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingLog) return
    if (!confirm('Remove this game from your log?')) return
    try {
      await api.delete(`/logs/${game.appId}`)
      toast.success('Log removed')
      onSaved?.(null)
      onClose()
    } catch {
      toast.error('Failed to remove log')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-md shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-display font-bold text-text-primary">
              {existingLog ? 'Update Log' : 'Log Game'}
            </h2>
            <p className="text-xs text-text-muted font-mono mt-0.5">{game.name}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Status */}
          <div>
            <label className="label block mb-2">Status *</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`py-2 px-2 rounded text-xs font-mono text-center border transition-all ${
                    form.status === s
                      ? 'bg-accent-green/10 border-accent-green text-accent-green'
                      : 'border-border text-text-muted hover:border-border-light hover:text-text-secondary'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="label block mb-2">Personal Rating (optional)</label>
            <StarRatingInput
              value={form.rating}
              onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
              size={24}
            />
          </div>

          {/* Hours */}
          <div>
            <label className="label block mb-1.5">Hours Played</label>
            <input
              type="number"
              placeholder="0"
              min="0"
              step="0.5"
              value={form.hoursLogged}
              onChange={(e) => setForm((f) => ({ ...f, hoursLogged: e.target.value }))}
              className="input"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label block mb-1.5">Finish Date</label>
              <input type="date" value={form.finishDate} onChange={(e) => setForm((f) => ({ ...f, finishDate: e.target.value }))} className="input" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label block mb-1.5">Notes (optional)</label>
            <textarea
              placeholder="Personal notes about your playthrough…"
              maxLength={500}
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="textarea"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {existingLog ? (
              <button type="button" onClick={handleDelete} className="btn-danger text-xs">
                Remove Log
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving…' : existingLog ? 'Update' : 'Add to Log'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
