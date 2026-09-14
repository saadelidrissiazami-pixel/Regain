import { forwardRef } from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps,
  type TextProps,
} from 'react-native';

// React 19 ignore defaultProps sur les composants fonction (et le JSX runtime automatique
// ne les applique pas du tout) : le seul moyen fiable d'avoir Nunito par défaut partout est
// de passer par ces deux composants, utilisés à la place de ceux de react-native.
// Le style passé par l'appelant reste prioritaire sur la police par défaut.
const DEFAULT_FONT = { fontFamily: 'Nunito_400Regular' } as const;

type TextRef = React.ElementRef<typeof RNText>;
type TextInputRef = React.ElementRef<typeof RNTextInput>;

export const Text = forwardRef<TextRef, TextProps>(({ style, ...props }, ref) => (
  <RNText ref={ref} {...props} style={[DEFAULT_FONT, style]} />
));
Text.displayName = 'Text';

export const TextInput = forwardRef<TextInputRef, TextInputProps>(({ style, ...props }, ref) => (
  <RNTextInput ref={ref} {...props} style={[DEFAULT_FONT, style]} />
));
TextInput.displayName = 'TextInput';
