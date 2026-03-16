export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0A0A0A', secondary: '#111111', card: '#161616', elevated: '#1C1C1C' },
        accent: { green: '#9EFF00', dim: '#7ACC00' },
        text: { primary: '#F0F0F0', secondary: '#888888', muted: '#444444' },
        border: { default: '#222222', subtle: '#1A1A1A' },
        status: {
          playing: '#9EFF00', played: '#40BCF4', completed: '#FFD700',
          dropped: '#FF3B3B', on_hold: '#FF6B35', want: '#888888',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        heading: ['Oswald', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
