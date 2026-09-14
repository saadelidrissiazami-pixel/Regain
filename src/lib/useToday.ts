import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { getToday, getWeekStart } from './week';
import { getUpcomingDates } from './upcomingDates';

// Une app mobile reste des jours en mémoire. Calculer ces valeurs au chargement du
// module figeait « cette semaine » et « aujourd'hui » sur la date de démarrage :
// le lundi matin, l'utilisateur voyait encore le planning de la semaine écoulée et
// le régénérait par-dessus. On les réévalue au retour au premier plan et à minuit.
function useDailyValue<T>(compute: () => T, isEqual: (a: T, b: T) => boolean): T {
  const [value, setValue] = useState(compute);

  useEffect(() => {
    const sync = () => setValue((prev) => {
      const next = compute();
      return isEqual(prev, next) ? prev : next;
    });

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    const timer = setInterval(sync, 60_000);

    return () => {
      subscription.remove();
      clearInterval(timer);
    };
    // compute/isEqual sont stables par appelant (fonctions de module).
  }, []);

  return value;
}

const sameString = (a: string, b: string) => a === b;

export function useWeekStart(): string {
  return useDailyValue(() => getWeekStart(), sameString);
}

export function useToday(): string {
  return useDailyValue(getToday, sameString);
}

export function useUpcomingDates(count = 14) {
  return useDailyValue(
    () => getUpcomingDates(count),
    (a, b) => a.length === b.length && a.every((d, i) => d.value === b[i].value)
  );
}
