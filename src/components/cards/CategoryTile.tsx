import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { wellbeingTheme } from './wellbeingThemes';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Tuile de thème bien-être : icône colorée, nom, nombre de séances. */
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
  const t = wellbeingTheme(category);
  return (
    <Card
      padding={12}
      radius={18}
      onPress={onPress}
      accessibilityLabel={`${category}, ${count} séance${count > 1 ? 's' : ''}${done ? `, ${done} faite${done > 1 ? 's' : ''}` : ''}`}
      style={{ alignItems: 'center', minHeight: 116, justifyContent: 'center' }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: t.tint(theme),
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Ionicons name={t.icon as IconName} size={22} color={t.color(theme)} />
      </View>
      <Text variant="caption" center numberOfLines={2} style={{ fontWeight: '700', color: theme.ink }}>
        {category}
      </Text>
      <Text variant="caption" tone="ink2" center style={{ fontSize: 12 }}>
        {count} séance{count > 1 ? 's' : ''}
      </Text>
    </Card>
  );
}
