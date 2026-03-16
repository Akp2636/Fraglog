import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiEdit2, FiCheck, FiX, FiExternalLink } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import WriteReviewModal from '../components/WriteReviewModal'
import { PageLoader, EmptyState } from '../components/LoadingSpinner'
import { StarRatingDisplay } from '../components/StarRating'
import { STATUS_LABELS, STATUS_COLORS, STATUS_ICONS } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Profile() {

  const { steamId } = useParams()
  const { user: me, setUser } = useAuth()

  const isOwn = me?.steamId === steamId

  const [profile,setProfile] = useState(null)
  const [stats,setStats] = useState(null)
  const [reviews,setReviews] = useState([])
  const [logs,setLogs] = useState([])
  const [tab,setTab] = useState('reviews')
  const [loading,setLoading] = useState(true)

  const [editBio,setEditBio] = useState(false)
  const [bio,setBio] = useState('')
  const [editModal,setEditModal] = useState(null)

  const fetchAll = async () => {

    setLoading(true)

    try {

      const requests = [
        api.get(`/users/${steamId}?t=${Date.now()}`),
        api.get(`/users/${steamId}/reviews`)
      ]

      if(isOwn){
        requests.push(api.get('/logs/my'))
      }else{
        requests.push(api.get(`/users/${steamId}/logs`))
      }

      const [pRes,rRes,lRes] = await Promise.all(requests)

      setProfile(pRes.data.user)
      setStats(pRes.data.stats)
      setBio(pRes.data.user.bio || '')
      setReviews(rRes.data.reviews || [])
      setLogs(lRes.data.logs || [])

    }catch(err){

      toast.error('Failed to load profile')

    }finally{

      setLoading(false)

    }

  }

  useEffect(()=>{

    fetchAll()

    const onFocus = () => fetchAll()

    window.addEventListener('focus',onFocus)

    return ()=> window.removeEventListener('focus',onFocus)

  },[steamId])

  const handleSaveBio = async () => {

    try{

      await api.patch('/users/me/bio',{bio})

      setProfile(p => ({...p,bio}))

      if(isOwn) setUser({...me,bio})

      setEditBio(false)

      toast.success('Bio updated!')

    }catch{

      toast.error('Failed to update bio')

    }

  }

  const handleDeleteReview = async(id)=>{

    if(!confirm('Delete this review?')) return

    try{

      await api.delete(`/reviews/${id}`)

      setReviews(r => r.filter(x => x._id !== id))

      toast.success('Review deleted')

    }catch{

      toast.error('Failed to delete')

    }

  }

  if(loading) return <PageLoader/>

  if(!profile) return(
    <div style={{textAlign:'center',padding:'6rem 2rem',color:'#555'}}>
      <p style={{fontFamily:'"Barlow Condensed"',fontWeight:700,fontSize:24,textTransform:'uppercase',letterSpacing:2}}>
        User not found
      </p>
    </div>
  )

  return(

    <div style={{minHeight:'100vh',background:'#080808'}}>

      {/* HERO */}

      <div style={{position:'relative',height:200,background:'#0a0a0a',overflow:'hidden'}}>

        <img
        src={`https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg`}
        style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.12,filter:'blur(3px)',transform:'scale(1.05)'}}
        />

        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 0%, #080808 100%)'}}/>

      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 2rem'}}>

        {/* HEADER */}

        <div style={{display:'flex',alignItems:'flex-end',gap:20,marginTop:-60,marginBottom:'2.5rem',flexWrap:'wrap'}}>

          <img
          src={profile.avatar}
          style={{width:96,height:96,border:'3px solid #080808'}}
          />

          <div style={{flex:1}}>

            <h1 style={{
              fontFamily:'"Barlow Condensed"',
              fontWeight:900,
              fontStyle:'italic',
              fontSize:32,
              textTransform:'uppercase',
              color:'#fff'
            }}>
              {profile.username}
            </h1>

            {editBio ? (

              <div style={{display:'flex',gap:8}}>

                <textarea
                value={bio}
                onChange={e=>setBio(e.target.value)}
                rows={2}
                style={{
                  flex:1,
                  background:'#111',
                  border:'1px solid #333',
                  color:'#fff',
                  padding:'8px'
                }}
                />

                <button onClick={handleSaveBio}><FiCheck/></button>

                <button onClick={()=>setEditBio(false)}><FiX/></button>

              </div>

            ):(
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <p style={{color:'#555'}}>{profile.bio || 'No bio yet.'}</p>

                {isOwn &&
                <button onClick={()=>setEditBio(true)}>
                  <FiEdit2 size={12}/>
                </button>
                }

              </div>
            )}

          </div>

          <a
          href={profile.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'flex',
            alignItems:'center',
            gap:8,
            background:'#1b2838',
            border:'1px solid #2a3f52',
            padding:'10px 16px',
            color:'#c6d4df',
            textDecoration:'none'
          }}>
            <SiSteam/>
            Steam Profile
            <FiExternalLink size={11}/>
          </a>

        </div>

        {/* TABS */}

        <div style={{display:'flex',borderBottom:'1px solid #1a1a1a',marginBottom:'2rem'}}>

          {['reviews','games','stats'].map(key=>(
            <button
            key={key}
            onClick={()=>setTab(key)}
            style={{
              background:'none',
              border:'none',
              padding:'12px 20px',
              color:tab===key?'#fff':'#444'
            }}>
              {key}
            </button>
          ))}

          <button
          onClick={fetchAll}
          style={{marginLeft:'auto',background:'none',border:'none',color:'#444'}}
          >
            ↻ Refresh
          </button>

        </div>

        {/* REVIEWS */}

        {tab==='reviews' && (

          reviews.length===0 ?

          <EmptyState icon="✍️" title="No reviews yet"/>

          :

          <div>

            {reviews.map(r=>(
              <ReviewCard
              key={r._id}
              review={r}
              onEdit={isOwn?()=>setEditModal(r):undefined}
              onDelete={isOwn?handleDeleteReview:undefined}
              />
            ))}

          </div>

        )}

        {/* GAMES */}

        {tab==='games' && (

          logs.length===0 ?

          <EmptyState icon="🎮" title="No games logged"/>

          :

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:8}}>

            {logs.map(log=>(
              <Link key={log._id} to={`/game/${log.appId}`}>

                <div>

                  <img
                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${log.appId}/header.jpg`}
                  style={{width:'100%'}}
                  />

                  <p>{log.gameName}</p>

                  {log.rating && <StarRatingDisplay value={log.rating}/>}

                </div>

              </Link>
            ))}

          </div>

        )}

        {/* STATS */}

        {tab==='stats' && stats && (

          <div>

            <p>Games Logged: {stats.logCount}</p>
            <p>Reviews: {stats.reviewCount}</p>

          </div>

        )}

      </div>

      {editModal && (
        <WriteReviewModal
        game={{steam_appid:editModal.appId,name:editModal.gameName}}
        existing={editModal}
        onClose={()=>setEditModal(null)}
        onSave={updated=>setReviews(r=>r.map(x=>x._id===updated._id?updated:x))}
        />
      )}

    </div>

  )

}