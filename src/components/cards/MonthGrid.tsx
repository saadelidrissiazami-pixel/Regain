import { View } from 'react-native';

import { toLocalISODate } from '../../lib/week';
import { useTheme } from '../../theme/ThemeProvider';
import { IconButton } from '../ui/IconButton';
import { PressableScale } from '../ui/motion';
import { Text } from '../ui/Text';
import type { DayMarker } from './WeekSelector';

const HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTH_FORMATTER = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

/** Dates affichées pour un mois (semaines complètes, du lundi au dimanche). */
export function monthCells(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(toLocalISODate(new Date(year, month, day)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Vue mensuelle : un point sous chaque jour qui a des activités. */
export function MonthGrid({
  year,
  month,
  selected,
  today,
  markers,
  onSelect,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  selected: string;
  today: string;
  markers: Record<string, DayMarker | undefined>;
  onSelect: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const theme = useTheme();
  const cells = monthCells(year, month);
  const label = MONTH_FORMATTER.format(new Date(year, month, 1));
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <IconButton icon="chevron-back" label="Mois précédent" onPress={onPrev} size={20} />
        <Text variant="cardTitle" accessibilityRole="header" style={{ textTransform: 'capitalize' }}>
          {label}
        </Text>
        <IconButton icon="chevron-forward" label="Mois suivant" onPress={onNext} size={20} />
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {HEADERS.map((h, i) => (
          <Text key={i} variant="caption" tone="ink3" center style={{ flex: 1 }} accessibilityElementsHidden>
            {h}
          </Text>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((date, c) =>
            date ? (
              <PressableScale
                key={date}
                onPress={() => onSelect(date)}
                feedback="selection"
                accessibilityRole="button"
                accessibilityState={{ selected: date === selected }}
                accessibilityLabel={`${new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}${
                  markers[date]?.count ? `, ${markers[date]!.count} activité${markers[date]!.count > 1 ? 's' : ''}` : ''
                }`}
                wrapperStyle={{ flex: 1 }}
                style={{ alignItems: 'center', paddingVertical: 4 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: date === selected ? theme.primary : 'transparent',
                    borderWidth: date === today && date !== selected ? 1 : 0,
                    borderColor: theme.primary600,
                  }}
                >
                  <Text
                    variant="label"
                    tone="inherit"
                    tabular
                    maxFontSizeMultiplier={1.2}
                    style={{ color: date === selected ? theme.onPrimary : date < today ? theme.ink3 : theme.ink }}
                  >
                    {Number(date.slice(8))}
                  </Text>
                </View>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    marginTop: 3,
                    backgroundColor: markers[date]?.count ? theme.primary500 : 'transparent',
                  }}
                />
              </PressableScale>
            ) : (
              <View key={`empty-${r}-${c}`} style={{ flex: 1 }} />
            )
          )}
        </View>
      ))}
    </View>
  );
}
