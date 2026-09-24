import { View } from 'react-native';

import { fromLocalISODate } from '../../lib/week';
import { useTheme } from '../../theme/ThemeProvider';
import { PressableScale } from '../ui/motion';
import { Text } from '../ui/Text';

const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LONG_DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export type DayMarker = { count: number; done: number };

/** The 7 days of the week. The chosen day in solid green, today underlined, a dot for activities. */
export function WeekSelector({
  days,
  selected,
  today,
  markers,
  onSelect,
}: {
  days: string[];
  selected: string;
  today: string;
  markers: Record<string, DayMarker | undefined>;
  onSelect: (date: string) => void;
}) {
  const theme = useTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
      {days.map((date, i) => {
        const isSelected = date === selected;
        const isToday = date === today;
        const marker = markers[date];
        const allDone = !!marker && marker.count > 0 && marker.done === marker.count;
        const dayNumber = fromLocalISODate(date).getDate();
        return (
          <PressableScale
            key={date}
            onPress={() => onSelect(date)}
            feedback="selection"
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${LONG_DAYS[i]} ${dayNumber}${isToday ? ', today' : ''}${
              marker?.count ? `, ${marker.count} activit${marker.count > 1 ? 'ies' : 'y'}` : ''
            }`}
            wrapperStyle={{ flex: 1 }}
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              borderRadius: 14,
              minHeight: 64,
              backgroundColor: isSelected ? theme.primary : 'transparent',
              borderWidth: isToday && !isSelected ? 1 : 0,
              borderColor: theme.primary600,
            }}
          >
            <Text variant="caption" tone="inherit" style={{ color: isSelected ? theme.onPrimary : theme.ink2 }} maxFontSizeMultiplier={1.2}>
              {SHORT_DAYS[i]}
            </Text>
            <Text
              variant="bodyStrong"
              tone="inherit"
              tabular
              style={{ color: isSelected ? theme.onPrimary : theme.ink, marginTop: 2 }}
              maxFontSizeMultiplier={1.2}
            >
              {dayNumber}
            </Text>
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                marginTop: 4,
                backgroundColor: marker?.count
                  ? isSelected
                    ? theme.onPrimary
                    : allDone
                      ? theme.primary600
                      : theme.primary500
                  : 'transparent',
              }}
            />
          </PressableScale>
        );
      })}
    </View>
  );
}
