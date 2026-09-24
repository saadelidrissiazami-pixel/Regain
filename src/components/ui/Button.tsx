import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { haptic, PressableScale } from './motion';
import { Text } from './Text';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

/**
 * An action button. One `primary` (solid dark green) per screen: that is the main action.
 * `secondary` (sage) and `outline` for alternatives, `ghost` for quieter action links.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  disabled,
  loading,
  fullWidth = true,
  align = 'flex-start',
  accessibilityHint,
  style,
  className,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'lg' | 'md' | 'sm';
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** Where it sits when the button does not fill the width. */
  align?: 'flex-start' | 'center';
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  const theme = useTheme();
  const colors = {
    primary: { bg: theme.primary, fg: theme.onPrimary, border: theme.primary },
    secondary: { bg: theme.sage100, fg: theme.primary700, border: theme.sage100 },
    outline: { bg: 'transparent', fg: theme.ink, border: theme.line },
    ghost: { bg: 'transparent', fg: theme.primary600, border: 'transparent' },
    destructive: { bg: theme.danger, fg: theme.dark ? theme.bg : '#FFFFFF', border: theme.danger },
  }[variant];
  const height = size === 'lg' ? 54 : size === 'md' ? 46 : 40;
  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      feedback={variant === 'primary' ? 'medium' : 'light'}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      wrapperStyle={[{ alignSelf: fullWidth ? 'stretch' : align }, style]}
      className={className}
      style={{
        minHeight: Math.max(height, 44),
        paddingHorizontal: size === 'sm' ? 14 : 20,
        borderRadius: 16,
        backgroundColor: colors.bg,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: colors.border,
        opacity: disabled ? 0.45 : 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={colors.fg} /> : null}
          <Text variant={size === 'sm' ? 'label' : 'cta'} tone="inherit" style={{ color: colors.fg }} numberOfLines={1}>
            {label}
          </Text>
          {iconRight ? <Ionicons name={iconRight} size={size === 'sm' ? 16 : 18} color={colors.fg} /> : null}
        </View>
      )}
    </PressableScale>
  );
}

/** A quiet inline action link (“See all →”, “Edit”). 44 px touch target. */
export function TextLink({
  label,
  onPress,
  icon = 'arrow-forward',
  tone = 'accent',
}: {
  label: string;
  onPress: () => void;
  icon?: IconName | null;
  tone?: 'accent' | 'ink2';
}) {
  const theme = useTheme();
  const color = tone === 'accent' ? theme.primary600 : theme.ink2;
  return (
    <PressableScale
      onPress={() => {
        haptic.selection();
        onPress();
      }}
      feedback={null}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={8}
      style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4 }}
    >
      <Text variant="label" tone="inherit" style={{ color }}>
        {label}
      </Text>
      {icon ? <Ionicons name={icon} size={15} color={color} /> : null}
    </PressableScale>
  );
}
