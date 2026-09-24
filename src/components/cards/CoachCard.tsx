import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { TextLink } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

const LONG = 170;

/** Le mot du coach : court par défaut, dépliable. */
export function CoachCard({ message, title = 'A word from your coach' }: { message: string; title?: string }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
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
          <Text variant="label">{title}</Text>
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
