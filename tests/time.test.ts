import { describe, expect, it } from 'vitest';

import { durationMinutes, formatTimeRange, TIME_SELECT_OPTIONS, timeSlotFromStartTime } from '../src/lib/time';

describe('timeSlotFromStartTime', () => {
  it('classe la journée en trois créneaux', () => {
    expect(timeSlotFromStartTime('07:00')).toBe('matin');
    expect(timeSlotFromStartTime('11:59')).toBe('matin');
    expect(timeSlotFromStartTime('12:00')).toBe('apres_midi');
    expect(timeSlotFromStartTime('17:30')).toBe('apres_midi');
    expect(timeSlotFromStartTime('18:00')).toBe('soir');
    expect(timeSlotFromStartTime('23:30')).toBe('soir');
  });
});

describe('durationMinutes', () => {
  it('calcule la durée d’un créneau', () => {
    expect(durationMinutes('09:00', '10:30')).toBe(90);
    expect(durationMinutes('18:15', '18:45')).toBe(30);
  });

  it('accepte le format time de Postgres (avec secondes)', () => {
    expect(durationMinutes('09:00:00', '11:00:00')).toBe(120);
  });
});

describe('formatTimeRange', () => {
  it('coupe les secondes', () => {
    expect(formatTimeRange('07:00:00', '09:00:00')).toBe('07:00–09:00');
  });
});

describe('TIME_SELECT_OPTIONS', () => {
  it('groupe chaque horaire par moment de la journée', () => {
    const groups = new Map(TIME_SELECT_OPTIONS.map((o) => [o.value, o.group]));
    expect([groups.get('06:00'), groups.get('11:30'), groups.get('12:00'), groups.get('17:30'), groups.get('18:00')]).toEqual([
      'Matin',
      'Matin',
      'Après-midi',
      'Après-midi',
      'Soir',
    ]);
    expect(TIME_SELECT_OPTIONS).toHaveLength(36);
  });
});
