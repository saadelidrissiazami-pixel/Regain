import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { getUpcomingDates } from './upcomingDates';
import { fromLocalISODate, getWeekStart, toLocalISODate } from './week';

// Une app mobile reste en mémoire plusieurs jours : calculer la date au chargement du module
// ferait vivre l'utilisateur dans la semaine passée jusqu'au prochain redémarrage complet.
// On recalcule donc au retour au premier plan, et seulement si le jour a réellement changé.
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
