import { describe, expect, it } from 'vitest';

import { getDateForDayOfWeek, getWeekStart, toISODateUTC, toLocalISODate } from '../src/lib/week';

describe('getWeekStart', () => {
  it('renvoie le lundi de la semaine en cours', () => {
    // 2026-09-16 est un mercredi
    expect(getWeekStart(new Date(2026, 8, 16, 12, 0))).toBe('2026-09-14');
  });

  it('attaches Sunday to the week just gone', () => {
    // 2026-09-20 est un dimanche : son lundi est le 14, pas le 21
    expect(getWeekStart(new Date(2026, 8, 20, 23, 30))).toBe('2026-09-14');
  });

  it('handles a change of month', () => {
    // 2026-10-01 est un jeudi
    expect(getWeekStart(new Date(2026, 9, 1, 8, 0))).toBe('2026-09-28');
  });

  it('does not depend on the time of day', () => {
    expect(getWeekStart(new Date(2026, 8, 16, 0, 5))).toBe(getWeekStart(new Date(2026, 8, 16, 23, 55)));
  });
});

describe('getDateForDayOfWeek', () => {
  it('offsets from the Monday of the week', () => {
    expect(getDateForDayOfWeek('2026-09-14', 0)).toBe('2026-09-14');
    expect(getDateForDayOfWeek('2026-09-14', 6)).toBe('2026-09-20');
  });

  it('franchit une fin de mois', () => {
    expect(getDateForDayOfWeek('2026-09-28', 6)).toBe('2026-10-04');
  });
});

describe('toLocalISODate', () => {
  it('garde la date du calendrier local, pas la date UTC', () => {
    // 00:30 local time: at UTC+2 that is still the previous day in UTC.
    const lateNight = new Date(2026, 8, 16, 0, 30);
    expect(toLocalISODate(lateNight)).toBe('2026-09-16');
  });

  it('agrees with toISODateUTC on explicit components', () => {
    expect(toLocalISODate(new Date(2026, 0, 1, 15, 0))).toBe(toISODateUTC(2026, 0, 1));
  });
});
