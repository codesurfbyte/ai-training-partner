import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#14f195',
          dark: '#08c56e',
          soft: '#dbffea',
          faint: '#f4fff8',
        },
        ink: '#050505',
        slate: '#6d6a62',
        canvas: '#f3f2ec',
        surface: '#ffffff',
        sand: '#eceae1',
        mist: '#d8d4c7',
      },
    },
  },
  plugins: [],
}

export default config
