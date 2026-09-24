import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import type { WeekTrackerDay } from '../../features/fitness/schedule';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LONG = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/** The week's sessions: one circle per day, ticked once the session is done. */
export function WeekTracker({ days }: { days: WeekTrackerDay[] }) {
  const theme = useTheme();
  const done = days.filter((d) => d.done).length;
  const planned = days.filter((d) => d.isTraining).length;
  return (
    <Card padding={14} accessibilityLabel={`${done} of ${planned} sessions done this week`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {days.map((day) => {
          const size = 30;
          return (
            <View
              key={day.date}
              style={{ flex: 1, alignItems: 'center' }}
              accessible
              accessibilityLabel={`${LONG[day.dayIndex]}${day.isToday ? ", aujourd'hui" : ''} : ${
                day.done ? 'session done' : day.isTraining ? 'session planned' : 'rest'
              }`}
            >
              <Text
                variant="caption"
                tone="inherit"
                style={{ color: day.isToday ? theme.primary600 : theme.ink2, fontWeight: day.isToday ? '700' : '500' }}
                maxFontSizeMultiplier={1.2}
              >
                {SHORT[day.dayIndex]}
              </Text>
              <View
                style={{
                  marginTop: 6,
                  width: size + 8,
                  height: size + 8,
                  borderRadius: (size + 8) / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: day.isToday ? 1.5 : 0,
                  borderColor: theme.primary600,
                }}
              >
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: day.done ? theme.primary600 : day.isTraining ? theme.surface : theme.sage100,
                    borderWidth: day.done ? 0 : day.isTraining ? 1.5 : 0,
                    borderColor: theme.sage300,
                  }}
                >
                  {day.done ? <Ionicons name="checkmark" size={16} color={theme.dark ? theme.bg : '#FFFFFF'} /> : null}
                  {!day.done && day.isTraining ? <Ionicons name="barbell-outline" size={13} color={theme.ink3} /> : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <Text variant="caption" tone="ink2" center style={{ marginTop: 10 }}>
        {done} of {planned} sessions done this week
      </Text>
    </Card>
  );
}
