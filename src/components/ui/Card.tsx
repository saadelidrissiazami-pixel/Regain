import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { cardShadow } from '../../theme/shadows';
import { PressableScale } from './motion';

export type CardVariant = 'default' | 'tinted' | 'premium' | 'flat';

/**
 * A card: white ground, thin border, a shadow barely there. `tinted` is a sage ground (advice,
 * gentle information), `premium` is cream and gold, `flat` has no shadow (a card inside a card).
 */
export function Card({
  children,
  variant = 'default',
  padding = 18,
  radius = 20,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
  className,
}: {
  children: ReactNode;
  variant?: CardVariant;
  padding?: number;
  radius?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  const theme = useTheme();
  const base: ViewStyle = {
    borderRadius: radius,
    padding,
    backgroundColor:
      variant === 'tinted' ? theme.sage100 : variant === 'premium' ? theme.premium : theme.surface,
    borderWidth: variant === 'default' || variant === 'flat' ? 1 : 0,
    borderColor: theme.line,
    ...(variant === 'default' ? cardShadow(theme.scheme) : null),
  };

  if (onPress) {
    // PressableScale's animated container has to carry the size (flex, width) so the card behaves
    // in a row the way a non-clickable card does.
    const flat = StyleSheet.flatten(style) ?? {};
    const sizing: ViewStyle = { flex: flat.flex, width: flat.width, alignSelf: flat.alignSelf };
    return (
      <PressableScale
        wrapperStyle={sizing}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        className={className}
        style={[base, style]}
      >
        {children}
      </PressableScale>
    );
  }
  return (
    <View className={className} style={[base, style]} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}
