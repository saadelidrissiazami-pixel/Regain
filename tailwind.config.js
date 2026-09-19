/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      // Chaque classe lit une variable posée par ThemeProvider (src/theme/colors.ts) : le passage
      // clair / sombre change toute l'app d'un coup.
      colors: {
        'bg': 'rgb(var(--color-bg) / <alpha-value>)',
        'surface': 'rgb(var(--color-surface) / <alpha-value>)',
        'ink': 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--color-ink-2) / <alpha-value>)',
        'ink-3': 'rgb(var(--color-ink-3) / <alpha-value>)',
        'line': 'rgb(var(--color-line) / <alpha-value>)',
        'divider': 'rgb(var(--color-divider) / <alpha-value>)',
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        'primary-900': 'rgb(var(--color-primary-900) / <alpha-value>)',
        'primary-700': 'rgb(var(--color-primary-700) / <alpha-value>)',
        'primary-600': 'rgb(var(--color-primary-600) / <alpha-value>)',
        'primary-500': 'rgb(var(--color-primary-500) / <alpha-value>)',
        'sage-100': 'rgb(var(--color-sage-100) / <alpha-value>)',
        'sage-200': 'rgb(var(--color-sage-200) / <alpha-value>)',
        'sage-300': 'rgb(var(--color-sage-300) / <alpha-value>)',
        'blue': 'rgb(var(--color-blue) / <alpha-value>)',
        'yellow': 'rgb(var(--color-yellow) / <alpha-value>)',
        'orange': 'rgb(var(--color-orange) / <alpha-value>)',
        'red': 'rgb(var(--color-red) / <alpha-value>)',
        'purple': 'rgb(var(--color-purple) / <alpha-value>)',
        'danger': 'rgb(var(--color-danger) / <alpha-value>)',
        'protein': 'rgb(var(--color-protein) / <alpha-value>)',
        'carbs': 'rgb(var(--color-carbs) / <alpha-value>)',
        'fat': 'rgb(var(--color-fat) / <alpha-value>)',
        'premium': 'rgb(var(--color-premium) / <alpha-value>)',
        'premium-ink': 'rgb(var(--color-premium-ink) / <alpha-value>)',
        'scrim': 'rgb(var(--color-scrim) / <alpha-value>)',
      },
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '18px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
