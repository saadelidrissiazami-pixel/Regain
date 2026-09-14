import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computeStreak } from '../lib/streak';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString();

test('compte les jours consécutifs jusqu’à aujourd’hui', () => {
  const now = new Date(2026, 8, 14, 20);
  const logs = [at(2026, 9, 14), at(2026, 9, 13), at(2026, 9, 12)];
  assert.equal(computeStreak(logs, now), 3);
});

test('une journée encore vide ne casse pas la série tant qu’hier est coché', () => {
  const now = new Date(2026, 8, 14, 9);
  assert.equal(computeStreak([at(2026, 9, 13), at(2026, 9, 12)], now), 2);
});

test('s’arrête au premier jour manquant', () => {
  const now = new Date(2026, 8, 14, 20);
  const logs = [at(2026, 9, 14), at(2026, 9, 12), at(2026, 9, 11)];
  assert.equal(computeStreak(logs, now), 1);
});

test('plusieurs activités le même jour comptent pour un seul jour', () => {
  const now = new Date(2026, 8, 14, 20);
  assert.equal(computeStreak([at(2026, 9, 14, 8), at(2026, 9, 14, 19)], now), 1);
});

test('une activité cochée juste après minuit compte pour le jour local', () => {
  // Régression : avec une troncature de l'ISO UTC, ce log était rangé au 13
  // dans tout fuseau à l'est de Greenwich, et la série tombait à 0.
  const now = new Date(2026, 8, 14, 1);
  assert.equal(computeStreak([at(2026, 9, 14, 0)], now), 1);
});

test('aucun historique donne une série vide', () => {
  assert.equal(computeStreak([], new Date(2026, 8, 14)), 0);
});
