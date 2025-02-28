/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['"Courier New"', 'monospace'],
      },
      colors: {
        primary: '#634AFF',
        secondary: 'rgba(99,74,255,0.05)',
        primaryText: '#11181C',
        secondaryText: '#5b606c',
        tertiaryText: '#7C7C7C',
        darkBackground: '#242424',
        darkPrimaryText: '#f9fafb',
        darkSecondaryText: '#d1d1d1',
        darkTertiaryText: '#7C7C7C',
        hover: 'rgba(99,74,255,0.1)',
      },
      fontSize: {
        text: '0.875rem',
        title: '1.5rem',
        subtitle: '1.25rem',
      },
    },
  },
  plugins: [],
};
