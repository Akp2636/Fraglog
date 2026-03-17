import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ActivityFeed from '../components/ActivityFeed'
import { PageLoader } from '../components/LoadingSpinner'
import api from '../utils/api'

export default function ActivityPage() {
  const { user }     = useAuth()
  const [activities, setActivities] = useState([])
  const [tab,        setTab]        = useState(user ? 'feed' : 'global')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    setLoading(true)
    const endpoint = tab === 'feed' ? '/activity/feed' : '/activity/global'
    api.get(`${endpoint}?limit=40`)
      .then(r => setActivities(r.data.activities || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px', minHeight: '80vh' }}>
      <div className="section-label" style={{ marginBottom: 24 }}><span>Activity</span></div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1A1A1A', marginBottom: 24 }}>
        {user && (
          <button onClick={() => setTab('feed')} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '11px 18px', marginBottom: -1,
            borderBottom: tab === 'feed' ? '2px solid #9EFF00' : '2px solid transparent',
            color: tab === 'feed' ? '#F0F0F0' : '#444',
            fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>Following</button>
        )}
        <button onClick={() => setTab('global')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '11px 18px', marginBottom: -1,
          borderBottom: tab === 'global' ? '2px solid #9EFF00' : '2px solid transparent',
          color: tab === 'global' ? '#F0F0F0' : '#444',
          fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>Global</button>
      </div>

      {loading ? <PageLoader /> : <ActivityFeed activities={activities} />}
    </div>
  )
}
