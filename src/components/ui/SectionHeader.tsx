import { View } from 'react-native';

import { TextLink } from './Button';
import { Text } from './Text';

/** A section title, with a quiet action link on the right (“See all →”). */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
  subtitle,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  subtitle?: string;
}) {
  return (
    <View style={{ marginBottom: 12, minHeight: 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="section" accessibilityRole="header" style={{ flex: 1, paddingRight: 8 }}>
          {title}
        </Text>
        {actionLabel && onAction ? <TextLink label={actionLabel} onPress={onAction} /> : null}
      </View>
      {subtitle ? (
        <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
