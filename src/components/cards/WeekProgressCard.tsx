import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/motion';
import { Text } from '../ui/Text';
import { t } from '../../lib/i18n';

/** The week's progress: “3 of 8 activities”, a bar and a percentage. */
export function WeekProgressCard({ done, total, onPress }: { done: number; total: number; onPress?: () => void }) {
  const theme = useTheme();
  const ratio = total > 0 ? done / total : 0;
  const percent = Math.round(ratio * 100);
  return (
    <Card
      padding={16}
      onPress={onPress}
      accessibilityLabel={t('Your progress this week: {done} of {total} activities, {percent}%', { done, total, percent })}
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
          <Text variant="label">{t('Your progress this week')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 }}>
            <Text variant="caption" tone="ink2" tabular>
              {done} of {total} activit{total > 1 ? 'ies' : 'y'}
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
