import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getDateForDayOfWeek, getWeekStart, toLocalISODate } from '../lib/week';

test('getWeekStart ramène au lundi de la semaine en cours', () => {
  assert.equal(getWeekStart(new Date(2026, 8, 9, 12)), '2026-09-07'); // mercredi
  assert.equal(getWeekStart(new Date(2026, 8, 7, 12)), '2026-09-07'); // lundi
});

test('getWeekStart traite dimanche comme la fin de la semaine, pas le début', () => {
  assert.equal(getWeekStart(new Date(2026, 8, 13, 12)), '2026-09-07');
});

test('getDateForDayOfWeek indexe lundi=0 comme DAYS_OF_WEEK', () => {
  assert.equal(getDateForDayOfWeek('2026-09-07', 0), '2026-09-07');
  assert.equal(getDateForDayOfWeek('2026-09-07', 6), '2026-09-13');
});

test('getDateForDayOfWeek franchit les fins de mois', () => {
  assert.equal(getDateForDayOfWeek('2026-09-28', 6), '2026-10-04');
});

test('toLocalISODate rend la date civile locale, pas la date UTC', () => {
  // 00h30 le 15, heure locale : un .slice(0, 10) sur l'ISO UTC renverrait le 14
  // dans tout fuseau à l'est de Greenwich.
  const justAfterMidnight = new Date(2026, 8, 15, 0, 30);
  assert.equal(toLocalISODate(justAfterMidnight), '2026-09-15');
});
