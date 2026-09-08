/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#FBF6F0',
        surface: '#FFFFFF',
        ink: '#2B2620',
        'ink-soft': '#928A7C',
        primary: '#FF6B57',
        'primary-soft': '#FFE4DD',
        accent: '#F0A324',
        'accent-soft': '#FCEACB',
        calm: '#1E9C86',
        'calm-soft': '#D9F1EB',
        line: '#EEE4D6',
      },
      fontFamily: {
        body: ['Nunito_400Regular'],
        label: ['Nunito_700Bold'],
        display: ['Nunito_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
