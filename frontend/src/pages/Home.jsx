import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SiSteam, SiInstagram, SiX, SiFacebook, SiYoutube, SiTiktok,
} from 'react-icons/si'
import {
  FiEye, FiHeart, FiAlignLeft, FiStar, FiCalendar, FiGrid, FiPlay,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import ReviewCard from '../components/ReviewCard'
import { PageLoader } from '../components/LoadingSpinner'

// ── Poster games shown in hero row ───────────────────────────────────────────
const POSTER_GAMES = [
  { appId: '1245620', name: 'Elden Ring' },
  { appId: '1086940', name: "Baldur's Gate 3" },
  { appId: '1091500', name: 'Cyberpunk 2077' },
  { appId: '1593500', name: 'God of War' },
  { appId: '2379780', name: 'Balatro' },
  { appId: '730',     name: 'CS2' },
]

// ── Feature list ─────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: FiEye,      title: 'Keep track of every game you\'ve ever played',           desc: 'Build your complete history — or just start from the day you join.' },
  { Icon: FiHeart,    title: 'Show some love for your favourite games and reviews',    desc: 'Like games, reviews, and community lists with a single click.' },
  { Icon: FiAlignLeft,title: 'Write and share reviews, follow other members',          desc: 'Post your take, follow critics you trust, read what friends think.' },
  { Icon: FiStar,     title: 'Rate each game on a five-star scale (with halves)',      desc: 'Half-star precision (0.5–5.0) to capture your exact reaction.' },
  { Icon: FiCalendar, title: 'Keep a gaming diary of every playthrough',               desc: 'Log start/finish dates, hours at review, and personal notes.' },
  { Icon: FiGrid,     title: 'Compile and share lists of games on any topic',          desc: 'Create curated collections and keep a wishlist of upcoming titles.' },
]

// ── Fake editorial stories ────────────────────────────────────────────────────
const STORIES = [
  {
    id: 1, channel: 'Fraglog Weekly', channelColor: '#00b020',
    title: "Elden Ring: Shadow of the Erdtree is a masterclass in DLC design",
    excerpt: "FromSoftware delivers one of the most ambitious expansions ever. We look at why it's already being called the best DLC in gaming history.",
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
    type: 'article', tag: 'REVIEW', tagColor: '#00b020',
  },
  {
    id: 2, channel: 'Community Picks', channelColor: '#e8a020',
    title: 'The 50 most-reviewed games on Fraglog this month',
    excerpt: "From indie darlings to AAA giants — the games our community can't stop talking about in March 2026.",
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg',
    type: 'list', tag: 'LIST', tagColor: '#e8a020',
  },
  {
    id: 3, channel: 'Deep Dive', channelColor: '#3b82f6',
    title: 'Hollow Knight: Silksong — the wait that became legend',
    excerpt: "How a simple sequel teaser became gaming's longest anticipation story. We talk to fans who've been waiting 7 years.",
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1233860/header.jpg',
    type: 'video', tag: 'FEATURE', tagColor: '#3b82f6',
  },
  {
    id: 4, channel: 'Valve Watch', channelColor: '#ef4444',
    title: 'Steam Deck 2 rumours: everything we know so far',
    excerpt: 'The handheld PC market is heating up. Every credible leak decoded — and what it means for portable PC gaming.',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/359550/header.jpg',
    type: 'article', tag: 'NEWS', tagColor: '#ef4444',
  },
  {
    id: 5, channel: 'Fraglog Podcast', channelColor: '#a855f7',
    title: 'Ep. 42 — Are live-service games killing single-player?',
    excerpt: 'Our hosts debate the state of modern game design and whether the industry has abandoned what made games magical.',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
    type: 'video', tag: 'PODCAST', tagColor: '#a855f7',
  },
  {
    id: 6, channel: 'Indie Spotlight', channelColor: '#06b6d4',
    title: "Balatro and the rise of the 'just one more run' roguelike",
    excerpt: "The poker-roguelike that swept GOTY awards. We explore what makes it so impossibly addictive — and what it owes to its predecessors.",
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/header.jpg',
    type: 'article', tag: 'SPOTLIGHT', tagColor: '#06b6d4',
  },
]

export default function Home() {
  const { user, loginWithSteam, loading: authLoading } = useAuth()
  const [feed, setFeed] = useState([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchFeed = async () => {
      setFeedLoading(true)
      try {
        const res = await api.get(`/reviews/feed?page=${page}&limit=10`)
        setFeed((prev) => (page === 1 ? res.data.reviews : [...prev, ...res.data.reviews]))
        setTotalPages(res.data.totalPages)
      } catch {}
      finally { setFeedLoading(false) }
    }
    fetchFeed()
  }, [page])

  /* ── Authenticated view: simple feed ── */
  if (!authLoading && user) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: '1.25rem' }}>
          Recent Activity
        </h2>
        {feedLoading && page === 1 ? <PageLoader /> : feed.length === 0 ? (
          <div style={{ background: '#2c3440', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#9ab', fontSize: 14 }}>No reviews yet — be the first!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {feed.map((r) => <ReviewCard key={r._id} review={r} showGame />)}
            </div>
            {page < totalPages && (
              <button onClick={() => setPage(p => p + 1)} disabled={feedLoading} className="btn-ghost w-full mt-6">
                {feedLoading ? 'Loading…' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    )
  }

  /* ── Guest landing page ── */
  return (
    <div style={{ background: '#14181c', fontFamily: 'Karla, sans-serif' }}>

      {/* ════════════════════════════════════════════════════════════
          § 1  HERO
      ════════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Hero background — large game art */}
        <div style={{ position: 'relative', height: 'max(600px, 90vh)' }}>
          <img
            src="https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_hero.jpg"
            alt=""
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top', opacity: 0.6,
            }}
            onError={e => e.target.style.opacity = 0}
          />
          {/* Letterboxd-style gradient: transparent top → dark bottom */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(20,24,28,0) 0%, rgba(20,24,28,0.4) 45%, rgba(20,24,28,0.9) 72%, #14181c 100%)',
          }} />

          {/* Game credit — vertical text top-right */}
          <p style={{
            position: 'absolute', top: 16, right: 20,
            writingMode: 'vertical-rl', fontSize: 11,
            color: 'rgba(255,255,255,0.35)', letterSpacing: 1,
          }}>
            Elden Ring (2022)
          </p>

          {/* Hero text + CTA */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 900,
              fontSize: 'clamp(1.75rem, 5vw, 3.25rem)',
              color: '#fff', lineHeight: 1.2, marginBottom: '1.5rem',
              textShadow: '0 2px 24px rgba(0,0,0,0.7)',
            }}>
              Track games you've played.<br />
              Save those you want to play.<br />
              Tell your friends what's good.
            </h1>

            <Btn onClick={loginWithSteam}>
              <SiSteam size={17} /> Get started — it's free!
            </Btn>

            <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
              The social network for Steam gamers.
            </p>
          </div>
        </div>

        {/* ── Poster row ── */}
        <div style={{
          background: '#14181c', borderTop: '1px solid #1f2830',
          padding: '2rem 1rem',
        }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto',
            display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {POSTER_GAMES.map(g => (
              <Link key={g.appId} to={`/game/${g.appId}`}>
                <img
                  src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appId}/header.jpg`}
                  alt={g.name}
                  title={g.name}
                  style={{
                    height: 110, width: 'auto', aspectRatio: '460/215',
                    objectFit: 'cover', borderRadius: 5,
                    border: '2px solid transparent',
                    transition: 'border-color 0.18s, transform 0.18s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#00b020'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}
                  onError={e => { e.currentTarget.parentElement.style.display = 'none' }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          § 2  FEATURES
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#14181c', padding: '5rem 1rem 4rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionLabel>FRAGLOG LETS YOU...</SectionLabel>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 10, marginTop: '1.25rem',
          }}>
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <FeatureCard key={i} Icon={Icon} title={title} desc={desc} />
            ))}
          </div>

          {/* Repeat CTA */}
          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Btn onClick={loginWithSteam}>
              <SiSteam size={17} /> Get started — it's free!
            </Btn>
            <p style={{ marginTop: '1rem', color: '#678', fontSize: 13 }}>
              The social network for Steam gamers.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          § 3  RECENT STORIES
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#14181c', padding: '3.5rem 1rem 5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <SectionLabel>RECENT STORIES</SectionLabel>
            <a href="#" style={{ fontSize: 11, color: '#678', letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#9ab'}
              onMouseLeave={e => e.currentTarget.style.color = '#678'}
            >
              ALL HQS
            </a>
          </div>

          {/* 3-column masonry grid — mirrors Letterboxd exactly */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: 'auto',
            gap: 8,
          }}>
            {/* Col 1 — one tall card */}
            <StoryCard story={STORIES[0]} tall />

            {/* Col 2 — two stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <StoryCard story={STORIES[1]} />
              <StoryCard story={STORIES[4]} />
            </div>

            {/* Col 3 — three stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <StoryCard story={STORIES[2]} />
              <StoryCard story={STORIES[3]} />
              <StoryCard story={STORIES[5]} />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FOOTER — matches Letterboxd exactly
      ════════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#2c3440' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '2rem 1.5rem',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '1.5rem',
        }}>
          {/* Nav */}
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
            {['About', 'Pro', 'News', 'Games', 'Members', 'Journal', 'Help', 'Terms', 'API', 'Contact'].map(label => (
              <FooterLink key={label}>{label}</FooterLink>
            ))}
          </nav>

          {/* Socials */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {[SiInstagram, SiX, SiFacebook, SiTiktok, SiYoutube].map((Icon, i) => (
              <a key={i} href="#" style={{ color: '#9ab', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ab'}
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright line */}
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '0 1.5rem 1.75rem',
          borderTop: '1px solid #3a4550',
          paddingTop: '1.25rem',
        }}>
          <p style={{ fontSize: 12, color: '#567' }}>
            © Fraglog. Built for Steam gamers.{' '}
            Game data courtesy of the{' '}
            <a href="https://steamcommunity.com/dev" target="_blank" rel="noopener noreferrer"
              style={{ color: '#789', textDecoration: 'none' }}>
              Steam Web API
            </a>
            .{' '}
            <a href="#" style={{ color: '#789', textDecoration: 'none' }}>Mobile site</a>.
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ── Shared tiny components ─────────────────────────────────────────────────── */

function Btn({ onClick, children }) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: h ? '#009918' : '#00b020', color: '#fff',
        fontFamily: 'Syne, sans-serif', fontWeight: 700,
        fontSize: 16, padding: '13px 30px', borderRadius: 5,
        border: 'none', cursor: 'pointer', transition: 'background 0.15s',
      }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    >
      {children}
    </button>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily: 'Karla, sans-serif', fontWeight: 700,
      fontSize: 11, color: '#678', letterSpacing: 3,
      textTransform: 'uppercase', marginBottom: 4,
    }}>
      {children}
    </p>
  )
}

function FooterLink({ children }) {
  const [h, setH] = useState(false)
  return (
    <a href="#" style={{ fontSize: 14, color: h ? '#fff' : '#9ab', textDecoration: 'none', transition: 'color 0.15s' }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      {children}
    </a>
  )
}

function FeatureCard({ Icon, title, desc }) {
  const [h, setH] = useState(false)
  return (
    <div
      style={{
        background: h ? '#2c3d50' : '#2c3440',
        borderRadius: 6, padding: '1.2rem 1.4rem',
        display: 'flex', gap: '1.1rem', alignItems: 'flex-start',
        transition: 'background 0.18s',
      }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    >
      <div style={{ flexShrink: 0, marginTop: 3 }}>
        <Icon size={22} style={{ color: '#9ab' }} />
      </div>
      <div>
        <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 5, fontFamily: 'Karla, sans-serif', lineHeight: 1.35 }}>
          {title}
        </p>
        <p style={{ color: '#9ab', fontSize: 13, lineHeight: 1.5, fontFamily: 'Karla, sans-serif' }}>
          {desc}
        </p>
      </div>
    </div>
  )
}

function StoryCard({ story, tall = false }) {
  const [h, setH] = useState(false)
  const imgH = tall ? 260 : 160
  return (
    <div
      style={{
        background: '#2c3440', borderRadius: 6, overflow: 'hidden',
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
        transition: 'transform 0.18s',
        transform: h ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img
          src={story.image} alt={story.title}
          style={{
            width: '100%', height: imgH, objectFit: 'cover', display: 'block',
            transition: 'transform 0.4s',
            transform: h ? 'scale(1.04)' : 'scale(1)',
          }}
          onError={e => { e.target.style.background = '#3a4550' }}
        />
        {story.type === 'video' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.28)',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,0.88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiPlay size={16} style={{ color: '#1a1a1a', marginLeft: 3 }} />
            </div>
          </div>
        )}
        <span style={{
          position: 'absolute', top: 9, left: 9,
          background: story.tagColor, color: '#fff',
          fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
          padding: '3px 7px', borderRadius: 3,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {story.tag}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: tall ? '1.1rem 1.25rem' : '0.8rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Channel badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: story.channelColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, flexShrink: 0,
          }}>🎮</div>
          <span style={{ fontSize: 12, color: '#9ab', fontWeight: 600, fontFamily: 'Karla, sans-serif' }}>
            {story.channel}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: tall ? 17 : 14, color: '#fff',
          lineHeight: 1.3, marginBottom: 8,
        }}>
          {story.title}
        </h3>

        {/* Excerpt */}
        <p style={{
          fontSize: 13, color: '#9ab', lineHeight: 1.55,
          fontFamily: 'Karla, sans-serif', flex: 1,
          display: '-webkit-box', WebkitLineClamp: tall ? 4 : 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {story.excerpt}
        </p>

        <p style={{
          marginTop: 10, fontSize: 11, color: '#678',
          fontFamily: 'Karla, sans-serif', fontWeight: 700,
          letterSpacing: 1, textTransform: 'uppercase',
        }}>
          READ STORY
        </p>
      </div>
    </div>
  )
}
