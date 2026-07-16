import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#F6F7F8',
        surface: '#FFFFFF',
        ink:     '#101012',
        'ink-2': '#6B6B75',
        'ink-3': '#9A9AA3',
        line:    '#E6E6E9',
        red:     { DEFAULT: '#C4302B', 50: '#FDF3F2', 200: '#F0C7C4' },
      },
      fontFamily: { sans: ['var(--font-geist-sans)', '-apple-system', 'system-ui', 'sans-serif'] },
      animation: { 'fade-in': 'fadeIn .3s ease-out', 'rise': 'rise .5s cubic-bezier(.16,1,.3,1)' },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        rise:   { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
