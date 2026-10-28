/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#142B4A",
        "primary-container": "#1B385D",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#94B3FD",
        "primary-fixed": "#D5E3FF",
        "primary-fixed-dim": "#B2C7EE",
        secondary: "#E27B12",
        "secondary-container": "#FFE8D6",
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#6B3900",
        "secondary-fixed": "#FFDCC2",
        "secondary-fixed-dim": "#FFB77A",
        tertiary: "#FF9F43",
        "tertiary-container": "#E68A2E",
        "on-tertiary": "#FFFFFF",
        background: "#F7F9FC",
        "on-background": "#191C1E",
        surface: "#F7F9FC",
        "on-surface": "#263449",
        "on-surface-variant": "#5A6B82",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#EDF2F7",
        "surface-container": "#ECEEF1",
        "surface-container-high": "#E2E8F0",
        "surface-container-highest": "#E0E3E6",
        outline: "#74777E",
        "outline-variant": "#CBD5E1",
        error: "#BA1A1A",
        "error-container": "#FFDAD6",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        headline: ['Manrope', 'sans-serif'],
        price: ['Manrope', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

