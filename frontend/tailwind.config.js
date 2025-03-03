/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue': {
          50: '#f0f8ff',
          100: '#e0f0fe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#38aff8',
          500: '#0f97ea',
          600: '#0077c8',
          700: '#0060a3',
          800: '#005085',
          900: '#00376d',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}