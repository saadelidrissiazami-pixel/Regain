import { describe, expect, it } from 'vitest';

import type { AvailabilitySlot, TimeSlot } from '../src/features/availability/types';
import type { CatalogActivity } from '../src/features/planning/catalog';
import { generateWeeklyPlan } from '../src/features/planning/ruleEngine';

const WEEK_START = '2026-09-14'; // un lundi

function slot(overrides: Partial<AvailabilitySlot> & { time_slot: TimeSlot }): AvailabilitySlot {
  return {
    id: `slot-${Math.random()}`,
    user_id: 'user-1',
    label: null,
    is_recurring: true,
    day_of_week: 0,
    specific_date: null,
    start_time: '09:00',
    end_time: '11:00',
    created_at: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

function activity(overrides: Partial<CatalogActivity> & { id: string }): CatalogActivity {
  return {
    title: `Activity ${overrides.id}`,
    category: 'physique',
    duration_minutes: 30,
    energy_required: 'bas',
    indoor_outdoor: 'indifferent',
    cost_level: 'gratuit',
    instructions: null,
    first_action: null,
    stop_rule: null,
    tags: [],
    steps: [],
    ...overrides,
  };
}

const baseParams = {
  primaryGoals: [],
  energyBySlot: {},
  budgetLevel: 'confortable' as const,
  weekStart: WEEK_START,
};

describe('generateWeeklyPlan', () => {
  it('places one activity per available slot', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      availability: [slot({ day_of_week: 0, time_slot: 'matin' }), slot({ day_of_week: 2, time_slot: 'soir' })],
      catalog: [activity({ id: 'a' }), activity({ id: 'b', category: 'relaxation' })],
    });

    expect(plan).toHaveLength(2);
    expect(plan.map((item) => item.date)).toEqual(['2026-09-14', '2026-09-16']);
  });

  it('excludes the activities longer than the slot', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      availability: [slot({ time_slot: 'matin', start_time: '09:00', end_time: '09:30' })],
      catalog: [activity({ id: 'longue', duration_minutes: 60 })],
    });

    expect(plan).toHaveLength(0);
  });

  it('respects the energy available in that slot', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      energyBySlot: { matin: 'bas' },
      availability: [slot({ time_slot: 'matin' })],
      catalog: [activity({ id: 'intense', energy_required: 'eleve' })],
    });

    expect(plan).toHaveLength(0);
  });

  it('respects the budget', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      budgetLevel: 'gratuit',
      availability: [slot({ time_slot: 'matin' })],
      catalog: [activity({ id: 'payante', cost_level: 'modere' })],
    });

    expect(plan).toHaveLength(0);
  });

  it('favours the activities that serve the person’s goals', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      primaryGoals: ['mieux_dormir'],
      availability: [slot({ time_slot: 'matin' })],
      catalog: [activity({ id: 'neutre' }), activity({ id: 'ciblee', tags: ['mieux_dormir'] })],
    });

    expect(plan[0].activity.id).toBe('ciblee');
  });

  it('does not regenerate a slot already taken by a completed activity', () => {
    const kept = {
      date: '2026-09-14',
      timeSlot: 'matin' as const,
      activity: activity({ id: 'already-done' }),
    };

    const plan = generateWeeklyPlan({
      ...baseParams,
      availability: [slot({ day_of_week: 0, time_slot: 'matin' }), slot({ day_of_week: 1, time_slot: 'matin' })],
      catalog: [activity({ id: 'a' })],
      keptItems: [kept],
    });

    expect(plan.map((item) => item.date)).toEqual(['2026-09-15']);
  });

  it('avoids offering again an activity already done this week', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      availability: [slot({ day_of_week: 1, time_slot: 'matin' })],
      catalog: [activity({ id: 'already-done' }), activity({ id: 'another' })],
      keptItems: [{ date: '2026-09-14', timeSlot: 'matin', activity: activity({ id: 'already-done' }) }],
    });

    expect(plan[0].activity.id).toBe('another');
  });

  it('ignores one-off dates outside the week asked for', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      availability: [
        slot({ is_recurring: false, day_of_week: null, specific_date: '2026-09-30', time_slot: 'matin' }),
      ],
      catalog: [activity({ id: 'a' })],
    });

    expect(plan).toHaveLength(0);
  });
});
