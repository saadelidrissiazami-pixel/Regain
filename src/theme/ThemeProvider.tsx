import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState, View } from 'react-native';

import { PALETTES, slotForHour, themeVariables, type DaySlot, type Palette } from './palettes';

/** « auto » suit l'heure ; un moment précis fige la palette (utile à qui préfère toujours clair). */
export type ThemeMode = 'auto' | DaySlot;

const MODE_KEY = 'regain.theme.mode';
const REFRESH_MS = 5 * 60_000;

type ThemeValue = Palette & {
  slot: DaySlot;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeValue>({
  ...PALETTES.apres_midi,
  slot: 'apres_midi',
  mode: 'auto',
  setMode: () => {},
});

function useCurrentHour(): number {
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const refresh = () => setHour(new Date().getHours());
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const timer = setInterval(refresh, REFRESH_MS);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, []);
  return hour;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const hour = useCurrentHour();
  const [mode, setModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    AsyncStorage.getItem(MODE_KEY)
      .then((saved) => {
        if (saved === 'matin' || saved === 'apres_midi' || saved === 'soir') setModeState(saved);
      })
      .catch(() => {});
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    (next === 'auto' ? AsyncStorage.removeItem(MODE_KEY) : AsyncStorage.setItem(MODE_KEY, next)).catch(() => {});
  };

  const slot = mode === 'auto' ? slotForHour(hour) : mode;
  const palette = PALETTES[slot];

  const value = useMemo(() => ({ ...palette, slot, mode, setMode }), [palette, slot, mode]);
  // Les variables sont posées dès le premier rendu (seules leurs valeurs changent ensuite) :
  // NativeWind recrée sinon la vue et perd l'état de l'app.
  const rootStyle = useMemo(
    () => [{ flex: 1, backgroundColor: palette.paper }, vars(themeVariables(palette))],
    [palette]
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={palette.dark ? 'light' : 'dark'} />
      <View style={rootStyle}>{children}</View>
    </ThemeContext.Provider>
  );
}

/** Palette du moment, pour ce que les classes Tailwind ne couvrent pas (icônes, dégradés, interrupteurs). */
export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
