/**
 * Just enough react-native for the node suite.
 *
 * src/lib/i18n.ts reads the saved language from react-native's Settings — NSUserDefaults, and the
 * only store readable synchronously at module load. Importing the real package here fails: its
 * source is Flow, which vitest does not parse. The render suite swaps in react-native-web; the
 * node suite has no DOM and needs neither.
 *
 * Settings is a real store rather than an empty stub, so a test can save a language and watch the
 * app read it back — which is the whole behaviour worth checking.
 */
/**
 * Hung off globalThis rather than held in the module.
 *
 * Tests reset the module registry to make src/lib/i18n.ts re-read the saved language at import —
 * which also hands this helper a brand new, empty store, so the test would be saving into one
 * copy and the app reading from another. NSUserDefaults does not forget between imports either.
 */
const store: Record<string, unknown> = ((globalThis as { __settings?: Record<string, unknown> })
  .__settings ??= {});

export const Settings = {
  get: (key: string) => store[key],
  set: (values: Record<string, unknown>) => Object.assign(store, values),
  clear: () => {
    for (const key of Object.keys(store)) delete store[key];
  },
};

export const Platform = { OS: 'ios' as 'ios' | 'android' | 'web', select: <T,>(o: { ios?: T; default?: T }) => o.ios ?? o.default };
