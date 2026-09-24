import { forwardRef } from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  type TextProps as RNTextProps,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { font, TABULAR, variantMaxScale, variantStyle, type TextVariant } from '../../theme/typography';

export type TextTone =
  | 'ink'
  | 'ink2'
  | 'ink3'
  | 'accent'
  | 'onPrimary'
  | 'danger'
  | 'premium'
  | 'white'
  | 'inherit';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  /** Tabular figures (times, counters). */
  tabular?: boolean;
  center?: boolean;
};

// React 19 ignores defaultProps on function components, so the default font and colour come
// through this component, used in place of react-native's own. The style of
// l'appelant reste prioritaire.
export const Text = forwardRef<RNText, TextProps>(
  ({ variant = 'body', tone = 'ink', tabular, center, style, maxFontSizeMultiplier, ...props }, ref) => {
    const theme = useTheme();
    const color =
      tone === 'inherit'
        ? undefined
        : {
            ink: theme.ink,
            ink2: theme.ink2,
            ink3: theme.ink3,
            accent: theme.primary600,
            onPrimary: theme.onPrimary,
            danger: theme.danger,
            premium: theme.premiumInk,
            white: '#FFFFFF',
          }[tone];
    return (
      <RNText
        ref={ref}
        maxFontSizeMultiplier={maxFontSizeMultiplier ?? variantMaxScale(variant)}
        {...props}
        style={[
          variantStyle(variant),
          color ? { color } : null,
          tabular ? TABULAR : null,
          center ? { textAlign: 'center' } : null,
          style,
        ]}
      />
    );
  }
);
Text.displayName = 'Text';

export const TextInput = forwardRef<RNTextInput, RNTextInputProps>(({ style, placeholderTextColor, ...props }, ref) => {
  const theme = useTheme();
  return (
    <RNTextInput
      ref={ref}
      maxFontSizeMultiplier={1.6}
      {...props}
      placeholderTextColor={placeholderTextColor ?? theme.ink3}
      style={[font(400), { fontSize: 16, color: theme.ink }, style]}
    />
  );
});
TextInput.displayName = 'TextInput';
