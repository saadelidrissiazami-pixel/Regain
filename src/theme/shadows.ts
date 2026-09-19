import type { ViewStyle } from 'react-native';

import type { ColorScheme } from './colors';

/** Ombre à peine perceptible : la carte se détache par sa bordure, pas en flottant. */
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

/** Pour les éléments qui flottent vraiment (bouton lecture sur une photo, indicateur de segment). */
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
