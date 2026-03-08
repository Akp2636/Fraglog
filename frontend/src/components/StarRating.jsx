import { useState } from 'react'
import { FiStar } from 'react-icons/fi'

// Interactive star rating (half-star support)
export function StarRatingInput({ value, onChange, size = 24 }) {
  const [hovered, setHovered] = useState(null)
  const display = hovered ?? value

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const full = display >= star
        const half = !full && display >= star - 0.5

        return (
          <div key={star} className="relative cursor-pointer" style={{ width: size, height: size }}>
            {/* Left half (0.5) */}
            <div
              className="absolute inset-y-0 left-0 z-10"
              style={{ width: '50%' }}
              onMouseEnter={() => setHovered(star - 0.5)}
              onClick={() => onChange(star - 0.5)}
            />
            {/* Right half (full star) */}
            <div
              className="absolute inset-y-0 right-0 z-10"
              style={{ width: '50%' }}
              onMouseEnter={() => setHovered(star)}
              onClick={() => onChange(star)}
            />
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background star */}
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="#2a2a45"
                stroke="#2a2a45"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Filled portion */}
              {(full || half) && (
                <clipPath id={`clip-${star}`}>
                  <rect x="0" y="0" width={half && !full ? '12' : '24'} height="24" />
                </clipPath>
              )}
              {(full || half) && (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#f59e0b"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  clipPath={`url(#clip-${star})`}
                />
              )}
            </svg>
          </div>
        )
      })}
      {value > 0 && (
        <span className="ml-2 text-sm font-mono text-accent-gold">{value.toFixed(1)}</span>
      )}
    </div>
  )
}

// Display-only stars (static)
export function StarRatingDisplay({ value, size = 14, showValue = false }) {
  if (!value) return <span className="text-text-muted text-xs font-mono">—</span>

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const full = value >= star
        const half = !full && value >= star - 0.5

        return (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="#2a2a45"
              stroke="none"
            />
            {(full || half) && (
              <>
                <clipPath id={`disp-${star}-${size}`}>
                  <rect x="0" y="0" width={half && !full ? '12' : '24'} height="24" />
                </clipPath>
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#f59e0b"
                  clipPath={`url(#disp-${star}-${size})`}
                />
              </>
            )}
          </svg>
        )
      })}
      {showValue && value && (
        <span className="ml-1 text-xs font-mono text-accent-gold">{value.toFixed(1)}</span>
      )}
    </div>
  )
}
