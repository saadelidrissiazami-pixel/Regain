import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme, View } from 'react-native';

import { PALETTES, themeVariables, type ColorScheme, type Palette } from './colors';

/** “auto” follows the device's light / dark setting. */
export type ThemeMode = 'auto' | ColorScheme;

const MODE_KEY = 'regain.theme.mode';

type ThemeValue = Palette & {
  scheme: ColorScheme;
  dark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeValue>({
  ...PALETTES.light,
  scheme: 'light',
  dark: false,
  mode: 'auto',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    AsyncStorage.getItem(MODE_KEY)
      .then((saved) => {
        // The old values (matin / apres-midi / soir) fall back to “auto”.
        if (saved === 'light' || saved === 'dark') setModeState(saved);
      })
      .catch(() => {});
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    (next === 'auto' ? AsyncStorage.removeItem(MODE_KEY) : AsyncStorage.setItem(MODE_KEY, next)).catch(() => {});
  };

  const scheme: ColorScheme = mode === 'auto' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const palette = PALETTES[scheme];

  const value = useMemo(
    () => ({ ...palette, scheme, dark: scheme === 'dark', mode, setMode }),
    [palette, scheme, mode]
  );
  // The variables are set on the first render (only their values change afterwards): otherwise
  // NativeWind recreates the view and loses the app's state.
  const rootStyle = useMemo(() => [{ flex: 1, backgroundColor: palette.bg }, vars(themeVariables(palette))], [palette]);

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={rootStyle}>{children}</View>
    </ThemeContext.Provider>
  );
}

/** The active palette, for what Tailwind classes do not cover (icons, SVG, gradients). */
export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
