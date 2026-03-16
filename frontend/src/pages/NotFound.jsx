import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Bebas Neue', fontSize: 120, color: '#1A1A1A', lineHeight: 1, letterSpacing: '0.02em' }}>404</p>
      <h1 style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 22, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444', marginBottom: 16, marginTop: -8 }}>Page Not Found</h1>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#9EFF00', color: '#0A0A0A', fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 24px', border: 'none' }}>
        Back to Home
      </Link>
    </div>
  )
}
