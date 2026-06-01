/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark background layers
        deepBlack: '#0A0A0A',
        darkSurface: '#141414',
        darkElevated: '#1A1A1A',
        darkHover: '#262626',
        
        // Primary accent (Netflix-inspired red) - use sparingly for LIVE indicators and active states
        primary: '#E50914',
        primaryHover: '#F40612',
        primaryLight: '#B20710',
        
        // Secondary accent (gold for premium feel)
        accent: '#FFD700',
        accentDim: '#CCA300',
        
        // Legacy colors (kept for compatibility, use sparingly)
        neonPink: '#E50914',
        neonPinkLight: '#F40612',
        neonPinkDark: '#B20710',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'skeleton-pulse': 'skeletonPulse 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(229, 9, 20, 0.3), 0 0 10px rgba(229, 9, 20, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(229, 9, 20, 0.4), 0 0 25px rgba(229, 9, 20, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        skeletonPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(229, 9, 20, 0.3)',
        'glow-strong': '0 0 30px rgba(229, 9, 20, 0.5)',
      },
    },
  },
  plugins: [],
}
