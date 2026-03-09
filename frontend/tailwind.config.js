/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary  : '#080808',
          secondary: '#111111',
          card     : '#161616',
          hover    : '#1e1e1e',
        },
        accent: {
          green : '#b9ff57',
          blue  : '#40bcf4',
          orange: '#ff6b35',
          gold  : '#ffd700',
          red   : '#ff2d2d',
        },
        border: '#222222',
        text  : {
          primary  : '#ffffff',
          secondary: '#888888',
          muted    : '#444444',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body    : ['Barlow', 'sans-serif'],
        mono    : ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
