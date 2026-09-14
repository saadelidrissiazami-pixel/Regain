import { describe, expect, it } from 'vitest';

import { getDateForDayOfWeek, getWeekStart, toISODateUTC, toLocalISODate } from '../src/lib/week';

describe('getWeekStart', () => {
  it('renvoie le lundi de la semaine en cours', () => {
    // 2026-09-16 est un mercredi
    expect(getWeekStart(new Date(2026, 8, 16, 12, 0))).toBe('2026-09-14');
  });

  it('rattache le dimanche à la semaine qui vient de s’écouler', () => {
    // 2026-09-20 est un dimanche : son lundi est le 14, pas le 21
    expect(getWeekStart(new Date(2026, 8, 20, 23, 30))).toBe('2026-09-14');
  });

  it('gère un changement de mois', () => {
    // 2026-10-01 est un jeudi
    expect(getWeekStart(new Date(2026, 9, 1, 8, 0))).toBe('2026-09-28');
  });

  it('ne dépend pas de l’heure de la journée', () => {
    expect(getWeekStart(new Date(2026, 8, 16, 0, 5))).toBe(getWeekStart(new Date(2026, 8, 16, 23, 55)));
  });
});

describe('getDateForDayOfWeek', () => {
  it('décale depuis le lundi de la semaine', () => {
    expect(getDateForDayOfWeek('2026-09-14', 0)).toBe('2026-09-14');
    expect(getDateForDayOfWeek('2026-09-14', 6)).toBe('2026-09-20');
  });

  it('franchit une fin de mois', () => {
    expect(getDateForDayOfWeek('2026-09-28', 6)).toBe('2026-10-04');
  });
});

describe('toLocalISODate', () => {
  it('garde la date du calendrier local, pas la date UTC', () => {
    // 00h30 heure locale : en UTC+2 c'est encore la veille côté UTC.
    const lateNight = new Date(2026, 8, 16, 0, 30);
    expect(toLocalISODate(lateNight)).toBe('2026-09-16');
  });

  it('est cohérent avec toISODateUTC sur des composantes explicites', () => {
    expect(toLocalISODate(new Date(2026, 0, 1, 15, 0))).toBe(toISODateUTC(2026, 0, 1));
  });
});
