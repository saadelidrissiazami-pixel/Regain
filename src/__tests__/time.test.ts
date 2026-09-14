import assert from 'node:assert/strict';
import { test } from 'node:test';

import { durationMinutes, timeSlotFromStartTime } from '../lib/time';

test('durationMinutes gère les formats "HH:MM" et "HH:MM:SS" de Postgres', () => {
  assert.equal(durationMinutes('18:00', '19:30'), 90);
  assert.equal(durationMinutes('18:00:00', '19:30:00'), 90);
});

test('timeSlotFromStartTime découpe la journée en trois créneaux', () => {
  assert.equal(timeSlotFromStartTime('06:00'), 'matin');
  assert.equal(timeSlotFromStartTime('11:30'), 'matin');
  assert.equal(timeSlotFromStartTime('12:00'), 'apres_midi');
  assert.equal(timeSlotFromStartTime('17:30'), 'apres_midi');
  assert.equal(timeSlotFromStartTime('18:00'), 'soir');
});
