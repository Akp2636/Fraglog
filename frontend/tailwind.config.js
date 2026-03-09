/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary  : '#0f0f17',
          secondary: '#16161f',
          card     : '#1c1c28',
          hover    : '#222232',
        },
        accent: {
          green : '#00e676',
          blue  : '#40bcf4',
          orange: '#ff6b35',
          gold  : '#ffd700',
          red   : '#ff4757',
        },
        border: '#2a2a3d',
        text  : {
          primary  : '#f0f0f8',
          secondary: '#8888aa',
          muted    : '#555570',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body    : ['Karla', 'sans-serif'],
        mono    : ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
