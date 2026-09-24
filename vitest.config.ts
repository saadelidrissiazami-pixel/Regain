import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { 'expo-localization': fileURLToPath(new URL('./tests/helpers/expo-localization.ts', import.meta.url)) },
  },
});
