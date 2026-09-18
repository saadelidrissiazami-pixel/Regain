/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      // Couleurs pilotées par le moment de la journée (src/theme/palettes.ts) : chaque classe lit
      // une variable posée par ThemeProvider, ce qui permet de changer toute l'app d'un coup.
      colors: {
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--color-ink-soft) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-soft': 'rgb(var(--color-primary-soft) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-soft': 'rgb(var(--color-accent-soft) / <alpha-value>)',
        calm: 'rgb(var(--color-calm) / <alpha-value>)',
        'calm-soft': 'rgb(var(--color-calm-soft) / <alpha-value>)',
        sky: 'rgb(var(--color-sky) / <alpha-value>)',
        'sky-soft': 'rgb(var(--color-sky-soft) / <alpha-value>)',
      },
      fontFamily: {
        body: ['Figtree_400Regular'],
        label: ['Figtree_700Bold'],
        display: ['BricolageGrotesque_800ExtraBold'],
        mono: ['IBMPlexMono_500Medium'],
      },
    },
  },
  plugins: [],
};
