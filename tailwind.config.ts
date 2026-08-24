import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Design system — dark backgrounds
        void: '#050505',
        base: '#0A0A0A',
        surface: '#111111',
        elevated: '#161616',
        hover: '#1C1C1C',
        active: '#222222',

        // Gold palette
        gold: {
          DEFAULT: '#D4AF37',
          bright: '#F0C950',
          dim: 'rgba(212,175,55,0.08)',
          glow: 'rgba(212,175,55,0.18)',
          border: 'rgba(212,175,55,0.3)',
          '50': '#FEFCE8',
          '100': '#FEF9C3',
          '200': '#FEF08A',
          '300': '#FDE047',
          '400': '#F0C950',
          '500': '#D4AF37',
          '600': '#B8960C',
          '700': '#926F00',
          '800': '#795400',
          '900': '#5C3F00',
        },

        // Border scale
        border: {
          subtle: '#181818',
          DEFAULT: '#242424',
          strong: '#333333',
          gold: 'rgba(212,175,55,0.3)',
        },

        // Text scale
        ink: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#52525B',
          gold: '#D4AF37',
        },

        // Status
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#6366F1',

        // shadcn compat
        background: '#0A0A0A',
        foreground: '#FAFAFA',
        primary: { DEFAULT: '#D4AF37', foreground: '#0A0A0A' },
        secondary: { DEFAULT: '#1C1C1C', foreground: '#FAFAFA' },
        destructive: { DEFAULT: '#EF4444', foreground: '#FAFAFA' },
        muted: { DEFAULT: '#161616', foreground: '#A1A1AA' },
        accent: { DEFAULT: '#1C1C1C', foreground: '#FAFAFA' },
        popover: { DEFAULT: '#111111', foreground: '#FAFAFA' },
        card: { DEFAULT: '#111111', foreground: '#FAFAFA' },
        input: '#242424',
        ring: 'rgba(212,175,55,0.4)',
      },
      borderRadius: {
        lg: '10px',
        md: '8px',
        sm: '6px',
        xl: '14px',
        '2xl': '20px',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(212,175,55,0.12)',
        'gold': '0 0 20px rgba(212,175,55,0.18)',
        'gold-lg': '0 0 40px rgba(212,175,55,0.25)',
        'dark-sm': '0 1px 3px rgba(0,0,0,0.5)',
        'dark-md': '0 4px 12px rgba(0,0,0,0.6)',
        'dark-lg': '0 8px 32px rgba(0,0,0,0.7)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212,175,55,0.12)' },
          '50%': { boxShadow: '0 0 30px rgba(212,175,55,0.28)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-fast': 'fade-in-fast 0.2s ease-out forwards',
        shimmer: 'shimmer 1.8s infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
