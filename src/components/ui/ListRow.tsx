import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { PressableScale } from './motion';
import { Text } from './Text';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** A list row: icon, title, detail, and a chevron when it leads somewhere. */
export function ListRow({
  icon,
  iconColor,
  title,
  subtitle,
  right,
  onPress,
  chevron = true,
  divider = false,
  compact = false,
  subtitleLines = 2,
}: {
  icon?: IconName;
  iconColor?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  divider?: boolean;
  compact?: boolean;
  subtitleLines?: number;
}) {
  const theme = useTheme();
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: compact ? 48 : 60,
        paddingVertical: compact ? 8 : 12,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: theme.divider,
      }}
    >
      {icon ? (
        <View
          style={{
            width: compact ? 32 : 38,
            height: compact ? 32 : 38,
            borderRadius: 12,
            backgroundColor: theme.sage100,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name={icon} size={compact ? 17 : 19} color={iconColor ?? theme.primary600} />
        </View>
      ) : null}
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text variant={compact ? 'label' : 'bodyStrong'} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="ink2" style={{ marginTop: 2 }} numberOfLines={subtitleLines}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {onPress && chevron ? <Ionicons name="chevron-forward" size={18} color={theme.ink3} /> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}>
      {content}
    </PressableScale>
  );
}
