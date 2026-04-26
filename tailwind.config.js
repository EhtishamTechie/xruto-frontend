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
          // Required layered dark palette (SaaS style)
          bg: '#0B0F17',
          surface: '#111827',
          elevated: '#1F2937',
          sidebar: '#0F172A',

          // Lines / borders
          line: '#1F2937',
          border: 'rgba(255,255,255,0.06)',

          // Text
          text: '#E5E7EB',
          secondary: '#9CA3AF',
          muted: '#6B7280',

          // Accent + semantic (soft)
          brand: '#F59E0B',
          success: '#22C55E',
          danger: '#F87171',
          info: '#60A5FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['"DM Sans"', 'Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
      },
      borderRadius: {
        // Enforce spec: cards 12px, controls 8px
        card: '12px',
        control: '8px',
      },
      fontSize: {
        // Typography scale (mapped to Tailwind tokens)
        display: ['2.25rem', { lineHeight: '1.1', fontWeight: '600', letterSpacing: '-0.03em' }],
        h1: ['28px', { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.02em' }],
        h2: ['20px', { lineHeight: '1.2', fontWeight: '500', letterSpacing: '-0.01em' }],
        h3: ['17px', { lineHeight: '1.35', fontWeight: '600', letterSpacing: '-0.01em' }],
        body: ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      maxWidth: {
        readable: '42rem',
        section: '72rem',
      },
      boxShadow: {
        panel: '0 10px 30px rgba(0,0,0,0.35)',
        soft: '0 6px 18px rgba(0,0,0,0.28)',
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