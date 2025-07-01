/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
        },
        dark: {
          100: '#1f2937',
          200: '#111827',
          300: '#0f172a',
        }
      },
      aspectRatio: {
        '9/16': '9 / 16',
      }
    },
  },
  plugins: [],
}
