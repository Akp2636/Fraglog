import { Link } from 'react-router-dom'
import { StarRatingDisplay } from './StarRating'
import { STATUS_LABELS, STATUS_COLORS, STATUS_ICONS, formatPlaytime } from '../utils/helpers'

export default function GameCard({ game, log, showPlaytime = true }) {
  const headerImg = game.headerImage ||
    `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`

  return (
    <Link to={`/game/${game.appid}`} style={{ textDecoration: 'none' }}>
      <div className="game-card-hover" style={{
        background: '#1c1c28', borderRadius: 12, overflow: 'hidden',
        border: '1px solid #2a2a3d', cursor: 'pointer',
      }}>
        {/* Cover */}
        <div style={{ position: 'relative', paddingTop: '46.7%', background: '#0f0f17' }}>
          <img src={headerImg} alt={game.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          {log && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              background: 'rgba(0,0,0,0.8)', borderRadius: 6,
              padding: '2px 8px', fontSize: 11, fontFamily: 'Karla', fontWeight: 700,
              color: STATUS_COLORS[log.status] || '#888',
              border: `1px solid ${STATUS_COLORS[log.status] || '#888'}33`,
            }}>
              {STATUS_ICONS[log.status]} {STATUS_LABELS[log.status]}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '0.75rem' }}>
          <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: '#f0f0f8', marginBottom: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {game.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {log?.rating
              ? <StarRatingDisplay value={log.rating} size={12} />
              : <span style={{ fontSize: 11, color: '#555570', fontFamily: 'Karla' }}>Not rated</span>
            }
            {showPlaytime && game.playtime_forever > 0 && (
              <span style={{ fontSize: 11, color: '#555570', fontFamily: 'JetBrains Mono' }}>
                {formatPlaytime(game.playtime_forever)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
