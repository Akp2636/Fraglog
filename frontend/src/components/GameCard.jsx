import { Link } from 'react-router-dom'
import { formatPlaytime } from '../utils/helpers'
import { StarRatingDisplay } from './StarRating'

export default function GameCard({ game, showPlaytime = true, compact = false }) {
  const { appId, name, headerImage, playtimeMinutes, rating } = game

  if (compact) {
    return (
      <Link to={`/game/${appId}`} className="group flex items-center gap-3 p-2 rounded hover:bg-bg-elevated transition-colors">
        <img
          src={headerImage || `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`}
          alt={name}
          className="w-16 h-9 object-cover rounded flex-shrink-0 bg-bg-elevated"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="min-w-0">
          <p className="text-sm text-text-primary font-body font-medium truncate group-hover:text-accent-green transition-colors">
            {name}
          </p>
          {showPlaytime && playtimeMinutes !== undefined && (
            <p className="text-xs text-text-muted font-mono">{formatPlaytime(playtimeMinutes)}</p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/game/${appId}`} className="group card hover:border-border-light transition-all duration-200">
      <div className="relative overflow-hidden aspect-[460/215]">
        <img
          src={headerImage || `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-bg-elevated"
          onError={(e) => {
            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-bg-elevated text-text-muted text-xs font-mono">No Image</div>`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-body font-medium text-text-primary truncate group-hover:text-accent-green transition-colors">
          {name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          {showPlaytime && playtimeMinutes !== undefined && (
            <span className="text-xs font-mono text-text-muted">{formatPlaytime(playtimeMinutes)}</span>
          )}
          {rating && <StarRatingDisplay value={rating} size={12} />}
        </div>
      </div>
    </Link>
  )
}
