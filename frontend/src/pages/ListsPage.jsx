import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiHeart, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/LoadingSpinner'
import { formatDate } from '../utils/helpers'
import api from '../utils/api'

export default function ListsPage() {
  const { user } = useAuth()
  const [lists,   setLists]   = useState([])
  const [sort,    setSort]    = useState('recent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/lists?sort=${sort}&limit=24`)
      .then(r => setLists(r.data.lists || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sort])

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="section-label"><span>Game Lists</span></div>
          <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 14, color: '#555', marginTop: -8 }}>
            Curated collections from the community.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', border: '1px solid #222', overflow: 'hidden' }}>
            {[['recent','Latest'],['popular','Popular']].map(([v, label]) => (
              <button key={v} onClick={() => setSort(v)} style={{
                background: sort === v ? '#222' : 'transparent', border: 'none',
                padding: '8px 14px', cursor: 'pointer',
                fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: sort === v ? '#F0F0F0' : '#444',
                transition: 'all 0.15s',
              }}>{label}</button>
            ))}
          </div>
          {user && (
            <Link to="/lists/new" className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}>
              <FiPlus size={12} /> New List
            </Link>
          )}
        </div>
      </div>

      {loading ? <PageLoader /> : lists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', border: '1px solid #1A1A1A' }}>
          <p style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>No lists yet</p>
          {user && <Link to="/lists/new" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex', fontSize: 12 }}><FiPlus size={12} /> Create First List</Link>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: '#1A1A1A' }}>
          {lists.map(list => <ListCard key={list._id} list={list} />)}
        </div>
      )}
    </div>
  )
}

function ListCard({ list }) {
  const previewGames = list.games?.slice(0, 4) || []
  return (
    <Link to={`/lists/${list._id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: '#0A0A0A', padding: '20px', cursor: 'pointer', transition: 'background 0.15s', height: '100%' }}
        onMouseEnter={e => e.currentTarget.style.background='#111'}
        onMouseLeave={e => e.currentTarget.style.background='#0A0A0A'}>

        {/* Game preview strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, marginBottom: 14 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ paddingTop: '46.7%', position: 'relative', background: '#161616' }}>
              {previewGames[i] && (
                <img src={previewGames[i].headerImage || `https://cdn.akamai.steamstatic.com/steam/apps/${previewGames[i].appId}/header.jpg`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
                  onError={e => e.target.style.display='none'} />
              )}
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#F0F0F0', marginBottom: 6, lineHeight: 1.2 }}>
          {list.title}
        </h3>
        {list.description && (
          <p style={{ fontFamily: 'Manrope', fontWeight: 300, fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {list.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to={`/profile/${list.steamId}`} onClick={e => e.stopPropagation()}
              style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#555', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color='#9EFF00'} onMouseLeave={e => e.currentTarget.style.color='#555'}>
              {list.username}
            </Link>
            <span style={{ fontFamily: 'Manrope', fontSize: 11, color: '#333' }}>· {list.games?.length || 0} games</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <FiHeart size={11} style={{ color: '#444' }} />
            <span style={{ fontFamily: 'Manrope', fontSize: 11, color: '#444' }}>{list.likes?.length || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
