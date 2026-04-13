/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mt: {
          'dark-green': '#003232',
          'mid-green': '#007846',
          'aqua': '#009696',
          'light-aqua': '#32d2a0',
          'purple': '#785fdc',
          'light-purple': '#96affa',
          'grey': '#556478',
          'white': '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
