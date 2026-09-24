import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import { t } from '../../lib/i18n';
import { useTheme } from '../../theme/ThemeProvider';
import { TextLink } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

const LONG = 170;

/** A word from the coach: short by default, expandable. */
export function CoachCard({ message, title }: { message: string; title?: string }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const heading = title ?? t('A word from your coach');
  const long = message.length > LONG;
  return (
    <Card padding={16}>
      <View style={{ flexDirection: 'row' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.sage200,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
          accessibilityElementsHidden
        >
          <Ionicons name="leaf" size={20} color={theme.primary700} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="label">{heading}</Text>
          <Text variant="bodySm" tone="ink2" style={{ marginTop: 4 }} numberOfLines={open ? undefined : 4}>
            {message}
          </Text>
          {long ? (
            <View style={{ alignSelf: 'flex-end' }}>
              <TextLink label={open ? 'Show less' : 'Show more'} icon={open ? 'chevron-up' : 'arrow-forward'} onPress={() => setOpen((v) => !v)} />
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
