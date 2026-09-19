import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { useTheme } from '../../theme/ThemeProvider';
import { raisedShadow } from '../../theme/shadows';
import { PressableScale } from './motion';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Icône cliquable de 44 × 44 : réglages, recherche, retour, fermer. */
export function IconButton({
  icon,
  label,
  onPress,
  variant = 'plain',
  size = 22,
  color,
}: {
  icon: IconName;
  /** Libellé lu par VoiceOver. */
  label: string;
  onPress: () => void;
  variant?: 'plain' | 'tinted' | 'surface' | 'primary';
  size?: number;
  color?: string;
}) {
  const theme = useTheme();
  const bg = {
    plain: 'transparent',
    tinted: theme.sage100,
    surface: theme.surface,
    primary: theme.primary,
  }[variant];
  const fg = color ?? (variant === 'primary' ? theme.onPrimary : theme.ink);
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.92}
      feedback="selection"
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={[
        { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: bg },
        variant === 'surface' ? raisedShadow(theme.scheme) : null,
      ]}
    >
      <Ionicons name={icon} size={size} color={fg} />
    </PressableScale>
  );
}
