/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF4EB',
          100: '#FFE4D1',
          200: '#FFC9A3',
          300: '#FFA76B',
          400: '#FF8A38',
          500: '#FF6B00',
          600: '#E85D00',
          700: '#C24E00',
          800: '#993E00',
          900: '#6B2B00',
        },
        ink: {
          950: '#07070B',
          900: '#0C0C12',
          850: '#111119',
          800: '#16161F',
          700: '#1E1E2A',
          600: '#2A2A3A',
          500: '#3D3D50',
          400: '#5C5C72',
          300: '#8A8AA0',
          200: '#B8B8C8',
          100: '#E4E4EC',
        },
      },
      fontFamily: {
        sans: [
          '"Inter"',
          '"Noto Sans TC"',
          'system-ui',
          '-apple-system',
          '"PingFang TC"',
          '"Microsoft JhengHei"',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(255, 107, 0, 0.45)',
        'glow-sm': '0 0 20px -6px rgba(255, 107, 0, 0.4)',
        card: '0 8px 32px rgba(0, 0, 0, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
