// Convert minutes to "Xh Ym" format
export const formatPlaytime = (minutes) => {
  if (!minutes || minutes === 0) return '0h'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Convert minutes to hours (rounded to 1 decimal)
export const minutesToHours = (minutes) => {
  if (!minutes) return 0
  return Math.round(minutes / 60 * 10) / 10
}

// Format a date as "Jan 2024" or "3 days ago"
export const formatDate = (date, short = false) => {
  if (!date) return '—'
  const d = new Date(date)
  if (short) {
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// Status label map
export const STATUS_LABELS = {
  playing: 'Playing',
  played: 'Played',
  want_to_play: 'Want to Play',
  dropped: 'Dropped',
  on_hold: 'On Hold',
}

// Status color classes
export const STATUS_COLORS = {
  playing: 'text-accent-green border-accent-green/30 bg-accent-green/10',
  played: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10',
  want_to_play: 'text-accent-purple border-accent-purple/30 bg-accent-purple/10',
  dropped: 'text-accent-red border-accent-red/30 bg-accent-red/10',
  on_hold: 'text-accent-gold border-accent-gold/30 bg-accent-gold/10',
}

// Rating to descriptive text
export const ratingLabel = (rating) => {
  if (!rating) return 'Unrated'
  if (rating >= 4.5) return 'Masterpiece'
  if (rating >= 4.0) return 'Excellent'
  if (rating >= 3.5) return 'Great'
  if (rating >= 3.0) return 'Good'
  if (rating >= 2.5) return 'Mixed'
  if (rating >= 2.0) return 'Mediocre'
  if (rating >= 1.0) return 'Bad'
  return 'Terrible'
}

// Truncate text
export const truncate = (str, max = 120) => {
  if (!str || str.length <= max) return str
  return str.slice(0, max).trimEnd() + '…'
}

// Steam game header image URL
export const steamHeader = (appId) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`

// Steam store URL
export const steamStoreUrl = (appId) => `https://store.steampowered.com/app/${appId}`
