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
        obsidian: {
          DEFAULT: '#0B0A0F',
          card: '#14121A',
          border: '#262232',
          light: '#1E1B2A',
        },
        roseGold: {
          DEFAULT: '#D8A499',
          light: '#F8DFD4',
          dark: '#C89388',
          metallic: '#E6C687',
        },
        neonCyan: {
          DEFAULT: '#00F2FE',
          glow: 'rgba(0, 242, 254, 0.25)',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Didot', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cyber-luxury': '0 25px 60px rgba(0, 0, 0, 0.75)',
        'rose-glow': '0 0 35px rgba(216, 164, 153, 0.25)',
        'cyan-glow': '0 0 35px rgba(0, 242, 254, 0.25)',
        'button-glow': '0 10px 30px rgba(216, 164, 153, 0.3)',
      }
    },
  },
  plugins: [],
};
