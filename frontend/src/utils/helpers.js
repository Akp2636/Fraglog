export const formatPlaytime = (minutes) => {
  if (!minutes) return '0h'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const steamHeader = (appId) =>
  `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`

export const steamHero = (appId) =>
  `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg`

export const STATUS_LABELS = {
  playing      : 'Playing',
  played       : 'Played',
  want_to_play : 'Want to Play',
  dropped      : 'Dropped',
  on_hold      : 'On Hold',
  completed    : 'Completed',
}

export const STATUS_COLORS = {
  playing      : '#00e676',
  played       : '#40bcf4',
  want_to_play : '#888899',
  dropped      : '#ff4757',
  on_hold      : '#ff6b35',
  completed    : '#ffd700',
}

export const STATUS_ICONS = {
  playing      : '🎮',
  played       : '✅',
  want_to_play : '📌',
  dropped      : '💀',
  on_hold      : '⏸️',
  completed    : '🏆',
}

export const ratingLabel = (r) => {
  if (!r) return ''
  const labels = { 0.5:'Abysmal', 1:'Terrible', 1.5:'Bad', 2:'Poor', 2.5:'Mediocre', 3:'Decent', 3.5:'Good', 4:'Great', 4.5:'Excellent', 5:'Masterpiece' }
  return labels[r] || ''
}

export const truncate = (str, n=80) =>
  str && str.length > n ? str.slice(0, n) + '…' : str
