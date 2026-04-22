/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xr: {
          bg: '#0A0F1E',
          sidebar: '#111827',
          card: '#1C2333',
          surface: '#0D1320',
          border: 'rgba(255,255,255,0.06)',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['"DM Sans"', 'Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        panel: '0 4px 24px rgba(0,0,0,0.4)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'dot-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.35)', opacity: '1' },
        },
        'glow-once': {
          '0%': { boxShadow: '0 0 0 rgba(245,158,11,0)' },
          '60%': { boxShadow: '0 0 0 6px rgba(245,158,11,0.18)' },
          '100%': { boxShadow: '0 0 0 rgba(245,158,11,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 380ms ease-out both',
        'dot-pulse': 'dot-pulse 1.4s ease-in-out infinite',
        'glow-once': 'glow-once 700ms ease-out both',
      },
    },
  },
  plugins: [],
}