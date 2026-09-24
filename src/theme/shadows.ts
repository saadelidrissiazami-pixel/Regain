import type { ViewStyle } from 'react-native';

import type { ColorScheme } from './colors';

/** A shadow barely there: the card stands out by its border, not by floating. */
export function cardShadow(scheme: ColorScheme): ViewStyle {
  if (scheme === 'dark') return {};
  return {
    shadowColor: '#0F3028',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  };
}

/** For the things that really do float (a play button over a photo, a segment indicator). */
export function raisedShadow(scheme: ColorScheme): ViewStyle {
  if (scheme === 'dark') return {};
  return {
    shadowColor: '#0F3028',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  };
}
