export function LoadingSpinner({ size = 32, color = '#00e676' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid #2a2a3d`,
      borderTopColor: color,
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}

export function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner size={40} />
    </div>
  )
}

export function EmptyState({ icon = '🎮', title = 'Nothing here', description = '', action }) {
  return (
    <div style={{
      textAlign: 'center', padding: '4rem 2rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 48 }}>{icon}</div>
      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#f0f0f8' }}>{title}</h3>
      {description && <p style={{ color: '#8888aa', fontSize: 14, maxWidth: 300 }}>{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong' }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: '#ff4757', fontFamily: 'Karla', fontSize: 14 }}>{message}</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#1c1c28', borderRadius: 12, overflow: 'hidden', border: '1px solid #2a2a3d' }}>
      <div className="skeleton" style={{ height: 140 }} />
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 16, borderRadius: 4, width: '70%' }} />
        <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '40%' }} />
      </div>
    </div>
  )
}
