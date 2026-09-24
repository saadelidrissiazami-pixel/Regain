const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Mêmes exclusions que tsconfig : Edge Functions (runtime Deno) et code V3 mis de côté.
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'supabase/functions/*', 'future-v3/*', '.claude/**'],
  },
  {
    rules: {
      // Règle pensée pour le HTML : en React Native une apostrophe dans le texte JSX est
      // parfaitement valide, et une app en français en contient partout.
      'react/no-unescaped-entities': 'off',
    },
  },
]);
