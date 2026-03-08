/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#08080f',
          secondary: '#0f0f1a',
          card: '#13131f',
          elevated: '#1a1a2e',
        },
        border: {
          DEFAULT: '#1e1e35',
          light: '#2a2a45',
        },
        accent: {
          green: '#22c55e',
          'green-dim': '#16a34a',
          red: '#ef4444',
          gold: '#f59e0b',
          blue: '#60a5fa',
          purple: '#a78bfa',
        },
        text: {
          primary: '#eeeef5',
          secondary: '#9999b8',
          muted: '#5c5c80',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Karla', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':
          "linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-sm': '32px 32px',
      },
    },
  },
  plugins: [],
}
