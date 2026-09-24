import { describe, expect, it } from 'vitest';

import { formatDateTimeLabel } from '../src/lib/formatDate';
import { durationMinutes, formatTimeRange, TIME_SELECT_OPTIONS, timeSlotFromStartTime } from '../src/lib/time';

describe('timeSlotFromStartTime', () => {
  it('splits the day into three parts', () => {
    expect(timeSlotFromStartTime('07:00')).toBe('matin');
    expect(timeSlotFromStartTime('11:59')).toBe('matin');
    expect(timeSlotFromStartTime('12:00')).toBe('apres_midi');
    expect(timeSlotFromStartTime('17:30')).toBe('apres_midi');
    expect(timeSlotFromStartTime('18:00')).toBe('soir');
    expect(timeSlotFromStartTime('23:30')).toBe('soir');
  });
});

describe('durationMinutes', () => {
  it('works out how long a slot lasts', () => {
    expect(durationMinutes('09:00', '10:30')).toBe(90);
    expect(durationMinutes('18:15', '18:45')).toBe(30);
  });

  it('accepts Postgres time values, seconds included', () => {
    expect(durationMinutes('09:00:00', '11:00:00')).toBe(120);
  });
});

describe('formatTimeRange', () => {
  it('drops the seconds', () => {
    expect(formatTimeRange('07:00:00', '09:00:00')).toBe('07:00–09:00');
  });
});

describe('TIME_SELECT_OPTIONS', () => {
  it('groups every time by part of the day', () => {
    const groups = new Map(TIME_SELECT_OPTIONS.map((o) => [o.value, o.group]));
    expect([groups.get('06:00'), groups.get('11:30'), groups.get('12:00'), groups.get('17:30'), groups.get('18:00')]).toEqual([
      'Morning',
      'Morning',
      'Afternoon',
      'Afternoon',
      'Evening',
    ]);
    expect(TIME_SELECT_OPTIONS).toHaveLength(36);
  });
});

describe('formatDateTimeLabel', () => {
  it('writes the day and the time in English', () => {
    const label = formatDateTimeLabel('2026-09-17T17:20:00Z');
    expect(label).toMatch(/^Thursday, Sep 17/);
    expect(label).toMatch(/\d{2}:\d{2}/);
  });
});
