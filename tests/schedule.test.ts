import { describe, expect, it } from 'vitest';

import type { AvailabilitySlot } from '../src/features/availability/types';
import { activityStartDate, buildCalendarEvents, resolveStartTime } from '../src/features/planning/schedule';

function slot(overrides: Partial<AvailabilitySlot>): AvailabilitySlot {
  return {
    id: Math.random().toString(36),
    user_id: 'u1',
    label: null,
    is_recurring: true,
    day_of_week: 0,
    specific_date: null,
    time_slot: 'soir',
    start_time: '18:30',
    end_time: '20:00',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// 2026-09-14 est un lundi.
const MONDAY = '2026-09-14';

describe('the start time of activities', () => {
  it('takes the start of that day’s recurring availability', () => {
    expect(resolveStartTime({ date: MONDAY, time_slot: 'soir' }, [slot({})])).toBe('18:30');
  });

  it('ignores availability on other days or in other slots', () => {
    const availability = [slot({ day_of_week: 1 }), slot({ time_slot: 'matin', start_time: '07:00:00' })];
    expect(resolveStartTime({ date: MONDAY, time_slot: 'soir' }, availability)).toBe('19:00');
  });

  it('prefers a one-off availability over the recurring one, and drops the seconds', () => {
    const availability = [slot({}), slot({ is_recurring: false, day_of_week: null, specific_date: MONDAY, start_time: '20:15:00' })];
    expect(resolveStartTime({ date: MONDAY, time_slot: 'soir' }, availability)).toBe('20:15');
  });

  it('falls back to the slot’s default time when there is no availability', () => {
    expect(resolveStartTime({ date: MONDAY, time_slot: 'matin' }, [])).toBe('09:00');
  });

  it('construit une date locale', () => {
    const start = activityStartDate({ date: MONDAY, time_slot: 'soir' }, [slot({})]);
    expect([start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes()]).toEqual([2026, 8, 14, 18, 30]);
  });
});

describe('buildCalendarEvents', () => {
  const activity = { id: 'a1', title: 'Marche rapide', duration_minutes: 30, instructions: 'Rythme soutenu.' };

  it('lasts as long as the activity and links back to the app', () => {
    const [event] = buildCalendarEvents([{ date: MONDAY, time_slot: 'soir', status: 'propose', activities_catalog: activity }], [slot({})]);
    expect(event.title).toBe('Marche rapide');
    expect(event.endDate.getTime() - event.startDate.getTime()).toBe(30 * 60_000);
    expect(event.notes).toBe('Rythme soutenu.\n\nOuvrir dans Regain : regain://activity/a1');
  });

  it('marks the activities already done', () => {
    const [event] = buildCalendarEvents(
      [{ date: MONDAY, time_slot: 'soir', status: 'realise', activities_catalog: { ...activity, instructions: null } }],
      []
    );
    expect(event.title).toBe('✓ Marche rapide');
    expect(event.notes).toBe('Ouvrir dans Regain : regain://activity/a1');
  });
});
