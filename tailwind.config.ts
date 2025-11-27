import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFFBEB',
        clay: {
          rose: '#F472B6',
          amber: '#FBBF24',
          sky: '#38BDF8',
          mint: '#34D399',
          purple: '#A78BFA',
        }
      },
      fontFamily: {
        display: ['var(--font-zcool)', 'cursive'],
        body: ['var(--font-noto)', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      boxShadow: {
        'clay': '0 8px 32px -4px rgba(251, 191, 36, 0.3)',
        'clay-lg': '0 16px 48px -8px rgba(251, 191, 36, 0.4)',
      }
    },
  },
  plugins: [],
}

export default config
