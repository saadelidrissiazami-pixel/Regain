import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { AvailabilitySlot, TimeSlot } from '../features/availability/types';
import type { CatalogActivity } from '../features/planning/catalog';
import { generateWeeklyPlan, slotKey } from '../features/planning/ruleEngine';

const WEEK_START = '2026-09-07'; // un lundi

function slot(dayOfWeek: number, timeSlot: TimeSlot, start = '18:00', end = '19:30'): AvailabilitySlot {
  return {
    id: `slot-${dayOfWeek}-${timeSlot}`,
    user_id: 'user',
    label: null,
    is_recurring: true,
    day_of_week: dayOfWeek,
    specific_date: null,
    time_slot: timeSlot,
    start_time: start,
    end_time: end,
    created_at: '2026-09-01T00:00:00Z',
  };
}

function activity(overrides: Partial<CatalogActivity> & { id: string }): CatalogActivity {
  return {
    title: overrides.id,
    category: 'relaxation',
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

const BASE = {
  primaryGoals: [] as string[],
  energyBySlot: {},
  budgetLevel: 'confortable' as const,
  weekStart: WEEK_START,
};

test('place une activité par créneau disponible', () => {
  const items = generateWeeklyPlan({
    ...BASE,
    availability: [slot(0, 'soir'), slot(2, 'soir')],
    catalog: [activity({ id: 'a' }), activity({ id: 'b', category: 'physique' })],
  });

  assert.equal(items.length, 2);
  assert.deepEqual(
    items.map((i) => i.date),
    ['2026-09-07', '2026-09-09']
  );
});

test('ne replanifie pas un créneau déjà occupé par une activité réalisée', () => {
  // Régression : la régénération effaçait puis remplaçait toute la semaine,
  // y compris ce que l'utilisateur avait déjà coché.
  const items = generateWeeklyPlan({
    ...BASE,
    availability: [slot(0, 'soir'), slot(2, 'soir')],
    catalog: [activity({ id: 'a' })],
    occupiedSlots: new Set([slotKey('2026-09-07', 'soir')]),
  });

  assert.equal(items.length, 1);
  assert.equal(items[0].date, '2026-09-09');
});

test('écarte les activités plus longues que le créneau', () => {
  const items = generateWeeklyPlan({
    ...BASE,
    availability: [slot(0, 'soir', '18:00', '18:30')],
    catalog: [activity({ id: 'longue', duration_minutes: 60 })],
  });

  assert.deepEqual(items, []);
});

test("écarte les activités au-dessus de l'énergie du créneau", () => {
  const items = generateWeeklyPlan({
    ...BASE,
    availability: [slot(0, 'soir')],
    energyBySlot: { soir: 'bas' },
    catalog: [activity({ id: 'intense', energy_required: 'eleve' })],
  });

  assert.deepEqual(items, []);
});

test('écarte les activités au-dessus du budget', () => {
  const items = generateWeeklyPlan({
    ...BASE,
    availability: [slot(0, 'soir')],
    budgetLevel: 'gratuit',
    catalog: [activity({ id: 'payante', cost_level: 'modere' })],
  });

  assert.deepEqual(items, []);
});

test('privilégie les activités qui servent les objectifs déclarés', () => {
  const items = generateWeeklyPlan({
    ...BASE,
    availability: [slot(0, 'soir')],
    primaryGoals: ['mieux_dormir'],
    catalog: [
      activity({ id: 'hors-sujet' }),
      activity({ id: 'ciblee', category: 'meditation', tags: ['mieux_dormir'] }),
    ],
  });

  assert.equal(items[0].activity.id, 'ciblee');
});

test('varie les catégories plutôt que de répéter la même', () => {
  const items = generateWeeklyPlan({
    ...BASE,
    availability: [slot(0, 'soir'), slot(1, 'soir'), slot(2, 'soir')],
    catalog: [
      activity({ id: 'relax-1', category: 'relaxation' }),
      activity({ id: 'relax-2', category: 'relaxation' }),
      activity({ id: 'physique-1', category: 'physique' }),
      activity({ id: 'social-1', category: 'social' }),
    ],
  });

  assert.equal(new Set(items.map((i) => i.activity.category)).size, 3);
});

test('ignore les dates ponctuelles hors de la semaine générée', () => {
  const outside: AvailabilitySlot = {
    ...slot(0, 'soir'),
    id: 'ponctuel',
    is_recurring: false,
    day_of_week: null,
    specific_date: '2026-09-20',
  };

  const items = generateWeeklyPlan({ ...BASE, availability: [outside], catalog: [activity({ id: 'a' })] });
  assert.deepEqual(items, []);
});

test("favorise les catégories que l'utilisateur termine le plus souvent", () => {
  const items = generateWeeklyPlan({
    ...BASE,
    availability: [slot(0, 'soir')],
    catalog: [
      activity({ id: 'souvent-sautee', category: 'physique' }),
      activity({ id: 'souvent-faite', category: 'meditation' }),
    ],
    categoryAffinity: { physique: 0, meditation: 1 },
  });

  assert.equal(items[0].activity.id, 'souvent-faite');
});
