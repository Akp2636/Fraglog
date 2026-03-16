import { Link } from 'react-router-dom'
import { StarRatingDisplay } from './StarRating'
import { STATUS_COLORS, STATUS_LABELS } from '../utils/helpers'

export default function GameCard({ game, log }) {
  const appId = game.appid || game.steam_appid
  return (
    <Link to={`/game/${appId}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="game-card-hover card-lift" style={{ background: '#111', cursor: 'pointer' }}>
        <div style={{ paddingTop: '46.7%', position: 'relative', background: '#0d0d0d' }}>
          <img
            src={`https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`}
            alt={game.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => e.target.style.display = 'none'}
          />
          {log && (
            <div style={{
              position: 'absolute', top: 6, left: 6, zIndex: 2,
              background: STATUS_COLORS[log.status], color: '#0A0A0A',
              padding: '2px 7px', fontFamily: 'Oswald', fontWeight: 600,
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {STATUS_LABELS[log.status]}
            </div>
          )}
          <div className="overlay">
            <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', marginBottom: 4 }}>
              {game.name}
            </p>
            {log?.rating && <StarRatingDisplay value={log.rating} size={10} />}
          </div>
        </div>
        <div style={{ padding: '8px 10px', borderTop: '1px solid #1A1A1A' }}>
          <p style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {game.name}
          </p>
        </div>
      </div>
    </Link>
  )
}
