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
    title: `Activité ${overrides.id}`,
    category: 'physique',
    duration_minutes: 30,
    energy_required: 'bas',
    indoor_outdoor: 'indifferent',
    cost_level: 'gratuit',
    instructions: null,
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
  it('place une activité par créneau disponible', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      availability: [slot({ day_of_week: 0, time_slot: 'matin' }), slot({ day_of_week: 2, time_slot: 'soir' })],
      catalog: [activity({ id: 'a' }), activity({ id: 'b', category: 'relaxation' })],
    });

    expect(plan).toHaveLength(2);
    expect(plan.map((item) => item.date)).toEqual(['2026-09-14', '2026-09-16']);
  });

  it('exclut les activités plus longues que le créneau', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      availability: [slot({ time_slot: 'matin', start_time: '09:00', end_time: '09:30' })],
      catalog: [activity({ id: 'longue', duration_minutes: 60 })],
    });

    expect(plan).toHaveLength(0);
  });

  it("respecte l'énergie disponible sur le créneau", () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      energyBySlot: { matin: 'bas' },
      availability: [slot({ time_slot: 'matin' })],
      catalog: [activity({ id: 'intense', energy_required: 'eleve' })],
    });

    expect(plan).toHaveLength(0);
  });

  it('respecte le budget', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      budgetLevel: 'gratuit',
      availability: [slot({ time_slot: 'matin' })],
      catalog: [activity({ id: 'payante', cost_level: 'modere' })],
    });

    expect(plan).toHaveLength(0);
  });

  it('privilégie les activités qui servent les objectifs de la personne', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      primaryGoals: ['mieux_dormir'],
      availability: [slot({ time_slot: 'matin' })],
      catalog: [activity({ id: 'neutre' }), activity({ id: 'ciblee', tags: ['mieux_dormir'] })],
    });

    expect(plan[0].activity.id).toBe('ciblee');
  });

  it('ne regénère pas un créneau déjà occupé par une activité réalisée', () => {
    const kept = {
      date: '2026-09-14',
      timeSlot: 'matin' as const,
      activity: activity({ id: 'deja-faite' }),
    };

    const plan = generateWeeklyPlan({
      ...baseParams,
      availability: [slot({ day_of_week: 0, time_slot: 'matin' }), slot({ day_of_week: 1, time_slot: 'matin' })],
      catalog: [activity({ id: 'a' })],
      keptItems: [kept],
    });

    expect(plan.map((item) => item.date)).toEqual(['2026-09-15']);
  });

  it('évite de reproposer une activité déjà réalisée cette semaine', () => {
    const plan = generateWeeklyPlan({
      ...baseParams,
      availability: [slot({ day_of_week: 1, time_slot: 'matin' })],
      catalog: [activity({ id: 'deja-faite' }), activity({ id: 'autre' })],
      keptItems: [{ date: '2026-09-14', timeSlot: 'matin', activity: activity({ id: 'deja-faite' }) }],
    });

    expect(plan[0].activity.id).toBe('autre');
  });

  it('ignore les dates ponctuelles hors de la semaine demandée', () => {
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
