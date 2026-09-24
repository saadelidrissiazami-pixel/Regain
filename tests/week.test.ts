import { describe, expect, it } from 'vitest';

import { getDateForDayOfWeek, getWeekStart, toISODateUTC, toLocalISODate } from '../src/lib/week';

describe('getWeekStart', () => {
  it('returns the Monday of the current week', () => {
    // 2026-09-16 is a Wednesday
    expect(getWeekStart(new Date(2026, 8, 16, 12, 0))).toBe('2026-09-14');
  });

  it('attaches Sunday to the week just gone', () => {
    // 2026-09-20 is a Sunday: its Monday is the 14th, not the 21st
    expect(getWeekStart(new Date(2026, 8, 20, 23, 30))).toBe('2026-09-14');
  });

  it('handles a change of month', () => {
    // 2026-10-01 is a Thursday
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

  it('crosses the end of a month', () => {
    expect(getDateForDayOfWeek('2026-09-28', 6)).toBe('2026-10-04');
  });
});

describe('toLocalISODate', () => {
  it('keeps the local calendar date, not the UTC one', () => {
    // 00:30 local time: at UTC+2 that is still the previous day in UTC.
    const lateNight = new Date(2026, 8, 16, 0, 30);
    expect(toLocalISODate(lateNight)).toBe('2026-09-16');
  });

  it('agrees with toISODateUTC on explicit components', () => {
    expect(toLocalISODate(new Date(2026, 0, 1, 15, 0))).toBe(toISODateUTC(2026, 0, 1));
  });
});
