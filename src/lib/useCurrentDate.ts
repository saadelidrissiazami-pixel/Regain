import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { getUpcomingDates } from './upcomingDates';
import { fromLocalISODate, getWeekStart, toLocalISODate } from './week';

// A mobile app stays in memory for days: computing the date when the module loads would leave
// the user living in last week until the next full restart.
// So it is recomputed on returning to the foreground, and only if the day really changed.
export function useToday(): string {
  const [today, setToday] = useState(() => toLocalISODate(new Date()));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(toLocalISODate(new Date()));
    });
    return () => subscription.remove();
  }, []);

  return today;
}

export function useWeekStart(): string {
  const today = useToday();
  return useMemo(() => getWeekStart(fromLocalISODate(today)), [today]);
}

export function useUpcomingDates(count = 14) {
  const today = useToday();
  return useMemo(() => getUpcomingDates(count, fromLocalISODate(today)), [today, count]);
}
