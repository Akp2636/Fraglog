import { useState } from 'react'
import { ratingLabel } from '../utils/helpers'

export function StarRatingInput({ value, onChange, size = 22 }) {
  const [hover, setHover] = useState(null)
  const display = hover ?? value ?? 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[1,2,3,4,5].map(star => {
          const half = star - 0.5
          const isHalf = display >= half && display < star
          const isFull = display >= star
          return (
            <div key={star} style={{ position: 'relative', width: size, height: size, cursor: 'pointer' }}>
              <div style={{ position: 'absolute', left: 0, width: '50%', height: '100%', zIndex: 1 }}
                onMouseEnter={() => setHover(half)} onMouseLeave={() => setHover(null)} onClick={() => onChange(half)} />
              <div style={{ position: 'absolute', right: 0, width: '50%', height: '100%', zIndex: 1 }}
                onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(null)} onClick={() => onChange(star)} />
              <svg width={size} height={size} viewBox="0 0 24 24" fill={isFull ? '#9EFF00' : isHalf ? 'url(#half-green)' : 'transparent'} stroke={isFull || isHalf ? '#9EFF00' : '#333'} strokeWidth="1.5">
                <defs>
                  <linearGradient id="half-green">
                    <stop offset="50%" stopColor="#9EFF00" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </div>
          )
        })}
      </div>
      {display > 0 && (
        <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9EFF00' }}>
          {display.toFixed(1)} — {ratingLabel(display)}
        </span>
      )}
    </div>
  )
}

export function StarRatingDisplay({ value, size = 13 }) {
  if (!value) return <span style={{ fontSize: 11, color: '#444', fontFamily: 'Oswald', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No Rating</span>
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1,2,3,4,5].map(s => (
          <svg key={s} width={size} height={size} viewBox="0 0 24 24"
            fill={value >= s ? '#9EFF00' : value >= s - 0.5 ? '#9EFF00' : 'transparent'}
            stroke={value >= s - 0.5 ? '#9EFF00' : '#333'} strokeWidth="1.5" style={{ opacity: value >= s - 0.5 ? 1 : 0.25 }}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>
      <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: size + 1, color: '#9EFF00', letterSpacing: '0.05em' }}>
        {value.toFixed(1)}
      </span>
    </div>
  )
}
