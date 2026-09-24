import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { themeLabel } from '../../features/wellbeing/catalogue';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { wellbeingTheme } from './wellbeingThemes';
import { t } from '../../lib/i18n';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** A wellbeing theme tile: coloured icon, name, number of sessions. */
export function CategoryTile({
  category,
  count,
  done,
  onPress,
}: {
  category: string;
  count: number;
  done: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const look = wellbeingTheme(category);
  const label = themeLabel(category);
  return (
    <Card
      padding={12}
      radius={18}
      onPress={onPress}
      accessibilityLabel={[
        label,
        count > 1 ? t('{count} sessions', { count }) : t('{count} session', { count }),
        done ? t('{count} done', { count: done }) : null,
      ]
        .filter(Boolean)
        .join(', ')}
      style={{ alignItems: 'center', minHeight: 116, justifyContent: 'center' }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: look.tint(theme),
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Ionicons name={look.icon as IconName} size={22} color={look.color(theme)} />
      </View>
      <Text variant="caption" center numberOfLines={2} style={{ fontWeight: '700', color: theme.ink }}>
        {label}
      </Text>
      <Text variant="caption" tone="ink2" center style={{ fontSize: 12 }}>
        {count > 1 ? t('{count} sessions', { count }) : t('{count} session', { count })}
      </Text>
    </Card>
  );
}
