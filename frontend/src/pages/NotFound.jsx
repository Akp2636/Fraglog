import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: 80, marginBottom: '1rem' }}>💀</div>
      <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 40, color: '#f0f0f8', marginBottom: 12 }}>404</h1>
      <p style={{ fontFamily: 'Karla', fontSize: 18, color: '#8888aa', marginBottom: '2rem' }}>
        You got fragged. This page doesn't exist.
      </p>
      <Link to="/" style={{
        background: '#00e676', border: 'none', borderRadius: 10,
        padding: '12px 24px', fontFamily: 'Syne', fontWeight: 700, fontSize: 15,
        color: '#0f0f17', textDecoration: 'none',
      }}>
        Back to Home
      </Link>
    </div>
  )
}
