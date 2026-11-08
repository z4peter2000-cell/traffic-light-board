/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        light: {
          green: '#22c55e',
          yellow: '#facc15',
          red: '#ef4444',
        },
      },
      boxShadow: {
        'glow-green': '0 0 12px 2px rgba(34,197,94,0.75), 0 0 30px 6px rgba(34,197,94,0.35)',
        'glow-yellow': '0 0 12px 2px rgba(250,204,21,0.75), 0 0 30px 6px rgba(250,204,21,0.35)',
        'glow-red': '0 0 12px 2px rgba(239,68,68,0.75), 0 0 30px 6px rgba(239,68,68,0.35)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
