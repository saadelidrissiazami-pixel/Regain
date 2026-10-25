import { describe, expect, it } from 'vitest';

import { computeActivityFit, pickComplementaryActivities } from '../src/features/planning/recommendation';
import type { CatalogActivity } from '../src/features/planning/catalog';
import type { UserPreferences } from '../src/lib/planning';

function activity(over: Partial<CatalogActivity> & { id: string }): CatalogActivity {
  return {
    title: `Activity ${over.id}`,
    category: 'physique',
    duration_minutes: 10,
    energy_required: 'bas',
    indoor_outdoor: 'indifferent',
    cost_level: 'gratuit',
    instructions: null,
    first_action: null,
    stop_rule: null,
    tags: [],
    steps: [],
    extra: null,
    slug: null,
    ...over,
  };
}

const prefs = {
  primary_goals: ['plus_mouvement', 'gerer_stress'],
  budget_level: 'gratuit',
  typical_energy_by_slot: { matin: 'bas', soir: 'eleve' },
} as unknown as UserPreferences;

describe('why an activity was suggested', () => {
  it('names the goals it meets and the moments there is energy for it', () => {
    const fit = computeActivityFit(activity({ id: 'a', tags: ['plus_mouvement'], energy_required: 'eleve' }), prefs);
    expect(fit.matchedGoalLabels.length).toBe(1);
    // A high-energy activity is only offered where the person said they have energy. The slots
    // they never filled in default to 'moyen', which is not enough for 'eleve'.
    expect(fit.goodEnergySlotLabels.length).toBeGreaterThan(0);
    expect(fit.budgetFits).toBe(true);
  });

  it('says a paid activity does not fit a free budget, rather than hiding it', () => {
    const fit = computeActivityFit(activity({ id: 'b', cost_level: 'modere' }), prefs);
    expect(fit.budgetFits).toBe(false);
  });

  it('claims no goal for an activity that meets none', () => {
    expect(computeActivityFit(activity({ id: 'c', tags: ['mieux_dormir'] }), prefs).matchedGoalLabels).toEqual([]);
  });
});

describe('what is offered in the same vein', () => {
  const catalog = [
    activity({ id: 'self', tags: ['plus_mouvement'] }),
    activity({ id: 'two', tags: ['plus_mouvement', 'gerer_stress'] }),
    activity({ id: 'one', tags: ['gerer_stress'] }),
    activity({ id: 'none', tags: ['mieux_dormir'] }),
  ];

  it('puts the closest match first and never suggests the activity itself', () => {
    const picked = pickComplementaryActivities(catalog[0], catalog, prefs);
    expect(picked.map((a) => a.id)).toEqual(['two', 'one']);
  });

  it('offers nothing rather than something unrelated', () => {
    // An activity sharing no goal is worse than an empty section: it reads as a recommendation.
    const picked = pickComplementaryActivities(catalog[0], [catalog[0], catalog[3]], prefs);
    expect(picked).toEqual([]);
  });
});
