import { fileURLToPath } from 'node:url';

import { configDefaults, defineConfig } from 'vitest/config';

const helper = (name: string) => fileURLToPath(new URL(`./tests/helpers/${name}`, import.meta.url));

const shared = {
  // The date tests read a UTC timestamp back as a local day and hour, so they assert whatever
  // timezone the machine happens to be in. Pinned here to the one the app is written for:
  // otherwise “Thursday 17 at 19:20” becomes Friday the 18th the moment the laptop travels east,
  // and a passing suite starts failing over nothing.
  env: { TZ: 'Europe/Paris' },
  // Claude Code checks branches out under .claude/worktrees/. Git already excludes that
  // directory; without excluding it here too, a second copy of the whole suite runs alongside
  // this one and another branch's work in progress is reported as this branch's failures.
  exclude: [...configDefaults.exclude, '.claude/**'],
};

/**
 * Two suites, because they need different worlds.
 *
 * Everything that was here before is pure logic and runs in node, which is fast and needs nothing.
 * The render tests need a DOM and a React Native that resolves in one — so they alias react-native
 * to react-native-web, which the project already carries for the web build. That is why no native
 * renderer had to be installed.
 *
 * The split is per file by name: *.render.test.tsx goes to the second project, everything else to
 * the first. A pure test cannot accidentally inherit the heavier environment.
 */
export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            'expo-localization': helper('expo-localization.ts'),
            'react-native': helper('react-native.ts'),
          },
        },
        test: {
          ...shared,
          name: 'unit',
          environment: 'node',
          include: ['tests/**/*.test.ts'],
        },
      },
      {
        resolve: {
          alias: {
            'expo-localization': helper('expo-localization.ts'),
            'react-native': 'react-native-web',
          },
        },
        test: {
          ...shared,
          name: 'render',
          environment: 'jsdom',
          include: ['tests/**/*.render.test.tsx'],
          setupFiles: [helper('render-setup.tsx')],
        },
      },
    ],
  },
});
