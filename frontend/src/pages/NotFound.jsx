import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center page-container">
      <div className="text-center">
        <p className="font-mono text-8xl font-bold text-border mb-4">404</p>
        <h1 className="font-display font-black text-2xl text-text-primary mb-2">
          Page Not Found
        </h1>
        <p className="text-text-muted font-body text-sm mb-6">
          Looks like you wandered into unknown territory.
        </p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    </div>
  )
}
