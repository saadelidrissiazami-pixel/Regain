import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Nothing to show yet: say why and what can be done about it, with a single action. */
export function EmptyState({
  icon = 'leaf-outline',
  title,
  body,
  actionLabel,
  onAction,
  actionLoading,
  secondaryLabel,
  onSecondary,
  bare = false,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Without a card around it (when already inside one). */
  bare?: boolean;
}) {
  const theme = useTheme();
  const content = (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.sage100,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <Ionicons name={icon} size={26} color={theme.primary600} />
      </View>
      <Text variant="cardTitle" center>
        {title}
      </Text>
      {body ? (
        <Text variant="bodySm" tone="ink2" center style={{ marginTop: 6 }}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ alignSelf: 'stretch', marginTop: 18 }}>
          <Button label={actionLabel} onPress={onAction} loading={actionLoading} />
        </View>
      ) : null}
      {secondaryLabel && onSecondary ? (
        <View style={{ alignSelf: 'stretch', marginTop: 8 }}>
          <Button label={secondaryLabel} onPress={onSecondary} variant="ghost" />
        </View>
      ) : null}
    </View>
  );
  if (bare) return content;
  return <Card padding={24}>{content}</Card>;
}
