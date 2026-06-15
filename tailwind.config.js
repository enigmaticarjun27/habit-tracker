/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0A0A0F', card: '#13131D', hover: '#1A1A28' },
        brd: { DEFAULT: '#1E1E2E', light: '#2A2A3E' },
        w1: '#60A5FA',
        w2: '#F472B6',
        w3: '#34D399',
        w4: '#FBBF24',
        w5: '#A78BFA',
      },
    },
  },
  plugins: [],
};
