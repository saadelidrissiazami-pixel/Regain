import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { getToday, getWeekStart } from './week';
import { getUpcomingDates } from './upcomingDates';

// Une app mobile reste des jours en mémoire. Calculer ces valeurs au chargement du
// module figeait « cette semaine » et « aujourd'hui » sur la date de démarrage :
// le lundi matin, l'utilisateur voyait encore le planning de la semaine écoulée et
// le régénérait par-dessus. On réévalue au retour au premier plan et à minuit.
export function useToday(): string {
  const [today, setToday] = useState(getToday);

  useEffect(() => {
    const sync = () =>
      setToday((previous) => {
        const next = getToday();
        return next === previous ? previous : next;
      });

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    const timer = setInterval(sync, 60_000);

    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, []);

  return today;
}

export function useWeekStart(): string {
  const today = useToday();
  // Midi local : à l'abri des décalages de fuseau au passage à l'heure d'été.
  return useMemo(() => getWeekStart(new Date(`${today}T12:00:00`)), [today]);
}

export function useUpcomingDates(count = 14) {
  const today = useToday();
  return useMemo(() => getUpcomingDates(count, new Date(`${today}T12:00:00`)), [today, count]);
}
