import { Link } from 'react-router-dom'
import { formatDate } from '../utils/helpers'
import { StarRatingDisplay } from './StarRating'

const TYPE_LABELS = {
  LOG_GAME    : 'logged',
  UPDATE_LOG  : 'updated',
  REVIEW      : 'reviewed',
  CREATE_LIST : 'created list',
  FOLLOW      : 'followed',
}

export default function ActivityFeed({ activities = [], showAvatar = true }) {
  if (activities.length === 0) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>
        No activity yet
      </p>
      <p style={{ fontFamily: 'Manrope', fontSize: 12, color: '#333', marginTop: 6 }}>
        Follow people to see their activity here.
      </p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {activities.map((a, i) => (
        <div key={a._id || i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 0', borderBottom: '1px solid #1A1A1A',
        }}>
          {showAvatar && (
            <Link to={`/profile/${a.steamId}`} style={{ flexShrink: 0 }}>
              {a.avatar
                ? <img src={a.avatar} alt={a.username} style={{ width: 32, height: 32, objectFit: 'cover', border: '1px solid #222' }} />
                : <div style={{ width: 32, height: 32, background: '#161616', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, color: '#444' }}>
                    {(a.username || '?')[0].toUpperCase()}
                  </div>
              }
            </Link>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Link to={`/profile/${a.steamId}`} style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', color: '#F0F0F0', textDecoration: 'none' }}>
                {a.username}
              </Link>
              <span style={{ fontFamily: 'Manrope', fontSize: 12, color: '#444' }}>
                {TYPE_LABELS[a.type] || a.type}
              </span>

              {/* Game reference */}
              {(a.type === 'LOG_GAME' || a.type === 'UPDATE_LOG' || a.type === 'REVIEW') && a.data?.appId && (
                <Link to={`/game/${a.data.appId}`} style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', color: '#9EFF00', textDecoration: 'none' }}>
                  {a.data.gameName}
                </Link>
              )}

              {/* List reference */}
              {a.type === 'CREATE_LIST' && a.data?.listId && (
                <Link to={`/lists/${a.data.listId}`} style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', color: '#9EFF00', textDecoration: 'none' }}>
                  {a.data.listTitle}
                </Link>
              )}

              {/* Follow reference */}
              {a.type === 'FOLLOW' && a.data?.targetSteamId && (
                <Link to={`/profile/${a.data.targetSteamId}`} style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', color: '#9EFF00', textDecoration: 'none' }}>
                  {a.data.targetUsername}
                </Link>
              )}
            </div>

            {/* Status/rating sub-info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              {a.data?.status && (
                <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', background: '#111', border: '1px solid #222', padding: '1px 7px' }}>
                  {a.data.status.replace(/_/g, ' ')}
                </span>
              )}
              {a.data?.rating && <StarRatingDisplay value={a.data.rating} size={10} />}
              <span style={{ fontFamily: 'Manrope', fontSize: 11, color: '#333' }}>{formatDate(a.createdAt)}</span>
            </div>
          </div>

          {/* Game thumbnail */}
          {a.data?.appId && (
            <Link to={`/game/${a.data.appId}`} style={{ flexShrink: 0 }}>
              <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${a.data.appId}/header.jpg`}
                style={{ width: 64, height: 30, objectFit: 'cover', border: '1px solid #1A1A1A', opacity: 0.7, transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.target.style.opacity = 1}
                onMouseLeave={e => e.target.style.opacity = 0.7}
                onError={e => e.target.style.display = 'none'}
              />
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
