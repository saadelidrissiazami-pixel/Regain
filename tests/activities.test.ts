import { describe, expect, it } from 'vitest';

import { CATEGORY_LABELS } from '../src/features/planning/types';
import { parseSeededActivities } from './helpers/catalogue';

// The catalogue lives in the database, written by hand in a migration. These tests read it back
// at the source and check what no type can check: that an activity can be started, that it
// ends, and that it stays small enough for an evening with no appetite for anything.

const ENERGIES = ['bas', 'moyen', 'eleve'];
const COSTS = ['gratuit', 'faible', 'modere'];
const PLACES = ['indoor', 'outdoor', 'indifferent'];
const TAGS = [
  'plus_mouvement',
  'plus_social',
  'reduire_ecrans',
  'gerer_stress',
  'mieux_dormir',
  'routine_stable',
  'confiance_en_soi',
  'plus_energie',
];

describe('the activity catalogue', () => {
  const activities = parseSeededActivities();

  it('reads correctly out of the migration', () => {
    // If this test fails on its own, it is the parser that needs fixing.
    expect(activities.length).toBeGreaterThan(30);
    expect(activities[0].title).toBe('Bouger sur une chanson');
    expect(activities[0].tags).toEqual(['plus_mouvement', 'plus_energie']);
  });

  it('always says how to start', () => {
    // This is the whole reason for the rewrite: no longer asking somebody to design the
    // activity themselves at the moment they have no momentum.
    expect(activities.filter((a) => !a.first_action || a.first_action.length < 20).map((a) => a.title)).toEqual([]);
  });

  it('always says when to stop', () => {
    expect(activities.filter((a) => !a.stop_rule || a.stop_rule.length < 8).map((a) => a.title)).toEqual([]);
  });

  it('stays short: nothing over half an hour', () => {
    const longues = activities.filter((a) => a.duration_minutes > 30).map((a) => [a.title, a.duration_minutes]);
    expect(longues).toEqual([]);
  });

  it('mostly offers formats under ten minutes', () => {
    const courtes = activities.filter((a) => a.duration_minutes <= 10);
    expect(courtes.length / activities.length).toBeGreaterThan(0.75);
  });

  it('never asks for high energy', () => {
    // The strength programme already covers sustained effort. This is for evenings with none.
    expect(activities.filter((a) => a.energy_required === 'eleve').map((a) => a.title)).toEqual([]);
  });

  it('uses only values the database accepts', () => {
    const invalides = activities.filter(
      (a) =>
        !ENERGIES.includes(a.energy_required) ||
        !COSTS.includes(a.cost_level) ||
        !PLACES.includes(a.indoor_outdoor) ||
        !(a.category in CATEGORY_LABELS)
    );
    expect(invalides.map((a) => a.title)).toEqual([]);
  });

  it('stays sparing with the goals it claims', () => {
    // A comic answers “cut down on screens”. It does not have to promise confidence and energy
    // as well: a catalogue that promises everything recommends nothing.
    const bavardes = activities.filter((a) => a.tags.length === 0 || a.tags.length > 2);
    expect(bavardes.map((a) => [a.title, a.tags])).toEqual([]);
    expect(activities.flatMap((a) => a.tags).filter((tag) => !TAGS.includes(tag))).toEqual([]);
  });

  it('covers all nine categories', () => {
    const couvertes = new Set(activities.map((a) => a.category));
    expect([...couvertes].sort()).toEqual(Object.keys(CATEGORY_LABELS).sort());
  });

  it('never offers the same title twice', () => {
    // The title carries the table's unique index: a duplicate would fail the migration.
    const titres = activities.map((a) => a.title);
    expect(titres.length).toBe(new Set(titres).size);
  });

  it('leaves a way out that costs nothing', () => {
    const gratuites = activities.filter((a) => a.cost_level === 'gratuit');
    expect(gratuites.length / activities.length).toBeGreaterThan(0.9);
  });

  it('offers a way to reach somebody without arranging anything', () => {
    // Social contact used to require somebody free right then. A few of these
    // activities have to be complete once a message is sent, with no reply expected.
    const sansRendezVous = activities.filter((a) => a.category === 'social' && a.duration_minutes <= 5);
    expect(sansRendezVous.length).toBeGreaterThanOrEqual(2);
  });
});
