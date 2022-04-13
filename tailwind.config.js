const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      // Build your palette here
      transparent: 'transparent',
      current: 'currentColor',
      white: colors.white,
      black: colors.black,
      bluegray: colors.blueGray,
      coolgray: colors.coolGray,
      gray: colors.gray,
      truegray: colors.trueGray,
      warmgray: colors.warmGray,
      red: colors.red,
      orange: colors.orange,
      amber: colors.amber,
      yellow: colors.amber,
      lime: colors.lime,
      green: colors.green,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      lightblue: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      fuchsia: colors.fuchsia,
      pink: colors.pink,
      rose: colors.rose,
      fanzoneGray: '#212121',
      fanzoneTextGray: '#BCBCBC',
      fanzoneGray2: '#3B3B3B',
    },
    screens: {
      xs: '320px',

      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }

      '3xl': '2000px',
    },
    extend: {
      backgroundImage: (theme) => ({
        metaCard: "url('./assets/bg-meta-card.png')",
        fanzoneBg: "url('./assets/fanzone-bg.png')",
        profileHero: "url('./assets/profilepage-hero-bg.svg')",
        profileCard: "url('./assets/bg-profile-card.png')",
      }),
      zIndex: {
        '-10': '-10',
      },
      margin: {
        '-22': '-5.5rem',
        '-30': '-7.5rem',
        '-18': '-4.5rem',
      },
      width: {
        lg: '1280px',
      },
      height: {
        grid: '473px',
      },
    },
    keyframes: {
      scale: {
        '0%,100%': { transform: 'scale(1.2)' },
        '50%': { transform: 'scale(1)' },
      },
      cardrender: {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
    },
    animation: {
      scale: 'scale 2s ease-in-out infinite',
      cardrender: 'cardrender 1s linear',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
