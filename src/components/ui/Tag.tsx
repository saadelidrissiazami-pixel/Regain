import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Text } from './Text';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Libellé de catégorie discret : un point de couleur + « MÉDITATION · 15 min ». */
export function Tag({ label, color, suffix }: { label: string; color?: string; suffix?: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 7, backgroundColor: color ?? theme.primary600 }} />
      <Text variant="overline" tone="ink2" numberOfLines={1}>
        {label}
        {suffix ? <Text variant="caption" tone="ink2" style={{ textTransform: 'none' }}>{` · ${suffix}`}</Text> : null}
      </Text>
    </View>
  );
}

export type PillTone = 'sage' | 'neutral' | 'premium' | 'primary' | 'onImage';

/** Petite pastille arrondie : badge d'état (« Adaptée à ta semaine allégée »), filtre, statut. */
export function Pill({ label, icon, tone = 'sage' }: { label: string; icon?: IconName; tone?: PillTone }) {
  const theme = useTheme();
  const colors = {
    sage: { bg: theme.sage100, fg: theme.primary700 },
    neutral: { bg: theme.bg, fg: theme.ink2 },
    premium: { bg: theme.premium, fg: theme.premiumInk },
    primary: { bg: theme.primary, fg: theme.onPrimary },
    onImage: { bg: 'rgba(255,255,255,0.85)', fg: '#102D27' },
  }[tone];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: colors.bg,
      }}
    >
      {icon ? <Ionicons name={icon} size={13} color={colors.fg} /> : null}
      <Text variant="caption" tone="inherit" style={{ color: colors.fg }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
