export function LoadingSpinner({ size = 32, color = '#9EFF00' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid #222`, borderTopColor: color,
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}

export function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner size={36} />
    </div>
  )
}

export function EmptyState({ icon, title = 'Nothing here', description = '', action }) {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {icon && <div style={{ fontSize: 36, marginBottom: 4, opacity: 0.3 }}>{icon}</div>}
      <h3 style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 18, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#444' }}>{title}</h3>
      {description && <p style={{ color: '#444', fontFamily: 'Manrope', fontSize: 13, maxWidth: 280 }}>{description}</p>}
      {action}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#111', overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 140 }} />
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 14, width: '70%' }} />
        <div className="skeleton" style={{ height: 11, width: '40%' }} />
      </div>
    </div>
  )
}
