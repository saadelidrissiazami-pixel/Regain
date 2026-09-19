import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { ActivityRow } from '../../components/cards/ActivityRow';
import { MonthGrid } from '../../components/cards/MonthGrid';
import { WeekSelector, type DayMarker } from '../../components/cards/WeekSelector';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback';
import { Appear, Button, Screen, ScreenHeader, SegmentedControl, Text } from '../../components/ui';
import { relativeDayLabel } from '../../features/fitness/schedule';
import { resolveStartTime } from '../../features/planning/schedule';
import { usePlanning } from '../../hooks/usePlanning';
import { formatDayLabel } from '../../lib/formatDate';
import { fetchPlanRange, type PlannedActivityRow } from '../../lib/planning';
import { fromLocalISODate, getDateForDayOfWeek, toLocalISODate } from '../../lib/week';

type Mode = 'week' | 'month';

function markersOf(items: PlannedActivityRow[]): Record<string, DayMarker> {
  const markers: Record<string, DayMarker> = {};
  for (const item of items) {
    const marker = (markers[item.date] ??= { count: 0, done: 0 });
    marker.count += 1;
    if (item.status === 'realise') marker.done += 1;
  }
  return markers;
}

function groupByDay(items: PlannedActivityRow[], startOf: (item: PlannedActivityRow) => string) {
  const days = Array.from(new Set(items.map((item) => item.date))).sort();
  return days.map((date) => ({
    date,
    items: items.filter((item) => item.date === date).sort((a, b) => startOf(a).localeCompare(startOf(b))),
  }));
}

/** Planning complet : la semaine (ou le mois) en un coup d'œil, chaque activité cochable. */
export default function PlanningWeekScreen() {
  const planning = usePlanning();
  const { today, weekStart, items, planQuery, userId } = planning;
  const [mode, setMode] = useState<Mode>('week');
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => {
    const d = fromLocalISODate(today);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => getDateForDayOfWeek(weekStart, i)), [weekStart]);
  const weekMarkers = markersOf(items);

  const monthFrom = toLocalISODate(new Date(month.year, month.month, 1));
  const monthTo = toLocalISODate(new Date(month.year, month.month + 1, 0));
  const monthQuery = useQuery({
    queryKey: ['planRange', userId, monthFrom, monthTo],
    queryFn: () => fetchPlanRange(userId!, monthFrom, monthTo),
    enabled: !!userId && mode === 'month',
  });
  const monthItems = monthQuery.data ?? [];

  const startOf = (item: PlannedActivityRow) => resolveStartTime(item, planning.availability);
  const weekGroups = groupByDay(items.filter((item) => item.date >= selected), startOf);
  const dayItems = groupByDay(monthItems.filter((item) => item.date === selected), startOf);

  const renderGroup = ({ date, items: dayRows }: { date: string; items: PlannedActivityRow[] }, index: number) => (
    <Appear key={date} index={index}>
      <View style={{ marginBottom: 12 }}>
        <Text variant="label" style={{ marginBottom: 10 }} accessibilityRole="header">
          {date === today || relativeDayLabel(date, today, formatDayLabel) === 'Demain'
            ? `${relativeDayLabel(date, today, formatDayLabel)} · ${formatDayLabel(date)}`
            : formatDayLabel(date)}
        </Text>
        {dayRows.map((item) => (
          <ActivityRow
            key={item.id}
            time={startOf(item)}
            activity={item.activities_catalog}
            done={item.status === 'realise'}
            toggling={planning.isToggling(item)}
            onToggle={() => planning.toggle(item)}
            onPress={() => router.push(`/activity/${item.activities_catalog.id}`)}
          />
        ))}
      </View>
    </Appear>
  );

  const loading = mode === 'week' ? planQuery.isLoading : monthQuery.isLoading;
  const failed = mode === 'week' ? planQuery.isError : monthQuery.isError;

  return (
    <Screen
      refreshing={planning.refreshing}
      onRefresh={planning.refresh}
      footer={
        <Button label="Ajouter une activité" icon="add" onPress={() => router.push({ pathname: '/planning/add', params: { date: selected } })} />
      }
    >
      <ScreenHeader title="Planning" subtitle="Ta semaine en un coup d'œil" onBack={() => router.back()} />

      <SegmentedControl
        label="Affichage"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'week', label: 'Semaine' },
          { value: 'month', label: 'Mois' },
        ]}
      />

      <View style={{ marginTop: 16, marginBottom: 20 }}>
        {mode === 'week' ? (
          <WeekSelector days={weekDays} selected={selected} today={today} markers={weekMarkers} onSelect={setSelected} />
        ) : (
          <MonthGrid
            year={month.year}
            month={month.month}
            selected={selected}
            today={today}
            markers={markersOf(monthItems)}
            onSelect={setSelected}
            onPrev={() => setMonth(({ year, month: m }) => (m === 0 ? { year: year - 1, month: 11 } : { year, month: m - 1 }))}
            onNext={() => setMonth(({ year, month: m }) => (m === 11 ? { year: year + 1, month: 0 } : { year, month: m + 1 }))}
          />
        )}
      </View>

      {loading ? (
        <LoadingSkeleton preset="list" />
      ) : failed ? (
        <ErrorState onRetry={() => (mode === 'week' ? planQuery.refetch() : monthQuery.refetch())} />
      ) : mode === 'week' ? (
        items.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Aucune activité cette semaine"
            body="Prépare ta semaine depuis l'accueil, ou ajoute une activité toi-même."
          />
        ) : weekGroups.length === 0 ? (
          <EmptyState icon="moon-outline" title="Rien de prévu à partir de ce jour" body="Choisis un autre jour, ou ajoute une activité." />
        ) : (
          weekGroups.map(renderGroup)
        )
      ) : dayItems.length === 0 ? (
        <EmptyState bare icon="sunny-outline" title={`Rien de prévu le ${formatDayLabel(selected).toLowerCase()}`} />
      ) : (
        dayItems.map(renderGroup)
      )}
    </Screen>
  );
}
