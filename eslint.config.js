// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['node_modules/**', 'supabase/functions/**', 'future-v3/**', '.expo/**', 'dist/**'],
  },
  {
    rules: {
      // Règle pensée pour le web (entités HTML). En React Native le texte n'est pas
      // du HTML, et l'app est intégralement rédigée en français : échapper chaque
      // apostrophe rendrait les libellés illisibles à la relecture.
      'react/no-unescaped-entities': 'off',
    },
  },
]);
