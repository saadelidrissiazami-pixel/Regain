import { fileURLToPath } from 'node:url';

import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { 'expo-localization': fileURLToPath(new URL('./tests/helpers/expo-localization.ts', import.meta.url)) },
  },
  test: {
    // The date tests read a UTC timestamp back as a local day and hour, so they assert whatever
    // timezone the machine happens to be in. Pinned here to the one the app is written for:
    // otherwise “Thursday 17 at 19:20” becomes Friday the 18th the moment the laptop travels east,
    // and a passing suite starts failing over nothing.
    env: { TZ: 'Europe/Paris' },
    // Claude Code checks branches out under .claude/worktrees/. Git already excludes that
    // directory; without excluding it here too, a second copy of the whole suite runs alongside
    // this one and another branch's work in progress is reported as this branch's failures.
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
});
