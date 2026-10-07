import { describe, expect, it } from 'vitest';

import { errorMessage } from '../src/lib/errors';

const FALLBACK = 'Something went wrong. Try again in a moment.';
const OFFLINE = 'The connection looks interrupted. Check your network, then try again.';

describe('errorMessage', () => {
  it('reads an Error', () => {
    expect(errorMessage(new Error('Not signed in.'))).toBe('Not signed in.');
  });

  /** `__DEV__` is Metro's global; outside a bundle it has to be set to mean anything. */
  function withDev<T>(dev: boolean, run: () => T): T {
    const globals = globalThis as { __DEV__?: boolean };
    const was = globals.__DEV__;
    globals.__DEV__ = dev;
    try {
      return run();
    } finally {
      globals.__DEV__ = was;
    }
  }

  // The shape a failed insert returns. It used to fall straight through to the fallback, so the
  // app knew the cause and said nothing — which is how a missing column cost an evening.
  const missingColumn = {
    message: 'column nutrition_entries.carbs_g does not exist',
    code: '42703',
    details: null,
    hint: null,
  };

  it("reads Supabase's plain object, which is not an Error", () => {
    expect(withDev(true, () => errorMessage(missingColumn))).toContain('42703');
    expect(withDev(true, () => errorMessage(missingColumn))).toContain('carbs_g');
  });

  it('never shows a database error in a build somebody uses', () => {
    expect(withDev(false, () => errorMessage(missingColumn))).toBe(FALLBACK);
    expect(withDev(false, () => errorMessage({ message: 'violates check constraint', code: '23514' }))).toBe(FALLBACK);
  });

  it('recognises a lost connection before anything else', () => {
    expect(errorMessage(new Error('Network request failed'))).toBe(OFFLINE);
    expect(errorMessage({ message: 'TypeError: Failed to fetch' })).toBe(OFFLINE);
  });

  it('falls back on what carries no message at all', () => {
    expect(errorMessage(null)).toBe(FALLBACK);
    expect(errorMessage({})).toBe(FALLBACK);
    expect(errorMessage({ message: 42 })).toBe(FALLBACK);
  });

  it('keeps a message meant for the person, even when it has no code', () => {
    expect(errorMessage({ message: 'You have already noted this meal today.' })).toBe('You have already noted this meal today.');
  });
});
