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
        accent: '#38c172',
        primaryText: '#11181C',
        secondaryText: '#6B7280',
        tertiaryText: '#7C7C7C',
        background: '#f9fafb',
        dark: '#1f2937',
        darkBackground: '#2d3748',
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
