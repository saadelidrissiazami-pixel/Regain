import { fileURLToPath } from 'node:url';

import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { 'expo-localization': fileURLToPath(new URL('./tests/helpers/expo-localization.ts', import.meta.url)) },
  },
  test: {
    // Claude Code checks branches out under .claude/worktrees/. Git already excludes that
    // directory; without excluding it here too, a second copy of the whole suite runs alongside
    // this one and another branch's work in progress is reported as this branch's failures.
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
});
