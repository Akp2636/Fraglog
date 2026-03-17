import { useState, useEffect } from 'react'
import { FiUserPlus, FiUserCheck } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function FollowButton({ targetSteamId, initialFollowing = false, onToggle }) {
  const { user } = useAuth()
  const [following, setFollowing] = useState(initialFollowing)
  const [loading,   setLoading]   = useState(false)
  const [hovered,   setHovered]   = useState(false)

  useEffect(() => {
    if (!user || user.steamId === targetSteamId) return
    api.get(`/follows/${targetSteamId}/status`)
      .then(r => setFollowing(r.data.following))
      .catch(() => {})
  }, [targetSteamId, user?.steamId])

  if (!user || user.steamId === targetSteamId) return null

  const handleToggle = async () => {
    setLoading(true)
    try {
      const r = await api.post(`/follows/${targetSteamId}`)
      setFollowing(r.data.following)
      toast.success(r.data.following ? 'Following!' : 'Unfollowed')
      onToggle?.(r.data.following)
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  const isFollowing = following

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Oswald', fontWeight: 600, fontSize: 12,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        transition: 'all 0.15s', border: 'none',
        background: isFollowing
          ? (hovered ? '#1a0000' : '#1C1C1C')
          : '#9EFF00',
        color: isFollowing
          ? (hovered ? '#FF3B3B' : '#888')
          : '#0A0A0A',
        ...(isFollowing && { border: `1px solid ${hovered ? '#FF3B3B' : '#333'}` }),
        opacity: loading ? 0.6 : 1,
      }}
    >
      {isFollowing
        ? <><FiUserCheck size={12} /> {hovered ? 'Unfollow' : 'Following'}</>
        : <><FiUserPlus  size={12} /> Follow</>
      }
    </button>
  )
}
