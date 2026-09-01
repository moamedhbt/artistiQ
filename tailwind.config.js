/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pearl: {
          DEFAULT: '#F9F8F6',
          dark: '#F0ECE8',
          card: '#FFFFFF',
          border: '#E6E0DA',
        },
        roseGold: {
          DEFAULT: '#C89388',
          light: '#F7ECE8',
          dark: '#A66E70',
        },
        charcoal: {
          DEFAULT: '#1E2025',
          button: '#2B2E36',
          buttonHover: '#1A1C22',
          muted: '#656975',
        },
        iridescent: {
          start: '#F3E5F5',
          mid: '#E1F5FE',
          end: '#FFF3E0',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Didot', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 25px 60px rgba(0, 0, 0, 0.06)',
        'button-shadow': '0 12px 30px rgba(43, 46, 54, 0.2)',
        'pearlescent': '0 8px 32px 0 rgba(200, 147, 136, 0.15)',
      }
    },
  },
  plugins: [],
};
