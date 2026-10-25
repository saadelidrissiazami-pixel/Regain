import { createElement } from 'react';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

/**
 * What a rendered component needs that a DOM does not have.
 *
 * Everything stubbed here is a native module with no web equivalent: an icon font, a haptic
 * engine, an animation library that talks to the UI thread. None of them decides what the screen
 * says, which is the whole point of these tests — so a stub that renders nothing is honest, and a
 * component that turns out to depend on one of them for its *words* will fail loudly here.
 */

vi.mock('@expo/vector-icons', () => ({
  // Rendered as a marked element rather than nothing, so a test can assert an icon is present
  // without asserting which glyph a font happened to pick.
  Ionicons: ({ name }: { name: string }) => <span data-icon={name} />,
}));

// nativewind turns the palette into CSS variables. It ships code vitest cannot parse, and it
// decides no word on screen — only how a colour reaches one.
vi.mock('nativewind', () => ({ vars: (values: Record<string, string>) => values }));

// Safe-area insets are a phone's notch and home bar. A DOM has neither, and no word on screen
// depends on them.
vi.mock('react-native-safe-area-context', async () => {
  // 'react-native' resolves to react-native-web here, by the alias this project sets for the
  // render suite — so the types come from react-native and the implementation from the web build.
  const { View } = await import('react-native');
  const insets = { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    SafeAreaProvider: View,
    SafeAreaView: View,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
    initialWindowMetrics: { frame: { x: 0, y: 0, width: 390, height: 844 }, insets },
  };
});

vi.mock('expo-haptics', () => ({
  impactAsync: () => Promise.resolve(),
  selectionAsync: () => Promise.resolve(),
  notificationAsync: () => Promise.resolve(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

vi.mock('react-native-reanimated', async () => {
  const { View } = await import('react-native');

  /**
   * One stand-in for every animation descriptor, chainable without end: FadeIn.duration(180),
   * LinearTransition.duration(220).delay(40). Calling it or reading anything off it gives it back.
   */
  const descriptor: never = new Proxy(function self() {}, {
    get: (_target, prop) => (prop === 'then' || typeof prop === 'symbol' ? undefined : descriptor),
    apply: () => descriptor,
  }) as never;

  // Listed one by one rather than behind a catch-all Proxy: vitest checks a mock really exports
  // the name a module asked for, and refuses the proxy. The list is what the app imports today —
  // a new import fails here, with a message that names it.
  return {
    default: { View, Text: View, ScrollView: View, createAnimatedComponent: (c: unknown) => c },
    FadeIn: descriptor,
    FadeInDown: descriptor,
    FadeOut: descriptor,
    LinearTransition: descriptor,
    SlideInDown: descriptor,
    SlideOutDown: descriptor,
    ZoomIn: descriptor,
    // The helpers hand back their target: a test asks what is on screen once things have settled,
    // never what they looked like mid-transition.
    withTiming: (value: unknown) => value,
    withSpring: (value: unknown) => value,
    withRepeat: (value: unknown) => value,
    withSequence: (value: unknown) => value,
    useSharedValue: (initial: unknown) => ({ value: initial, get: () => initial, set: () => {} }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    // Always on, so nothing waits on a transition that will never run in a DOM.
    useReducedMotion: () => true,
  };
});

/**
 * react-native-svg, drawn as plain SVG.
 *
 * The real package resolves to a native component through codegen, which has no meaning in a DOM.
 * Its own web build maps these elements onto the SVG tags below, so the stub is the same shape —
 * and what the tests here assert is our drawing's geometry, not the library's rendering.
 */
vi.mock('react-native-svg', () => {
  const tag = (name: string) => {
    const Element = ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      createElement(name, props, children as never);
    Element.displayName = name;
    return Element;
  };
  const Svg = tag('svg');
  return {
    default: Svg,
    Svg,
    Circle: tag('circle'),
    Ellipse: tag('ellipse'),
    G: tag('g'),
    Line: tag('line'),
    Path: tag('path'),
    Polyline: tag('polyline'),
    Rect: tag('rect'),
  };
});

// A gradient is a background. It decides no word on screen, and its native module warns loudly
// into the test output when asked to draw in a DOM.
vi.mock('expo-linear-gradient', async () => {
  const { View } = await import('react-native');
  return { LinearGradient: View };
});

afterEach(cleanup);
