import { describe, expect, it } from 'vitest';

import { durationMinutes, formatTimeRange, timeSlotFromStartTime } from '../src/lib/time';

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
