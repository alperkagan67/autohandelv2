/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0a',
          paper: '#1a1a1a',
          elevation1: '#262626',
          elevation2: '#2d2d2d',
        },
      },
      backgroundColor: {
        dark: {
          DEFAULT: '#0a0a0a',
          paper: '#1a1a1a',
          elevation1: '#262626',
          elevation2: '#2d2d2d',
        },
      },
    },
  },
  plugins: [],
}