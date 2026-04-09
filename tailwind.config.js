/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#E8620A', light: '#F4854A', dark: '#B84D08', xlight: '#FDF0E8' },
        secondary: { DEFAULT: '#25176E', light: '#3A2694' },
        grey: {
          50: '#F8F9FB', 100: '#EEF0F5', 200: '#D8DCE8',
          400: '#A0A8C0', 500: '#6B7494', 700: '#3A4060', 900: '#1E2333'
        },
        success: { DEFAULT: '#22C55E', bg: '#DCFCE7', text: '#16A34A' },
        warning: { DEFAULT: '#F59E0B', bg: '#FEF9C3', text: '#A16207' },
        danger:  { DEFAULT: '#EF4444', bg: '#FEE2E2', text: '#DC2626' },
        info:    { DEFAULT: '#3B82F6', bg: '#DBEAFE', text: '#1D4ED8' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px', md: '10px', lg: '16px', xl: '24px',
      },
      boxShadow: {
        sm: '0 1px 4px rgba(30,35,51,0.08)',
        md: '0 4px 16px rgba(30,35,51,0.12)',
      },
    },
  },
  plugins: [],
}