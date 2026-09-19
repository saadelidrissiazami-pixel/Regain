import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/motion';
import { Text } from '../ui/Text';

/** Progression de la semaine : « 3 sur 8 activités », barre et pourcentage. */
export function WeekProgressCard({ done, total, onPress }: { done: number; total: number; onPress?: () => void }) {
  const theme = useTheme();
  const ratio = total > 0 ? done / total : 0;
  const percent = Math.round(ratio * 100);
  return (
    <Card
      padding={16}
      onPress={onPress}
      accessibilityLabel={`Ta progression cette semaine : ${done} sur ${total} activités, ${percent} %`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: theme.sage100,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="calendar-outline" size={20} color={theme.primary600} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="label">Ta progression cette semaine</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 }}>
            <Text variant="caption" tone="ink2" tabular>
              {done} sur {total} activité{total > 1 ? 's' : ''}
            </Text>
            <View style={{ flex: 1 }}>
              <ProgressBar progress={ratio} height={6} />
            </View>
            <Text variant="caption" tabular style={{ minWidth: 36, textAlign: 'right' }}>
              {percent} %
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
