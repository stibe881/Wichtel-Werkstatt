/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        elf: {
          red: '#D42426',
          green: '#1E5945',
          gold: '#F2C94C',
          white: '#F9FAFB',
          dark: '#2d1b14', // Darker wood tone
          paper: '#fdfbf7', // Warm paper
          wood: '#855E42',
          woodlight: '#A07050'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        handwriting: ['Georgia', 'serif'], // Fallback
      },
      backgroundImage: {
        'winter': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        'wood': `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`, // Fallback or simple pattern
        'parchment': `linear-gradient(to bottom right, #fffdf5, #f5f0e1)`
      },
      boxShadow: {
        'wood-bezel': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(255, 255, 255, 0.1)',
        'wood-plank': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'inner-deep': 'inset 0 2px 10px 0 rgba(0, 0, 0, 0.1)'
      }
    }
  },
  plugins: [],
}
