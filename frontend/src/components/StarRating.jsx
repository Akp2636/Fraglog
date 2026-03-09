import { useState } from 'react'
import { FiStar } from 'react-icons/fi'

export function StarRatingInput({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(null)

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(star => {
        const half = star - 0.5
        const full = hover ?? value ?? 0
        const isHalf = full >= half && full < star
        const isFull = full >= star
        return (
          <div key={star} style={{ position: 'relative', width: size, height: size, cursor: 'pointer' }}>
            {/* Half star */}
            <div style={{ position: 'absolute', left: 0, width: '50%', height: '100%', zIndex: 1 }}
              onMouseEnter={() => setHover(half)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange(half)}
            />
            {/* Full star */}
            <div style={{ position: 'absolute', right: 0, width: '50%', height: '100%', zIndex: 1 }}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange(star)}
            />
            <FiStar size={size} style={{
              fill: isFull ? '#ffd700' : isHalf ? 'url(#half)' : 'transparent',
              stroke: isFull || isHalf ? '#ffd700' : '#555570',
              transition: 'all 0.1s',
            }} />
          </div>
        )
      })}
    </div>
  )
}

export function StarRatingDisplay({ value, size = 14 }) {
  if (!value) return <span style={{ fontSize: size - 2, color: '#555570', fontFamily: 'Karla' }}>No rating</span>
  return (
    <div style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {[1,2,3,4,5].map(star => (
        <FiStar key={star} size={size} style={{
          fill: value >= star ? '#ffd700' : value >= star - 0.5 ? '#ffd700' : 'transparent',
          stroke: value >= star - 0.5 ? '#ffd700' : '#555570',
          opacity: value >= star - 0.5 ? 1 : 0.3,
        }} />
      ))}
      <span style={{ fontSize: size, color: '#ffd700', fontFamily: 'Karla', fontWeight: 700, marginLeft: 4 }}>
        {value.toFixed(1)}
      </span>
    </div>
  )
}
